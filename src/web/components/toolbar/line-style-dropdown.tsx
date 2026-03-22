'use client';

import type { LineStyle } from '../../../types/tactical-sequence';
import { ChevronDown } from 'lucide-react';

interface LineStyleDropdownProps {
  value: LineStyle;
  onChange: (lineStyle: LineStyle) => void;
}

const LINE_STYLES: { value: LineStyle; label: string; description: string }[] = [
  { value: 'straight', label: 'Straight', description: 'Direct line between points' },
  { value: 'curved', label: 'Curved', description: 'Controlled curved path' },
  { value: 'free_draw', label: 'Free Draw', description: 'Hand-drawn custom path' },
];

export function LineStyleDropdown({ value, onChange }: LineStyleDropdownProps) {
  const selected = LINE_STYLES.find((s) => s.value === value) || LINE_STYLES[0];

  return (
    <div className="relative group">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as LineStyle)}
        className="appearance-none bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-1.5 pr-8 rounded border border-white/20 outline-none focus:border-emerald-500/50 cursor-pointer transition-colors"
        title={selected.description}
      >
        {LINE_STYLES.map((style) => (
          <option key={style.value} value={style.value} className="bg-[#1a1a2e] text-white">
            {style.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"
      />
    </div>
  );
}
