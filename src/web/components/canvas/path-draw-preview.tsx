'use client';

import type { PathDrawState } from '../../hooks/use-path-draw';

interface PathDrawPreviewProps {
  state: PathDrawState;
}

export function PathDrawPreview({ state }: PathDrawPreviewProps) {
  if (!state.isDrawing || state.points.length === 0) return null;

  // Build path string for SVG path element
  let pathData = `M ${state.points[0].x} ${state.points[0].y}`;

  // Add lines to each subsequent point
  for (let i = 1; i < state.points.length; i++) {
    pathData += ` L ${state.points[i].x} ${state.points[i].y}`;
  }

  // Add preview line if cursor is hovering
  if (state.preview) {
    pathData += ` L ${state.preview.x} ${state.preview.y}`;
  }

  const lastPoint = state.points[state.points.length - 1];

  return (
    <g className="path-draw-preview" style={{ pointerEvents: 'none' }}>
      {/* Path line */}
      <path
        d={pathData}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={3}
        strokeDasharray="8 4"
        opacity={0.8}
      />

      {/* Point markers */}
      {state.points.map((point, i) => (
        <g key={i}>
          <circle
            cx={point.x}
            cy={point.y}
            r={6}
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={2}
          />
          {i === 0 && (
            <circle
              cx={point.x}
              cy={point.y}
              r={10}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={2}
              opacity={0.6}
            />
          )}
        </g>
      ))}

      {/* Preview point */}
      {state.preview && (
        <circle
          cx={state.preview.x}
          cy={state.preview.y}
          r={4}
          fill="#3b82f6"
          opacity={0.5}
        />
      )}

      {/* Instruction text */}
      <text
        x={lastPoint.x}
        y={lastPoint.y - 20}
        fill="#3b82f6"
        fontSize={12}
        fontWeight="bold"
        textAnchor="middle"
        style={{ userSelect: 'none' }}
      >
        {state.points.length === 1 ? 'Click to add points' : `${state.points.length} points • Enter to finish`}
      </text>
    </g>
  );
}
