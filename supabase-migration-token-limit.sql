-- Run this only if you already ran supabase-setup.sql before this change.
-- Supabase → SQL Editor → New query → Run

alter table public.laundry_status
  drop constraint if exists laundry_status_ready_token_check;

alter table public.laundry_status
  add constraint laundry_status_ready_token_check check (ready_token >= 0);
