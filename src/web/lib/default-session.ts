import type { ScreenState, CanvasPlayer } from '../../types/canvas';
import type { Screen, Session, SessionMeta } from '../../types/session';
import { emptyNotes } from '../../types/notes';
import { newId } from './id';

const DEFAULT_TEAM_A: Omit<CanvasPlayer, 'id' | 'x' | 'y'>[] = [
  { type: 'gk-a', number: 1, name: 'GK' },
  { type: 'team-a', number: 2, name: 'RB' },
  { type: 'team-a', number: 3, name: 'CB' },
  { type: 'team-a', number: 4, name: 'CB' },
  { type: 'team-a', number: 5, name: 'LB' },
  { type: 'team-a', number: 6, name: 'CM' },
  { type: 'team-a', number: 7, name: 'RW' },
  { type: 'team-a', number: 8, name: 'CM' },
  { type: 'team-a', number: 9, name: 'ST' },
  { type: 'team-a', number: 10, name: 'CAM' },
  { type: 'team-a', number: 11, name: 'LW' },
];

const TEAM_A_POSITIONS: [number, number][] = [
  [160, 340],  // GK
  [280, 160],  // RB
  [280, 280],  // CB
  [280, 400],  // CB
  [280, 520],  // LB
  [400, 250],  // CM
  [400, 140],  // RW
  [400, 430],  // CM
  [520, 340],  // ST
  [470, 280],  // CAM
  [400, 540],  // LW
];

export function createDefaultPlayers(): CanvasPlayer[] {
  return DEFAULT_TEAM_A.map((p, i) => ({
    ...p,
    id: newId(),
    x: TEAM_A_POSITIONS[i][0],
    y: TEAM_A_POSITIONS[i][1],
  }));
}

export function createEmptyScreenState(): ScreenState {
  return {
    players: [],
    arrows: [],
    zones: [],
    cones: [],
    goals: [],
    scribbles: [],
    annotations: [],
    ball: { x: 525, y: 340, ownerId: null },
  };
}

export function createDefaultScreenState(): ScreenState {
  return {
    players: createDefaultPlayers(),
    arrows: [],
    zones: [],
    cones: [],
    goals: [],
    scribbles: [],
    annotations: [],
    ball: { x: 525, y: 340, ownerId: null },
  };
}

export function createScreen(name: string, withPlayers = false): Screen {
  return {
    id: newId(),
    name,
    pitchType: 'full',
    state: withPlayers ? createDefaultScreenState() : createEmptyScreenState(),
    notes: emptyNotes(),
  };
}

export function createSession(title = 'Untitled Session'): Session {
  const now = new Date().toISOString();
  const meta: SessionMeta = {
    title,
    author: '',
    club: '',
    created: now,
    updated: now,
    tags: [],
    category: '',
    skillLevel: 'intermediate',
  };
  return {
    id: newId(),
    version: '1.0',
    meta,
    screens: [createScreen('Phase 1', true)],
  };
}
