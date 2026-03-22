import type { TacticalSequence, TacticalAction, ActionType } from '../../types/tactical-sequence';
import type { CanvasPlayer } from '../../types/canvas';
import { newId } from './id';
import { getArrowColor } from '../components/canvas/svg-defs';
import { calculateBallHolderAfterAction } from './sequence-validation';

/**
 * Create a new empty tactical sequence
 */
export function createTacticalSequence(
  startingPlayerId: string,
  ballHolderId: string,
  title?: string
): TacticalSequence {
  return {
    sequence_id: newId(),
    title: title || 'Untitled Pattern',
    actions: [],
    starting_player_id: startingPlayerId,
    starting_ball_holder_id: ballHolderId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Add an action to a sequence
 */
export function addActionToSequence(
  sequence: TacticalSequence,
  actionType: ActionType,
  fromPlayerId: string,
  toPlayerId?: string,
  pathPoints: { x: number; y: number }[] = []
): TacticalSequence {
  const currentBallHolder =
    sequence.actions.length > 0
      ? sequence.actions[sequence.actions.length - 1].ball_holder_after_id
      : sequence.starting_ball_holder_id;

  const action: TacticalAction = {
    action_id: newId(),
    sequence_id: sequence.sequence_id,
    sequence_order: sequence.actions.length,
    action_type: actionType,
    from_player_id: fromPlayerId,
    to_player_id: toPlayerId,
    path_points: pathPoints,
    ball_holder_before_id: currentBallHolder,
    ball_holder_after_id: calculateBallHolderAfterAction({
      action_id: '',
      sequence_id: '',
      sequence_order: 0,
      action_type: actionType,
      from_player_id: fromPlayerId,
      to_player_id: toPlayerId,
      path_points: pathPoints,
      ball_holder_before_id: currentBallHolder,
      ball_holder_after_id: null,
      ball_state: 'with_player',
      instruction_label: '',
      color: '',
    }),
    ball_state: actionType === 'pass' ? 'in_flight' : 'with_player',
    instruction_label: generateInstructionLabel(actionType, fromPlayerId, toPlayerId),
    sequence_marker: sequence.actions.length + 1,
    color: getArrowColor(actionType),
  };

  return {
    ...sequence,
    actions: [...sequence.actions, action],
    updated_at: new Date().toISOString(),
  };
}

/**
 * Remove an action from a sequence
 */
export function removeActionFromSequence(
  sequence: TacticalSequence,
  actionId: string
): TacticalSequence {
  const actions = sequence.actions.filter((a) => a.action_id !== actionId);

  // Reorder sequence numbers
  const reorderedActions = actions.map((action, index) => ({
    ...action,
    sequence_order: index,
    sequence_marker: index + 1,
  }));

  return {
    ...sequence,
    actions: reorderedActions,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Update an action in a sequence
 */
export function updateActionInSequence(
  sequence: TacticalSequence,
  actionId: string,
  updates: Partial<TacticalAction>
): TacticalSequence {
  const actions = sequence.actions.map((action) =>
    action.action_id === actionId ? { ...action, ...updates } : action
  );

  return {
    ...sequence,
    actions,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Get the current ball holder in a sequence
 */
export function getCurrentBallHolder(sequence: TacticalSequence): string | null {
  if (sequence.actions.length === 0) {
    return sequence.starting_ball_holder_id;
  }

  return sequence.actions[sequence.actions.length - 1].ball_holder_after_id;
}

/**
 * Get player by ID
 */
export function getPlayerById(players: CanvasPlayer[], playerId: string): CanvasPlayer | null {
  return players.find((p) => p.id === playerId) || null;
}

/**
 * Generate instruction label for an action
 */
function generateInstructionLabel(
  actionType: ActionType,
  fromPlayerId: string,
  toPlayerId?: string
): string {
  const fromLabel = `P${fromPlayerId.slice(-4)}`;
  const toLabel = toPlayerId ? `P${toPlayerId.slice(-4)}` : '';

  switch (actionType) {
    case 'pass':
      return `Pass: ${fromLabel} → ${toLabel}`;
    case 'dribble':
      return `Dribble: ${fromLabel}`;
    case 'run':
      return `Run: ${fromLabel}`;
    case 'shot':
      return `Shot: ${fromLabel}`;
    case 'movement':
      return `Movement: ${fromLabel}`;
    case 'pressing':
      return `Press: ${fromLabel}`;
    case 'overlap':
      return `Overlap: ${fromLabel}`;
    default:
      return `Action: ${fromLabel}`;
  }
}

/**
 * Convert legacy arrow to tactical action
 */
export function convertArrowToAction(
  arrow: any,
  sequenceId: string,
  sequenceOrder: number,
  currentBallHolder: string | null
): TacticalAction {
  return {
    action_id: arrow.id || newId(),
    sequence_id: sequenceId,
    sequence_order: sequenceOrder,
    action_type: arrow.style as ActionType,
    from_player_id: arrow.fromPlayerId || '',
    to_player_id: arrow.toPlayerId,
    path_points: [
      { x: arrow.x1, y: arrow.y1 },
      { x: arrow.x2, y: arrow.y2 },
    ],
    ball_holder_before_id: currentBallHolder,
    ball_holder_after_id: calculateBallHolderAfterAction({
      action_id: '',
      sequence_id: '',
      sequence_order: 0,
      action_type: arrow.style,
      from_player_id: arrow.fromPlayerId || '',
      to_player_id: arrow.toPlayerId,
      path_points: [],
      ball_holder_before_id: currentBallHolder,
      ball_holder_after_id: null,
      ball_state: 'with_player',
      instruction_label: '',
      color: '',
    }),
    ball_state: 'with_player',
    instruction_label: arrow.style,
    color: arrow.color,
    sequence_marker: sequenceOrder + 1,
  };
}
