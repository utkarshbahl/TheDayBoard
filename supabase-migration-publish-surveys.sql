-- Run this in Supabase SQL Editor after the existing survey migrations.
-- Publishing is performed atomically so a policy error cannot leave a draft
-- survey or a form permanently waiting in the browser.

create extension if not exists pgcrypto;

alter table public.surveys add column if not exists password_protected boolean not null default false;
alter table public.surveys add column if not exists password_hash text;

create or replace function public.publish_survey(
  p_title text,
  p_description text,
  p_collect_name boolean,
  p_password text default '',
  p_questions jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  new_survey_id uuid;
  question jsonb;
  question_position integer := 0;
  question_prompt text;
  question_type text;
  question_options jsonb;
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') <> 'admin' then
    raise exception 'Not authorized to publish opinions.';
  end if;

  if coalesce(char_length(trim(p_title)), 0) not between 1 and 140 then
    raise exception 'Opinion title must contain between 1 and 140 characters.';
  end if;
  if char_length(coalesce(p_description, '')) > 1000 then
    raise exception 'Opinion description is too long.';
  end if;
  if jsonb_typeof(p_questions) <> 'array' or jsonb_array_length(p_questions) = 0 then
    raise exception 'Add at least one question.';
  end if;

  insert into public.surveys (title, description, collect_name, is_published, published_at, password_protected, password_hash)
  values (
    trim(p_title),
    coalesce(trim(p_description), ''),
    coalesce(p_collect_name, false),
    true,
    now(),
    coalesce(char_length(trim(p_password)), 0) > 0,
    case when coalesce(char_length(trim(p_password)), 0) > 0 then crypt(p_password, gen_salt('bf')) else null end
  ) returning id into new_survey_id;

  for question in select value from jsonb_array_elements(p_questions) loop
    question_position := question_position + 1;
    question_prompt := trim(coalesce(question ->> 'prompt', ''));
    question_type := question ->> 'question_type';
    select coalesce(jsonb_agg(option_value), '[]'::jsonb) into question_options
    from jsonb_array_elements_text(coalesce(question -> 'options', '[]'::jsonb)) as option_value
    where trim(option_value) <> '';

    if char_length(question_prompt) not between 1 and 500 then
      raise exception 'Question % needs a prompt.', question_position;
    end if;
    if question_type not in ('mcq', 'written') then
      raise exception 'Question % has an invalid answer type.', question_position;
    end if;
    if question_type = 'mcq' and jsonb_array_length(question_options) not between 2 and 10 then
      raise exception 'Question % needs between 2 and 10 options.', question_position;
    end if;
    if question_type = 'written' then question_options := '[]'::jsonb; end if;

    insert into public.survey_questions (survey_id, position, prompt, question_type, options)
    values (new_survey_id, question_position, question_prompt, question_type, question_options);
  end loop;

  return new_survey_id;
end;
$$;

revoke all on function public.publish_survey(text, text, boolean, text, jsonb) from public;
grant execute on function public.publish_survey(text, text, boolean, text, jsonb) to authenticated;

notify pgrst, 'reload schema';
