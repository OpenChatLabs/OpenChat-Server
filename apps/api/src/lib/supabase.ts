import { createPublicClient, createServiceRoleClient } from '@openchat-server/database'
import {
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from './env'

let service: ReturnType<typeof createServiceRoleClient> | null = null
let anon: ReturnType<typeof createPublicClient> | null = null

/** 服务端特权（建用户、改密码等） */
export function getServiceSupabase() {
  if (!service) {
    service = createServiceRoleClient(getSupabaseUrl(), getSupabaseServiceRoleKey())
  }
  return service
}

/** 登录与校验 access_token（Publishable / anon key） */
export function getAnonSupabase() {
  if (!anon) {
    anon = createPublicClient(getSupabaseUrl(), getSupabaseAnonKey())
  }
  return anon
}
