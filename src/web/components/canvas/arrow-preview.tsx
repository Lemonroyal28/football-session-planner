'use client';

import type { ArrowStyle } from '../../../types/canvas';
import { getArrowheadId, getArrowColor } from './svg-defs';

interface ArrowPreviewProps {
  style: ArrowStyle;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function ArrowPreview({ style, x1, y1, x2, y2 }: ArrowPreviewProps) {
  const color = getArrowColor(style);
  const markerId = `url(#${getArrowheadId(style)})`;

  if (style === 'dribble') {
    const midX = (x1 + x2) / 2 - (y2 - y1) * 0.25;
    const midY = (y1 + y2) / 2 + (x2 - x1) * 0.25;
    const d = `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;
    return (
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeOpacity={0.6}
        markerEnd={markerId}
        style={{ pointerEvents: 'none' }}
      />
    );
  }

  const isDashed = style === 'run';
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth={2.5}
      strokeOpacity={0.6}
      strokeDasharray={isDashed ? '8 4' : undefined}
      markerEnd={markerId}
      style={{ pointerEvents: 'none' }}
    />
  );
}
