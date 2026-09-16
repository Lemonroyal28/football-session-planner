-- Player photos storage bucket, scoped by team via folder path: {team_id}/{player_id}.{ext}
insert into storage.buckets (id, name, public)
values ('player-photos', 'player-photos', false)
on conflict (id) do nothing;

create policy "Team members can read player photos"
  on storage.objects for select
  using (
    bucket_id = 'player-photos'
    and exists (
      select 1 from public.teams
      where teams.id::text = (storage.foldername(name))[1]
      and teams.user_id = auth.uid()
    )
  );

create policy "Team members can upload player photos"
  on storage.objects for insert
  with check (
    bucket_id = 'player-photos'
    and exists (
      select 1 from public.teams
      where teams.id::text = (storage.foldername(name))[1]
      and teams.user_id = auth.uid()
    )
  );

create policy "Team members can update player photos"
  on storage.objects for update
  using (
    bucket_id = 'player-photos'
    and exists (
      select 1 from public.teams
      where teams.id::text = (storage.foldername(name))[1]
      and teams.user_id = auth.uid()
    )
  );

create policy "Team members can delete player photos"
  on storage.objects for delete
  using (
    bucket_id = 'player-photos'
    and exists (
      select 1 from public.teams
      where teams.id::text = (storage.foldername(name))[1]
      and teams.user_id = auth.uid()
    )
  );
