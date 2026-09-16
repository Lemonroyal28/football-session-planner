# Multi-User Team Collaboration — Design & Technical Spec

Status: Approved design, not yet implemented
Owner context: single-tenant grassroots/academy app today (auth scaffolded but not enforced, RLS opened to `anon`). This spec re-introduces real multi-user auth with team-based collaboration and an admin role.

## Goals

- Each user has their own account (email/password via Supabase Auth, already scaffolded).
- Users belong to one team/club ("organization"), and all teammates collaborate on a shared library of sessions, drills, templates, teams (squads), players, and attendance.
- One role tier above regular coaches: **admin**, who manages membership/roles and (later) billing.
- Remove the current anonymous-access hole (migration `006_allow_anonymous_access.sql`) and properly scope all data by organization.

## Current State (as of this spec)

- `profiles` table already has a `role text default 'coach'` column (unused today) — reuse it as `'admin' | 'coach'`.
- `teams` table currently means "a squad" (age group, e.g. U12s), owned via `user_id`, not a tenant/org.
- `sessions`, `drills`, `session_templates` are owned via `user_id`; `players` and `session_blocks`/`attendance_records` cascade through `teams`/`sessions`.
- Migration `006_allow_anonymous_access.sql` dropped `NOT NULL` on `user_id` for `sessions`, `drills`, `teams`, `session_templates`, and added `anon` policies granting full CRUD + read on `profiles` to anyone. This must be reverted.
- `middleware.ts` / `lib/supabase/middleware.ts` currently only refreshes the Supabase session cookie and never redirects unauthenticated users ("no auth redirects for now").

## Data Model Changes

### New table: `organizations`

The tenant boundary — a club. One admin owns it; multiple coaches join it.

```sql
create table public.organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.organizations enable row level security;

create policy "Members can view their organization"
  on public.organizations for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.organization_id = organizations.id
    )
  );

create policy "Admins can update their organization"
  on public.organizations for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.organization_id = organizations.id
      and profiles.role = 'admin'
    )
  );
```

### `profiles` — add org linkage

```sql
alter table public.profiles
  add column organization_id uuid references public.organizations(id) on delete set null;

-- role column already exists (default 'coach'); constrain values
alter table public.profiles
  add constraint profiles_role_check check (role in ('admin', 'coach'));
```

Signup flow determines `organization_id` and `role` (see Auth Flow below) — the `handle_new_user()` trigger stays focused on row creation; org assignment happens in application code right after signup, before the user reaches the dashboard.

### New table: `invites`

Admin-generated, single-use (or time-limited) codes for joining an org as a coach.

```sql
create table public.invites (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  code text unique not null default encode(gen_random_bytes(6), 'hex'),
  created_by uuid references auth.users(id) on delete set null,
  role text not null default 'coach' check (role in ('admin', 'coach')),
  expires_at timestamptz default (now() + interval '14 days'),
  used_by uuid references auth.users(id) on delete set null,
  used_at timestamptz,
  created_at timestamptz default now()
);

alter table public.invites enable row level security;

create policy "Admins can manage invites for their org"
  on public.invites for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.organization_id = invites.organization_id
      and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.organization_id = invites.organization_id
      and profiles.role = 'admin'
    )
  );

-- Unauthenticated/authenticated users need to be able to look up an invite by code to redeem it.
create policy "Anyone can read an unused, unexpired invite by code"
  on public.invites for select
  using (used_at is null and expires_at > now());
```

Redemption (setting `organization_id`/`role` on the user's profile and marking the invite used) happens via a `security definer` Postgres function called from the signup/join flow, so a client never needs direct UPDATE rights on `invites` or another user's `profiles` row:

```sql
create or replace function public.redeem_invite(invite_code text)
returns void as $$
declare
  v_invite public.invites%rowtype;
begin
  select * into v_invite from public.invites
    where code = invite_code and used_at is null and expires_at > now()
    for update;

  if not found then
    raise exception 'Invalid or expired invite code';
  end if;

  update public.profiles
    set organization_id = v_invite.organization_id, role = v_invite.role
    where id = auth.uid();

  update public.invites
    set used_by = auth.uid(), used_at = now()
    where id = v_invite.id;
end;
$$ language plpgsql security definer;
```

### Existing tables — add `organization_id`, drop anon access

For `sessions`, `drills`, `session_templates`, `teams` (squads), `players` (via `teams`), `session_blocks` (via `sessions`), `attendance_records` (via `sessions`):

```sql
-- Revert migration 006
drop policy if exists "anon_select_sessions" on public.sessions;
-- ...repeat drop for every anon_* policy created in 006...

alter table public.sessions alter column user_id set not null;
alter table public.drills alter column user_id set not null;
alter table public.teams alter column user_id set not null;
alter table public.session_templates alter column user_id set not null;

-- Add organization scoping
alter table public.sessions add column organization_id uuid references public.organizations(id) on delete cascade;
alter table public.drills add column organization_id uuid references public.organizations(id) on delete cascade;
alter table public.teams add column organization_id uuid references public.organizations(id) on delete cascade;
alter table public.session_templates add column organization_id uuid references public.organizations(id) on delete cascade;

-- Backfill from profiles, then set NOT NULL (data migration step, run once, org-specific to existing single-tenant data)
update public.sessions s set organization_id = p.organization_id from public.profiles p where p.id = s.user_id;
-- ...repeat for drills, teams, session_templates...

alter table public.sessions alter column organization_id set not null;
alter table public.drills alter column organization_id set not null;
alter table public.teams alter column organization_id set not null;
alter table public.session_templates alter column organization_id set not null;
```

New shared-library RLS policy pattern (replace the old `auth.uid() = user_id` policies):

```sql
drop policy "Users can CRUD own sessions" on public.sessions;

create policy "Org members can CRUD org sessions"
  on public.sessions for all
  using (
    organization_id in (
      select organization_id from public.profiles where id = auth.uid()
    )
  )
  with check (
    organization_id in (
      select organization_id from public.profiles where id = auth.uid()
    )
  );
```

Apply the equivalent pattern to `drills`, `teams`, `session_templates`. Tables that cascade through a parent (`players` via `teams`, `session_blocks`/`attendance_records` via `sessions`) keep their existing `exists (...)` join pattern but the join now transitively enforces org scoping since the parent row is already org-scoped — no separate `organization_id` column needed on those child tables.

`profiles` table policies need one addition so teammates can see each other (for the member list UI):

```sql
create policy "Org members can view each other"
  on public.profiles for select
  using (
    organization_id is not null
    and organization_id in (
      select organization_id from public.profiles where id = auth.uid()
    )
  );
```

## Auth Flow

### Sign up
Two paths presented on `/auth/signup`:
1. **"Create a new club"** — user provides club name. On success: create `organizations` row (`created_by = user.id`), set the new user's `profiles.organization_id` to it and `role = 'admin'`.
2. **"Join with invite code"** — user pastes/arrives via an invite link (`/auth/signup?invite=<code>`). After Supabase Auth account creation, call `redeem_invite(code)`.

Both paths are one Supabase Auth signup call followed by one additional application-side step (create org, or redeem invite) before redirecting to `/dashboard`.

### Invite links
Format: `https://<app>/auth/signup?invite=<code>`. If a user with that link already has an account, clicking it while logged out takes them to login instead, then redeems the invite post-login (same `redeem_invite` call, different entry point).

### Middleware — re-enable enforcement

```ts
// lib/supabase/middleware.ts
const { data: { user } } = await supabase.auth.getUser();

const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
if (!user && !isAuthRoute) {
  const url = request.nextUrl.clone();
  url.pathname = '/auth/login';
  return NextResponse.redirect(url);
}
if (user && isAuthRoute && !request.nextUrl.pathname.startsWith('/auth/callback')) {
  const url = request.nextUrl.clone();
  url.pathname = '/dashboard';
  return NextResponse.redirect(url);
}
```

Also add a check (in a layout or the middleware) for `user` with no `organization_id` yet — redirect to an "onboarding" step (create org / enter invite code) rather than the dashboard, to handle the edge case of a signed-up-but-not-yet-joined user.

## New UI Surfaces

- **`/auth/signup`**: add the create-vs-join branch (radio or two buttons), invite code field pre-filled from `?invite=` query param.
- **Onboarding step** (new, `/auth/onboarding` or similar): shown when `profiles.organization_id is null` — same create/join choice, for users who signed up without an invite link in hand.
- **Settings → Team tab** (new section in existing `(app)/settings`):
  - Member list: name, email, role badge, "Remove" button (admin only, disabled for self).
  - Invite panel (admin only): "Generate invite link" button → creates an `invites` row, shows copyable link, lists pending/expired invites.
  - Role change (admin only): promote a coach to admin / demote (must always leave at least one admin — enforce in application code, not DB constraint, to keep this simple).

## Permissions Summary

| Action | Coach | Admin |
|---|---|---|
| Create/edit/delete sessions, drills, templates, squads, players, attendance | ✅ (org-shared) | ✅ |
| View teammates | ✅ | ✅ |
| Generate invites | ❌ | ✅ |
| Remove a member | ❌ | ✅ |
| Change a member's role | ❌ | ✅ |
| Rename organization | ❌ | ✅ |
| Delete organization | ❌ | ✅ (out of scope for v1 — no UI, manual only) |

## Migration Plan (ordered)

1. `008_create_organizations.sql` — `organizations` table + RLS.
2. `009_add_organization_to_profiles.sql` — `profiles.organization_id`, role check constraint.
3. `010_create_invites.sql` — `invites` table, RLS, `redeem_invite()` function.
4. `011_scope_data_to_organizations.sql` — add `organization_id` to `sessions`/`drills`/`teams`/`session_templates`, backfill, set `NOT NULL`, drop all `anon_*` policies from migration 006, replace per-user RLS policies with org-scoped ones, add cross-member `profiles` SELECT policy.
5. Backfill step for **existing production data**: every existing row currently has a real `user_id` (from before 006) or `null` (from anonymous writes made after 006 shipped). Existing users each need an `organizations` row created for them (1 org per existing user, they become that org's admin) before step 4's backfill UPDATE can populate `organization_id`. Orphaned rows with `user_id = null` (written anonymously) have no owner to backfill from — decide at migration time whether to assign them to a default/admin org or delete them (recommend: assign to the first admin's org, since this is pre-launch data).

## Code Changes (non-DB)

- `lib/supabase/middleware.ts` — add redirect logic (above).
- `app/(auth)/auth/signup/page.tsx` — add create/join branching UI + calls.
- New: `app/(auth)/auth/onboarding/page.tsx` (or reuse signup layout).
- New: `lib/organizations.ts` — `createOrganization()`, `redeemInvite()` client helpers wrapping Supabase calls.
- `app/(app)/settings/` — new `team` sub-route or section with member list + invite panel.
- Any query that currently filters by `user_id` (session list, drill list, template list, team list) needs to instead rely on RLS (no client-side filter needed once policies are org-scoped) — audit `store/session-builder-store.ts`, `store/session-store.ts`, and any data-fetching in the sessions/drills/templates/teams pages for hardcoded `user_id` filters that would now incorrectly hide teammates' data.

## Out of Scope (v1)

- Multiple teams/orgs per user (a coach working at two clubs) — one org per user account for now.
- Per-coach data restrictions (e.g. assistant coach limited to one squad) — everyone in an org sees everything.
- Billing/subscription tied to the admin role — flagged as a future admin capability, not built here.
- Organization deletion UI/flow.
- Email-based invites (magic-link-style) — v1 ships link/code copy-paste only.
