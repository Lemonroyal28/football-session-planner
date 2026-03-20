'use client';

import React from 'react';
import type { CanvasArrow } from '../../../types/canvas';
import { getArrowheadId, getArrowColor } from './svg-defs';

interface ArrowElementProps {
  arrow: CanvasArrow;
  sequenceNumber?: number;
  onClick?: (e: React.MouseEvent, arrow: CanvasArrow) => void;
}

export function ArrowElement({ arrow, sequenceNumber, onClick }: ArrowElementProps) {
  const color = getArrowColor(arrow.style);
  const markerId = `url(#${getArrowheadId(arrow.style)})`;

  // Offset the badge slightly along the arrow direction
  const dx = arrow.x2 - arrow.x1;
  const dy = arrow.y2 - arrow.y1;
  const len = Math.hypot(dx, dy) || 1;
  const badgeX = arrow.x1 + (dx / len) * 18;
  const badgeY = arrow.y1 + (dy / len) * 18;

  const badge = sequenceNumber != null ? (
    <g style={{ pointerEvents: 'none' }}>
      <circle cx={badgeX} cy={badgeY} r={9} fill="#1e293b" stroke="#ffffff" strokeWidth={1.2} />
      <text
        x={badgeX}
        y={badgeY}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#ffffff"
        fontSize={9}
        fontWeight="bold"
        style={{ userSelect: 'none' }}
      >
        {sequenceNumber}
      </text>
    </g>
  ) : null;

  // Curved arrows (dribble)
  if (arrow.style === 'dribble') {
    const midX = (arrow.x1 + arrow.x2) / 2 - (arrow.y2 - arrow.y1) * 0.25;
    const midY = (arrow.y1 + arrow.y2) / 2 + (arrow.x2 - arrow.x1) * 0.25;
    const d = `M ${arrow.x1} ${arrow.y1} Q ${midX} ${midY} ${arrow.x2} ${arrow.y2}`;
    return (
      <g>
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          markerEnd={markerId}
          style={{ cursor: 'pointer' }}
          onClick={(e) => onClick?.(e, arrow)}
        />
        {badge}
      </g>
    );
  }

  // Wavy/zigzag arrow (overlap)
  if (arrow.style === 'overlap') {
    const dx = arrow.x2 - arrow.x1;
    const dy = arrow.y2 - arrow.y1;
    const len = Math.hypot(dx, dy) || 1;
    const segments = 6;
    const amplitude = 8;

    let path = `M ${arrow.x1} ${arrow.y1}`;
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const x = arrow.x1 + dx * t;
      const y = arrow.y1 + dy * t;
      const offset = i % 2 === 0 ? amplitude : -amplitude;
      const perpX = -dy / len * offset;
      const perpY = dx / len * offset;
      path += ` L ${x + perpX} ${y + perpY}`;
    }

    return (
      <g>
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={2}
          markerEnd={markerId}
          style={{ cursor: 'pointer' }}
          onClick={(e) => onClick?.(e, arrow)}
        />
        {badge}
      </g>
    );
  }

  // Determine line style based on arrow type
  let strokeDasharray: string | undefined;
  let strokeWidth = 2.5;

  switch (arrow.style) {
    case 'run':
      strokeDasharray = '8 4'; // Dashed
      break;
    case 'movement':
      strokeDasharray = '2 3'; // Dotted
      break;
    case 'pressing':
      strokeWidth = 3.5; // Thicker solid
      break;
    case 'pass':
    default:
      strokeDasharray = undefined; // Solid
      break;
  }

  return (
    <g>
      <line
        x1={arrow.x1}
        y1={arrow.y1}
        x2={arrow.x2}
        y2={arrow.y2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        markerEnd={markerId}
        style={{ cursor: 'pointer' }}
        onClick={(e) => onClick?.(e, arrow)}
      />
      {badge}
    </g>
  );
}
