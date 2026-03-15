import {
  PITCH_WIDTH,
  PITCH_HEIGHT,
  PITCH_X,
  PITCH_Y,
  PITCH_INNER_WIDTH,
  PITCH_INNER_HEIGHT,
  CENTRE_X,
  CENTRE_Y,
  CENTRE_CIRCLE_R,
  CENTRE_SPOT_R,
  LEFT_PA,
  RIGHT_PA,
  LEFT_6YD,
  RIGHT_6YD,
  LEFT_PENALTY_SPOT,
  RIGHT_PENALTY_SPOT,
  LEFT_GOAL,
  RIGHT_GOAL,
} from '../../types/pitch';

export const pitchConfig = {
  viewBox: `0 0 ${PITCH_WIDTH} ${PITCH_HEIGHT}`,
  width: PITCH_WIDTH,
  height: PITCH_HEIGHT,

  boundary: { x: PITCH_X, y: PITCH_Y, width: PITCH_INNER_WIDTH, height: PITCH_INNER_HEIGHT },

  centre: { x: CENTRE_X, y: CENTRE_Y, circleR: CENTRE_CIRCLE_R, spotR: CENTRE_SPOT_R },
  halfwayLine: { x1: CENTRE_X, y1: PITCH_Y, x2: CENTRE_X, y2: PITCH_Y + PITCH_INNER_HEIGHT },

  leftPenaltyArea: LEFT_PA,
  rightPenaltyArea: RIGHT_PA,
  leftSixYard: LEFT_6YD,
  rightSixYard: RIGHT_6YD,
  leftPenaltySpot: LEFT_PENALTY_SPOT,
  rightPenaltySpot: RIGHT_PENALTY_SPOT,
  leftGoal: LEFT_GOAL,
  rightGoal: RIGHT_GOAL,

  lineColor: 'rgba(255,255,255,0.9)',
  lineWidth: 2,
};
