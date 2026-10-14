  -- Run this once in Supabase: SQL Editor -> New query -> Run.
  -- Stores the public visibility of each campus service independently.

  create table if not exists public.site_section_visibility (
    section_key text primary key check (section_key in (
      'laundry',
      'mess',
      'bus',
      'curriculum',
      'campus-map'
    )),
    is_public boolean not null default true,
    updated_at timestamptz not null default now()
  );

  insert into public.site_section_visibility (section_key, is_public)
  values
    ('laundry', true),
    ('mess', true),
    ('bus', true),
    ('curriculum', true),
    ('campus-map', true)
  on conflict (section_key) do nothing;

  alter table public.site_section_visibility enable row level security;

  drop policy if exists "Anyone can view section visibility" on public.site_section_visibility;
  create policy "Anyone can view section visibility"
  on public.site_section_visibility for select
  using (true);

  drop policy if exists "Admins can update section visibility" on public.site_section_visibility;
  create policy "Admins can update section visibility"
  on public.site_section_visibility for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

  create or replace function public.set_section_visibility_updated_at()
  returns trigger language plpgsql as $$
  begin
    new.updated_at = now();
    return new;
  end;
  $$;

  drop trigger if exists site_section_visibility_updated_at on public.site_section_visibility;
  create trigger site_section_visibility_updated_at
  before update on public.site_section_visibility
  for each row execute function public.set_section_visibility_updated_at();
