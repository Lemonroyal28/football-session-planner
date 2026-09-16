# Player Profiles — Design & Technical Spec

Status: Approved design, not yet implemented
Depends on: player rows already live in `public.players`, scoped to a `teams` row (squad). This feature extends that table; it does not depend on the multi-user/org work in `multi-user-team-collaboration-design.md` to function, but once that work lands, player data inherits org-scoped RLS automatically since `players` is joined through `teams`.

## Goals

- Coaches can create a profile for each player on their team: name, date of birth, position(s), and a FIFA-style rating.
- Rating is broken into six attributes (Pace, Shooting, Passing, Dribbling, Defending, Physical) on a 1-99 scale, with an overall computed as their average.
- One primary position plus optional secondary positions, drawn from a fixed position list.
- Optional player photo.
- Ship the data model, entry form, and a list/detail view now; a stylized FIFA-card visual component is an explicit fast-follow, not part of this pass.

## Current State

`public.players` (from `002_create_teams_players.sql`):

```sql
create table public.players (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  number int,
  name text not null,
  preferred_positions text[] default '{}',
  active boolean default true,
  created_at timestamptz default now()
);
```

RLS: CRUD allowed if the requesting user owns the parent `teams` row (`teams.user_id = auth.uid()`). This access pattern is unchanged by this feature — it will later inherit org-scoping automatically once the `teams` table itself becomes org-scoped per the multi-user design.

## Data Model Changes

```sql
-- 012_add_player_profile_fields.sql

alter table public.players
  add column date_of_birth date,
  add column primary_position text,
  add column secondary_positions text[] default '{}',
  add column photo_url text,
  add column rating_pace int check (rating_pace between 1 and 99),
  add column rating_shooting int check (rating_shooting between 1 and 99),
  add column rating_passing int check (rating_passing between 1 and 99),
  add column rating_dribbling int check (rating_dribbling between 1 and 99),
  add column rating_defending int check (rating_defending between 1 and 99),
  add column rating_physical int check (rating_physical between 1 and 99);

alter table public.players
  add constraint players_primary_position_check check (
    primary_position is null or primary_position in (
      'GK','CB','LB','RB','CDM','CM','CAM','LM','RM','LW','RW','ST'
    )
  );
```

- `preferred_positions text[]` stays in the schema for backward compatibility with any existing data/UI, but new player forms write to `primary_position` + `secondary_positions` instead. It can be dropped in a later cleanup migration once nothing reads it.
- **Overall rating is never stored** — always computed in application code (and optionally exposed as a generated column for querying/sorting):

```sql
alter table public.players
  add column overall_rating int generated always as (
    case
      when rating_pace is null or rating_shooting is null or rating_passing is null
        or rating_dribbling is null or rating_defending is null or rating_physical is null
      then null
      else round((rating_pace + rating_shooting + rating_passing + rating_dribbling + rating_defending + rating_physical) / 6.0)
    end
  ) stored;
```

Using a generated column (rather than computing client-side only) makes sorting/filtering players by overall rating a plain indexed query.

- **Age** is always derived from `date_of_birth`, never stored as a raw integer:

```sql
select *, extract(year from age(date_of_birth))::int as age from public.players;
```

The app-layer helper for this lives alongside the player type, not duplicated per-page.

- **Position scope note**: all six attributes apply uniformly regardless of position, including goalkeepers. A GK's "shooting"/"dribbling" numbers will typically sit low and "defending"/"physical" higher — this is accepted as the v1 tradeoff rather than branching the schema per position. Revisit only if coaches report the six-attribute model doesn't fit GKs well in practice.

## Storage: Player Photos

New Supabase Storage bucket: `player-photos`.

- Public read (photos aren't sensitive) or org/team-scoped read — recommend **team-scoped read** to stay consistent with the rest of the data model, using a storage RLS policy keyed off the folder path convention `team-photos/{team_id}/{player_id}.{ext}`:

```sql
create policy "Team members can read player photos"
  on storage.objects for select
  using (
    bucket_id = 'player-photos'
    and exists (
      select 1 from public.teams
      where teams.id::text = (storage.foldername(name))[1]
      and teams.user_id = auth.uid() -- becomes org-scoped once multi-user design lands
    )
  );

create policy "Team members can upload player photos"
  on storage.objects for insert
  with check (
    bucket_id = 'player-photos'
    and exists (
      select 1 from public.teams
      where teams.id::text = (storage.foldername(name))[1]
      and teams.user_id = auth.uid()
    )
  );
```

- `players.photo_url` stores the public/signed URL (or just the storage path, resolved to a URL at read time — prefer storing the path and resolving client-side, so bucket visibility changes don't require a data migration).
- No photo set → UI falls back to initials-on-jersey-color avatar, no placeholder image asset needed.

## Permissions

No new role logic. Any coach with write access to the parent `teams` row can create/edit any player profile and ratings on that team — same shared-editing model as the rest of the app's data. No separate "who can rate players" restriction.

## UI

### Player form (create/edit)
- Name (text, required)
- Jersey number (existing field, unchanged)
- Date of birth (date picker) — displays computed age next to the field, read-only
- Primary position (single select, fixed list: GK, CB, LB, RB, CDM, CM, CAM, LM, RM, LW, RW, ST)
- Secondary positions (multi-select, same list, excludes whatever is chosen as primary)
- Photo (optional upload, image crop-to-square recommended, stored to `player-photos/{team_id}/{player_id}.{ext}`)
- Six attribute sliders (1-99): Pace, Shooting, Passing, Dribbling, Defending, Physical
- Live-computed **Overall** badge next to the form title, recalculated client-side as sliders move (matches the generated column server-side)

### Player list / detail view
- Per-team list (existing `(app)/teams/[id]` page gains a players section, or a dedicated `(app)/teams/[id]/players` view — reuse whichever the current teams UI already has for the player roster)
- Each row/card shows: photo (or initials avatar), name, computed age, primary position badge, overall rating badge
- Sort/filter controls: by primary position, by overall rating (desc/asc)
- Click through to a player detail view showing full attribute breakdown (six stats) and secondary positions

### Explicitly deferred
- Stylized FIFA-card visual component (photo + rating badge + attribute bars laid out like an actual FIFA/EA FC card) — ship as a follow-up once this data model and the basic list/form views are live and in use.

## Code Changes

- New migration: `src/web/supabase/migrations/012_add_player_profile_fields.sql` (schema above) and a follow-up `013_create_player_photos_bucket.sql` (bucket + storage policies).
- `types/` — extend the `Player` type with `date_of_birth`, `primary_position`, `secondary_positions`, `photo_url`, the six rating fields, and a derived `overall_rating` (nullable if any attribute is unset).
- New shared helper (e.g. `lib/players.ts`): `calculateAge(dateOfBirth)`, `calculateOverall(ratings)`, `POSITION_OPTIONS` constant — used by both the form (live preview) and list/detail views, so the computation logic isn't duplicated.
- Player form component (likely under `components/players/` or wherever the existing team/roster UI lives) — extend or replace whatever currently handles `preferred_positions` entry.
- Player list/detail components — add rating badge, age, position display; add sort/filter controls.

## Out of Scope (v1)

- Stylized FIFA-card visual/graphic component.
- Position-specific attribute sets (e.g. GK-specific stats like Diving, Handling, Reflexes) — same six attributes apply to every position.
- Historical rating tracking (rating changes over time/season) — only the current rating is stored, no versioning.
- Auto-suggested lineups or squad-balance tooling based on ratings — this spec only covers data entry and display.
- Bulk import of player rosters/ratings (e.g. CSV) — manual entry only for v1.
