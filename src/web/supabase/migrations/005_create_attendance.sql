-- Attendance records table
create table public.attendance_records (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) on delete cascade not null,
  player_id uuid references public.players(id) on delete cascade not null,
  status text default 'present' check (status in ('present', 'absent', 'late', 'injured')),
  notes text default '',
  created_at timestamptz default now(),
  unique(session_id, player_id)
);

alter table public.attendance_records enable row level security;

create policy "Users can CRUD attendance via session ownership"
  on public.attendance_records for all
  using (
    exists (
      select 1 from public.sessions
      where sessions.id = attendance_records.session_id
      and sessions.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.sessions
      where sessions.id = attendance_records.session_id
      and sessions.user_id = auth.uid()
    )
  );

-- Add foreign key for session_blocks.drill_id now that drills table exists
alter table public.session_blocks
  add constraint session_blocks_drill_id_fkey
  foreign key (drill_id) references public.drills(id) on delete set null;
