-- Contributor attribution: track who last edited a shared item, separate from
-- user_id (the original creator). Nullable, no backfill — the UI falls back
-- to user_id when last_edited_by is null (i.e. rows never edited since this shipped).
alter table public.sessions add column last_edited_by uuid references auth.users(id) on delete set null;
alter table public.drills add column last_edited_by uuid references auth.users(id) on delete set null;
alter table public.session_templates add column last_edited_by uuid references auth.users(id) on delete set null;
