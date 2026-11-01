-- Run this in Supabase SQL Editor after enabling Google in Authentication > Providers.
-- Add the deployed site's /signin.html and /index.html URLs to Authentication > URL Configuration.

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles
  add column if not exists is_active boolean not null default true;

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

insert into public.site_section_visibility (section_key, is_public)
values ('auth', false)
on conflict (section_key) do nothing;

create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  display_name text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.jwt() -> 'app_metadata' ->> 'role') <> 'admin' then
    raise exception 'Administrator access required';
  end if;

  return query
  select
    users.id,
    users.email::text,
    coalesce(
      users.raw_user_meta_data ->> 'full_name',
      users.raw_user_meta_data ->> 'name',
      users.email::text
    )::text,
    users.created_at
  from auth.users as users
  order by users.created_at desc;
end;
$$;

revoke all on function public.admin_list_users() from public;
grant execute on function public.admin_list_users() to authenticated;

notify pgrst, 'reload schema';
