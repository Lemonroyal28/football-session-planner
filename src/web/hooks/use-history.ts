'use client';

import { useState, useCallback, useRef } from 'react';
import type { ScreenState } from '../../types/canvas';

const MAX_HISTORY = 50;

function cloneState(s: ScreenState): ScreenState {
  return JSON.parse(JSON.stringify(s));
}

export function useHistory(initialState: ScreenState) {
  const [entries, setEntries] = useState<ScreenState[]>([cloneState(initialState)]);
  const [index, setIndex] = useState(0);
  const initialRef = useRef(initialState);

  const current = entries[index];

  const push = useCallback(
    (state: ScreenState) => {
      setEntries((prev) => {
        const trimmed = prev.slice(0, index + 1);
        const next = [...trimmed, cloneState(state)];
        if (next.length > MAX_HISTORY) next.shift();
        return next;
      });
      setIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
    },
    [index]
  );

  const undo = useCallback(() => {
    setIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const redo = useCallback(() => {
    setIndex((prev) => {
      return prev < entries.length - 1 ? prev + 1 : prev;
    });
  }, [entries.length]);

  const canUndo = index > 0;
  const canRedo = index < entries.length - 1;

  const reset = useCallback(
    (state: ScreenState) => {
      setEntries([cloneState(state)]);
      setIndex(0);
      initialRef.current = state;
    },
    []
  );

  return { current, push, undo, redo, canUndo, canRedo, reset };
}
