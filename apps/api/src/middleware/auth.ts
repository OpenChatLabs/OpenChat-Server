import type { MiddlewareHandler } from 'hono'
import { verify } from 'hono/jwt'
import { findAppProfileById } from '@openchat-server/database'
import { getRootCredentials, getJwtSecret } from '../lib/env'
import { getAnonSupabase, getServiceSupabase } from '../lib/supabase'
import type { AuthUser, JwtPayload } from '../types/auth'

function parseBearer(header: string | undefined): string | null {
  const m = header?.match(/^Bearer\s+(.+)$/i)
  return m?.[1]?.trim() ?? null
}

/**
 * 校验 Authorization: Bearer
 * - 默认：Supabase Auth access_token + app_profiles 角色
 * - 例外：.env root 仍使用自签 JWT（JWT_SECRET）
 */
export const requireAuth: MiddlewareHandler = async (c, next) => {
  const token = parseBearer(c.req.header('Authorization'))
  if (!token) return c.json({ error: '未授权' }, 401)

  const anon = getAnonSupabase()
  const { data: userData, error: authErr } = await anon.auth.getUser(token)

  if (!authErr && userData.user) {
    const row = await findAppProfileById(getServiceSupabase(), userData.user.id)
    if (!row) return c.json({ error: '未授权' }, 401)
    const user: AuthUser = {
      id: row.id,
      username: row.username,
      role: row.role,
    }
    c.set('user', user)
    await next()
    return
  }

  try {
    const payload = (await verify(token, getJwtSecret(), 'HS256')) as JwtPayload
    if (payload.role !== 'root' || payload.sub !== 'root') {
      return c.json({ error: '未授权' }, 401)
    }
    if (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) {
      return c.json({ error: '未授权' }, 401)
    }
    const root = getRootCredentials()
    if (payload.username !== root.username) {
      return c.json({ error: '未授权' }, 401)
    }
    c.set('user', { id: 'root', username: root.username, role: 'root' })
    await next()
    return
  } catch {
    return c.json({ error: '未授权' }, 401)
  }
}
