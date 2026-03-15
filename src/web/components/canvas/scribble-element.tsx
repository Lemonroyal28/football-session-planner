'use client';

import React from 'react';
import type { CanvasScribble } from '../../../types/canvas';

interface ScribbleElementProps {
  scribble: CanvasScribble;
  onClick?: (e: React.MouseEvent, scribble: CanvasScribble) => void;
}

export function ScribbleElement({ scribble, onClick }: ScribbleElementProps) {
  return (
    <path
      d={scribble.path}
      fill="none"
      stroke={scribble.color}
      strokeWidth={scribble.strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ cursor: 'pointer' }}
      onClick={(e) => onClick?.(e, scribble)}
    />
  );
}
