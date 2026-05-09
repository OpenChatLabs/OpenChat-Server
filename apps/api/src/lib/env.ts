function pick(name: string, value: string | undefined): string {
  if (value === undefined || value === '') {
    throw new Error(`缺少环境变量: ${name}`)
  }
  return value
}

/** 使用静态 process.env.XXX，便于 Vite `define` 注入到 Cloudflare Worker */
export function getJwtSecret(): string {
  return pick('JWT_SECRET', process.env.JWT_SECRET)
}

export function getRootCredentials(): { username: string; password: string } {
  return {
    username: pick('ROOT_USERNAME', process.env.ROOT_USERNAME?.trim()),
    password: pick('ROOT_PASSWORD', process.env.ROOT_PASSWORD?.trim()),
  }
}

export function getSupabaseUrl(): string {
  return pick('SUPABASE_URL', process.env.SUPABASE_URL)
}

export function getSupabaseServiceRoleKey(): string {
  return pick('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export function getSupabaseAnonKey(): string {
  return pick('SUPABASE_ANON_KEY', process.env.SUPABASE_ANON_KEY)
}
export function getDomain(): string {
  return pick('DOMAIN', process.env.DOMAIN)
}

export function isRootUsername(username: string): boolean {
  try {
    return username.trim() === getRootCredentials().username
  } catch {
    return false
  }
}
