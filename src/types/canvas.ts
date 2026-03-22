import type { PlayerType } from './pitch';
import type { TacticalSequence } from './tactical-sequence';

export interface CanvasPlayer {
  id: string;
  x: number;
  y: number;
  type: PlayerType;
  number: number;
  name: string;
  /** Whether this player is currently selected for sequence building */
  selected?: boolean;
  /** Whether this player currently has the ball */
  hasBall?: boolean;
}

export type ArrowStyle = 'pass' | 'run' | 'dribble' | 'movement' | 'pressing' | 'overlap';

export interface CanvasArrow {
  id: string;
  style: ArrowStyle;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  /** Optional: ID of the player this arrow originates from */
  fromPlayerId?: string;
  /** Optional: Control points for curved/elastic arrows (for dribble paths) */
  controlPoints?: { x: number; y: number }[];
  /** Optional: Timing group for concurrent actions (arrows with same timing group execute simultaneously) */
  timingGroup?: number;
  /** Optional: Whether this action is concurrent with the next action */
  isConcurrent?: boolean;
}

export interface CanvasZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
}

export interface CanvasBall {
  x: number;
  y: number;
  /** ID of the player currently holding the ball, or null if free */
  ownerId: string | null;
}

export type ConeColor = '#ff6b00' | '#facc15' | '#3b82f6' | '#ef4444' | '#22c55e' | '#ffffff';
export type ConeVariant = 'standard' | 'flat' | 'marker';

export interface CanvasCone {
  id: string;
  x: number;
  y: number;
  color: ConeColor;
  variant?: ConeVariant;
}

export type GoalVariant = 'mini' | 'medium' | 'full_size';

export interface CanvasGoal {
  id: string;
  x: number;
  y: number;
  variant: GoalVariant;
  rotation?: number;
}

export interface CanvasScribble {
  id: string;
  path: string;
  color: string;
  strokeWidth: number;
}

export type AnnotationType = 'text' | 'number';

export interface CanvasAnnotation {
  id: string;
  type: AnnotationType;
  x: number;
  y: number;
  text: string;
  fontSize?: number;
  color?: string;
}

export interface ScreenState {
  players: CanvasPlayer[];
  arrows: CanvasArrow[];
  zones: CanvasZone[];
  cones: CanvasCone[];
  goals: CanvasGoal[];
  scribbles: CanvasScribble[];
  annotations: CanvasAnnotation[];
  ball: CanvasBall;
  /** Tactical sequences (player-linked action chains) */
  sequences: TacticalSequence[];
  /** Active sequence being built */
  activeSequenceId: string | null;
}
