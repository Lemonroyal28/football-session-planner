'use client';

import type { PitchType } from '../../../types/pitch';

const OPTIONS: { value: PitchType; label: string }[] = [
  { value: 'full', label: 'Full Pitch' },
  { value: 'half-attack', label: 'Half (Attack)' },
  { value: 'half-defend', label: 'Half (Defend)' },
  { value: 'small-sided', label: 'Small-Sided' },
  { value: 'futsal', label: 'Futsal' },
  { value: 'thirds', label: 'Thirds Overlay' },
];

interface PitchTypeSelectorProps {
  value: PitchType;
  onChange: (type: PitchType) => void;
}

export function PitchTypeSelector({ value, onChange }: PitchTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
        Pitch Type
      </h3>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as PitchType)}
        className="w-full rounded-md bg-white/10 text-white text-sm px-3 py-2 border border-white/10 focus:outline-none focus:ring-1 focus:ring-white/30"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#1e293b]">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
