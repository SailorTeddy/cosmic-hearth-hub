-- Blessing stars — run in Supabase SQL Editor
-- Visitors who send a gift can claim a personal star cluster in the sky.
-- Safe to re-run. Supports color, family side, and named member stars.

create table if not exists public.blessing_stars (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null default '',
  color text not null default '#D4AF37',
  star_count integer not null default 3,
  members jsonb not null default '[]'::jsonb,
  family_side text not null default 'nichols',
  created_at timestamptz not null default now()
);

alter table public.blessing_stars add column if not exists color text;
alter table public.blessing_stars add column if not exists star_count integer;
alter table public.blessing_stars add column if not exists members jsonb;
alter table public.blessing_stars add column if not exists family_side text;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'blessing_stars' and column_name = 'hue'
  ) then
    update public.blessing_stars
    set color = case lower(trim(hue))
      when 'gold' then '#D4AF37'
      when 'blue' then '#6EA8FF'
      when 'violet' then '#A878FF'
      when 'rose' then '#FF8CBE'
      when 'champagne' then '#F0DCB9'
      else coalesce(nullif(color, ''), '#D4AF37')
    end
    where color is null or color = '' or color not like '#%';

    alter table public.blessing_stars drop column if exists hue;
  end if;
end $$;

update public.blessing_stars set color = '#D4AF37' where color is null or btrim(color) = '';
update public.blessing_stars set star_count = 3 where star_count is null or star_count < 1;
update public.blessing_stars set members = '[]'::jsonb where members is null;
update public.blessing_stars
  set family_side = case lower(trim(family_side))
    when 'monica' then 'rentz'
    when 'rentz' then 'rentz'
    when 'emmanuel' then 'nichols'
    when 'nichols' then 'nichols'
    when 'chosen' then 'chosen'
    when 'external' then 'chosen'
    when 'friend' then 'chosen'
    when 'friends' then 'chosen'
    else 'nichols'
  end;

alter table public.blessing_stars alter column color set default '#D4AF37';
alter table public.blessing_stars alter column color set not null;
alter table public.blessing_stars alter column star_count set default 3;
alter table public.blessing_stars alter column star_count set not null;
alter table public.blessing_stars alter column members set default '[]'::jsonb;
alter table public.blessing_stars alter column members set not null;
alter table public.blessing_stars alter column family_side set default 'nichols';
alter table public.blessing_stars alter column family_side set not null;

alter table public.blessing_stars drop constraint if exists blessing_stars_hue_check;
alter table public.blessing_stars drop constraint if exists blessing_stars_color_check;
alter table public.blessing_stars drop constraint if exists blessing_stars_star_count_check;
alter table public.blessing_stars drop constraint if exists blessing_stars_family_side_check;

alter table public.blessing_stars
  add constraint blessing_stars_color_check
  check (color ~ '^#[0-9A-Fa-f]{6}$');

alter table public.blessing_stars
  add constraint blessing_stars_star_count_check
  check (star_count between 1 and 24);

alter table public.blessing_stars
  add constraint blessing_stars_family_side_check
  check (family_side in ('rentz', 'nichols', 'chosen'));

create index if not exists blessing_stars_created_at_idx
  on public.blessing_stars (created_at desc);

alter table public.blessing_stars enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'blessing_stars'
      and policyname = 'blessing_stars_select_public'
  ) then
    create policy blessing_stars_select_public
      on public.blessing_stars
      for select
      to anon, authenticated
      using (true);
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'blessing_stars'
      and policyname = 'blessing_stars_insert_public'
  ) then
    drop policy blessing_stars_insert_public on public.blessing_stars;
  end if;

  create policy blessing_stars_insert_public
    on public.blessing_stars
    for insert
    to anon, authenticated
    with check (
      char_length(trim(name)) between 1 and 60
      and char_length(trim(message)) <= 280
      and color ~ '^#[0-9A-Fa-f]{6}$'
      and star_count between 1 and 24
      and jsonb_typeof(members) = 'array'
      and jsonb_array_length(members) between 1 and 24
      and family_side in ('rentz', 'nichols', 'chosen')
    );

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'blessing_stars'
      and policyname = 'blessing_stars_delete_auth'
  ) then
    create policy blessing_stars_delete_auth
      on public.blessing_stars
      for delete
      to authenticated
      using (true);
  end if;
end $$;
