-- Per-member, per-module access control. Absence of a row for a given
-- (profile, module) pair means 'granted' — this table only records
-- explicit revokes and pending/decided access requests.
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

-- Use the SECURITY DEFINER helpers from 016 to avoid recursive profiles RLS.
create policy "Org members can view module access in their org"
  on public.module_access for select
  using (organization_id = public.current_organization_id());

-- A coach can create only their own row, and only to request access.
create policy "Members can request access to their own modules"
  on public.module_access for insert
  with check (
    profile_id = auth.uid()
    and status = 'requested'
    and organization_id = public.current_organization_id()
  );

-- A coach can re-request their own revoked access (move their own row back to 'requested').
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
    public.current_user_role() = 'admin'
    and organization_id = public.current_organization_id()
  )
  with check (
    public.current_user_role() = 'admin'
    and organization_id = public.current_organization_id()
  );

create index module_access_org_idx on public.module_access(organization_id);
create index module_access_profile_idx on public.module_access(profile_id);
