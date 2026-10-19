-- Run this once in Supabase SQL Editor after the traffic analytics migration.
-- Adds the Home, Laundry, Clubs, and Opinions paths to analytics.

alter table public.site_page_views
  drop constraint if exists site_page_views_page_path_check;
alter table public.site_page_views
  add constraint site_page_views_page_path_check
  check (page_path in ('/', '/laundry', '/mess-menu', '/bus-timings', '/campus-map', '/curriculum', '/clubs', '/surveys'));
