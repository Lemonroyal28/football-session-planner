-- Link profiles to organizations, constrain role values
alter table public.profiles
  add column organization_id uuid references public.organizations(id) on delete set null;

alter table public.profiles
  add constraint profiles_role_check check (role in ('admin', 'coach'));

-- Teammates can see each other (for member list UI)
create policy "Org members can view each other"
  on public.profiles for select
  using (
    organization_id is not null
    and organization_id in (
      select organization_id from public.profiles where id = auth.uid()
    )
  );

-- Now that profiles.organization_id exists, add the organizations policies deferred from 008
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
