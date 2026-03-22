'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import type { ActionType } from '../../types/tactical-sequence';

export interface PathDrawState {
  isDrawing: boolean;
  actionType: ActionType;
  fromPlayerId: string;
  points: { x: number; y: number }[];
  preview: { x: number; y: number } | null;
}

export function usePathDraw(
  svgRef: React.RefObject<SVGSVGElement | null>,
  onPathComplete: (actionType: ActionType, fromPlayerId: string, points: { x: number; y: number }[]) => void
) {
  const [state, setState] = useState<PathDrawState>({
    isDrawing: false,
    actionType: 'dribble',
    fromPlayerId: '',
    points: [],
    preview: null,
  });

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const startDrawing = useCallback((actionType: ActionType, fromPlayerId: string, startX: number, startY: number) => {
    setState({
      isDrawing: true,
      actionType,
      fromPlayerId,
      points: [{ x: startX, y: startY }],
      preview: null,
    });
  }, []);

  const stopDrawing = useCallback(() => {
    const current = stateRef.current;
    if (current.isDrawing && current.points.length >= 2) {
      onPathComplete(current.actionType, current.fromPlayerId, current.points);
    }
    setState({
      isDrawing: false,
      actionType: 'dribble',
      fromPlayerId: '',
      points: [],
      preview: null,
    });
  }, [onPathComplete]);

  const cancelDrawing = useCallback(() => {
    setState({
      isDrawing: false,
      actionType: 'dribble',
      fromPlayerId: '',
      points: [],
      preview: null,
    });
  }, []);

  const addPoint = useCallback((x: number, y: number) => {
    setState((prev) => ({
      ...prev,
      points: [...prev.points, { x, y }],
    }));
  }, []);

  const updatePreview = useCallback((x: number, y: number) => {
    setState((prev) => ({
      ...prev,
      preview: { x, y },
    }));
  }, []);

  const clearPreview = useCallback(() => {
    setState((prev) => ({
      ...prev,
      preview: null,
    }));
  }, []);

  // Keyboard handler for Enter (finish) and Escape (cancel)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const current = stateRef.current;
      if (!current.isDrawing) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        stopDrawing();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelDrawing();
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [stopDrawing, cancelDrawing]);

  return {
    state,
    startDrawing,
    stopDrawing,
    cancelDrawing,
    addPoint,
    updatePreview,
    clearPreview,
  };
}
