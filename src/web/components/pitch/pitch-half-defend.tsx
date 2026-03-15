'use client';

import { pitchConfig as pc } from '../../lib/pitch-config';

const stroke = pc.lineColor;
const sw = pc.lineWidth;

export function PitchHalfDefend() {
  return (
    <g className="pitch-markings-half-defend">
      {/* Left half boundary */}
      <rect
        x={pc.boundary.x}
        y={pc.boundary.y}
        width={pc.boundary.width / 2}
        height={pc.boundary.height}
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
      />
      {/* Centre circle (half) */}
      <clipPath id="clip-left-half">
        <rect x={0} y={0} width={pc.centre.x} height={pc.height} />
      </clipPath>
      <circle
        cx={pc.centre.x}
        cy={pc.centre.y}
        r={pc.centre.circleR}
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
        clipPath="url(#clip-left-half)"
      />
      <circle cx={pc.centre.x} cy={pc.centre.y} r={pc.centre.spotR} fill={stroke} />
      {/* Left penalty area */}
      <rect
        x={pc.leftPenaltyArea.x}
        y={pc.leftPenaltyArea.y}
        width={pc.leftPenaltyArea.width}
        height={pc.leftPenaltyArea.height}
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
      />
      {/* Left 6-yard box */}
      <rect
        x={pc.leftSixYard.x}
        y={pc.leftSixYard.y}
        width={pc.leftSixYard.width}
        height={pc.leftSixYard.height}
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
      />
      <circle cx={pc.leftPenaltySpot.cx} cy={pc.leftPenaltySpot.cy} r={pc.leftPenaltySpot.r} fill={stroke} />
      <rect
        x={pc.leftGoal.x}
        y={pc.leftGoal.y}
        width={pc.leftGoal.width}
        height={pc.leftGoal.height}
        fill="none"
        stroke={stroke}
        strokeWidth={sw + 1}
      />
    </g>
  );
}
