'use client';

import { create } from 'zustand';

export type BlockType = 'warmup' | 'drill' | 'tactical_board' | 'game' | 'cooldown';

export interface SessionBlock {
  id: string;
  session_id: string;
  order_index: number;
  block_type: BlockType;
  title: string;
  duration_minutes: number;
  drill_id: string | null;
  tactical_board_data: Record<string, unknown> | null;
  notes: Record<string, unknown>;
  coaching_points: string[];
  equipment: string[];
  description: string;
  intensity: 'low' | 'medium' | 'high';
}

export interface SessionData {
  id: string;
  title: string;
  session_date: string | null;
  duration_minutes: number;
  status: string;
  tags: string[];
  category: string;
  age_group: string | null;
  objective: string;
  team_id: string | null;
}

interface SessionBuilderStore {
  session: SessionData | null;
  blocks: SessionBlock[];
  activeBlockId: string | null;
  dirty: boolean;

  setSession: (session: SessionData) => void;
  updateSession: (updates: Partial<SessionData>) => void;
  setBlocks: (blocks: SessionBlock[]) => void;
  setActiveBlock: (id: string | null) => void;

  addBlock: (block: SessionBlock) => void;
  updateBlock: (id: string, updates: Partial<SessionBlock>) => void;
  removeBlock: (id: string) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;

  markClean: () => void;
}

export const useSessionBuilderStore = create<SessionBuilderStore>((set) => ({
  session: null,
  blocks: [],
  activeBlockId: null,
  dirty: false,

  setSession: (session) => set({ session }),
  updateSession: (updates) =>
    set((s) => ({
      session: s.session ? { ...s.session, ...updates } : null,
      dirty: true,
    })),

  setBlocks: (blocks) => set({ blocks }),
  setActiveBlock: (id) => set({ activeBlockId: id }),

  addBlock: (block) =>
    set((s) => ({
      blocks: [...s.blocks, block],
      activeBlockId: block.id,
      dirty: true,
    })),

  updateBlock: (id, updates) =>
    set((s) => ({
      blocks: s.blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
      dirty: true,
    })),

  removeBlock: (id) =>
    set((s) => ({
      blocks: s.blocks.filter((b) => b.id !== id),
      activeBlockId: s.activeBlockId === id ? null : s.activeBlockId,
      dirty: true,
    })),

  reorderBlocks: (fromIndex, toIndex) =>
    set((s) => {
      const blocks = [...s.blocks];
      const [moved] = blocks.splice(fromIndex, 1);
      blocks.splice(toIndex, 0, moved);
      return {
        blocks: blocks.map((b, i) => ({ ...b, order_index: i })),
        dirty: true,
      };
    }),

  markClean: () => set({ dirty: false }),
}));
