const TOKEN_KEY = 'openchat_token'

/** 线上可设完整 API 源（含协议与域名）；开发默认空字符串，走 Vite 代理 */
export function apiUrl(path: string): string {
  const base = (import.meta.env.VITE_API_ORIGIN as string | undefined)?.replace(/\/$/, '') ?? ''
  const p = path.startsWith('/') ? path : `/${path}`
  return base ? `${base}${p}` : p
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function authHeaders(): Headers {
  const h = new Headers()
  const t = getToken()
  if (t) h.set('Authorization', `Bearer ${t}`)
  return h
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(authHeaders())
  const incoming = new Headers(init.headers)
  incoming.forEach((v, k) => headers.set(k, v))
  return fetch(apiUrl(path), { ...init, headers })
}

/** 仅用于展示（不校验签名）；root 自签 JWT 与 Supabase access_token 混用 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}
