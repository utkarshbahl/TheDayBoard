-- Run once in Supabase SQL Editor after supabase-setup.sql.
-- Browser subscriptions are stored only for delivering the selected laundry alert.

create table if not exists public.laundry_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  subscription jsonb not null,
  target_token integer not null check (target_token >= 0),
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.laundry_push_subscriptions enable row level security;
-- No browser role receives direct table permissions. Vercel API functions use the service-role key.
