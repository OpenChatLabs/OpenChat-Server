import {
  createClient,
  type SupabaseClient,
  type SupabaseClientOptions,
} from "@supabase/supabase-js";
import type { Database } from "./database.types.js";

export type { Database };
export type { SupabaseClient };

export function createPublicClient(
  supabaseUrl: string,
  supabaseAnonKey: string,
  options?: SupabaseClientOptions<"public">,
): SupabaseClient<Database> {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, options);
}

export function createServiceRoleClient(
  supabaseUrl: string,
  serviceRoleKey: string,
  options?: SupabaseClientOptions<"public">,
): SupabaseClient<Database> {
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    ...options,
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      ...options?.auth,
    },
  });
}
