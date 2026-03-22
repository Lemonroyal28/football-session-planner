import type { TacticalSequence, TacticalAction } from '../../types/tactical-sequence';
import type { CanvasArrow, CanvasPlayer } from '../../types/canvas';
import { getArrowColor } from '../components/canvas/svg-defs';
import { newId } from './id';

/**
 * Convert a tactical sequence to canvas arrows for rendering
 */
export function sequenceToArrows(
  sequence: TacticalSequence,
  players: CanvasPlayer[]
): CanvasArrow[] {
  const arrows: CanvasArrow[] = [];

  for (const action of sequence.actions) {
    const arrow = actionToArrow(action, players);
    if (arrow) {
      arrows.push(arrow);
    }
  }

  return arrows;
}

/**
 * Convert a single tactical action to a canvas arrow
 */
function actionToArrow(
  action: TacticalAction,
  players: CanvasPlayer[]
): CanvasArrow | null {
  const fromPlayer = players.find((p) => p.id === action.from_player_id);
  if (!fromPlayer) return null;

  // Determine arrow style based on action type
  const style = getArrowStyleFromActionType(action.action_type);
  if (!style) return null;

  // Get coordinates
  let x1 = fromPlayer.x;
  let y1 = fromPlayer.y;
  let x2: number;
  let y2: number;

  if (action.action_type === 'pass' && action.to_player_id) {
    // Pass: from player to target player
    const toPlayer = players.find((p) => p.id === action.to_player_id);
    if (!toPlayer) return null;
    x2 = toPlayer.x;
    y2 = toPlayer.y;
  } else if (action.path_points.length >= 2) {
    // Dribble/Run: use path points
    const startPoint = action.path_points[0];
    const endPoint = action.path_points[action.path_points.length - 1];
    x1 = startPoint.x;
    y1 = startPoint.y;
    x2 = endPoint.x;
    y2 = endPoint.y;
  } else {
    // Default: short arrow forward (for shot, movement without path)
    x2 = fromPlayer.x + 60;
    y2 = fromPlayer.y;
  }

  const arrow: CanvasArrow = {
    id: action.action_id || newId(),
    style,
    x1,
    y1,
    x2,
    y2,
    color: action.color || getArrowColor(style),
    fromPlayerId: action.from_player_id,
    controlPoints: action.path_points.length > 2
      ? action.path_points.slice(1, -1)
      : undefined,
    // Mark as part of sequence with timing group = sequence marker
    timingGroup: action.sequence_marker,
    isConcurrent: false,
  };

  return arrow;
}

/**
 * Map action type to arrow style
 */
function getArrowStyleFromActionType(
  actionType: TacticalAction['action_type']
): CanvasArrow['style'] | null {
  switch (actionType) {
    case 'pass':
      return 'pass';
    case 'dribble':
      return 'dribble';
    case 'run':
    case 'movement':
      return 'run';
    case 'pressing':
      return 'pressing';
    case 'overlap':
      return 'overlap';
    case 'shot':
      // Shot could be represented as a pass arrow towards goal
      return 'pass';
    default:
      return null;
  }
}

/**
 * Check if an arrow belongs to a specific sequence
 */
export function isArrowInSequence(
  arrow: CanvasArrow,
  sequence: TacticalSequence
): boolean {
  return sequence.actions.some((action) => action.action_id === arrow.id);
}

/**
 * Get all arrows for active sequences
 */
export function getSequenceArrows(
  sequences: TacticalSequence[],
  players: CanvasPlayer[],
  activeSequenceId: string | null
): CanvasArrow[] {
  const arrows: CanvasArrow[] = [];

  for (const sequence of sequences) {
    // Only show arrows for the active sequence being built
    if (activeSequenceId && sequence.sequence_id === activeSequenceId) {
      const sequenceArrows = sequenceToArrows(sequence, players);
      arrows.push(...sequenceArrows);
    }
  }

  return arrows;
}
