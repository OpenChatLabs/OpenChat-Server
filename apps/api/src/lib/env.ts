export function requireEnv(name: string): string {
  const v = process.env[name]
  if (v === undefined || v === '') {
    throw new Error(`缺少环境变量: ${name}`)
  }
  return v
}

export function getJwtSecret(): string {
  return requireEnv('JWT_SECRET')
}

export function getRootCredentials(): { username: string; password: string } {
  return {
    username: requireEnv('ROOT_USERNAME'),
    password: requireEnv('ROOT_PASSWORD'),
  }
}

export function isRootUsername(username: string): boolean {
  try {
    return username === getRootCredentials().username
  } catch {
    return false
  }
}
