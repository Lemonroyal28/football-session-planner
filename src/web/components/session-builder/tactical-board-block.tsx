'use client';

import { useState } from 'react';
import { TacticalBoardEditor } from '../tactical-board/tactical-board-editor';
import type { Session } from '../../../types/session';
import { createSession } from '../../lib/default-session';
import { Layout, X } from 'lucide-react';

interface TacticalBoardBlockProps {
  data: Record<string, unknown> | null;
  onSave: (data: Record<string, unknown>) => void;
}

export function TacticalBoardBlock({ data, onSave }: TacticalBoardBlockProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = (session: Session) => {
    onSave(session as unknown as Record<string, unknown>);
    setIsOpen(false);
  };

  const initialSession = data
    ? (data as unknown as Session)
    : createSession('Tactical Diagram');

  return (
    <div>
      <label className="block text-xs font-medium text-white/50 mb-2">Tactical Diagram</label>

      {data ? (
        <div className="rounded-md bg-white/5 border border-white/10 p-3">
          <p className="text-sm text-white/60 mb-2">Diagram saved</p>
          <button
            onClick={() => setIsOpen(true)}
            className="text-sm text-emerald-400 hover:text-emerald-300"
          >
            Edit diagram
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-md bg-white/5 border border-dashed border-white/20 px-4 py-6 w-full text-sm text-white/40 hover:bg-white/[0.07] hover:text-white/60 transition-colors"
        >
          <Layout size={18} />
          Open Tactical Board
        </button>
      )}

      {/* Full-screen modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-[#0f172a] flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
            <h3 className="text-sm font-medium text-white/80">Tactical Board</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  handleSave(initialSession);
                }}
                className="px-3 py-1.5 rounded-md bg-emerald-600 text-sm text-white hover:bg-emerald-500 transition-colors"
              >
                Save & Close
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/40 hover:text-white/70"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1">
            <TacticalBoardEditor
              initialSession={initialSession}
              onSave={handleSave}
              embedded
            />
          </div>
        </div>
      )}
    </div>
  );
}
