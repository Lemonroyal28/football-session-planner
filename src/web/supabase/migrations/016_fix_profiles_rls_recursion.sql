-- The self-referencing subqueries in profiles policies caused infinite recursion (42P17).
-- Use SECURITY DEFINER helpers to look up the caller's org/role without re-triggering profiles RLS.
create or replace function public.current_organization_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select organization_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_user_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

drop policy if exists "Org members can view each other" on public.profiles;
create policy "Org members can view each other"
  on public.profiles for select
  using (
    organization_id is not null
    and organization_id = public.current_organization_id()
  );

drop policy if exists "Admins can update org members" on public.profiles;
create policy "Admins can update org members"
  on public.profiles for update
  using (
    public.current_user_role() = 'admin'
    and organization_id = public.current_organization_id()
  )
  with check (
    public.current_user_role() = 'admin'
    and (organization_id is null or organization_id = public.current_organization_id())
  );
