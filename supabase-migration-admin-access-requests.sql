-- The admin access request workflow has been removed.
-- Manage administrator roles directly in Supabase Auth app_metadata.

drop function if exists public.admin_set_user_admin(uuid, boolean);
drop function if exists public.admin_review_access_request(uuid, boolean);
drop function if exists public.admin_list_access_requests();
drop function if exists public.request_admin_access();
drop table if exists public.admin_access_requests;
