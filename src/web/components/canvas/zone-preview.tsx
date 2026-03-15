'use client';

interface ZonePreviewProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export function ZonePreview({ x, y, width, height, color }: ZonePreviewProps) {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={color}
      opacity={0.2}
      stroke={color}
      strokeWidth={1.5}
      strokeDasharray="6 3"
      style={{ pointerEvents: 'none' }}
    />
  );
}
