'use client';

import type { CanvasZone } from '../../../types/canvas';
import { ZoneElement } from './zone-element';

interface ZoneLayerProps {
  zones: CanvasZone[];
  onZoneClick?: (e: React.MouseEvent, zone: CanvasZone) => void;
}

export function ZoneLayer({ zones, onZoneClick }: ZoneLayerProps) {
  return (
    <g className="zone-layer">
      {zones.map((zone) => (
        <ZoneElement key={zone.id} zone={zone} onClick={onZoneClick} />
      ))}
    </g>
  );
}
