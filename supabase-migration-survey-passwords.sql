-- Run after supabase-migration-surveys.sql.
-- Passwords are hashed in the database and never returned to the public site.

create extension if not exists pgcrypto;

alter table public.surveys add column if not exists password_protected boolean not null default false;
alter table public.surveys add column if not exists password_hash text;

drop policy if exists "Anyone can read published surveys" on public.surveys;
drop policy if exists "Anyone can read questions for published surveys" on public.survey_questions;
create or replace view public.open_survey_index with (security_barrier = true) as
  select id, title, description, collect_name, password_protected, published_at
  from public.surveys where is_published = true;
grant select on public.open_survey_index to anon, authenticated;

create or replace function public.set_survey_password(p_survey_id uuid, p_password text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') <> 'admin' then raise exception 'Not authorized'; end if;
  update surveys set password_protected = coalesce(length(trim(p_password)), 0) > 0,
    password_hash = case when coalesce(length(trim(p_password)), 0) > 0 then extensions.crypt(p_password, extensions.gen_salt('bf')) else null end
  where id = p_survey_id;
end;
$$;

-- Removes only incomplete drafts left behind by interrupted publishing; published data is never auto-deleted.
create or replace function public.clean_abandoned_survey_drafts()
returns integer language plpgsql security definer set search_path = public as $$
declare removed_count integer;
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') <> 'admin' then raise exception 'Not authorized'; end if;
  delete from surveys where is_published = false and created_at < now() - interval '24 hours';
  get diagnostics removed_count = row_count;
  return removed_count;
end;
$$;

create or replace function public.get_survey_questions(p_survey_id uuid, p_password text default '')
returns table(id uuid, prompt text, question_type text, options jsonb, question_position integer)
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from surveys where surveys.id = p_survey_id and is_published and (not password_protected or extensions.crypt(coalesce(p_password, ''), password_hash) = password_hash)) then
    raise exception 'This opinion is unavailable or the password is incorrect.';
  end if;
  return query select q.id, q.prompt, q.question_type, q.options, q.position from survey_questions q where q.survey_id = p_survey_id order by q.position;
end;
$$;

create or replace function public.submit_survey_response(p_survey_id uuid, p_name text, p_answers jsonb, p_password text default '')
returns uuid language plpgsql security definer set search_path = public as $$
declare response_id uuid; question record; submitted_answer text; survey_requires_name boolean;
begin
  select collect_name into survey_requires_name from surveys where id = p_survey_id and is_published and (not password_protected or extensions.crypt(coalesce(p_password, ''), password_hash) = password_hash);
  if not found then raise exception 'This opinion is unavailable or the password is incorrect.'; end if;
  if survey_requires_name and coalesce(length(trim(p_name)), 0) = 0 then raise exception 'Please enter your name.'; end if;
  if not survey_requires_name then p_name := null; end if;
  insert into survey_responses (survey_id, respondent_name) values (p_survey_id, nullif(trim(p_name), '')) returning id into response_id;
  for question in select id, question_type, options from survey_questions where survey_id = p_survey_id order by position loop
    submitted_answer := nullif(trim(coalesce(p_answers ->> question.id::text, '')), '');
    if submitted_answer is null then raise exception 'Please answer every question.'; end if;
    if question.question_type = 'mcq' and not (question.options ? submitted_answer) then raise exception 'An invalid option was submitted.'; end if;
    insert into survey_answers (response_id, question_id, answer_text) values (response_id, question.id, submitted_answer);
  end loop;
  return response_id;
end;
$$;

revoke all on function public.set_survey_password(uuid, text) from public;
grant execute on function public.set_survey_password(uuid, text) to authenticated;
revoke all on function public.clean_abandoned_survey_drafts() from public;
grant execute on function public.clean_abandoned_survey_drafts() to authenticated;
revoke all on function public.get_survey_questions(uuid, text) from public;
grant execute on function public.get_survey_questions(uuid, text) to anon, authenticated;
revoke all on function public.submit_survey_response(uuid, text, jsonb, text) from public;
grant execute on function public.submit_survey_response(uuid, text, jsonb, text) to anon, authenticated;
revoke execute on function public.submit_survey_response(uuid, text, jsonb) from anon, authenticated;

-- Makes the new view and RPC functions available to Supabase's API immediately.
notify pgrst, 'reload schema';
