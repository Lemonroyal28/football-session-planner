'use client';

const DRAW_COLORS = ['#ffffff', '#facc15', '#ef4444', '#3b82f6', '#22c55e', '#f97316'];

interface DrawOptionsProps {
  color: string;
  strokeWidth: number;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
}

export function DrawOptions({ color, strokeWidth, onColorChange, onStrokeWidthChange }: DrawOptionsProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
        Draw Options
      </h3>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {DRAW_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onColorChange(c)}
              className={`w-6 h-6 rounded-full border-2 transition-all ${
                color === c ? 'border-white scale-110' : 'border-white/20 hover:border-white/50'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-white/50">Width</label>
          <input
            type="range"
            min={1}
            max={6}
            step={0.5}
            value={strokeWidth}
            onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
            className="flex-1 accent-white/70 h-1"
          />
          <span className="text-xs text-white/50 w-4">{strokeWidth}</span>
        </div>
      </div>
    </div>
  );
}
