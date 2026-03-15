'use client';

import { pitchConfig as pc } from '../../lib/pitch-config';

const stroke = pc.lineColor;
const sw = pc.lineWidth;

// Scaled to 1050×680
const OUTER = { x: 25, y: 15, width: 1000, height: 650, rx: 14 };
const CENTRE_X = 525;
const CENTRE_Y = 340;
const CIRCLE_R = 65;
const LEFT_GOAL_AREA = { x: 25, y: 275, width: 65, height: 130 };
const RIGHT_GOAL_AREA = { x: 960, y: 275, width: 65, height: 130 };
const LEFT_GOAL = { x: 5, y: 295, width: 20, height: 90 };
const RIGHT_GOAL = { x: 1025, y: 295, width: 20, height: 90 };
const LEFT_SPOT = { cx: 130, cy: 340 };
const RIGHT_SPOT = { cx: 920, cy: 340 };

export function PitchFutsal() {
  return (
    <g className="pitch-markings-futsal">
      <rect
        x={OUTER.x} y={OUTER.y}
        width={OUTER.width} height={OUTER.height}
        rx={OUTER.rx}
        fill="none" stroke={stroke} strokeWidth={sw}
      />
      <line x1={CENTRE_X} y1={OUTER.y} x2={CENTRE_X} y2={OUTER.y + OUTER.height} stroke={stroke} strokeWidth={sw} />
      <circle cx={CENTRE_X} cy={CENTRE_Y} r={CIRCLE_R} fill="none" stroke={stroke} strokeWidth={sw} />
      <circle cx={CENTRE_X} cy={CENTRE_Y} r={5} fill={stroke} />
      <circle cx={LEFT_SPOT.cx} cy={LEFT_SPOT.cy} r={5} fill={stroke} />
      <circle cx={RIGHT_SPOT.cx} cy={RIGHT_SPOT.cy} r={5} fill={stroke} />
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
