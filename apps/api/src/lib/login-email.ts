/** 未单独提供邮箱时，用于 Supabase Auth 的占位邮箱（仅服务端约定） */
export function defaultLoginEmailFromUsername(username: string): string {
  const safe =
    username
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'user'
  return `${safe}@users.openchat.local`
}
