/**
 * Football-aware tactical sequencing types
 *
 * This module defines the data structures for player-linked action sequences.
 * Actions are football-specific (pass, dribble, run, shot) and maintain
 * ball possession logic throughout the sequence.
 */

export type ActionType = 'pass' | 'dribble' | 'run' | 'shot' | 'movement' | 'pressing' | 'overlap';

export type LineStyle = 'straight' | 'curved' | 'free_draw';

export type TimingRelation = 'before' | 'during' | 'after' | 'simultaneous';

export type BallState = 'with_player' | 'in_flight' | 'loose';

/**
 * A single tactical action within a sequence
 * Links players and tracks ball possession
 */
export interface TacticalAction {
  /** Unique identifier for this action */
  action_id: string;

  /** Parent sequence this action belongs to */
  sequence_id: string;

  /** Position in the sequence (0-indexed) */
  sequence_order: number;

  /** Type of football action */
  action_type: ActionType;

  /** Drawing style for this action */
  line_style: LineStyle;

  /** Player who initiates/performs this action */
  from_player_id: string;

  /** Target player (required for pass, optional for others) */
  to_player_id?: string;

  /** Path points for dribble/run actions */
  path_points: { x: number; y: number }[];

  /** Who has the ball before this action */
  ball_holder_before_id: string | null;

  /** Who has the ball after this action */
  ball_holder_after_id: string | null;

  /** Ball state during this action */
  ball_state: BallState;

  /** Visual label for this action */
  instruction_label: string;

  /** Optional coaching note/detail */
  coaching_note?: string;

  /** Visual sequence marker (1, 2, 3, etc.) */
  sequence_marker?: number;

  /** Timing relationship to other actions (for future use) */
  timing_relation?: TimingRelation;

  /** Visual styling */
  color: string;

  /** Whether this action is part of concurrent group */
  is_concurrent?: boolean;

  /** Concurrent timing group */
  timing_group?: number;
}

/**
 * A complete tactical sequence/pattern
 * Represents a connected chain of actions
 */
export interface TacticalSequence {
  /** Unique identifier for this sequence */
  sequence_id: string;

  /** Optional title for this pattern */
  title?: string;

  /** Ordered list of actions in this sequence */
  actions: TacticalAction[];

  /** Player who starts the sequence */
  starting_player_id: string;

  /** Player who has the ball at sequence start */
  starting_ball_holder_id: string;

  /** Session block this belongs to (optional) */
  session_block_id?: string;

  /** Drill this belongs to (optional) */
  drill_id?: string;

  /** Metadata */
  created_at: string;
  updated_at: string;
}

/**
 * Validation result for an action
 */
export interface ActionValidation {
  valid: boolean;
  warnings: string[];
  errors: string[];
  can_override: boolean;
}

/**
 * Configuration for sequence builder mode
 */
export interface SequenceBuilderConfig {
  /** Enable strict possession validation */
  strict_possession_validation: boolean;

  /** Auto-assign sequence numbers */
  auto_sequence_numbers: boolean;

  /** Show possession indicators */
  show_possession_indicators: boolean;

  /** Advanced mode (allows overrides) */
  advanced_mode: boolean;
}

/**
 * Action inspector state
 */
export interface ActionInspectorState {
  /** Currently selected action */
  selected_action_id: string | null;

  /** Whether inspector is open */
  is_open: boolean;

  /** Edit mode */
  editing: boolean;
}
