-- Run this once in Supabase SQL Editor to enable the admin mess-menu controls.
create table if not exists public.mess_menu (id integer primary key check (id = 1), menu jsonb not null, source_pdf_path text, updated_at timestamptz not null default now());
alter table public.mess_menu enable row level security;
create policy "Anyone can view the published mess menu" on public.mess_menu for select using (true);
create policy "Admins can manage the mess menu" on public.mess_menu for all to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
drop policy if exists "Laundry staff can update the laundry status" on public.laundry_status;
create policy "Laundry staff or admins can update the laundry status" on public.laundry_status for update to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('laundry_staff', 'admin')) with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('laundry_staff', 'admin'));
insert into storage.buckets (id, name, public) values ('mess-menu-files', 'mess-menu-files', true) on conflict (id) do update set public = true;
create policy "Anyone can view official mess menu PDFs" on storage.objects for select using (bucket_id = 'mess-menu-files');
create policy "Admins can upload official mess menu PDFs" on storage.objects for insert to authenticated with check (bucket_id = 'mess-menu-files' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
alter publication supabase_realtime add table public.mess_menu;
