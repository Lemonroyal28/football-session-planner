'use client';

import type { TacticalAction } from '../../../types/tactical-sequence';

interface PathEditHandlesProps {
  action: TacticalAction;
  onPointDrag: (pointIndex: number, x: number, y: number) => void;
  onDragStart: (pointIndex: number) => void;
  onDragEnd: () => void;
}

export function PathEditHandles({
  action,
  onPointDrag,
  onDragStart,
  onDragEnd,
}: PathEditHandlesProps) {
  if (!action.path_points || action.path_points.length === 0) {
    return null;
  }

  return (
    <g className="path-edit-handles" style={{ pointerEvents: 'all' }}>
      {/* Draw the editable path */}
      <path
        d={buildPathData(action.path_points)}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={3}
        strokeDasharray="8 4"
        opacity={0.9}
        style={{ pointerEvents: 'none' }}
      />

      {/* Edit handles at each point */}
      {action.path_points.map((point, index) => (
        <g key={index}>
          {/* Larger invisible hit area for easier grabbing */}
          <circle
            cx={point.x}
            cy={point.y}
            r={12}
            fill="transparent"
            style={{ cursor: 'grab' }}
            onMouseDown={(e) => {
              e.stopPropagation();
              onDragStart(index);
            }}
          />

          {/* Visible handle */}
          <circle
            cx={point.x}
            cy={point.y}
            r={6}
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={2}
            style={{ pointerEvents: 'none' }}
          />

          {/* Start point indicator */}
          {index === 0 && (
            <circle
              cx={point.x}
              cy={point.y}
              r={10}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={2}
              opacity={0.6}
              style={{ pointerEvents: 'none' }}
            />
          )}

          {/* End point indicator */}
          {index === action.path_points.length - 1 && (
            <circle
              cx={point.x}
              cy={point.y}
              r={8}
              fill="#3b82f6"
              opacity={0.3}
              style={{ pointerEvents: 'none' }}
            />
          )}
        </g>
      ))}
    </g>
  );
}

function buildPathData(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';

  let pathData = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    pathData += ` L ${points[i].x} ${points[i].y}`;
  }

  return pathData;
}
