-- Nichols Estate Family Journal
-- Paste ALL of this into Supabase SQL Editor and click Run.

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('Milestones', 'Projects', 'Life')),
  date_label text not null,
  title text not null,
  body text not null,
  image_url text,
  image_alt text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.journal_entries enable row level security;

create index if not exists journal_entries_created_at_idx
  on public.journal_entries (created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'journal_entries_set_updated_at'
  ) then
    create trigger journal_entries_set_updated_at
      before update on public.journal_entries
      for each row
      execute function public.set_updated_at();
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'journal_entries'
      and policyname = 'journal_select_public'
  ) then
    create policy journal_select_public
      on public.journal_entries
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'journal_entries'
      and policyname = 'journal_insert_auth'
  ) then
    create policy journal_insert_auth
      on public.journal_entries
      for insert
      to authenticated
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'journal_entries'
      and policyname = 'journal_update_auth'
  ) then
    create policy journal_update_auth
      on public.journal_entries
      for update
      to authenticated
      using (true)
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'journal_entries'
      and policyname = 'journal_delete_auth'
  ) then
    create policy journal_delete_auth
      on public.journal_entries
      for delete
      to authenticated
      using (true);
  end if;
end $$;

insert into storage.buckets (id, name, public)
values ('journal', 'journal', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'journal_images_select'
  ) then
    create policy journal_images_select
      on storage.objects
      for select
      to anon, authenticated
      using (bucket_id = 'journal');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'journal_images_insert'
  ) then
    create policy journal_images_insert
      on storage.objects
      for insert
      to authenticated
      with check (bucket_id = 'journal');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'journal_images_update'
  ) then
    create policy journal_images_update
      on storage.objects
      for update
      to authenticated
      using (bucket_id = 'journal')
      with check (bucket_id = 'journal');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'journal_images_delete'
  ) then
    create policy journal_images_delete
      on storage.objects
      for delete
      to authenticated
      using (bucket_id = 'journal');
  end if;
end $$;

insert into public.journal_entries (category, date_label, title, body)
select v.category, v.date_label, v.title, v.body
from (
  values
    ('Milestones', 'July 2026', 'First night with the telescope', 'We spent the evening looking at the sky together.'),
    ('Life', 'June 2026', 'Slow mornings are back', 'Quiet coffee at the kitchen table.'),
    ('Projects', 'June 2026', 'The garage workbench build', 'Half finished and already loved.'),
    ('Milestones', 'May 2026', 'A new chapter, officially signed', 'Paperwork done. Deep breath.'),
    ('Life', 'April 2026', 'Sunday table, open invite', 'If you are in town on Sunday, there is a plate for you.'),
    ('Projects', 'April 2026', 'This little corner of the internet', 'A home base for family updates.')
) as v(category, date_label, title, body)
where not exists (select 1 from public.journal_entries limit 1);
