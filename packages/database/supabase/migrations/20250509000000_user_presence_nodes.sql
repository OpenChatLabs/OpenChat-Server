-- 用户当前所在聊天节点域名（多节点时用用户名解析连接目标）

create table public.user_presence_nodes (
  username text primary key,
  domain text not null constraint user_presence_nodes_domain_nonempty check (domain <> ''),
  updated_at timestamptz not null default now()
);

create index user_presence_nodes_updated_at_idx on public.user_presence_nodes using btree (updated_at desc);

alter table public.user_presence_nodes enable row level security;

comment on table public.user_presence_nodes is '用户名 -> 当前登记的在线服务器节点域名；由 API service role 写入';
