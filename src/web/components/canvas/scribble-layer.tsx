'use client';

import type { CanvasScribble } from '../../../types/canvas';
import { ScribbleElement } from './scribble-element';

interface ScribbleLayerProps {
  scribbles: CanvasScribble[];
  onScribbleClick?: (e: React.MouseEvent, scribble: CanvasScribble) => void;
}

export function ScribbleLayer({ scribbles, onScribbleClick }: ScribbleLayerProps) {
  return (
    <g className="scribble-layer">
      {scribbles.map((s) => (
        <ScribbleElement key={s.id} scribble={s} onClick={onScribbleClick} />
      ))}
    </g>
  );
}
