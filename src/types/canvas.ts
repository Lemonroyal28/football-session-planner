import type { PlayerType } from './pitch';

export interface CanvasPlayer {
  id: string;
  x: number;
  y: number;
  type: PlayerType;
  number: number;
  name: string;
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

export interface CanvasCone {
  id: string;
  x: number;
  y: number;
  color: ConeColor;
}

export interface CanvasScribble {
  id: string;
  path: string;
  color: string;
  strokeWidth: number;
}

export interface ScreenState {
  players: CanvasPlayer[];
  arrows: CanvasArrow[];
  zones: CanvasZone[];
  cones: CanvasCone[];
  scribbles: CanvasScribble[];
  ball: CanvasBall;
}
