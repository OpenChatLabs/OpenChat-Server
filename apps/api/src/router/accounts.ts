import { Hono } from 'hono'
import { isRootUsername } from '../lib/env'
import { requireAuth } from '../middleware/auth'
import { getAnonSupabase } from '../lib/supabase'
import {
  createAuthUser,
  findProfileById,
  findProfileByUsername,
  listProfiles,
  updateAuthPassword,
  updateProfileUsername,
} from '../services/account-store'
import type { AuthUser } from '../types/auth'

type Variables = { user: AuthUser }

export const accountsRouter = new Hono<{ Variables: Variables }>()

accountsRouter.use('*', requireAuth)

function sanitize(u: { id: string; username: string; role: string }) {
  return { id: u.id, username: u.username, role: u.role }
}

accountsRouter.get('/', async (c) => {
  const me = c.get('user')
  const all = await listProfiles()

  if (me.role === 'user') {
    const row = all.find((p) => p.id === me.id)
    return c.json(row ? [sanitize(row)] : [])
  }

  return c.json(all.map(sanitize))
})

type CreateBody = { username: string; password: string; role: 'admin' | 'user'; email?: string }

accountsRouter.post('/', async (c) => {
  const me = c.get('user')
  const body = await c.req.json<CreateBody>()
  const { username, password, role, email: rawEmail } = body
  if (!username?.trim() || !password) {
    return c.json({ error: '用户名与密码必填' }, 400)
  }
  if (isRootUsername(username.trim())) {
    return c.json({ error: '不可使用与 root 相同的用户名' }, 400)
  }

  const email = rawEmail?.trim()
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return c.json({ error: '邮箱格式无效' }, 400)
  }

  if (me.role === 'root') {
    if (role !== 'admin') {
      return c.json({ error: 'root 仅可创建管理员账号' }, 403)
    }
  } else if (me.role === 'admin') {
    if (role !== 'user') {
      return c.json({ error: '管理员仅可创建普通账号' }, 403)
    }
  } else {
    return c.json({ error: '无权创建账号' }, 403)
  }

  try {
    const user = await createAuthUser({
      username: username.trim(),
      password,
      role,
      ...(email ? { email } : {}),
    })
    return c.json(sanitize(user), 201)
  } catch (e) {
    const msg = e instanceof Error ? e.message : '创建失败'
    return c.json({ error: msg }, 400)
  }
})

type PatchBody = { username?: string; password?: string }

accountsRouter.patch('/:username', async (c) => {
  const me = c.get('user')
  const targetName = c.req.param('username')
  const target = await findProfileByUsername(targetName)
  if (!target) {
    return c.json({ error: '用户不存在' }, 404)
  }

  const body = await c.req.json<PatchBody>()
  const isSelf = me.id === target.id

  if (!isSelf) {
    if (me.role === 'user') {
      return c.json({ error: '无权修改他人账号' }, 403)
    }
    if (me.role === 'admin' && target.role !== 'user') {
      return c.json({ error: '管理员仅能修改普通账号' }, 403)
    }
  }

  try {
    if (body.username !== undefined && body.username !== target.username) {
      const next = body.username.trim()
      if (!next) return c.json({ error: '用户名无效' }, 400)
      if (isRootUsername(next)) return c.json({ error: '不可使用该用户名' }, 400)
      await updateProfileUsername(target.id, next)
    }
    if (body.password !== undefined && body.password !== '') {
      await updateAuthPassword(target.id, body.password)
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : '更新失败'
    return c.json({ error: msg }, 400)
  }

  const fresh = (await findProfileById(target.id))!
  const out = sanitize(fresh)

  if (isSelf && body.password !== undefined && body.password !== '' && me.role !== 'root') {
    const anon = getAnonSupabase()
    const { data, error } = await anon.auth.signInWithPassword({
      email: fresh.email,
      password: body.password,
    })
    if (!error && data.session?.access_token) {
      return c.json({ ...out, token: data.session.access_token })
    }
    return c.json({ ...out, reauthRequired: true })
  }

  return c.json(out)
})
