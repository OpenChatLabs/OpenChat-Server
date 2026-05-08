import type { AppProfileIdentity } from '@openchat-server/database'
import {
  findAppProfileById,
  findAppProfileByUsername,
  insertAppProfile,
  listAppProfiles,
  updateAppProfileUsername,
} from '@openchat-server/database'
import { defaultLoginEmailFromUsername } from '../lib/login-email'
import { getServiceSupabase } from '../lib/supabase'
import type { AppProfile } from '../types/auth'

export async function findProfileByUsername(username: string): Promise<AppProfile | null> {
  const row = await findAppProfileByUsername(getServiceSupabase(), username)
  if (!row) return null
  return { id: row.id, username: row.username, email: row.email, role: row.role }
}

export async function findProfileById(id: string): Promise<AppProfile | null> {
  const row = await findAppProfileById(getServiceSupabase(), id)
  if (!row) return null
  return { id: row.id, username: row.username, email: row.email, role: row.role }
}

export async function listProfiles(): Promise<AppProfileIdentity[]> {
  return listAppProfiles(getServiceSupabase())
}

export async function createAuthUser(params: {
  username: string
  password: string
  role: 'admin' | 'user'
  email?: string
}): Promise<AppProfileIdentity> {
  const sb = getServiceSupabase()
  const email = params.email?.trim() || defaultLoginEmailFromUsername(params.username)

  const { data: created, error } = await sb.auth.admin.createUser({
    email,
    password: params.password,
    email_confirm: true,
    user_metadata: { username: params.username },
  })

  if (error || !created.user) {
    const msg = error?.message ?? '创建 Auth 用户失败'
    if (/already|exists|registered|duplicate/i.test(msg)) {
      throw new Error('邮箱或账号已在系统中存在')
    }
    throw new Error(msg)
  }

  try {
    return await insertAppProfile(sb, {
      id: created.user.id,
      username: params.username,
      email,
      role: params.role,
    })
  } catch (e) {
    await sb.auth.admin.deleteUser(created.user.id)
    throw e
  }
}

export async function updateProfileUsername(userId: string, nextUsername: string): Promise<AppProfileIdentity> {
  return updateAppProfileUsername(getServiceSupabase(), userId, nextUsername)
}

export async function updateAuthPassword(userId: string, newPassword: string): Promise<void> {
  const sb = getServiceSupabase()
  const { error } = await sb.auth.admin.updateUserById(userId, { password: newPassword })
  if (error) throw new Error(error.message)
}
