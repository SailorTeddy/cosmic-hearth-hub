/* Quick fix for blessing_stars missing columns + schema cache */

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

update public.blessing_stars set color = '#D4AF37' where color is null or btrim(color) = '';
update public.blessing_stars set star_count = 3 where star_count is null or star_count < 1;
update public.blessing_stars set members = '[]'::jsonb where members is null;
update public.blessing_stars
  set family_side = coalesce(nullif(btrim(family_side), ''), 'nichols')
  where family_side is null or btrim(family_side) = '';

update public.blessing_stars
  set family_side = case lower(trim(family_side))
    when 'monica' then 'rentz'
    when 'emmanuel' then 'nichols'
    when 'external' then 'chosen'
    when 'friend' then 'chosen'
    when 'friends' then 'chosen'
    when 'rentz' then 'rentz'
    when 'nichols' then 'nichols'
    when 'chosen' then 'chosen'
    else 'nichols'
  end;

alter table public.blessing_stars alter column color set default '#D4AF37';
alter table public.blessing_stars alter column star_count set default 3;
alter table public.blessing_stars alter column members set default '[]'::jsonb;
alter table public.blessing_stars alter column family_side set default 'nichols';

alter table public.blessing_stars alter column color set not null;
alter table public.blessing_stars alter column star_count set not null;
alter table public.blessing_stars alter column members set not null;
alter table public.blessing_stars alter column family_side set not null;

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

alter table public.blessing_stars enable row level security;

notify pgrst, 'reload schema';
