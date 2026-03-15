'use client';

const ZONE_COLORS = [
  { color: '#facc15', label: 'Yellow' },
  { color: '#3b82f6', label: 'Blue' },
  { color: '#ef4444', label: 'Red' },
  { color: '#22c55e', label: 'Green' },
  { color: '#f97316', label: 'Orange' },
  { color: '#a855f7', label: 'Purple' },
  { color: '#ffffff', label: 'White' },
  { color: '#ec4899', label: 'Pink' },
];

interface ZonePaletteProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export function ZonePalette({ selectedColor, onSelectColor }: ZonePaletteProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
        Zone Color
      </h3>
      <div className="flex flex-wrap gap-2">
        {ZONE_COLORS.map((c) => (
          <button
            key={c.color}
            onClick={() => onSelectColor(c.color)}
            title={c.label}
            className={`w-7 h-7 rounded-md border-2 transition-all ${
              selectedColor === c.color
                ? 'border-white scale-110'
                : 'border-white/20 hover:border-white/50'
            }`}
            style={{ backgroundColor: c.color, opacity: 0.6 }}
          />
        ))}
      </div>
    </div>
  );
}
