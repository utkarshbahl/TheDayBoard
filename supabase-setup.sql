-- Run this once in Supabase: SQL Editor → New query → Run.
-- Then create the laundry staff account in Authentication → Users → Add user.

create table public.laundry_status (
  id integer primary key check (id = 1),
  ready_token integer not null check (ready_token >= 0),
  updated_at timestamptz not null default now()
);

insert into public.laundry_status (id, ready_token) values (1, 84);

alter table public.laundry_status enable row level security;

create policy "Anyone can view the current laundry status"
on public.laundry_status for select using (true);

create policy "Signed-in staff can update the laundry status"
on public.laundry_status for update to authenticated using (true) with check (true);

create or replace function public.set_laundry_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger laundry_status_updated_at
before update on public.laundry_status
for each row execute function public.set_laundry_updated_at();

alter publication supabase_realtime add table public.laundry_status;
