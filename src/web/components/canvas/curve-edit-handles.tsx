'use client';

import type { TacticalAction } from '../../../types/tactical-sequence';

interface CurveEditHandlesProps {
  action: TacticalAction;
  onControlPointDrag: (x: number, y: number) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export function CurveEditHandles({
  action,
  onControlPointDrag,
  onDragStart,
  onDragEnd,
}: CurveEditHandlesProps) {
  if (!action.path_points || action.path_points.length < 3) {
    return null;
  }

  const start = action.path_points[0];
  const control = action.path_points[1];
  const end = action.path_points[action.path_points.length - 1];

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDragStart();
  };

  const handleDrag = (e: React.MouseEvent) => {
    if (e.buttons === 1) {
      const svg = (e.target as SVGElement).ownerSVGElement;
      if (!svg) return;

      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

      onControlPointDrag(svgP.x, svgP.y);
    }
  };

  return (
    <g className="curve-edit-handles" style={{ pointerEvents: 'none' }}>
      {/* Curve preview line */}
      <path
        d={`M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={2}
        strokeDasharray="4 2"
        opacity={0.5}
      />

      {/* Control line from start to control point */}
      <line
        x1={start.x}
        y1={start.y}
        x2={control.x}
        y2={control.y}
        stroke="#94a3b8"
        strokeWidth={1}
        strokeDasharray="2 2"
        opacity={0.4}
      />

      {/* Control line from control point to end */}
      <line
        x1={control.x}
        y1={control.y}
        x2={end.x}
        y2={end.y}
        stroke="#94a3b8"
        strokeWidth={1}
        strokeDasharray="2 2"
        opacity={0.4}
      />

      {/* Start point (fixed) */}
      <circle
        cx={start.x}
        cy={start.y}
        r={4}
        fill="#94a3b8"
        stroke="#ffffff"
        strokeWidth={1.5}
        opacity={0.8}
      />

      {/* End point (fixed) */}
      <circle
        cx={end.x}
        cy={end.y}
        r={4}
        fill="#94a3b8"
        stroke="#ffffff"
        strokeWidth={1.5}
        opacity={0.8}
      />

      {/* Control point (draggable) */}
      <circle
        cx={control.x}
        cy={control.y}
        r={7}
        fill="#3b82f6"
        stroke="#ffffff"
        strokeWidth={2}
        style={{ pointerEvents: 'all', cursor: 'move' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleDrag}
        onMouseUp={onDragEnd}
      />

      {/* Control point label */}
      <text
        x={control.x}
        y={control.y - 12}
        fill="#3b82f6"
        fontSize={10}
        fontWeight="bold"
        textAnchor="middle"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        Control Point
      </text>
    </g>
  );
}
