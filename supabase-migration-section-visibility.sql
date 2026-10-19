  -- Run this once in Supabase: SQL Editor -> New query -> Run.
  -- Stores the public visibility of each campus service independently.

  create table if not exists public.site_section_visibility (
    section_key text primary key check (section_key in (
      'laundry',
      'mess',
      'bus',
      'curriculum',
      'campus-map',
      'clubs',
      'auth'
    )),
    is_public boolean not null default true,
    updated_at timestamptz not null default now()
  );

  alter table public.site_section_visibility
    drop constraint if exists site_section_visibility_section_key_check;
  alter table public.site_section_visibility
    add constraint site_section_visibility_section_key_check
    check (section_key in ('laundry', 'mess', 'bus', 'curriculum', 'campus-map', 'clubs', 'surveys', 'auth'));

  -- Upgrade an existing installation with the login visibility row.
  insert into public.site_section_visibility (section_key, is_public)
  values
    ('laundry', true),
    ('mess', true),
    ('bus', true),
    ('curriculum', true),
    ('campus-map', true),
    ('clubs', true),
    ('surveys', true),
    ('auth', true)
  on conflict (section_key) do nothing;

  alter table public.site_section_visibility enable row level security;

  grant select on public.site_section_visibility to anon, authenticated;
  grant update on public.site_section_visibility to authenticated;

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
