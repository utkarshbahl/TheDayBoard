-- Run this once in Supabase SQL Editor to make Campus Clubs available in Admin > Hide tabs.
-- It is safe to run after the existing section-visibility and survey migrations.

alter table public.site_section_visibility
  drop constraint if exists site_section_visibility_section_key_check;
alter table public.site_section_visibility
  add constraint site_section_visibility_section_key_check
  check (section_key in ('laundry', 'mess', 'bus', 'curriculum', 'campus-map', 'clubs', 'auth', 'surveys'));

insert into public.site_section_visibility (section_key, is_public)
values ('clubs', true)
on conflict (section_key) do nothing;

notify pgrst, 'reload schema';
