'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { useSessionBuilderStore, type BlockType } from '../../store/session-builder-store';
import { BlockCard } from './block-card';
import { BlockEditor } from './block-editor';
import {
  Plus,
  Save,
  ArrowLeft,
  Flame,
  Target,
  Gamepad2,
  Snowflake,
  Layout,
} from 'lucide-react';

const BLOCK_TYPES: { type: BlockType; label: string; icon: typeof Flame }[] = [
  { type: 'warmup', label: 'Warm Up', icon: Flame },
  { type: 'drill', label: 'Drill', icon: Target },
  { type: 'tactical_board', label: 'Tactical', icon: Layout },
  { type: 'game', label: 'Game', icon: Gamepad2 },
  { type: 'cooldown', label: 'Cool Down', icon: Snowflake },
];

export function SessionBuilder() {
  const router = useRouter();
  const {
    session,
    blocks,
    activeBlockId,
    dirty,
    setActiveBlock,
    addBlock,
    removeBlock,
    reorderBlocks,
    updateBlock,
    updateSession,
    markClean,
  } = useSessionBuilderStore();

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Autosave
  const save = useCallback(async () => {
    if (!session || !dirty) return;
    const supabase = createClient();

    await supabase
      .from('sessions')
      .update({
        title: session.title,
        session_date: session.session_date,
        duration_minutes: session.duration_minutes,
        status: session.status,
        tags: session.tags,
        category: session.category,
        age_group: session.age_group,
        objective: session.objective,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.id);

    // Upsert blocks
    for (const block of blocks) {
      await supabase
        .from('session_blocks')
        .upsert({
          id: block.id,
          session_id: session.id,
          order_index: block.order_index,
          block_type: block.block_type,
          title: block.title,
          duration_minutes: block.duration_minutes,
          drill_id: block.drill_id,
          tactical_board_data: block.tactical_board_data,
          notes: block.notes,
          coaching_points: block.coaching_points,
          equipment: block.equipment,
          description: block.description,
          intensity: block.intensity,
        });
    }

    markClean();
  }, [session, blocks, dirty, markClean]);

  // Debounced autosave
  useEffect(() => {
    if (!dirty) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(save, 3000);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [dirty, save]);

  const handleAddBlock = useCallback(
    (type: BlockType) => {
      if (!session) return;
      const id = crypto.randomUUID();
      addBlock({
        id,
        session_id: session.id,
        order_index: blocks.length,
        block_type: type,
        title: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
        duration_minutes: 15,
        drill_id: null,
        tactical_board_data: null,
        notes: {},
        coaching_points: [],
        equipment: [],
        description: '',
        intensity: 'medium',
      });
    },
    [session, blocks.length, addBlock]
  );

  const handleMoveBlock = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= blocks.length) return;
      reorderBlocks(index, newIndex);
    },
    [blocks.length, reorderBlocks]
  );

  const activeBlock = blocks.find((b) => b.id === activeBlockId);

  const totalDuration = blocks.reduce((sum, b) => sum + b.duration_minutes, 0);

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-white/40 text-sm">Session not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Sticky header */}
      <header className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-3 bg-[#0f172a] shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/sessions')}
            className="text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <input
            value={session.title}
            onChange={(e) => updateSession({ title: e.target.value })}
            className="bg-transparent text-lg font-semibold text-white border-b border-transparent hover:border-white/20 focus:border-white/40 outline-none"
            placeholder="Session title..."
          />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-white/40">
            {totalDuration}min / {blocks.length} blocks
          </span>
          <select
            value={session.status}
            onChange={(e) => updateSession({ status: e.target.value })}
            className="rounded-md bg-white/5 border border-white/10 px-2 py-1 text-xs text-white/70 focus:outline-none"
          >
            <option value="draft">Draft</option>
            <option value="planned">Planned</option>
            <option value="completed">Completed</option>
          </select>
          <button
            onClick={save}
            className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
          >
            <Save size={14} />
            Save
          </button>
        </div>
      </header>

      {/* Main area: block list + editor */}
      <div className="flex flex-1 overflow-hidden">
        {/* Block timeline (left) */}
        <div className="w-80 shrink-0 border-r border-white/10 overflow-y-auto p-4 space-y-3">
          {blocks.map((block, index) => (
            <BlockCard
              key={block.id}
              block={block}
              index={index}
              isActive={block.id === activeBlockId}
              onClick={() => setActiveBlock(block.id)}
              onMoveUp={() => handleMoveBlock(index, 'up')}
              onMoveDown={() => handleMoveBlock(index, 'down')}
              onRemove={() => removeBlock(block.id)}
              canMoveUp={index > 0}
              canMoveDown={index < blocks.length - 1}
            />
          ))}

          {/* Add block buttons */}
          <div className="pt-2 border-t border-white/10">
            <p className="text-xs text-white/40 mb-2">Add block</p>
            <div className="grid grid-cols-2 gap-2">
              {BLOCK_TYPES.map((bt) => (
                <button
                  key={bt.type}
                  onClick={() => handleAddBlock(bt.type)}
                  className="flex items-center gap-2 rounded-md bg-white/5 border border-white/10 px-3 py-2 text-xs text-white/60 hover:bg-white/10 hover:text-white/80 transition-colors"
                >
                  <bt.icon size={14} />
                  {bt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Block editor (right) */}
        <div className="flex-1 overflow-y-auto">
          {activeBlock ? (
            <BlockEditor
              block={activeBlock}
              onUpdate={(updates) => updateBlock(activeBlock.id, updates)}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-white/30 text-sm">
                {blocks.length === 0
                  ? 'Add a block to get started'
                  : 'Select a block to edit'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
