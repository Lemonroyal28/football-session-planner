-- Sessions table
create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  team_id uuid references public.teams(id) on delete set null,
  title text not null default 'Untitled Session',
  session_date date,
  duration_minutes int default 90,
  status text default 'draft' check (status in ('draft', 'planned', 'completed')),
  tags text[] default '{}',
  category text default '',
  age_group text,
  objective text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.sessions enable row level security;

create policy "Users can CRUD own sessions"
  on public.sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Session blocks table
create table public.session_blocks (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) on delete cascade not null,
  order_index int not null default 0,
  block_type text not null default 'drill' check (block_type in ('warmup', 'drill', 'tactical_board', 'game', 'cooldown')),
  title text not null default '',
  duration_minutes int default 15,
  drill_id uuid,
  tactical_board_data jsonb,
  notes jsonb default '{}'::jsonb,
  coaching_points text[] default '{}',
  equipment text[] default '{}',
  description text default '',
  intensity text default 'medium' check (intensity in ('low', 'medium', 'high')),
  created_at timestamptz default now()
);

alter table public.session_blocks enable row level security;

create policy "Users can CRUD blocks via session ownership"
  on public.session_blocks for all
  using (
    exists (
      select 1 from public.sessions
      where sessions.id = session_blocks.session_id
      and sessions.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.sessions
      where sessions.id = session_blocks.session_id
      and sessions.user_id = auth.uid()
    )
  );
