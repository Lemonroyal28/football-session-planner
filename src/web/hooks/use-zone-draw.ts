'use client';

import { useState, useCallback } from 'react';
import type { CanvasZone } from '../../types/canvas';
import { clientToSVG } from '../lib/svg-utils';
import { newId } from '../lib/id';

interface ZoneStart {
  x: number;
  y: number;
}

export function useZoneDraw(
  svgRef: React.RefObject<SVGSVGElement | null>,
  color: string,
  onCommit: (zone: CanvasZone) => void
) {
  const [zoneStart, setZoneStart] = useState<ZoneStart | null>(null);
  const [preview, setPreview] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      const pt = clientToSVG(e.nativeEvent, svg);
      setZoneStart({ x: pt.x, y: pt.y });
    },
    [svgRef]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!zoneStart) return;
      const svg = svgRef.current;
      if (!svg) return;
      const pt = clientToSVG(e.nativeEvent, svg);
      setPreview({
        x: Math.min(zoneStart.x, pt.x),
        y: Math.min(zoneStart.y, pt.y),
        width: Math.abs(pt.x - zoneStart.x),
        height: Math.abs(pt.y - zoneStart.y),
      });
    },
    [svgRef, zoneStart]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (!zoneStart) return;
      const svg = svgRef.current;
      if (!svg) return;
      const pt = clientToSVG(e.nativeEvent, svg);
      const w = Math.abs(pt.x - zoneStart.x);
      const h = Math.abs(pt.y - zoneStart.y);
      if (w > 10 && h > 10) {
        onCommit({
          id: newId(),
          x: Math.min(zoneStart.x, pt.x),
          y: Math.min(zoneStart.y, pt.y),
          width: w,
          height: h,
          color,
          opacity: 0.25,
        });
      }
      setZoneStart(null);
      setPreview(null);
    },
    [svgRef, zoneStart, color, onCommit]
  );

  const cancel = useCallback(() => {
    setZoneStart(null);
    setPreview(null);
  }, []);

  return { preview, handleMouseDown, handleMouseMove, handleMouseUp, cancel };
}
