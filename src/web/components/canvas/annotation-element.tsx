'use client';

import React from 'react';
import type { CanvasAnnotation } from '../../../types/canvas';

interface AnnotationElementProps {
  annotation: CanvasAnnotation;
  onClick?: (e: React.MouseEvent, annotation: CanvasAnnotation) => void;
}

export function AnnotationElement({ annotation, onClick }: AnnotationElementProps) {
  const fontSize = annotation.fontSize || (annotation.type === 'number' ? 16 : 12);
  const color = annotation.color || '#ffffff';

  if (annotation.type === 'number') {
    return (
      <g onClick={(e) => onClick?.(e, annotation)} style={{ cursor: 'pointer' }}>
        <circle
          cx={annotation.x}
          cy={annotation.y}
          r={12}
          fill="#1e293b"
          stroke={color}
          strokeWidth={2}
        />
        <text
          x={annotation.x}
          y={annotation.y}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize={fontSize}
          fontWeight="bold"
          style={{ userSelect: 'none' }}
        >
          {annotation.text}
        </text>
      </g>
    );
  }

  return (
    <text
      x={annotation.x}
      y={annotation.y}
      fill={color}
      fontSize={fontSize}
      fontWeight="500"
      style={{ cursor: 'pointer', userSelect: 'none' }}
      onClick={(e) => onClick?.(e, annotation)}
    >
      {annotation.text}
    </text>
  );
}
