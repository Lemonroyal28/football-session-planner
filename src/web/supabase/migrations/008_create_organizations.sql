-- Organizations table: the tenant/club boundary for multi-user collaboration
create table public.organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.organizations enable row level security;

-- Policies referencing profiles.organization_id are added in 009, once that column exists.
