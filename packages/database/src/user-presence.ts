import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types.js";

export async function upsertUserPresenceDomain(
  supabase: SupabaseClient<Database>,
  username: string,
  domain: string,
): Promise<void> {
  const { error } = await supabase.from("user_presence_nodes").upsert(
    {
      username: username.trim(),
      domain: domain.trim(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "username" },
  );
  if (error) throw error;
}

export async function findUserPresenceDomain(
  supabase: SupabaseClient<Database>,
  username: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("user_presence_nodes")
    .select("domain")
    .eq("username", username.trim())
    .maybeSingle();
  if (error) throw error;
  return data?.domain ?? null;
}
