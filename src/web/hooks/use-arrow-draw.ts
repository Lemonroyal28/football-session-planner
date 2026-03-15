'use client';

import { useState, useCallback } from 'react';
import type { ArrowStyle, CanvasArrow } from '../../types/canvas';
import { clientToSVG } from '../lib/svg-utils';
import { getArrowColor } from '../components/canvas/svg-defs';
import { newId } from '../lib/id';

interface DrawStart {
  x: number;
  y: number;
}

export function useArrowDraw(
  svgRef: React.RefObject<SVGSVGElement | null>,
  style: ArrowStyle,
  onCommit: (arrow: CanvasArrow) => void
) {
  const [drawStart, setDrawStart] = useState<DrawStart | null>(null);
  const [preview, setPreview] = useState<{ x: number; y: number } | null>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      const pt = clientToSVG(e.nativeEvent, svg);

      if (!drawStart) {
        setDrawStart({ x: pt.x, y: pt.y });
        setPreview({ x: pt.x, y: pt.y });
      } else {
        onCommit({
          id: newId(),
          style,
          x1: drawStart.x,
          y1: drawStart.y,
          x2: pt.x,
          y2: pt.y,
          color: getArrowColor(style),
        });
        setDrawStart(null);
        setPreview(null);
      }
    },
    [svgRef, drawStart, style, onCommit]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!drawStart) return;
      const svg = svgRef.current;
      if (!svg) return;
      const pt = clientToSVG(e.nativeEvent, svg);
      setPreview({ x: pt.x, y: pt.y });
    },
    [svgRef, drawStart]
  );

  const cancel = useCallback(() => {
    setDrawStart(null);
    setPreview(null);
  }, []);

  return { drawStart, preview, handleClick, handleMouseMove, cancel };
}
