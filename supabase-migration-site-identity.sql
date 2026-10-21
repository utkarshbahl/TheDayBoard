  -- Run this once in Supabase: SQL Editor -> New query -> Run.
  -- Stores the product name and the club credit shown across the site.
  -- Update a row to rebrand the board without touching the front end.

  create table if not exists public.site_settings (
    key text primary key,
    value text not null,
    updated_at timestamptz not null default now()
  );

  insert into public.site_settings (key, value) values
    ('site_name', 'TheDayBoard'),
    ('site_credit', 'by Ethers Club')
  on conflict (key) do nothing;

  alter table public.site_settings enable row level security;

  grant select on public.site_settings to anon, authenticated;
  grant update on public.site_settings to authenticated;

  drop policy if exists "Anyone can view site settings" on public.site_settings;
  create policy "Anyone can view site settings"
    on public.site_settings for select
    using (true);

  drop policy if exists "Admins can update site settings" on public.site_settings;
  create policy "Admins can update site settings"
    on public.site_settings for update to authenticated
    using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

  create or replace function public.set_site_settings_updated_at()
  returns trigger language plpgsql as $$
  begin
    new.updated_at = now();
    return new;
  end;
  $$;

  drop trigger if exists site_settings_updated_at on public.site_settings;
  create trigger site_settings_updated_at
    before update on public.site_settings
    for each row execute function public.set_site_settings_updated_at();
