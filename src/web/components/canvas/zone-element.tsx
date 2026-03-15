'use client';

import React from 'react';
import type { CanvasZone } from '../../../types/canvas';

interface ZoneElementProps {
  zone: CanvasZone;
  onClick?: (e: React.MouseEvent, zone: CanvasZone) => void;
}

export function ZoneElement({ zone, onClick }: ZoneElementProps) {
  return (
    <rect
      x={zone.x}
      y={zone.y}
      width={zone.width}
      height={zone.height}
      fill={zone.color}
      opacity={zone.opacity}
      stroke={zone.color}
      strokeWidth={1}
      strokeOpacity={0.5}
      style={{ cursor: 'pointer' }}
      onClick={(e) => onClick?.(e, zone)}
    />
  );
}
