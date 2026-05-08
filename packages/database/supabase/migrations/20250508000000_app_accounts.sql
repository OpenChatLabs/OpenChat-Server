create table public.app_accounts (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  password_hash text not null,
  role text not null check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  constraint app_accounts_username_unique unique (username)
);

create index app_accounts_username_idx on public.app_accounts using btree (username);

alter table public.app_accounts enable row level security;

comment on table public.app_accounts is 'OpenChat 自建账号（非 Supabase Auth）；仅服务端用 service_role 访问';
