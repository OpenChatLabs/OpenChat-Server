import { createPublicClient, createServiceRoleClient } from '@openchat-server/database'
import { requireEnv } from './env'

let service: ReturnType<typeof createServiceRoleClient> | null = null
let anon: ReturnType<typeof createPublicClient> | null = null

/** 服务端特权（建用户、改密码等） */
export function getServiceSupabase() {
  if (!service) {
    service = createServiceRoleClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'))
  }
  return service
}

/** 登录与校验 access_token（Publishable / anon key） */
export function getAnonSupabase() {
  if (!anon) {
    anon = createPublicClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_ANON_KEY'))
  }
  return anon
}
