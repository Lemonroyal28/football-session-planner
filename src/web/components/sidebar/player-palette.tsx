'use client';

import React from 'react';
import { PLAYER_COLORS, type PlayerType } from '../../../types/pitch';
import type { CanvasPlayer } from '../../../types/canvas';
import { newId } from '../../lib/id';

interface PlayerTemplate {
  type: PlayerType;
  number: number;
  name: string;
  label: string;
}

const TEMPLATES: PlayerTemplate[] = [
  { type: 'team-a', number: 0, name: '', label: 'Team A' },
  { type: 'gk-a', number: 1, name: 'GK', label: 'GK A' },
  { type: 'team-b', number: 0, name: '', label: 'Team B' },
  { type: 'gk-b', number: 1, name: 'GK', label: 'GK B' },
  { type: 'referee', number: 0, name: 'REF', label: 'Referee' },
  { type: 'mannequin', number: 0, name: '', label: 'Mannequin' },
];

interface PlayerPaletteProps {
  onAddPlayer: (player: CanvasPlayer) => void;
  nextNumbers: Record<PlayerType, number>;
}

export function PlayerPalette({ onAddPlayer, nextNumbers }: PlayerPaletteProps) {
  const handleClick = (template: PlayerTemplate) => {
    const num = template.number || nextNumbers[template.type];
    onAddPlayer({
      id: newId(),
      x: 525,
      y: 340,
      type: template.type,
      number: num,
      name: template.name,
    });
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
        Add Players
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.type + t.label}
            onClick={() => handleClick(t)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors text-sm text-white/80"
          >
            <span
              className={`inline-block w-5 h-5 border border-white/40 shrink-0 ${
                t.type === 'mannequin' ? 'rounded-sm' : 'rounded-full'
              }`}
              style={{ backgroundColor: PLAYER_COLORS[t.type] }}
            />
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
