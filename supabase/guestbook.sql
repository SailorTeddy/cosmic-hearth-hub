-- Guestbook notes — run in Supabase SQL Editor
-- Safe to re-run. Adds IP / device / network columns for family inbox.

create table if not exists public.guestbook_notes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null,
  reaction text not null,
  ip_address text,
  user_agent text,
  device_label text,
  network_label text,
  created_at timestamptz not null default now()
);

alter table public.guestbook_notes add column if not exists ip_address text;
alter table public.guestbook_notes add column if not exists user_agent text;
alter table public.guestbook_notes add column if not exists device_label text;
alter table public.guestbook_notes add column if not exists network_label text;

create index if not exists guestbook_notes_created_at_idx
  on public.guestbook_notes (created_at desc);

alter table public.guestbook_notes enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'guestbook_notes'
      and policyname = 'guestbook_insert_public'
  ) then
    create policy guestbook_insert_public
      on public.guestbook_notes
      for insert
      to anon, authenticated
      with check (
        char_length(trim(name)) between 1 and 60
        and char_length(trim(message)) between 1 and 600
        and char_length(trim(reaction)) between 1 and 16
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'guestbook_notes'
      and policyname = 'guestbook_select_auth'
  ) then
    create policy guestbook_select_auth
      on public.guestbook_notes
      for select
      to authenticated
      using (true);
  end if;
end $$;
