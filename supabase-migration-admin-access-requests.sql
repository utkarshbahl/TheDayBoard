-- Run this once in Supabase: SQL Editor -> New query -> Run.
-- Adds a request-and-approval workflow for admin access.

create table if not exists public.admin_access_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);

alter table public.admin_access_requests enable row level security;

drop policy if exists "Users can view their own admin request" on public.admin_access_requests;
create policy "Users can view their own admin request"
on public.admin_access_requests for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can submit their own admin request" on public.admin_access_requests;
create policy "Users can submit their own admin request"
on public.admin_access_requests for insert to authenticated
with check (auth.uid() = user_id);

create or replace function public.request_admin_access()
returns public.admin_access_requests
language plpgsql security invoker as $$
declare
  request public.admin_access_requests;
begin
  insert into public.admin_access_requests (user_id)
  values (auth.uid())
  on conflict (user_id) do update
    set status = 'pending',
        requested_at = now(),
        reviewed_at = null,
        reviewed_by = null
  returning * into request;
  return request;
end;
$$;

create or replace function public.admin_list_access_requests()
returns table (
  id uuid,
  user_id uuid,
  full_name text,
  email text,
  status text,
  requested_at timestamptz
)
language sql security definer set search_path = public as $$
  select r.id, r.user_id, p.full_name, p.email, r.status, r.requested_at
  from public.admin_access_requests r
  join public.user_profiles p on p.id = r.user_id
  where (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  order by r.requested_at desc;
$$;

create or replace function public.admin_review_access_request(
  request_id uuid,
  approve boolean
)
returns void
language plpgsql security definer set search_path = public as $$
declare
  requested_user_id uuid;
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') <> 'admin' then
    raise exception 'Only admins can review access requests';
  end if;

  select user_id into requested_user_id
  from public.admin_access_requests
  where id = request_id and status = 'pending';

  if requested_user_id is null then
    raise exception 'Pending access request was not found';
  end if;

  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
    || case when approve then '{"role":"admin"}'::jsonb else '{}'::jsonb end
  where id = requested_user_id;

  update public.admin_access_requests
  set status = case when approve then 'approved' else 'rejected' end,
      reviewed_at = now(),
      reviewed_by = auth.uid()
  where id = request_id;
end;
$$;

grant execute on function public.request_admin_access() to authenticated;
grant execute on function public.admin_list_access_requests() to authenticated;
grant execute on function public.admin_review_access_request(uuid, boolean) to authenticated;
