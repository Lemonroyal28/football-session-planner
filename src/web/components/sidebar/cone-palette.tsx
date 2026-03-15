'use client';

import type { ConeColor } from '../../../types/canvas';

const CONE_COLORS: { color: ConeColor; label: string }[] = [
  { color: '#ff6b00', label: 'Orange' },
  { color: '#facc15', label: 'Yellow' },
  { color: '#3b82f6', label: 'Blue' },
  { color: '#ef4444', label: 'Red' },
  { color: '#22c55e', label: 'Green' },
  { color: '#ffffff', label: 'White' },
];

interface ConePaletteProps {
  selectedColor: ConeColor;
  onSelectColor: (color: ConeColor) => void;
}

export function ConePalette({ selectedColor, onSelectColor }: ConePaletteProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
        Cone Color
      </h3>
      <div className="flex flex-wrap gap-2">
        {CONE_COLORS.map((c) => (
          <button
            key={c.color}
            onClick={() => onSelectColor(c.color)}
            title={c.label}
            className={`w-7 h-7 rounded-md border-2 transition-all ${
              selectedColor === c.color
                ? 'border-white scale-110'
                : 'border-white/20 hover:border-white/50'
            }`}
            style={{ backgroundColor: c.color }}
          />
        ))}
      </div>
    </div>
  );
}
