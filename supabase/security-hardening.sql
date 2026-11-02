-- Security hardening — run in Supabase SQL Editor (safe to re-run).
-- Locks down leftover journal/guestbook tables after those features were removed,
-- and tightens blessing_stars delete so random authenticated users cannot wipe stars.

-- ── Journal (feature removed from the site) ──────────────────────────────────
do $$
begin
  if to_regclass('public.journal_entries') is not null then
    drop policy if exists journal_select_public on public.journal_entries;
    drop policy if exists journal_insert_auth on public.journal_entries;
    drop policy if exists journal_update_auth on public.journal_entries;
    drop policy if exists journal_delete_auth on public.journal_entries;

    -- No anon/authenticated access; service role (dashboard) still works.
    revoke all on public.journal_entries from anon, authenticated;
  end if;
end $$;

-- Journal storage bucket policies (if present)
do $$
begin
  if exists (select 1 from storage.buckets where id = 'journal') then
    drop policy if exists journal_images_select on storage.objects;
    drop policy if exists journal_images_insert on storage.objects;
    drop policy if exists journal_images_update on storage.objects;
    drop policy if exists journal_images_delete on storage.objects;
    update storage.buckets set public = false where id = 'journal';
  end if;
end $$;

-- ── Guestbook (feature removed from the site) ────────────────────────────────
do $$
begin
  if to_regclass('public.guestbook_notes') is not null then
    drop policy if exists guestbook_insert_public on public.guestbook_notes;
    drop policy if exists guestbook_select_auth on public.guestbook_notes;
    revoke all on public.guestbook_notes from anon, authenticated;
  end if;
end $$;

-- ── Blessing stars — remove open delete-for-any-authenticated-user ───────────
do $$
begin
  if to_regclass('public.blessing_stars') is not null then
    drop policy if exists blessing_stars_delete_auth on public.blessing_stars;
    -- Deletes only via service role / dashboard. Public may still SELECT + INSERT (RLS).
  end if;
end $$;
