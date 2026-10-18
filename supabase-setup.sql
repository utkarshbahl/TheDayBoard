-- Run this in Supabase SQL Editor for a direct-access DayBoard.
-- This project intentionally does not use Supabase Authentication.

create table if not exists public.laundry_status (
  id integer primary key check (id = 1),
  ready_token integer not null check (ready_token >= 0),
  updated_at timestamptz not null default now()
);

insert into public.laundry_status (id, ready_token)
values (1, 84)
on conflict (id) do nothing;

alter table public.laundry_status enable row level security;
drop policy if exists "Anyone can view the current laundry status" on public.laundry_status;
drop policy if exists "Laundry staff can update the laundry status" on public.laundry_status;
drop policy if exists "Signed-in staff can update the laundry status" on public.laundry_status;
drop policy if exists "Anyone can update the laundry status" on public.laundry_status;
create policy "Anyone can view the current laundry status" on public.laundry_status for select using (true);
create policy "Anyone can update the laundry status" on public.laundry_status for update to anon, authenticated using (true) with check (true);

create or replace function public.set_laundry_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists laundry_status_updated_at on public.laundry_status;
create trigger laundry_status_updated_at before update on public.laundry_status for each row execute function public.set_laundry_updated_at();

alter publication supabase_realtime add table public.laundry_status;
