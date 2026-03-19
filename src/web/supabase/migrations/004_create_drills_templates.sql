-- Drills table
create table public.drills (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  category text default '',
  age_groups text[] default '{}',
  equipment text[] default '{}',
  coaching_points text[] default '{}',
  description text default '',
  diagram_data jsonb,
  tags text[] default '{}',
  is_favorite boolean default false,
  min_players int,
  max_players int,
  duration_minutes int default 15,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.drills enable row level security;

create policy "Users can CRUD own drills"
  on public.drills for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Session templates table
create table public.session_templates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text default '',
  age_group text,
  level text,
  blocks jsonb default '[]'::jsonb,
  tags text[] default '{}',
  duration_minutes int default 90,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.session_templates enable row level security;

create policy "Users can CRUD own templates"
  on public.session_templates for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
