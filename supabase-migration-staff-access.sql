-- Run once in Supabase SQL Editor if the original setup script was already run.
-- This prevents ordinary signed-in users from changing the ready token.

drop policy if exists "Signed-in staff can update the laundry status" on public.laundry_status;
drop policy if exists "Laundry staff can update the laundry status" on public.laundry_status;

create policy "Laundry staff can update the laundry status"
on public.laundry_status for update to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'laundry_staff')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'laundry_staff');

-- Replace the email below with the real laundry staff account, then run this line.
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
--   || '{"role":"laundry_staff"}'::jsonb
-- where email = 'laundry.staff@lnmiit.ac.in';
