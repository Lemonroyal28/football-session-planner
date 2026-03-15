export type PitchType = 'full' | 'half-attack' | 'half-defend' | 'small-sided' | 'futsal' | 'thirds';

export const PITCH_WIDTH = 1050;
export const PITCH_HEIGHT = 680;

// Pitch boundary
export const PITCH_X = 50;
export const PITCH_Y = 40;
export const PITCH_INNER_WIDTH = 950;
export const PITCH_INNER_HEIGHT = 600;

// Centre
export const CENTRE_X = 525;
export const CENTRE_Y = 340;
export const CENTRE_CIRCLE_R = 91.5;
export const CENTRE_SPOT_R = 5;

// Penalty areas
export const LEFT_PA = { x: 50, y: 182, width: 165, height: 316 };
export const RIGHT_PA = { x: 835, y: 182, width: 165, height: 316 };

// 6-yard boxes
export const LEFT_6YD = { x: 50, y: 271, width: 55, height: 138 };
export const RIGHT_6YD = { x: 945, y: 271, width: 55, height: 138 };

// Penalty spots
export const LEFT_PENALTY_SPOT = { cx: 161, cy: 340, r: 5 };
export const RIGHT_PENALTY_SPOT = { cx: 889, cy: 340, r: 5 };

// Goals
export const LEFT_GOAL = { x: 35, y: 305, width: 15, height: 70 };
export const RIGHT_GOAL = { x: 1000, y: 305, width: 15, height: 70 };

// Player colors
export const PLAYER_COLORS = {
  'team-a': '#1a73e8',
  'team-b': '#e53935',
  'gk-a': '#fdd835',
  'gk-b': '#ff8f00',
  'referee': '#000000',
  'mannequin': '#9ca3af',
} as const;

export type PlayerType = keyof typeof PLAYER_COLORS;
