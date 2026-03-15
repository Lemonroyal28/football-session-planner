'use client';

import { pitchConfig as pc } from '../../lib/pitch-config';

const stroke = pc.lineColor;
const sw = pc.lineWidth;

export function PitchHalfAttack() {
  return (
    <g className="pitch-markings-half-attack">
      {/* Right half boundary */}
      <rect
        x={pc.centre.x}
        y={pc.boundary.y}
        width={pc.boundary.width / 2}
        height={pc.boundary.height}
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
      />
      {/* Centre circle (half) */}
      <clipPath id="clip-right-half">
        <rect x={pc.centre.x} y={0} width={pc.width} height={pc.height} />
      </clipPath>
      <circle
        cx={pc.centre.x}
        cy={pc.centre.y}
        r={pc.centre.circleR}
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
        clipPath="url(#clip-right-half)"
      />
      <circle cx={pc.centre.x} cy={pc.centre.y} r={pc.centre.spotR} fill={stroke} />
      {/* Right penalty area */}
      <rect
        x={pc.rightPenaltyArea.x}
        y={pc.rightPenaltyArea.y}
        width={pc.rightPenaltyArea.width}
        height={pc.rightPenaltyArea.height}
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
      />
      {/* Right 6-yard box */}
      <rect
        x={pc.rightSixYard.x}
        y={pc.rightSixYard.y}
        width={pc.rightSixYard.width}
        height={pc.rightSixYard.height}
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
      />
      <circle cx={pc.rightPenaltySpot.cx} cy={pc.rightPenaltySpot.cy} r={pc.rightPenaltySpot.r} fill={stroke} />
      <rect
        x={pc.rightGoal.x}
        y={pc.rightGoal.y}
        width={pc.rightGoal.width}
        height={pc.rightGoal.height}
        fill="none"
        stroke={stroke}
        strokeWidth={sw + 1}
      />
    </g>
  );
}
