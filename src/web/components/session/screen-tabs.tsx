'use client';

import { Plus } from 'lucide-react';
import type { Screen } from '../../../types/session';
import { ScreenTab } from './screen-tab';

interface ScreenTabsProps {
  screens: Screen[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onRename: (index: number, name: string) => void;
  onRemove: (index: number) => void;
}

export function ScreenTabs({
  screens,
  activeIndex,
  onSelect,
  onAdd,
  onRename,
  onRemove,
}: ScreenTabsProps) {
  return (
    <div className="flex items-end gap-1 px-2 overflow-x-auto">
      {screens.map((screen, i) => (
        <ScreenTab
          key={screen.id}
          name={screen.name}
          active={i === activeIndex}
          canClose={screens.length > 1}
          onClick={() => onSelect(i)}
          onRename={(name) => onRename(i, name)}
          onClose={() => onRemove(i)}
        />
      ))}
      <button
        onClick={onAdd}
        className="flex items-center gap-1 px-2 py-1.5 text-sm text-white/50 hover:text-white/80 transition-colors"
      >
        <Plus size={14} />
        <span className="hidden sm:inline">Screen</span>
      </button>
    </div>
  );
}
