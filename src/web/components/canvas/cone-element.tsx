'use client';

import React from 'react';
import type { CanvasCone } from '../../../types/canvas';

interface ConeElementProps {
  cone: CanvasCone;
  onClick?: (e: React.MouseEvent, cone: CanvasCone) => void;
}

export function ConeElement({ cone, onClick }: ConeElementProps) {
  // Triangle pointing up — training cone shape
  const size = 12;
  const x = cone.x;
  const y = cone.y;
  const points = `${x},${y - size} ${x - size * 0.8},${y + size * 0.5} ${x + size * 0.8},${y + size * 0.5}`;

  return (
    <g
      className="cone-element"
      style={{ cursor: 'pointer' }}
      onClick={(e) => onClick?.(e, cone)}
    >
      <polygon
        points={points}
        fill={cone.color}
        stroke="#000000"
        strokeWidth={1}
        strokeOpacity={0.3}
      />
      {/* Small flat base line */}
      <line
        x1={x - size * 0.9}
        y1={y + size * 0.5}
        x2={x + size * 0.9}
        y2={y + size * 0.5}
        stroke={cone.color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </g>
  );
}
