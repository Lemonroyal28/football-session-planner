'use client';

import type { CanvasCone } from '../../../types/canvas';
import { ConeElement } from './cone-element';

interface ConeLayerProps {
  cones: CanvasCone[];
  onConeClick?: (e: React.MouseEvent, cone: CanvasCone) => void;
}

export function ConeLayer({ cones, onConeClick }: ConeLayerProps) {
  return (
    <g className="cone-layer">
      {cones.map((cone) => (
        <ConeElement key={cone.id} cone={cone} onClick={onConeClick} />
      ))}
    </g>
  );
}
