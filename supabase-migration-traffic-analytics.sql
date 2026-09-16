-- Run this once in Supabase SQL Editor.
-- This stores anonymous page-view counts only: page path and timestamp.

create table if not exists public.site_page_views (
  id bigint generated always as identity primary key,
  page_path text not null check (page_path in ('/', '/about', '/mess-menu', '/bus-timings', '/campus-map', '/curriculum')),
  created_at timestamptz not null default now()
);

create index if not exists site_page_views_created_at_idx on public.site_page_views (created_at desc);

alter table public.site_page_views enable row level security;

create policy "Visitors can record anonymous page views"
on public.site_page_views for insert
to anon, authenticated
with check (true);

create policy "Admins can view traffic analytics"
on public.site_page_views for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Create an Authentication user for the admin, then assign this role:
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
-- where email = 'admin-email@example.com';
