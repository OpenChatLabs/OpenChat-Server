import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import { getJwtSecret, getRootCredentials } from '../lib/env'
import { getAnonSupabase } from '../lib/supabase'
import { findProfileByUsername } from '../services/account-store'
import type { LoginRequest, LoginResponse } from '../types/login'

const TTL_SEC = 60 * 60 * 24 * 7

export const loginRouter = new Hono()

loginRouter.post('/', async (c) => {
  const { username, password } = await c.req.json<LoginRequest>()
  if (!username?.trim() || !password) {
    return c.json({ error: '用户名与密码必填' }, 400)
  }

  const root = getRootCredentials()
  if (username === root.username && password === root.password) {
    const exp = Math.floor(Date.now() / 1000) + TTL_SEC
    const token = await sign({ sub: 'root', username: root.username, role: 'root', exp }, getJwtSecret())
    return c.json({ token } satisfies LoginResponse)
  }

  const profile = await findProfileByUsername(username)
  if (!profile) {
    return c.json({ error: '用户名或密码错误' }, 401)
  }

  const anon = getAnonSupabase()
  const { data, error } = await anon.auth.signInWithPassword({
    email: profile.email,
    password,
  })

  if (error || !data.session?.access_token) {
    return c.json({ error: '用户名或密码错误' }, 401)
  }

  return c.json({ token: data.session.access_token } satisfies LoginResponse)
})
