'use client';

import type { CanvasArrow } from '../../../types/canvas';
import { ArrowElement } from './arrow-element';

interface ArrowLayerProps {
  arrows: CanvasArrow[];
  onArrowClick?: (e: React.MouseEvent, arrow: CanvasArrow) => void;
}

export function ArrowLayer({ arrows, onArrowClick }: ArrowLayerProps) {
  return (
    <g className="arrow-layer">
      {arrows.map((arrow, index) => (
        <ArrowElement
          key={arrow.id}
          arrow={arrow}
          sequenceNumber={arrow.timingGroup ?? (index + 1)}
          onClick={onArrowClick}
        />
      ))}
    </g>
  );
}
