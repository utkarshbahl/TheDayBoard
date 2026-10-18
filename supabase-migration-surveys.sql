-- Run this in Supabase SQL Editor to enable the public Opinions section.
-- Admin access requires app_metadata.role to be "admin".

create table if not exists public.surveys (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 140),
  description text not null default '' check (char_length(description) <= 1000),
  collect_name boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.survey_questions (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  position integer not null check (position > 0),
  prompt text not null check (char_length(prompt) between 1 and 500),
  question_type text not null check (question_type in ('mcq', 'written')),
  options jsonb not null default '[]'::jsonb,
  unique (survey_id, position),
  check ((question_type = 'written' and options = '[]'::jsonb) or (question_type = 'mcq' and jsonb_array_length(options) between 2 and 10))
);

create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  respondent_name text check (respondent_name is null or char_length(respondent_name) between 1 and 120),
  submitted_at timestamptz not null default now()
);

create table if not exists public.survey_answers (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.survey_responses(id) on delete cascade,
  question_id uuid not null references public.survey_questions(id) on delete cascade,
  answer_text text not null check (char_length(answer_text) between 1 and 3000),
  unique (response_id, question_id)
);

alter table public.surveys enable row level security;
alter table public.survey_questions enable row level security;
alter table public.survey_responses enable row level security;
alter table public.survey_answers enable row level security;

drop policy if exists "Anyone can read published surveys" on public.surveys;
create policy "Anyone can read published surveys" on public.surveys for select using (is_published = true);
drop policy if exists "Admins manage surveys" on public.surveys;
create policy "Admins manage surveys" on public.surveys for all to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
drop policy if exists "Anyone can read questions for published surveys" on public.survey_questions;
create policy "Anyone can read questions for published surveys" on public.survey_questions for select using (exists (select 1 from public.surveys s where s.id = survey_id and s.is_published));
drop policy if exists "Admins manage survey questions" on public.survey_questions;
create policy "Admins manage survey questions" on public.survey_questions for all to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
drop policy if exists "Admins can read survey responses" on public.survey_responses;
create policy "Admins can read survey responses" on public.survey_responses for select to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
drop policy if exists "Admins can read survey answers" on public.survey_answers;
create policy "Admins can read survey answers" on public.survey_answers for select to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create or replace function public.submit_survey_response(p_survey_id uuid, p_name text, p_answers jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  response_id uuid;
  question record;
  submitted_answer text;
  survey_requires_name boolean;
begin
  select collect_name into survey_requires_name from surveys where id = p_survey_id and is_published;
  if not found then raise exception 'This opinion is no longer open.'; end if;
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

revoke all on function public.submit_survey_response(uuid, text, jsonb) from public;
grant execute on function public.submit_survey_response(uuid, text, jsonb) to anon, authenticated;

-- Makes the Opinions item manageable through the existing visibility controls.
alter table public.site_section_visibility drop constraint if exists site_section_visibility_section_key_check;
alter table public.site_section_visibility add constraint site_section_visibility_section_key_check check (section_key in ('laundry', 'mess', 'bus', 'curriculum', 'campus-map', 'auth', 'surveys'));
insert into public.site_section_visibility (section_key, is_public) values ('surveys', true) on conflict (section_key) do nothing;
