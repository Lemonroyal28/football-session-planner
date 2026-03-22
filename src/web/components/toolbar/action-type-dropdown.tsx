'use client';

import type { ActionType } from '../../../types/tactical-sequence';
import { ChevronDown } from 'lucide-react';

interface ActionTypeDropdownProps {
  value: ActionType;
  onChange: (actionType: ActionType) => void;
}

const ACTION_TYPES: { value: ActionType; label: string; description: string }[] = [
  { value: 'pass', label: 'Pass', description: 'Ball movement between players' },
  { value: 'run', label: 'Run', description: 'Off-ball player movement' },
  { value: 'dribble', label: 'Dribble', description: 'Ball-carrying movement' },
  { value: 'movement', label: 'Movement', description: 'General motion instruction' },
];

export function ActionTypeDropdown({ value, onChange }: ActionTypeDropdownProps) {
  const selected = ACTION_TYPES.find((t) => t.value === value) || ACTION_TYPES[0];

  return (
    <div className="relative group">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ActionType)}
        className="appearance-none bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-1.5 pr-8 rounded border border-white/20 outline-none focus:border-emerald-500/50 cursor-pointer transition-colors"
        title={selected.description}
      >
        {ACTION_TYPES.map((type) => (
          <option key={type.value} value={type.value} className="bg-[#1a1a2e] text-white">
            {type.label}
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
