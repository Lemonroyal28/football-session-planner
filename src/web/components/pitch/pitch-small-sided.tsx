'use client';

import { pitchConfig as pc } from '../../lib/pitch-config';

const stroke = pc.lineColor;
const sw = pc.lineWidth;

// Scaled to canonical 1050×680 coordinate space
const OUTER = { x: 130, y: 80, width: 790, height: 520 };
const LEFT_GOAL_AREA = { x: 130, y: 235, width: 70, height: 210 };
const RIGHT_GOAL_AREA = { x: 850, y: 235, width: 70, height: 210 };
const LEFT_GOAL = { x: 110, y: 280, width: 20, height: 120 };
const RIGHT_GOAL = { x: 920, y: 280, width: 20, height: 120 };
const CENTRE_X = 525;
const CENTRE_Y = 340;
const CIRCLE_R = 65;

export function PitchSmallSided() {
  return (
    <g className="pitch-markings-small-sided">
      <rect
        x={OUTER.x} y={OUTER.y}
        width={OUTER.width} height={OUTER.height}
        fill="none" stroke={stroke} strokeWidth={sw}
      />
      <line x1={CENTRE_X} y1={OUTER.y} x2={CENTRE_X} y2={OUTER.y + OUTER.height} stroke={stroke} strokeWidth={sw} />
      <circle cx={CENTRE_X} cy={CENTRE_Y} r={CIRCLE_R} fill="none" stroke={stroke} strokeWidth={sw} />
      <circle cx={CENTRE_X} cy={CENTRE_Y} r={5} fill={stroke} />
      <rect
        x={LEFT_GOAL_AREA.x} y={LEFT_GOAL_AREA.y}
        width={LEFT_GOAL_AREA.width} height={LEFT_GOAL_AREA.height}
        fill="none" stroke={stroke} strokeWidth={sw}
      />
      <rect
        x={RIGHT_GOAL_AREA.x} y={RIGHT_GOAL_AREA.y}
        width={RIGHT_GOAL_AREA.width} height={RIGHT_GOAL_AREA.height}
        fill="none" stroke={stroke} strokeWidth={sw}
      />
      <rect
        x={LEFT_GOAL.x} y={LEFT_GOAL.y}
        width={LEFT_GOAL.width} height={LEFT_GOAL.height}
        fill="none" stroke={stroke} strokeWidth={sw + 1}
      />
      <rect
        x={RIGHT_GOAL.x} y={RIGHT_GOAL.y}
        width={RIGHT_GOAL.width} height={RIGHT_GOAL.height}
        fill="none" stroke={stroke} strokeWidth={sw + 1}
      />
    </g>
  );
}
