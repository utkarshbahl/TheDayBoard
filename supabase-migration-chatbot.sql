    -- Run once in Supabase SQL Editor.
    -- Adds public chatbot settings and anonymous request analytics.

    insert into public.site_settings (key, value) values
      ('chatbot_enabled', 'true'),
      ('chatbot_name', 'TheDayBoard AI'),
      ('chatbot_welcome', 'Hi! I’m your campus assistant. What would you like to know?'),
      ('chatbot_model', 'openai-fast'),
      ('chatbot_instructions', 'Only answer questions about TheDayBoard website features and campus services. Do not invent facts.')
    on conflict (key) do nothing;

    create table if not exists public.chatbot_requests (
      id bigint generated always as identity primary key,
      created_at timestamptz not null default now()
    );

    create index if not exists chatbot_requests_created_at_idx
      on public.chatbot_requests (created_at desc);

    alter table public.chatbot_requests enable row level security;

    drop policy if exists "Visitors can record chatbot requests" on public.chatbot_requests;
    create policy "Visitors can record chatbot requests"
    on public.chatbot_requests for insert to anon, authenticated
    with check (true);

    create or replace function public.get_chatbot_analytics()
    returns jsonb
    language sql
    stable
    security definer
    set search_path = public
    as $$
      select case
        when (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' then (
          with boundaries as (
            select date_trunc('day', now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata' as today_start,
                  (date_trunc('day', now() at time zone 'Asia/Kolkata') - interval '6 days') at time zone 'Asia/Kolkata' as week_start
          )
          select jsonb_build_object(
            'today', count(*) filter (where created_at >= today_start),
            'week', count(*) filter (where created_at >= week_start),
            'all', count(*)
          )
          from public.chatbot_requests, boundaries
        )
        else jsonb_build_object('today', 0, 'week', 0, 'all', 0)
      end;
    $$;

    revoke all on function public.get_chatbot_analytics() from public;
    grant execute on function public.get_chatbot_analytics() to authenticated;
