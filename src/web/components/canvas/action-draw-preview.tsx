'use client';

import type { ActionType, LineStyle } from '../../../types/tactical-sequence';
import { getArrowColor } from './svg-defs';

interface ActionDrawPreviewProps {
  actionType: ActionType;
  lineStyle: LineStyle;
  startPoint: { x: number; y: number } | null;
  endPoint: { x: number; y: number } | null;
  controlPoint: { x: number; y: number } | null;
  pathPoints: { x: number; y: number }[];
  preview: { x: number; y: number } | null;
}

export function ActionDrawPreview({
  actionType,
  lineStyle,
  startPoint,
  endPoint,
  controlPoint,
  pathPoints,
  preview,
}: ActionDrawPreviewProps) {
  if (!startPoint) return null;

  const color = getArrowColor(actionType);
  const strokeWidth = 3;
  const dashArray = actionType === 'run' ? '8 4' : undefined;

  // Straight line preview
  if (lineStyle === 'straight' && preview) {
    return (
      <g className="action-draw-preview" style={{ pointerEvents: 'none' }}>
        <line
          x1={startPoint.x}
          y1={startPoint.y}
          x2={preview.x}
          y2={preview.y}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={dashArray}
          opacity={0.7}
        />
        <circle cx={startPoint.x} cy={startPoint.y} r={5} fill={color} opacity={0.7} />
        <circle cx={preview.x} cy={preview.y} r={5} fill={color} opacity={0.5} />
      </g>
    );
  }

  // Curved line preview
  if (lineStyle === 'curved') {
    if (!controlPoint && preview) {
      // Show control point placement
      return (
        <g className="action-draw-preview" style={{ pointerEvents: 'none' }}>
          <line
            x1={startPoint.x}
            y1={startPoint.y}
            x2={preview.x}
            y2={preview.y}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={dashArray}
            opacity={0.7}
          />
          <circle cx={startPoint.x} cy={startPoint.y} r={5} fill={color} opacity={0.7} />
          <text
            x={startPoint.x}
            y={startPoint.y - 15}
            fill={color}
            fontSize={11}
            fontWeight="bold"
            textAnchor="middle"
          >
            Click for curve point
          </text>
        </g>
      );
    } else if (controlPoint && preview) {
      // Show curved path preview
      const path = `M ${startPoint.x} ${startPoint.y} Q ${controlPoint.x} ${controlPoint.y} ${preview.x} ${preview.y}`;
      return (
        <g className="action-draw-preview" style={{ pointerEvents: 'none' }}>
          <path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={dashArray}
            opacity={0.7}
          />
          <circle cx={startPoint.x} cy={startPoint.y} r={5} fill={color} opacity={0.7} />
          <circle cx={controlPoint.x} cy={controlPoint.y} r={4} fill="#3b82f6" opacity={0.6} />
          <circle cx={preview.x} cy={preview.y} r={5} fill={color} opacity={0.5} />
          <text
            x={preview.x}
            y={preview.y - 15}
            fill={color}
            fontSize={11}
            fontWeight="bold"
            textAnchor="middle"
          >
            Click to finish
          </text>
        </g>
      );
    }
  }

  // Free-draw preview
  if (lineStyle === 'free_draw' && pathPoints.length > 0) {
    let pathData = `M ${pathPoints[0].x} ${pathPoints[0].y}`;
    for (let i = 1; i < pathPoints.length; i++) {
      pathData += ` L ${pathPoints[i].x} ${pathPoints[i].y}`;
    }

    return (
      <g className="action-draw-preview" style={{ pointerEvents: 'none' }}>
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={dashArray}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.7}
        />
        <circle cx={pathPoints[0].x} cy={pathPoints[0].y} r={5} fill={color} opacity={0.7} />
        {pathPoints.length > 1 && (
          <circle
            cx={pathPoints[pathPoints.length - 1].x}
            cy={pathPoints[pathPoints.length - 1].y}
            r={5}
            fill={color}
            opacity={0.5}
          />
        )}
      </g>
    );
  }

  return null;
}
