'use client';

import React from 'react';
import type { CanvasArrow } from '../../../types/canvas';
import { getArrowheadId, getArrowColor } from './svg-defs';

interface ArrowElementProps {
  arrow: CanvasArrow;
  onClick?: (e: React.MouseEvent, arrow: CanvasArrow) => void;
}

export function ArrowElement({ arrow, onClick }: ArrowElementProps) {
  const color = getArrowColor(arrow.style);
  const markerId = `url(#${getArrowheadId(arrow.style)})`;

  if (arrow.style === 'dribble') {
    const midX = (arrow.x1 + arrow.x2) / 2 - (arrow.y2 - arrow.y1) * 0.25;
    const midY = (arrow.y1 + arrow.y2) / 2 + (arrow.x2 - arrow.x1) * 0.25;
    const d = `M ${arrow.x1} ${arrow.y1} Q ${midX} ${midY} ${arrow.x2} ${arrow.y2}`;
    return (
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        markerEnd={markerId}
        style={{ cursor: 'pointer' }}
        onClick={(e) => onClick?.(e, arrow)}
      />
    );
  }

  const isDashed = arrow.style === 'run';

  return (
    <line
      x1={arrow.x1}
      y1={arrow.y1}
      x2={arrow.x2}
      y2={arrow.y2}
      stroke={color}
      strokeWidth={2.5}
      strokeDasharray={isDashed ? '8 4' : undefined}
      markerEnd={markerId}
      style={{ cursor: 'pointer' }}
      onClick={(e) => onClick?.(e, arrow)}
    />
  );
}
