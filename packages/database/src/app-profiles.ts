import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types.js";

export type AppProfileRow = Database["public"]["Tables"]["app_profiles"]["Row"];

export type AppProfileIdentity = Pick<
  AppProfileRow,
  "id" | "username" | "role" | "created_at"
>;

export type AppProfileWithEmail = Pick<
  AppProfileRow,
  "id" | "username" | "email" | "role" | "created_at"
>;

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === "23505";
}

export async function listAppProfiles(
  supabase: SupabaseClient<Database>,
): Promise<AppProfileIdentity[]> {
  const { data, error } = await supabase
    .from("app_profiles")
    .select("id, username, role, created_at")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function findAppProfileById(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<AppProfileWithEmail | null> {
  const { data, error } = await supabase
    .from("app_profiles")
    .select("id, username, email, role, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function findAppProfileByUsername(
  supabase: SupabaseClient<Database>,
  username: string,
): Promise<AppProfileWithEmail | null> {
  const { data, error } = await supabase
    .from("app_profiles")
    .select("id, username, email, role, created_at")
    .eq("username", username)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function insertAppProfile(
  supabase: SupabaseClient<Database>,
  row: Database["public"]["Tables"]["app_profiles"]["Insert"],
): Promise<AppProfileIdentity> {
  const { data, error } = await supabase
    .from("app_profiles")
    .insert(row)
    .select("id, username, role, created_at")
    .single();

  if (error) {
    if (isUniqueViolation(error)) throw new Error("用户名或邮箱已存在");
    throw new Error(error.message);
  }
  if (!data) throw new Error("插入失败");
  return data;
}

export async function updateAppProfileUsername(
  supabase: SupabaseClient<Database>,
  id: string,
  username: string,
): Promise<AppProfileIdentity> {
  const { data, error } = await supabase
    .from("app_profiles")
    .update({ username })
    .eq("id", id)
    .select("id, username, role, created_at")
    .single();

  if (error) {
    if (isUniqueViolation(error)) throw new Error("用户名已存在");
    throw new Error(error.message);
  }
  if (!data) throw new Error("用户不存在");
  return data;
}
