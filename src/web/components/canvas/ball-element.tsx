'use client';

import React from 'react';

interface BallElementProps {
  cx: number;
  cy: number;
  owned: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
}

export function BallElement({ cx, cy, owned, onMouseDown }: BallElementProps) {
  return (
    <g style={{ cursor: owned ? 'default' : 'grab' }} onMouseDown={onMouseDown}>
      {/* Glow ring when owned by a player */}
      {owned && (
        <circle
          cx={cx}
          cy={cy}
          r={16}
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={2}
          className="ball-glow"
        />
      )}
      {/* Invisible hit area for dragging */}
      <circle cx={cx} cy={cy} r={14} fill="transparent" />
      {/* Ball emoji */}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={20}
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        ⚽
      </text>
    </g>
  );
}
