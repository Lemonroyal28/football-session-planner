'use client';

import { useState, useCallback } from 'react';
import type { CanvasPlayer } from '../../types/canvas';
import { clientToSVG, clampToPitch } from '../lib/svg-utils';

interface DragState {
  id: string;
  offsetX: number;
  offsetY: number;
}

// Helper to get touch/mouse coordinates
function getEventPoint(e: MouseEvent | TouchEvent, svg: SVGSVGElement) {
  const clientEvent = 'touches' in e ? e.touches[0] : e;
  return clientToSVG(clientEvent, svg);
}

export function useDrag(
  svgRef: React.RefObject<SVGSVGElement | null>,
  players: CanvasPlayer[],
  setPlayers: (fn: (prev: CanvasPlayer[]) => CanvasPlayer[]) => void,
  onDragEnd: () => void
) {
  const [dragging, setDragging] = useState<DragState | null>(null);

  // Unified handler for mouse and touch start
  const handlePlayerMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent, player: CanvasPlayer) => {
      e.stopPropagation();
      const svg = svgRef.current;
      if (!svg) return;
      const nativeEvent = e.nativeEvent as MouseEvent | TouchEvent;
      const pt = getEventPoint(nativeEvent, svg);
      setDragging({ id: player.id, offsetX: pt.x - player.x, offsetY: pt.y - player.y });
    },
    [svgRef]
  );

  // Unified handler for mouse and touch move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!dragging) return;
      const svg = svgRef.current;
      if (!svg) return;
      const nativeEvent = e.nativeEvent as MouseEvent | TouchEvent;
      const pt = getEventPoint(nativeEvent, svg);
      const clamped = clampToPitch(pt.x - dragging.offsetX, pt.y - dragging.offsetY);
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === dragging.id ? { ...p, x: clamped.x, y: clamped.y } : p
        )
      );
    },
    [dragging, svgRef, setPlayers]
  );

  // Unified handler for mouse and touch end
  const handleMouseUp = useCallback(() => {
    if (dragging) {
      setDragging(null);
      onDragEnd();
    }
  }, [dragging, onDragEnd]);

  return { dragging, handlePlayerMouseDown, handleMouseMove, handleMouseUp };
}
