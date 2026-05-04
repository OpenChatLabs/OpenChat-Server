import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export type SupabaseBindings = {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

export function createSupabaseClient(env: SupabaseBindings): SupabaseClient {
  const { SUPABASE_URL: url, SUPABASE_ANON_KEY: key } = env
  if (!url?.trim() || !key?.trim()) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set')
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
