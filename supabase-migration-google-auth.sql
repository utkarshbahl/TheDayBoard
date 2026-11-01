-- Run this in Supabase SQL Editor after enabling Google in Authentication > Providers.
-- Add the deployed site's /signin.html and /index.html URLs to Authentication > URL Configuration.

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

-- Profiles are optional. Never attach a failing trigger to auth.users because
-- a profile write must not prevent Google from creating the authenticated user.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

drop policy if exists "Users can view their own profile" on public.user_profiles;
create policy "Users can view their own profile"
on public.user_profiles for select to authenticated
using ((select auth.uid()) = id);

grant select on public.user_profiles to authenticated;
