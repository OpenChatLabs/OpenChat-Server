import {
  findUserPresenceDomain,
  upsertUserPresenceDomain,
} from '@openchat-server/database'
import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'
import { getServiceSupabase } from '../lib/supabase'
import type { AuthUser } from '../types/auth'
import type { UserLocation } from '../types/location'

type Variables = { user: AuthUser }

const locationRouter = new Hono<{ Variables: Variables }>()


/** 公开：按用户名解析当前登记的节点域名 */
locationRouter.get('/users/:username', async (c) => {
  const requested = c.req.param('username')?.trim()
  if (!requested) {
    return c.json({ error: '用户名无效' }, 400)
  }
  try {
    const domain = await findUserPresenceDomain(
      getServiceSupabase(),
      requested,
    )
    if (!domain) {
      return c.json({ error: '未找到' }, 404)
    }
    const body: UserLocation = {
      username: requested,
      location: { username: requested, domain },
    }
    return c.json(body)
  } catch (e) {
    const msg = e instanceof Error ? e.message : '查询失败'
    return c.json({ error: msg }, 500)
  }
})

locationRouter.post('/user/new', requireAuth, async (c) => {
  const user = c.get('user')
  const tokenUsername = user.username.trim()
  let bodyUsername: string | undefined
  let domain: string | undefined
  try {
    const json = await c.req.json<Partial<Pick<UserLocation, 'username' | 'location'>>>()
    if (typeof json?.username === 'string') {
      bodyUsername = json.username.trim()
    }
    const locDomain = json?.location?.domain
    if (typeof locDomain === 'string') {
      domain = locDomain.trim()
    }
    const locUser = json?.location?.username
    if (typeof locUser === 'string' && locUser.trim() !== '') {
      if (locUser.trim() !== tokenUsername) {
        return c.json({ error: '令牌用户与 location 中的 username 不一致' }, 403)
      }
    }
  } catch {
    // 无 body 或非 JSON 时视为未声明 username，仅以 token 用户为准
  }
  if (bodyUsername !== undefined && bodyUsername !== '') {
    if (bodyUsername !== tokenUsername) {
      return c.json({ error: '令牌用户与 body 中的 username 不一致' }, 403)
    }
  }

  if (!domain) {
    return c.json({ error: '缺少 location.domain' }, 400)
  }
  try {
    await upsertUserPresenceDomain(getServiceSupabase(), tokenUsername, domain)
    const body: UserLocation = {
      username: tokenUsername,
      location: { username: tokenUsername, domain },
    }
    return c.json(body)
  } catch (e) {
    const msg = e instanceof Error ? e.message : '登记失败'
    return c.json({ error: msg }, 500)
  }
})

export default locationRouter
