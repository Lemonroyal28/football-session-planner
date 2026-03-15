'use client';

import { useState, useCallback, useRef } from 'react';
import type { CanvasScribble } from '../../types/canvas';
import { clientToSVG } from '../lib/svg-utils';
import { newId } from '../lib/id';

export function useScribbleDraw(
  svgRef: React.RefObject<SVGSVGElement | null>,
  color: string,
  strokeWidth: number,
  onCommit: (scribble: CanvasScribble) => void
) {
  const [drawing, setDrawing] = useState(false);
  const [livePath, setLivePath] = useState<string | null>(null);
  const pointsRef = useRef<{ x: number; y: number }[]>([]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      const pt = clientToSVG(e.nativeEvent, svg);
      pointsRef.current = [pt];
      setLivePath(`M ${pt.x} ${pt.y}`);
      setDrawing(true);
    },
    [svgRef]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!drawing) return;
      const svg = svgRef.current;
      if (!svg) return;
      const pt = clientToSVG(e.nativeEvent, svg);
      pointsRef.current.push(pt);
      setLivePath((prev) => (prev ? `${prev} L ${pt.x} ${pt.y}` : `M ${pt.x} ${pt.y}`));
    },
    [svgRef, drawing]
  );

  const handleMouseUp = useCallback(() => {
    if (!drawing || !livePath) {
      setDrawing(false);
      setLivePath(null);
      return;
    }
    if (pointsRef.current.length > 2) {
      onCommit({
        id: newId(),
        path: livePath,
        color,
        strokeWidth,
      });
    }
    pointsRef.current = [];
    setLivePath(null);
    setDrawing(false);
  }, [drawing, livePath, color, strokeWidth, onCommit]);

  const cancel = useCallback(() => {
    pointsRef.current = [];
    setLivePath(null);
    setDrawing(false);
  }, []);

  return { livePath, drawing, handleMouseDown, handleMouseMove, handleMouseUp, cancel };
}
