export type Role = 'root' | 'admin' | 'user'

export type AuthUser = {
  id: string
  username: string
  role: Role
}

/** 自建账号在 Supabase 侧的资料（含登录用邮箱） */
export type AppProfile = {
  id: string
  username: string
  email: string
  role: 'admin' | 'user'
}

export type JwtPayload = {
  sub: string
  username: string
  role: Role
  exp: number
}
