-- Teams table
create table public.teams (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  age_group text,
  level text,
  season text,
  colors jsonb default '{"primary": "#1a73e8", "secondary": "#e53935"}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.teams enable row level security;

create policy "Users can CRUD own teams"
  on public.teams for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Players table
create table public.players (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  number int,
  name text not null,
  preferred_positions text[] default '{}',
  active boolean default true,
  created_at timestamptz default now()
);

alter table public.players enable row level security;

create policy "Users can CRUD players via team ownership"
  on public.players for all
  using (
    exists (
      select 1 from public.teams
      where teams.id = players.team_id
      and teams.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.teams
      where teams.id = players.team_id
      and teams.user_id = auth.uid()
    )
  );
