-- Scope all data to organizations, revert the anonymous-access hole from migration 006.

-- 1. Give every existing profile without an org its own organization, and make them its admin.
--    This covers all pre-existing real users so the backfill below has somewhere to point.
do $$
declare
  v_profile record;
  v_org_id uuid;
begin
  for v_profile in select id, club_name from public.profiles where organization_id is null loop
    insert into public.organizations (name, created_by)
    values (coalesce(v_profile.club_name, 'My Club'), v_profile.id)
    returning id into v_org_id;

    update public.profiles
      set organization_id = v_org_id, role = 'admin'
      where id = v_profile.id;
  end loop;
end $$;

-- 2. Pick a fallback org for rows written anonymously after migration 006 (user_id is null).
--    Pre-launch data with no real owner; assigned to the oldest admin org rather than deleted.
do $$
declare
  v_fallback_org uuid;
  v_fallback_user uuid;
begin
  select o.id, o.created_by into v_fallback_org, v_fallback_user
    from public.organizations o
    order by o.created_at asc
    limit 1;

  if v_fallback_org is not null then
    update public.sessions set user_id = v_fallback_user where user_id is null;
    update public.drills set user_id = v_fallback_user where user_id is null;
    update public.teams set user_id = v_fallback_user where user_id is null;
    update public.session_templates set user_id = v_fallback_user where user_id is null;
  end if;
end $$;

-- 3. Drop the anonymous-access policies opened in 006.
drop policy if exists "anon_select_sessions" on public.sessions;
drop policy if exists "anon_insert_sessions" on public.sessions;
drop policy if exists "anon_update_sessions" on public.sessions;
drop policy if exists "anon_delete_sessions" on public.sessions;
drop policy if exists "anon_select_session_blocks" on public.session_blocks;
drop policy if exists "anon_insert_session_blocks" on public.session_blocks;
drop policy if exists "anon_update_session_blocks" on public.session_blocks;
drop policy if exists "anon_delete_session_blocks" on public.session_blocks;
drop policy if exists "anon_select_drills" on public.drills;
drop policy if exists "anon_insert_drills" on public.drills;
drop policy if exists "anon_update_drills" on public.drills;
drop policy if exists "anon_delete_drills" on public.drills;
drop policy if exists "anon_select_teams" on public.teams;
drop policy if exists "anon_insert_teams" on public.teams;
drop policy if exists "anon_update_teams" on public.teams;
drop policy if exists "anon_delete_teams" on public.teams;
drop policy if exists "anon_select_players" on public.players;
drop policy if exists "anon_insert_players" on public.players;
drop policy if exists "anon_update_players" on public.players;
drop policy if exists "anon_delete_players" on public.players;
drop policy if exists "anon_select_templates" on public.session_templates;
drop policy if exists "anon_insert_templates" on public.session_templates;
drop policy if exists "anon_update_templates" on public.session_templates;
drop policy if exists "anon_delete_templates" on public.session_templates;
drop policy if exists "anon_select_attendance" on public.attendance_records;
drop policy if exists "anon_insert_attendance" on public.attendance_records;
drop policy if exists "anon_update_attendance" on public.attendance_records;
drop policy if exists "anon_delete_attendance" on public.attendance_records;
drop policy if exists "anon_select_profiles" on public.profiles;

-- 4. Restore NOT NULL on user_id now that every row has an owner.
alter table public.sessions alter column user_id set not null;
alter table public.drills alter column user_id set not null;
alter table public.teams alter column user_id set not null;
alter table public.session_templates alter column user_id set not null;

-- 5. Add organization scoping columns.
alter table public.sessions add column organization_id uuid references public.organizations(id) on delete cascade;
alter table public.drills add column organization_id uuid references public.organizations(id) on delete cascade;
alter table public.teams add column organization_id uuid references public.organizations(id) on delete cascade;
alter table public.session_templates add column organization_id uuid references public.organizations(id) on delete cascade;

-- 6. Backfill organization_id from the owning user's profile.
update public.sessions s set organization_id = p.organization_id from public.profiles p where p.id = s.user_id;
update public.drills d set organization_id = p.organization_id from public.profiles p where p.id = d.user_id;
update public.teams t set organization_id = p.organization_id from public.profiles p where p.id = t.user_id;
update public.session_templates st set organization_id = p.organization_id from public.profiles p where p.id = st.user_id;

alter table public.sessions alter column organization_id set not null;
alter table public.drills alter column organization_id set not null;
alter table public.teams alter column organization_id set not null;
alter table public.session_templates alter column organization_id set not null;

-- 7. Replace per-user RLS policies with org-scoped, shared-library policies.
drop policy if exists "Users can CRUD own sessions" on public.sessions;
create policy "Org members can CRUD org sessions"
  on public.sessions for all
  using (organization_id in (select organization_id from public.profiles where id = auth.uid()))
  with check (organization_id in (select organization_id from public.profiles where id = auth.uid()));

drop policy if exists "Users can CRUD own drills" on public.drills;
create policy "Org members can CRUD org drills"
  on public.drills for all
  using (organization_id in (select organization_id from public.profiles where id = auth.uid()))
  with check (organization_id in (select organization_id from public.profiles where id = auth.uid()));

drop policy if exists "Users can CRUD own teams" on public.teams;
create policy "Org members can CRUD org teams"
  on public.teams for all
  using (organization_id in (select organization_id from public.profiles where id = auth.uid()))
  with check (organization_id in (select organization_id from public.profiles where id = auth.uid()));

drop policy if exists "Users can CRUD own templates" on public.session_templates;
create policy "Org members can CRUD org templates"
  on public.session_templates for all
  using (organization_id in (select organization_id from public.profiles where id = auth.uid()))
  with check (organization_id in (select organization_id from public.profiles where id = auth.uid()));

-- 8. Child tables (players via teams, session_blocks/attendance_records via sessions) inherit
--    org scoping transitively through their now-org-scoped parent.
drop policy if exists "Users can CRUD players via team ownership" on public.players;
create policy "Org members can CRUD players via team org"
  on public.players for all
  using (
    exists (
      select 1 from public.teams
      where teams.id = players.team_id
      and teams.organization_id in (select organization_id from public.profiles where id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.teams
      where teams.id = players.team_id
      and teams.organization_id in (select organization_id from public.profiles where id = auth.uid())
    )
  );

drop policy if exists "Users can CRUD blocks via session ownership" on public.session_blocks;
create policy "Org members can CRUD blocks via session org"
  on public.session_blocks for all
  using (
    exists (
      select 1 from public.sessions
      where sessions.id = session_blocks.session_id
      and sessions.organization_id in (select organization_id from public.profiles where id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.sessions
      where sessions.id = session_blocks.session_id
      and sessions.organization_id in (select organization_id from public.profiles where id = auth.uid())
    )
  );

drop policy if exists "Users can CRUD attendance via session ownership" on public.attendance_records;
create policy "Org members can CRUD attendance via session org"
  on public.attendance_records for all
  using (
    exists (
      select 1 from public.sessions
      where sessions.id = attendance_records.session_id
      and sessions.organization_id in (select organization_id from public.profiles where id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.sessions
      where sessions.id = attendance_records.session_id
      and sessions.organization_id in (select organization_id from public.profiles where id = auth.uid())
    )
  );
