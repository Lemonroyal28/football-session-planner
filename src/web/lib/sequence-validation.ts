import type { TacticalAction, ActionValidation, TacticalSequence } from '../../types/tactical-sequence';
import type { CanvasPlayer } from '../../types/canvas';

/**
 * Validates a tactical action based on football rules
 */
export function validateAction(
  action: TacticalAction,
  players: CanvasPlayer[],
  currentBallHolder: string | null,
  strictMode: boolean = true
): ActionValidation {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Validate player exists
  const fromPlayer = players.find((p) => p.id === action.from_player_id);
  if (!fromPlayer) {
    errors.push(`Player ${action.from_player_id} not found`);
    return { valid: false, warnings, errors, can_override: false };
  }

  // Validate action-specific rules
  switch (action.action_type) {
    case 'pass':
      return validatePass(action, players, currentBallHolder, strictMode, warnings, errors);

    case 'dribble':
      return validateDribble(action, currentBallHolder, strictMode, warnings, errors);

    case 'shot':
      return validateShot(action, currentBallHolder, strictMode, warnings, errors);

    case 'run':
    case 'movement':
    case 'pressing':
    case 'overlap':
      // Off-ball actions are always valid
      return { valid: true, warnings, errors, can_override: true };

    default:
      errors.push(`Unknown action type: ${action.action_type}`);
      return { valid: false, warnings, errors, can_override: false };
  }
}

function validatePass(
  action: TacticalAction,
  players: CanvasPlayer[],
  currentBallHolder: string | null,
  strictMode: boolean,
  warnings: string[],
  errors: string[]
): ActionValidation {
  // Pass requires target player
  if (!action.to_player_id) {
    errors.push('Pass action requires a target player');
    return { valid: false, warnings, errors, can_override: false };
  }

  // Check target player exists
  const toPlayer = players.find((p) => p.id === action.to_player_id);
  if (!toPlayer) {
    errors.push(`Target player ${action.to_player_id} not found`);
    return { valid: false, warnings, errors, can_override: false };
  }

  // Check ball possession
  if (strictMode && currentBallHolder !== action.from_player_id) {
    warnings.push(
      `Player ${action.from_player_id} does not have the ball (current holder: ${currentBallHolder || 'none'})`
    );
    return { valid: false, warnings, errors, can_override: true };
  }

  return { valid: true, warnings, errors, can_override: true };
}

function validateDribble(
  action: TacticalAction,
  currentBallHolder: string | null,
  strictMode: boolean,
  warnings: string[],
  errors: string[]
): ActionValidation {
  // Dribble requires ball possession
  if (strictMode && currentBallHolder !== action.from_player_id) {
    warnings.push(
      `Player ${action.from_player_id} does not have the ball (current holder: ${currentBallHolder || 'none'})`
    );
    return { valid: false, warnings, errors, can_override: true };
  }

  // Dribble should have path points
  if (action.path_points.length < 2) {
    warnings.push('Dribble action should have at least 2 path points');
  }

  return { valid: true, warnings, errors, can_override: true };
}

function validateShot(
  action: TacticalAction,
  currentBallHolder: string | null,
  strictMode: boolean,
  warnings: string[],
  errors: string[]
): ActionValidation {
  // Shot requires ball possession
  if (strictMode && currentBallHolder !== action.from_player_id) {
    warnings.push(
      `Player ${action.from_player_id} does not have the ball (current holder: ${currentBallHolder || 'none'})`
    );
    return { valid: false, warnings, errors, can_override: true };
  }

  return { valid: true, warnings, errors, can_override: true };
}

/**
 * Validates an entire tactical sequence
 */
export function validateSequence(
  sequence: TacticalSequence,
  players: CanvasPlayer[],
  strictMode: boolean = true
): ActionValidation {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check starting player exists
  const startPlayer = players.find((p) => p.id === sequence.starting_player_id);
  if (!startPlayer) {
    errors.push(`Starting player ${sequence.starting_player_id} not found`);
    return { valid: false, warnings, errors, can_override: false };
  }

  // Validate ball holder
  let currentBallHolder: string | null = sequence.starting_ball_holder_id;

  // Validate each action in sequence
  for (const action of sequence.actions) {
    const validation = validateAction(action, players, currentBallHolder, strictMode);

    warnings.push(...validation.warnings);
    errors.push(...validation.errors);

    if (!validation.valid && !validation.can_override) {
      return { valid: false, warnings, errors, can_override: false };
    }

    // Update ball holder based on action
    currentBallHolder = action.ball_holder_after_id;
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
    can_override: true,
  };
}

/**
 * Calculate ball holder after an action
 */
export function calculateBallHolderAfterAction(action: TacticalAction): string | null {
  switch (action.action_type) {
    case 'pass':
      // Ball transfers to target player
      return action.to_player_id || null;

    case 'dribble':
      // Same player keeps the ball
      return action.from_player_id;

    case 'shot':
      // Ball is gone (in flight or scored)
      return null;

    case 'run':
    case 'movement':
    case 'pressing':
    case 'overlap':
      // Off-ball actions don't change possession
      return action.ball_holder_before_id;

    default:
      return action.ball_holder_before_id;
  }
}
