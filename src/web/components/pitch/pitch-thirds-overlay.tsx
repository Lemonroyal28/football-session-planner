'use client';

import { PITCH_X, PITCH_Y, PITCH_INNER_WIDTH, PITCH_INNER_HEIGHT } from '../../../types/pitch';
import { PitchMarkings } from './pitch-markings';

const thirdWidth = PITCH_INNER_WIDTH / 3;

const thirds = [
  { x: PITCH_X, label: 'Defensive Third', color: 'rgba(239,68,68,0.12)' },
  { x: PITCH_X + thirdWidth, label: 'Middle Third', color: 'rgba(234,179,8,0.12)' },
  { x: PITCH_X + thirdWidth * 2, label: 'Attacking Third', color: 'rgba(34,197,94,0.12)' },
];

export function PitchThirdsOverlay() {
  return (
    <g className="pitch-thirds-overlay">
      {thirds.map((t) => (
        <g key={t.label}>
          <rect
            x={t.x}
            y={PITCH_Y}
            width={thirdWidth}
            height={PITCH_INNER_HEIGHT}
            fill={t.color}
          />
          <text
            x={t.x + thirdWidth / 2}
            y={PITCH_Y + PITCH_INNER_HEIGHT / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fill="rgba(255,255,255,0.3)"
            fontSize={14}
            fontWeight="bold"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
            transform={`rotate(-90, ${t.x + thirdWidth / 2}, ${PITCH_Y + PITCH_INNER_HEIGHT / 2})`}
          >
            {t.label}
          </text>
        </g>
      ))}
      <PitchMarkings />
    </g>
  );
}
