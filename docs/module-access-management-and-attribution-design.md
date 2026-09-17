# Module Access Management & Contributor Attribution — Design & Technical Spec

Status: Draft, not yet implemented
Depends on: `docs/multi-user-team-collaboration-design.md` (organizations, roles, invites — already implemented in migrations 008–016). This spec assumes that foundation is live: every user belongs to one `organizations` row via `profiles.organization_id`, `profiles.role` is `'admin' | 'coach'`, and org-scoped RLS already gates `sessions`, `drills`, `teams`, `session_templates`, `players`, `session_blocks`, `attendance_records`.

## Goals

1. **Default shared access.** When a coach joins an org, they see the same shared library as everyone else (sessions, drills, templates, teams, attendance, tactical board, calendar) — org-wide sharing already works via existing RLS. This spec does not change that default.
2. **Admin-managed module access.** An admin can restrict which *modules* a given coach can open, from a new **Access** tab in Settings. A restricted module is hidden from that coach's nav and blocked at the route level, not just visually.
3. **In-app access requests.** A coach who hits a restricted module can request access from inside the app (no email/Slack round-trip). The admin sees pending requests in the same Access tab and approves or denies with one click.
4. **Contributor attribution.** Every shared item (session, drill, template, and tactical board save) visibly shows who created it and who last edited it, via a small avatar+name tag, wherever that item is listed or opened.

## Modules

Fixed list, matching the app's real route/nav surface:

| Module key | Nav label | Route(s) |
|---|---|---|
| `sessions` | Sessions | `/sessions`, `/sessions/new`, `/sessions/[id]` |
| `drills` | Drill Library | `/drills`, `/drills/new`, `/drills/[id]` |
| `templates` | Templates | `/templates`, `/templates/[id]` |
| `teams` | Teams | `/teams`, `/teams/new`, `/teams/[id]` |
| `attendance` | Attendance | `/attendance/[sessionId]` |
| `tactical_board` | Tactical Board | `/tactical-board` |
| `calendar` | Calendar | `/calendar` |

Not gated (always available to every org member, admin or coach): `/dashboard`, `/settings` (the settings page itself is always reachable; the **Access** tab within it is admin-only — see Permissions).

## Data Model

### New table: `module_access`

One row per (organization, profile, module). Absence of a row for a given module means **granted** (default-open, matching "all features must be shared" for anyone not explicitly restricted). A row only exists to record an explicit `revoked` state or a pending/decided request.

```sql
create table public.module_access (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  module text not null check (module in (
    'sessions', 'drills', 'templates', 'teams', 'attendance', 'tactical_board', 'calendar'
  )),
  status text not null default 'granted' check (status in ('granted', 'revoked', 'requested')),
  requested_at timestamptz,
  decided_by uuid references auth.users(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (profile_id, module)
);

alter table public.module_access enable row level security;

create policy "Org members can view module access in their org"
  on public.module_access for select
  using (
    organization_id in (select organization_id from public.profiles where id = auth.uid())
  );

-- A coach can create/update only their OWN row, and only to move it into 'requested' state.
create policy "Members can request access to their own modules"
  on public.module_access for insert
  with check (
    profile_id = auth.uid()
    and status = 'requested'
    and organization_id in (select organization_id from public.profiles where id = auth.uid())
  );

create policy "Members can re-request their own revoked access"
  on public.module_access for update
  using (profile_id = auth.uid())
  with check (
    profile_id = auth.uid()
    and status = 'requested'
  );

-- Admins can grant/revoke/decide for anyone in their org.
create policy "Admins manage module access in their org"
  on public.module_access for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.organization_id = module_access.organization_id
      and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.organization_id = module_access.organization_id
      and profiles.role = 'admin'
    )
  );
```

Admins are implicitly granted every module regardless of any row present (enforced in application code — see Access Resolution below), so admin accounts never end up locking themselves out.

### Existing tables — contributor attribution

`sessions`, `drills`, `session_templates` already have `user_id` (the creator, effectively — keep this as the "created by" pointer, do not rename). Add a last-editor pointer:

```sql
alter table public.sessions add column last_edited_by uuid references auth.users(id) on delete set null;
alter table public.drills add column last_edited_by uuid references auth.users(id) on delete set null;
alter table public.session_templates add column last_edited_by uuid references auth.users(id) on delete set null;
```

`last_edited_by` is set to `auth.uid()` by the app on every update (not a DB trigger — keeps write path simple and consistent with how `updated_at` is already set client-side elsewhere in this codebase). Falls back to `user_id` (creator) when `last_edited_by` is null, i.e. for rows never edited since this column shipped.

Tactical board saves reuse `sessions.last_edited_by` since a tactical board layout is saved as part of a session (per existing architecture — the tactical board editor takes an `onSave` prop and is embedded in the session builder). No separate attribution column needed there.

Calendar has no standalone table — it's a view/query over `sessions` (grouped by date). It therefore inherits `sessions`' org-scoped RLS automatically: every org member sees every teammate's scheduled sessions on the shared calendar, with no additional policy needed. Confirmed explicitly here so it isn't assumed silently: calendar visibility is shared org-wide, same as every other module.

## Access Resolution (application logic)

A single helper, `resolveModuleAccess(profile, organizationId)`, used by middleware and by the nav:

```ts
// lib/access/module-access.ts
export type ModuleKey = 'sessions' | 'drills' | 'templates' | 'teams' | 'attendance' | 'tactical_board' | 'calendar';

export async function getModuleAccessMap(supabase, profileId: string, role: string): Promise<Record<ModuleKey, 'granted' | 'revoked' | 'requested'>> {
  if (role === 'admin') {
    // admins always see everything; short-circuit, no query needed
    return ALL_MODULES.reduce((acc, m) => ({ ...acc, [m]: 'granted' }), {} as Record<ModuleKey, 'granted'>);
  }
  const { data } = await supabase.from('module_access').select('module, status').eq('profile_id', profileId);
  const map = ALL_MODULES.reduce((acc, m) => ({ ...acc, [m]: 'granted' }), {} as Record<ModuleKey, 'granted' | 'revoked' | 'requested'>);
  for (const row of data ?? []) map[row.module as ModuleKey] = row.status;
  return map;
}
```

### Route enforcement (middleware)

`lib/supabase/middleware.ts` already redirects unauthenticated users. Extend it: after resolving `user` and `profile`, map the request path to a `ModuleKey` (simple prefix match against the table above) and, if `getModuleAccessMap(...)[module] !== 'granted'`, redirect to `/dashboard?access_denied=<module>`. The dashboard reads that query param and surfaces a toast/banner: *"You don't have access to [Module]. [Request access]"* — clicking it fires the request-access call (see below) without leaving the dashboard.

### Nav (client)

`components/layout/app-shell.tsx` fetches the access map once per session (or on org/profile change) and hides nav entries for `revoked`/`requested` modules — restricted modules simply don't appear, keeping the nav "minimal on first view" per this project's UX philosophy rather than showing disabled/greyed items.

## Request-Access Flow

1. Coach lands on `/dashboard?access_denied=sessions` (via middleware redirect) or opens Settings → Access tab and sees their own module list with a "Request access" button next to any `revoked` module.
2. Client calls `supabase.from('module_access').upsert({ organization_id, profile_id: user.id, module, status: 'requested', requested_at: now() }, { onConflict: 'profile_id,module' })` — allowed by the "re-request" RLS policy above since it only permits moving *their own row* to `status = 'requested'`.
3. Admin's Settings → Access tab lists all `requested` rows across the org (a simple `select * from module_access where organization_id = ... and status = 'requested'`, readable under the existing "members can view module access in their org" SELECT policy) with **Approve** / **Deny** buttons per row.
   - Approve → `update module_access set status = 'granted', decided_by = auth.uid(), decided_at = now() where id = ...`. (A `granted` row is functionally identical to "no row" per the resolution logic above, but keeping it as an explicit row preserves the audit trail of who approved it and when — simpler than deleting and re-relying on the default-open interpretation.)
   - Deny → `update module_access set status = 'revoked', decided_by = auth.uid(), decided_at = now() where id = ...`.
4. No notification/email system exists yet in this app — the request surfaces purely via the Access tab (admin has to check it). Out of scope for v1 to add push/email notifications for this; flag as a future enhancement if admins report missing requests.

## New UI Surfaces

### Settings → Access tab (new, admin-only nav entry within Settings)

Add `'access'` to the `Tab` union in `app/(app)/settings/page.tsx`, gated so the tab button itself only renders `if (profile.role === 'admin')`. New component `components/settings/access-tab.tsx`, structured in two sections:

- **Pending requests** (top, only shown if any exist): list of `requested` rows joined with `profiles` for name/avatar and the module label, Approve/Deny buttons.
- **Member access grid**: table with one row per org member (excluding the viewing admin), one column per module, each cell a toggle (granted/revoked). Toggling calls the same upsert pattern as request-access but admin-authored, going straight to `granted`/`revoked` (skipping the `requested` intermediate state, since admins don't need to request their own changes).

A non-admin coach sees a simpler self-service view instead of the Access tab entirely being hidden — actually per Permissions below, expose it to coaches too, scoped to "my access" only, showing their own granted/revoked modules with a Request button on revoked ones. This means the tab is visible to everyone, but its contents differ by role (matches the existing `TeamTab` pattern of one component branching on role internally, rather than hiding the whole tab).

### Contributor attribution tags

New shared component `components/shared/contributor-tag.tsx`: small pill — avatar circle (initial or `avatar_url`) + first name — with a tooltip on hover showing full name and timestamp ("Edited by Sam Okafor · 2 days ago" / "Created by Priya Nair · 3 weeks ago"). Two variants:
- `<ContributorTag kind="created" profile={...} at={...} />`
- `<ContributorTag kind="edited" profile={...} at={...} />` — only rendered when `last_edited_by` differs from `user_id` (creator); otherwise just show the "created" tag to avoid redundant tags on untouched items.

Placement:
- Session cards (`/sessions` list) and the session builder header (`/sessions/[id]`).
- Drill cards (`/drills` list) and drill detail (`/drills/[id]`).
- Template cards (`/templates` list) and template detail (`/templates/[id]`).
- Tactical board editor header, when embedded in a session (uses the session's `last_edited_by`/`user_id`, per the "no separate column" decision above).

Fetching the profile for a tag: batch-resolve in the parent list query (`select *, creator:profiles!sessions_user_id_fkey(full_name, avatar_url), editor:profiles!sessions_last_edited_by_fkey(full_name, avatar_url)`) rather than one profile fetch per card — keeps list views fast.

## Permissions Summary

| Action | Coach | Admin |
|---|---|---|
| View shared sessions/drills/templates/teams/attendance/tactical board/calendar (if module granted) | ✅ | ✅ |
| See who created/last edited an item | ✅ | ✅ |
| View own module access status | ✅ | ✅ |
| Request access to a revoked module | ✅ | n/a (always granted) |
| View org-wide pending access requests | ❌ | ✅ |
| Approve/deny access requests | ❌ | ✅ |
| Grant/revoke any member's module access | ❌ | ✅ |

## Migration Plan (ordered)

1. `017_create_module_access.sql` — `module_access` table, RLS policies above.
2. `018_add_last_edited_by.sql` — `last_edited_by` column on `sessions`, `drills`, `session_templates` (nullable, no backfill needed — falls back to `user_id` in the UI when null).

## Code Changes (non-DB)

- `lib/access/module-access.ts` — new: `ModuleKey` type, `ALL_MODULES`, `getModuleAccessMap()`, path-to-module mapping helper.
- `lib/supabase/middleware.ts` — extend with module-route enforcement + `access_denied` redirect param.
- `app/(app)/dashboard/page.tsx` — read `access_denied` search param, show banner with inline "Request access" action.
- `components/layout/app-shell.tsx` — fetch access map, filter nav items.
- `components/settings/access-tab.tsx` — new, role-branching (admin: pending requests + grid; coach: self-service view).
- `app/(app)/settings/page.tsx` — add `'access'` tab entry.
- `components/shared/contributor-tag.tsx` — new.
- Update session/drill/template list queries and detail pages to select creator/editor profile joins and render `<ContributorTag>`.
- Any create/update call for sessions, drills, templates must set `last_edited_by: user.id` on update (creator stays `user_id`, set once on insert only).

## Out of Scope (v1)

- Per-item (as opposed to per-module) access control — e.g. restricting a specific session rather than the whole Sessions module.
- Email/push notifications when a request is filed or decided — admin must check the Access tab.
- Expiring or time-boxed grants.
- Activity feed / audit log of all attribution changes beyond the single "created by / last edited by" pair — full edit history is not tracked.
- Attendance-module-specific sub-permissions (e.g. coach can view but not mark attendance) — attendance is granted/revoked as one module for v1.
