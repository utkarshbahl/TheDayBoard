-- Run in the Supabase SQL Editor to make Placements controllable from Admin.

alter table public.site_section_visibility
  drop constraint if exists site_section_visibility_section_key_check;
alter table public.site_section_visibility
  add constraint site_section_visibility_section_key_check
  check (section_key in ('laundry', 'mess', 'bus', 'curriculum', 'placements', 'campus-map', 'clubs', 'surveys', 'auth'));

insert into public.site_section_visibility (section_key, is_public)
values ('placements', true)
on conflict (section_key) do nothing;

alter table public.site_page_views
  drop constraint if exists site_page_views_page_path_check;
alter table public.site_page_views
  add constraint site_page_views_page_path_check
  check (page_path in ('/', '/laundry', '/mess-menu', '/bus-timings', '/campus-map', '/curriculum', '/placements', '/clubs', '/surveys'));
