-- Player profile fields: DOB, positions, FIFA-style ratings
alter table public.players
  add column date_of_birth date,
  add column primary_position text,
  add column secondary_positions text[] default '{}',
  add column photo_url text,
  add column rating_pace int check (rating_pace between 1 and 99),
  add column rating_shooting int check (rating_shooting between 1 and 99),
  add column rating_passing int check (rating_passing between 1 and 99),
  add column rating_dribbling int check (rating_dribbling between 1 and 99),
  add column rating_defending int check (rating_defending between 1 and 99),
  add column rating_physical int check (rating_physical between 1 and 99);

alter table public.players
  add constraint players_primary_position_check check (
    primary_position is null or primary_position in (
      'GK','CB','LB','RB','CDM','CM','CAM','LM','RM','LW','RW','ST'
    )
  );

alter table public.players
  add column overall_rating int generated always as (
    case
      when rating_pace is null or rating_shooting is null or rating_passing is null
        or rating_dribbling is null or rating_defending is null or rating_physical is null
      then null
      else round((rating_pace + rating_shooting + rating_passing + rating_dribbling + rating_defending + rating_physical) / 6.0)
    end
  ) stored;
