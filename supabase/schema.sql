-- FinPath users table for JWT auth/profile persistence

create table if not exists public.users (
  id text primary key,
  email text not null unique,
  username text not null unique,
  password_hash text not null,
  profile jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists users_created_at_idx on public.users (created_at desc);
create index if not exists users_profile_gin_idx on public.users using gin (profile);
