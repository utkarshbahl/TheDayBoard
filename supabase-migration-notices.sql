-- Run this once in Supabase SQL Editor.
-- Create the public notice board and the admin-only publishing controls.

create table if not exists public.campus_notices (
  id bigint generated always as identity primary key,
  title text not null check (char_length(trim(title)) between 1 and 140),
  body text not null check (char_length(trim(body)) between 1 and 5000),
  image_url text,
  event_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid not null default auth.uid()
);

alter table public.campus_notices enable row level security;

drop policy if exists "Everyone can view active campus notices" on public.campus_notices;
create policy "Everyone can view active campus notices"
on public.campus_notices for select
using (expires_at is null or expires_at > now());

drop policy if exists "Admins can publish campus notices" on public.campus_notices;
create policy "Admins can publish campus notices"
on public.campus_notices for insert
to authenticated
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can delete campus notices" on public.campus_notices;
create policy "Admins can delete campus notices"
on public.campus_notices for delete
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into storage.buckets (id, name, public)
values ('notice-images', 'notice-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Everyone can view notice images" on storage.objects;
create policy "Everyone can view notice images"
on storage.objects for select
using (bucket_id = 'notice-images');

drop policy if exists "Admins can upload notice images" on storage.objects;
create policy "Admins can upload notice images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'notice-images'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

alter publication supabase_realtime add table public.campus_notices;
