-- Run this once in Supabase SQL Editor.
-- This stores anonymous page views: page path, timestamp and a random session ID.
-- The session ID is kept only while a visitor has the site open; it is not a login or identity.

create table if not exists public.site_page_views (
  id bigint generated always as identity primary key,
  page_path text not null check (page_path in ('/', '/mess-menu', '/bus-timings', '/campus-map', '/curriculum')),
  visitor_id uuid not null,
  created_at timestamptz not null default now()
);

-- Safe to run if the earlier page-view-only migration was already applied.
alter table public.site_page_views add column if not exists visitor_id uuid;
alter table public.site_page_views drop constraint if exists site_page_views_page_path_check;
alter table public.site_page_views add constraint site_page_views_page_path_check
  check (page_path in ('/', '/mess-menu', '/bus-timings', '/campus-map', '/curriculum'));

create index if not exists site_page_views_created_at_idx on public.site_page_views (created_at desc);

alter table public.site_page_views enable row level security;

drop policy if exists "Visitors can record anonymous page views" on public.site_page_views;
drop policy if exists "Admins can view traffic analytics" on public.site_page_views;

create policy "Visitors can record anonymous page views"
on public.site_page_views for insert
to anon, authenticated
with check (true);

create policy "Admins can view traffic analytics"
on public.site_page_views for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create or replace function public.get_site_traffic_analytics()
returns jsonb
language sql
stable
as $$
  with boundaries as (
    select date_trunc('day', now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata' as today_start,
           (date_trunc('day', now() at time zone 'Asia/Kolkata') - interval '6 days') at time zone 'Asia/Kolkata' as week_start
  ), page_counts as (
    select page_path, count(*)::bigint as views
    from public.site_page_views, boundaries
    where created_at >= week_start
    group by page_path
  )
  select jsonb_build_object(
    'today', count(distinct visitor_id) filter (where created_at >= today_start),
    'week', count(distinct visitor_id) filter (where created_at >= week_start),
    'all', count(distinct visitor_id),
    'breakdown', coalesce((select jsonb_object_agg(page_path, views) from page_counts), '{}'::jsonb)
  )
  from public.site_page_views, boundaries;
$$;

grant execute on function public.get_site_traffic_analytics() to authenticated;

-- Create an Authentication user for the admin, then assign this role:
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
-- where email = 'admin-email@example.com';
