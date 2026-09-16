import type { SupabaseClient } from '@supabase/supabase-js';

export const POSITION_OPTIONS = [
  'GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST',
] as const;

export type Position = (typeof POSITION_OPTIONS)[number];

export interface PlayerRatings {
  rating_pace: number | null;
  rating_shooting: number | null;
  rating_passing: number | null;
  rating_dribbling: number | null;
  rating_defending: number | null;
  rating_physical: number | null;
}

export interface Player extends PlayerRatings {
  id: string;
  team_id: string;
  number: number | null;
  name: string;
  active: boolean;
  date_of_birth: string | null;
  primary_position: Position | null;
  secondary_positions: Position[];
  photo_url: string | null;
  overall_rating: number | null;
}

export function calculateAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

export async function getPlayerPhotoUrl(
  supabase: SupabaseClient,
  photoPath: string | null
): Promise<string | null> {
  if (!photoPath) return null;
  const { data } = await supabase.storage.from('player-photos').createSignedUrl(photoPath, 3600);
  return data?.signedUrl ?? null;
}

export function calculateOverall(ratings: PlayerRatings): number | null {
  const values = [
    ratings.rating_pace,
    ratings.rating_shooting,
    ratings.rating_passing,
    ratings.rating_dribbling,
    ratings.rating_defending,
    ratings.rating_physical,
  ];

  if (values.some((v) => v === null || v === undefined)) return null;

  const sum = (values as number[]).reduce((total, v) => total + v, 0);
  return Math.round(sum / values.length);
}
