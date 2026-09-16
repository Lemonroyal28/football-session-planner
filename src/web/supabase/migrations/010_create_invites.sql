-- Invites: admin-generated codes for joining an organization
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

-- Redeem an invite: sets the caller's profile org/role and marks the invite used.
-- security definer so the caller doesn't need direct UPDATE rights on invites or profiles.
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
