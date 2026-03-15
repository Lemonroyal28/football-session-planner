'use client';

import { useState, useCallback } from 'react';
import type { CanvasPlayer } from '../../types/canvas';
import { clientToSVG, clampToPitch } from '../lib/svg-utils';

interface DragState {
  id: string;
  offsetX: number;
  offsetY: number;
}

export function useDrag(
  svgRef: React.RefObject<SVGSVGElement | null>,
  players: CanvasPlayer[],
  setPlayers: (fn: (prev: CanvasPlayer[]) => CanvasPlayer[]) => void,
  onDragEnd: () => void
) {
  const [dragging, setDragging] = useState<DragState | null>(null);

  const handlePlayerMouseDown = useCallback(
    (e: React.MouseEvent, player: CanvasPlayer) => {
      e.stopPropagation();
      const svg = svgRef.current;
      if (!svg) return;
      const pt = clientToSVG(e.nativeEvent, svg);
      setDragging({ id: player.id, offsetX: pt.x - player.x, offsetY: pt.y - player.y });
    },
    [svgRef]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;
      const svg = svgRef.current;
      if (!svg) return;
      const pt = clientToSVG(e.nativeEvent, svg);
      const clamped = clampToPitch(pt.x - dragging.offsetX, pt.y - dragging.offsetY);
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === dragging.id ? { ...p, x: clamped.x, y: clamped.y } : p
        )
      );
    },
    [dragging, svgRef, setPlayers]
  );

  const handleMouseUp = useCallback(() => {
    if (dragging) {
      setDragging(null);
      onDragEnd();
    }
  }, [dragging, onDragEnd]);

  return { dragging, handlePlayerMouseDown, handleMouseMove, handleMouseUp };
}
