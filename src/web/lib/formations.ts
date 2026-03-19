import type { PlayerType } from '../../types/pitch';

export interface FormationPlayer {
  x: number;
  y: number;
  type: PlayerType;
  number: number;
  name: string;
}

export interface Formation {
  id: string;
  label: string;
  players: Omit<FormationPlayer, 'type'>[];
}

// Pitch dimensions:
// Inner area: x 50–1000, y 40–640, centre line x=525
//
// Team A occupies LEFT half  (x: ~80–480), attacks right
// Team B occupies RIGHT half (x: ~570–970), attacks left
//
// Convention (from player's perspective facing opponent goal):
//   Team A faces right → left hand points UP, right hand points DOWN
//     LW/LB/LM = TOP    (low y)
//     RW/RB/RM = BOTTOM (high y)
//
//   Team B faces left → mirrored automatically by mirrorFormation

export const FORMATIONS: Formation[] = [
  {
    id: '4-4-2',
    label: '4-4-2',
    players: [
      { x: 80,  y: 340, number: 1,  name: 'GK' },
      { x: 190, y: 540, number: 2,  name: 'RB' },
      { x: 190, y: 410, number: 4,  name: 'CB' },
      { x: 190, y: 270, number: 5,  name: 'CB' },
      { x: 190, y: 140, number: 3,  name: 'LB' },
      { x: 330, y: 540, number: 7,  name: 'RM' },
      { x: 330, y: 400, number: 8,  name: 'CM' },
      { x: 330, y: 280, number: 6,  name: 'CM' },
      { x: 330, y: 140, number: 11, name: 'LM' },
      { x: 460, y: 420, number: 9,  name: 'ST' },
      { x: 460, y: 260, number: 10, name: 'ST' },
    ],
  },
  {
    id: '4-3-3',
    label: '4-3-3',
    players: [
      { x: 80,  y: 340, number: 1,  name: 'GK' },
      { x: 190, y: 540, number: 2,  name: 'RB' },
      { x: 190, y: 410, number: 4,  name: 'CB' },
      { x: 190, y: 270, number: 5,  name: 'CB' },
      { x: 190, y: 140, number: 3,  name: 'LB' },
      { x: 320, y: 470, number: 8,  name: 'CM' },
      { x: 320, y: 340, number: 6,  name: 'CM' },
      { x: 320, y: 210, number: 10, name: 'CM' },
      { x: 460, y: 520, number: 7,  name: 'RW' },
      { x: 460, y: 340, number: 9,  name: 'ST' },
      { x: 460, y: 160, number: 11, name: 'LW' },
    ],
  },
  {
    id: '4-2-3-1',
    label: '4-2-3-1',
    players: [
      { x: 80,  y: 340, number: 1,  name: 'GK' },
      { x: 190, y: 540, number: 2,  name: 'RB' },
      { x: 190, y: 410, number: 4,  name: 'CB' },
      { x: 190, y: 270, number: 5,  name: 'CB' },
      { x: 190, y: 140, number: 3,  name: 'LB' },
      { x: 290, y: 420, number: 6,  name: 'CDM' },
      { x: 290, y: 260, number: 8,  name: 'CDM' },
      { x: 400, y: 520, number: 7,  name: 'RAM' },
      { x: 400, y: 340, number: 10, name: 'CAM' },
      { x: 400, y: 160, number: 11, name: 'LAM' },
      { x: 470, y: 340, number: 9,  name: 'ST' },
    ],
  },
  {
    id: '4-1-4-1',
    label: '4-1-4-1',
    players: [
      { x: 80,  y: 340, number: 1,  name: 'GK' },
      { x: 190, y: 540, number: 2,  name: 'RB' },
      { x: 190, y: 410, number: 4,  name: 'CB' },
      { x: 190, y: 270, number: 5,  name: 'CB' },
      { x: 190, y: 140, number: 3,  name: 'LB' },
      { x: 280, y: 340, number: 6,  name: 'CDM' },
      { x: 380, y: 540, number: 7,  name: 'RM' },
      { x: 380, y: 400, number: 8,  name: 'CM' },
      { x: 380, y: 280, number: 10, name: 'CM' },
      { x: 380, y: 140, number: 11, name: 'LM' },
      { x: 470, y: 340, number: 9,  name: 'ST' },
    ],
  },
  {
    id: '3-5-2',
    label: '3-5-2',
    players: [
      { x: 80,  y: 340, number: 1,  name: 'GK' },
      { x: 190, y: 470, number: 4,  name: 'CB' },
      { x: 190, y: 340, number: 5,  name: 'CB' },
      { x: 190, y: 210, number: 6,  name: 'CB' },
      { x: 320, y: 580, number: 2,  name: 'RWB' },
      { x: 320, y: 440, number: 8,  name: 'CM' },
      { x: 320, y: 340, number: 10, name: 'CM' },
      { x: 320, y: 240, number: 7,  name: 'CM' },
      { x: 320, y: 100, number: 3,  name: 'LWB' },
      { x: 460, y: 420, number: 9,  name: 'ST' },
      { x: 460, y: 260, number: 11, name: 'ST' },
    ],
  },
  {
    id: '3-4-3',
    label: '3-4-3',
    players: [
      { x: 80,  y: 340, number: 1,  name: 'GK' },
      { x: 190, y: 470, number: 4,  name: 'CB' },
      { x: 190, y: 340, number: 5,  name: 'CB' },
      { x: 190, y: 210, number: 6,  name: 'CB' },
      { x: 320, y: 540, number: 2,  name: 'RM' },
      { x: 320, y: 400, number: 8,  name: 'CM' },
      { x: 320, y: 280, number: 10, name: 'CM' },
      { x: 320, y: 140, number: 3,  name: 'LM' },
      { x: 460, y: 500, number: 7,  name: 'RW' },
      { x: 460, y: 340, number: 9,  name: 'ST' },
      { x: 460, y: 180, number: 11, name: 'LW' },
    ],
  },
  {
    id: '5-3-2',
    label: '5-3-2',
    players: [
      { x: 80,  y: 340, number: 1,  name: 'GK' },
      { x: 190, y: 580, number: 2,  name: 'RWB' },
      { x: 190, y: 450, number: 4,  name: 'CB' },
      { x: 190, y: 340, number: 5,  name: 'CB' },
      { x: 190, y: 230, number: 6,  name: 'CB' },
      { x: 190, y: 100, number: 3,  name: 'LWB' },
      { x: 330, y: 470, number: 8,  name: 'CM' },
      { x: 330, y: 340, number: 10, name: 'CM' },
      { x: 330, y: 210, number: 7,  name: 'CM' },
      { x: 460, y: 420, number: 9,  name: 'ST' },
      { x: 460, y: 260, number: 11, name: 'ST' },
    ],
  },
  {
    id: '5-4-1',
    label: '5-4-1',
    players: [
      { x: 80,  y: 340, number: 1,  name: 'GK' },
      { x: 190, y: 580, number: 2,  name: 'RWB' },
      { x: 190, y: 450, number: 4,  name: 'CB' },
      { x: 190, y: 340, number: 5,  name: 'CB' },
      { x: 190, y: 230, number: 6,  name: 'CB' },
      { x: 190, y: 100, number: 3,  name: 'LWB' },
      { x: 330, y: 540, number: 7,  name: 'RM' },
      { x: 330, y: 400, number: 8,  name: 'CM' },
      { x: 330, y: 280, number: 10, name: 'CM' },
      { x: 330, y: 140, number: 11, name: 'LM' },
      { x: 470, y: 340, number: 9,  name: 'ST' },
    ],
  },
  {
    id: '4-5-1',
    label: '4-5-1',
    players: [
      { x: 80,  y: 340, number: 1,  name: 'GK' },
      { x: 190, y: 540, number: 2,  name: 'RB' },
      { x: 190, y: 410, number: 4,  name: 'CB' },
      { x: 190, y: 270, number: 5,  name: 'CB' },
      { x: 190, y: 140, number: 3,  name: 'LB' },
      { x: 330, y: 570, number: 7,  name: 'RM' },
      { x: 330, y: 450, number: 8,  name: 'CM' },
      { x: 330, y: 340, number: 6,  name: 'CM' },
      { x: 330, y: 230, number: 10, name: 'CM' },
      { x: 330, y: 110, number: 11, name: 'LM' },
      { x: 470, y: 340, number: 9,  name: 'ST' },
    ],
  },
  {
    id: '4-4-1-1',
    label: '4-4-1-1',
    players: [
      { x: 80,  y: 340, number: 1,  name: 'GK' },
      { x: 190, y: 540, number: 2,  name: 'RB' },
      { x: 190, y: 410, number: 4,  name: 'CB' },
      { x: 190, y: 270, number: 5,  name: 'CB' },
      { x: 190, y: 140, number: 3,  name: 'LB' },
      { x: 310, y: 540, number: 7,  name: 'RM' },
      { x: 310, y: 400, number: 8,  name: 'CM' },
      { x: 310, y: 280, number: 6,  name: 'CM' },
      { x: 310, y: 140, number: 11, name: 'LM' },
      { x: 410, y: 340, number: 10, name: 'AM' },
      { x: 470, y: 340, number: 9,  name: 'ST' },
    ],
  },
];

/**
 * Mirror formation for Team B (right half of pitch).
 * Flips both axes so each team stays in their own half
 * and R/L sides are correct for the opposite facing direction:
 *   x_b = 1050 - x_a  (moves to right half)
 *   y_b = 680  - y_a   (swaps R/L for opposite perspective)
 */
export function mirrorFormation(formation: Formation): Formation['players'] {
  return formation.players.map((p) => ({
    ...p,
    x: 1050 - p.x,
    y: 680 - p.y,
  }));
}
