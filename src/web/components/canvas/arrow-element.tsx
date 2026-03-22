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

  // Get line style from arrow metadata (new system) or fall back to style-based detection (legacy)
  const lineStyle = (arrow as any).lineStyle ||
    (arrow.style === 'dribble' ? 'curved' :
     (arrow as any).pathPoints && (arrow as any).pathPoints.length > 2 ? 'free_draw' : 'straight');

  const pathPoints = (arrow as any).pathPoints || [];

  // Calculate direction for badge placement
  let dx = arrow.x2 - arrow.x1;
  let dy = arrow.y2 - arrow.y1;

  // For curved/free-draw, calculate direction from first segment
  if (lineStyle !== 'straight' && pathPoints.length >= 2) {
    dx = pathPoints[1].x - pathPoints[0].x;
    dy = pathPoints[1].y - pathPoints[0].y;
  }

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

  // Calculate final direction for concurrent badge
  let finalDx = dx;
  let finalDy = dy;
  if (lineStyle !== 'straight' && pathPoints.length >= 2) {
    const lastIdx = pathPoints.length - 1;
    finalDx = pathPoints[lastIdx].x - pathPoints[lastIdx - 1].x;
    finalDy = pathPoints[lastIdx].y - pathPoints[lastIdx - 1].y;
  }
  const finalLen = Math.hypot(finalDx, finalDy) || 1;

  // Concurrent indicator (link icon) near endpoint
  const concurrentBadgeX = arrow.x2 - (finalDx / finalLen) * 25;
  const concurrentBadgeY = arrow.y2 - (finalDy / finalLen) * 25;

  const concurrentBadge = arrow.isConcurrent ? (
    <g style={{ pointerEvents: 'none' }}>
      <circle cx={concurrentBadgeX} cy={concurrentBadgeY} r={7} fill="#3b82f6" stroke="#ffffff" strokeWidth={1} />
      <text
        x={concurrentBadgeX}
        y={concurrentBadgeY}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#ffffff"
        fontSize={10}
        fontWeight="bold"
        style={{ userSelect: 'none' }}
      >
        ⚡
      </text>
    </g>
  ) : null;

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
    case 'dribble':
      // Dribble is solid but curved - don't set dash array
      break;
    case 'pass':
    default:
      strokeDasharray = undefined; // Solid
      break;
  }

  // NEW RENDERING SYSTEM: Check lineStyle first
  // Render curved paths using path points
  if (lineStyle === 'curved' && pathPoints.length >= 3) {
    // Quadratic bezier curve: start → control → end
    const start = pathPoints[0];
    const control = pathPoints[1];
    const end = pathPoints[pathPoints.length - 1];
    const d = `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`;

    return (
      <g>
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          markerEnd={markerId}
          style={{ cursor: 'pointer' }}
          onClick={(e) => onClick?.(e, arrow)}
        />
        {badge}
        {concurrentBadge}
      </g>
    );
  }

  // Render free-draw paths using path points
  if (lineStyle === 'free_draw' && pathPoints.length >= 2) {
    let d = `M ${pathPoints[0].x} ${pathPoints[0].y}`;
    for (let i = 1; i < pathPoints.length; i++) {
      d += ` L ${pathPoints[i].x} ${pathPoints[i].y}`;
    }

    return (
      <g>
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          strokeLinejoin="round"
          markerEnd={markerId}
          style={{ cursor: 'pointer' }}
          onClick={(e) => onClick?.(e, arrow)}
        />
        {badge}
        {concurrentBadge}
      </g>
    );
  }

  // LEGACY: Curved arrows (dribble) with elastic control points
  if (arrow.style === 'dribble') {
    let d: string;

    if (arrow.controlPoints && arrow.controlPoints.length > 0) {
      // Use custom control points for elastic dribble path
      d = `M ${arrow.x1} ${arrow.y1}`;
      for (const cp of arrow.controlPoints) {
        d += ` L ${cp.x} ${cp.y}`;
      }
      d += ` L ${arrow.x2} ${arrow.y2}`;
    } else {
      // Default curved path
      const midX = (arrow.x1 + arrow.x2) / 2 - (arrow.y2 - arrow.y1) * 0.25;
      const midY = (arrow.y1 + arrow.y2) / 2 + (arrow.x2 - arrow.x1) * 0.25;
      d = `M ${arrow.x1} ${arrow.y1} Q ${midX} ${midY} ${arrow.x2} ${arrow.y2}`;
    }

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
        {concurrentBadge}
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
        {concurrentBadge}
      </g>
    );
  }

  // Straight line rendering (default)
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
      {concurrentBadge}
    </g>
  );
}
