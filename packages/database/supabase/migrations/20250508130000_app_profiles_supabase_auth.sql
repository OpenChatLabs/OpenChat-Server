-- 鉴权改由 Supabase Auth；public 表仅存应用角色与展示名

drop table if exists public.app_accounts;

create table public.app_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  email text not null,
  role text not null check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  constraint app_profiles_username_unique unique (username),
  constraint app_profiles_email_unique unique (email)
);

create index app_profiles_username_idx on public.app_profiles using btree (username);

alter table public.app_profiles enable row level security;

comment on table public.app_profiles is '应用角色；密码与会话由 auth.users / Supabase Auth 管理';
