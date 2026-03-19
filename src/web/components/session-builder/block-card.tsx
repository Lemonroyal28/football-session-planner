'use client';

import type { SessionBlock, BlockType } from '../../store/session-builder-store';
import {
  Flame,
  Target,
  Gamepad2,
  Snowflake,
  Layout,
  ChevronUp,
  ChevronDown,
  Trash2,
} from 'lucide-react';

const BLOCK_ICONS: Record<BlockType, typeof Flame> = {
  warmup: Flame,
  drill: Target,
  tactical_board: Layout,
  game: Gamepad2,
  cooldown: Snowflake,
};

const BLOCK_COLORS: Record<BlockType, string> = {
  warmup: 'border-l-orange-400',
  drill: 'border-l-blue-400',
  tactical_board: 'border-l-purple-400',
  game: 'border-l-emerald-400',
  cooldown: 'border-l-cyan-400',
};

interface BlockCardProps {
  block: SessionBlock;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function BlockCard({
  block,
  index,
  isActive,
  onClick,
  onMoveUp,
  onMoveDown,
  onRemove,
  canMoveUp,
  canMoveDown,
}: BlockCardProps) {
  const Icon = BLOCK_ICONS[block.block_type];

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-md border-l-2 ${BLOCK_COLORS[block.block_type]} cursor-pointer transition-colors ${
        isActive
          ? 'bg-white/10 border border-white/20'
          : 'bg-white/5 border border-transparent hover:bg-white/[0.07]'
      }`}
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
        <Icon size={16} className="text-white/50 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white/80 truncate">{block.title}</p>
          <p className="text-xs text-white/40">{block.duration_minutes}min</p>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            disabled={!canMoveUp}
            className="p-1 text-white/30 hover:text-white/60 disabled:invisible"
          >
            <ChevronUp size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            disabled={!canMoveDown}
            className="p-1 text-white/30 hover:text-white/60 disabled:invisible"
          >
            <ChevronDown size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1 text-white/30 hover:text-red-400"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
