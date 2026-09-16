-- Admins need to update other members' role/organization_id (role changes, removal).
-- The existing "Users can update own profile" policy only covers auth.uid() = id.
create policy "Admins can update org members"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles admin_profile
      where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
      and admin_profile.organization_id = profiles.organization_id
    )
  )
  with check (
    exists (
      select 1 from public.profiles admin_profile
      where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
      and (
        profiles.organization_id is null
        or profiles.organization_id = admin_profile.organization_id
      )
    )
  );
