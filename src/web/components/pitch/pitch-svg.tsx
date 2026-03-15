'use client';

import React from 'react';
import { pitchConfig } from '../../lib/pitch-config';

interface PitchSVGProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  children: React.ReactNode;
  onMouseMove?: (e: React.MouseEvent<SVGSVGElement>) => void;
  onMouseUp?: (e: React.MouseEvent<SVGSVGElement>) => void;
  onMouseDown?: (e: React.MouseEvent<SVGSVGElement>) => void;
  onClick?: (e: React.MouseEvent<SVGSVGElement>) => void;
  cursor?: string;
}

export function PitchSVG({
  svgRef,
  children,
  onMouseMove,
  onMouseUp,
  onMouseDown,
  onClick,
  cursor = 'default',
}: PitchSVGProps) {
  return (
    <svg
      ref={svgRef}
      viewBox={pitchConfig.viewBox}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full select-none"
      style={{ cursor }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      {/* Pitch surface */}
      <rect
        x={0}
        y={0}
        width={pitchConfig.width}
        height={pitchConfig.height}
        fill="var(--pitch-green)"
      />
      {children}
    </svg>
  );
}
