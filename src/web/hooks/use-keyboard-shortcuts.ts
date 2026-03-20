'use client';

import { useEffect } from 'react';
import type { ActiveTool } from '../../types/tools';

interface ShortcutHandlers {
  setTool: (tool: ActiveTool) => void;
  undo: () => void;
  redo: () => void;
  cancelDraw: () => void;
  canUndo: boolean;
  canRedo: boolean;
  toggleConcurrent?: () => void;
  openHelp?: () => void;
}

export function useKeyboardShortcuts({
  setTool,
  undo,
  redo,
  cancelDraw,
  canUndo,
  canRedo,
  toggleConcurrent,
  openHelp,
}: ShortcutHandlers) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Undo: Cmd+Z / Ctrl+Z
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
        return;
      }

      // Redo: Cmd+Shift+Z / Ctrl+Shift+Z
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (canRedo) redo();
        return;
      }

      if (e.metaKey || e.ctrlKey) return;

      switch (e.key.toLowerCase()) {
        case '?':
          e.preventDefault();
          if (openHelp) openHelp();
          break;
        case 's':
          e.preventDefault();
          setTool('select');
          break;
        case 'p':
          e.preventDefault();
          setTool('arrow-pass');
          break;
        case 'r':
          e.preventDefault();
          setTool('arrow-run');
          break;
        case 'd':
          e.preventDefault();
          setTool('arrow-dribble');
          break;
        case 'm':
          e.preventDefault();
          setTool('arrow-movement');
          break;
        case 'e':
          e.preventDefault();
          setTool('arrow-pressing');
          break;
        case 'o':
          e.preventDefault();
          setTool('arrow-overlap');
          break;
        case 'l':
          e.preventDefault();
          if (toggleConcurrent) toggleConcurrent();
          break;
        case 'z':
          e.preventDefault();
          setTool('zone');
          break;
        case 'c':
          e.preventDefault();
          setTool('cone');
          break;
        case 'x':
          e.preventDefault();
          setTool('draw');
          break;
        case 'delete':
        case 'backspace':
          e.preventDefault();
          setTool('delete');
          break;
        case 'escape':
          e.preventDefault();
          cancelDraw();
          setTool('select');
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setTool, undo, redo, cancelDraw, canUndo, canRedo, toggleConcurrent, openHelp]);
}
