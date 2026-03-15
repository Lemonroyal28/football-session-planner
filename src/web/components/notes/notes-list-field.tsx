'use client';

import { Plus, X } from 'lucide-react';

interface NotesListFieldProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}

export function NotesListField({ label, items, onChange }: NotesListFieldProps) {
  const addItem = () => onChange([...items, '']);
  const removeItem = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, value: string) =>
    onChange(items.map((item, idx) => (idx === i ? value : item)));

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">
          {label}
        </label>
        <button
          onClick={addItem}
          className="text-white/40 hover:text-white/70 transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1">
            <input
              value={item}
              onChange={(e) => updateItem(i, e.target.value)}
              className="flex-1 rounded-md bg-white/5 text-white text-sm px-3 py-1.5 border border-white/10 focus:outline-none focus:ring-1 focus:ring-white/30"
              placeholder={`${label} ${i + 1}...`}
            />
            <button
              onClick={() => removeItem(i)}
              className="text-white/30 hover:text-red-400 transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-white/30 italic">Click + to add</p>
        )}
      </div>
    </div>
  );
}
