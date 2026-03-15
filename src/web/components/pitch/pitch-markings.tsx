'use client';

import { pitchConfig as pc } from '../../lib/pitch-config';

const stroke = pc.lineColor;
const sw = pc.lineWidth;

export function PitchMarkings() {
  return (
    <g className="pitch-markings">
      {/* Outer boundary */}
      <rect
        x={pc.boundary.x}
        y={pc.boundary.y}
        width={pc.boundary.width}
        height={pc.boundary.height}
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
      />

      {/* Halfway line */}
      <line
        x1={pc.halfwayLine.x1}
        y1={pc.halfwayLine.y1}
        x2={pc.halfwayLine.x2}
        y2={pc.halfwayLine.y2}
        stroke={stroke}
        strokeWidth={sw}
      />

      {/* Centre circle */}
      <circle
        cx={pc.centre.x}
        cy={pc.centre.y}
        r={pc.centre.circleR}
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
      />

      {/* Centre spot */}
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

      {/* Left penalty spot */}
      <circle
        cx={pc.leftPenaltySpot.cx}
        cy={pc.leftPenaltySpot.cy}
        r={pc.leftPenaltySpot.r}
        fill={stroke}
      />

      {/* Right penalty spot */}
      <circle
        cx={pc.rightPenaltySpot.cx}
        cy={pc.rightPenaltySpot.cy}
        r={pc.rightPenaltySpot.r}
        fill={stroke}
      />

      {/* Left goal */}
      <rect
        x={pc.leftGoal.x}
        y={pc.leftGoal.y}
        width={pc.leftGoal.width}
        height={pc.leftGoal.height}
        fill="none"
        stroke={stroke}
        strokeWidth={sw + 1}
      />

      {/* Right goal */}
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
