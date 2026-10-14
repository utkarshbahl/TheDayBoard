-- Run this once in Supabase: SQL Editor -> New query -> Run.
-- Creates user profiles and admin-only account management functions.

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) between 2 and 80),
  email text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.user_profiles;
create policy "Users can view their own profile"
on public.user_profiles for select to authenticated
using (auth.uid() = id);

create or replace function public.create_user_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_profiles (id, full_name, email)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Campus user'),
    lower(new.email)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.create_user_profile();

create or replace function public.admin_list_user_profiles()
returns table (id uuid, full_name text, email text, is_active boolean, created_at timestamptz)
language sql security definer set search_path = public as $$
  select id, full_name, email, is_active, created_at
  from public.user_profiles
  where (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  order by created_at desc;
$$;

create or replace function public.admin_set_user_active(target_user_id uuid, active boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') <> 'admin' then
    raise exception 'Only admins can manage user accounts';
  end if;
  update public.user_profiles
  set is_active = active
  where id = target_user_id;
end;
$$;

create or replace function public.admin_delete_user(target_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') <> 'admin' then
    raise exception 'Only admins can manage user accounts';
  end if;
  if target_user_id = auth.uid() then
    raise exception 'Admins cannot delete their own account';
  end if;
  delete from auth.users where id = target_user_id;
end;
$$;

grant execute on function public.admin_list_user_profiles() to authenticated;
grant execute on function public.admin_set_user_active(uuid, boolean) to authenticated;
grant execute on function public.admin_delete_user(uuid) to authenticated;
