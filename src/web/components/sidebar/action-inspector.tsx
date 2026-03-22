'use client';

import { useState, useCallback } from 'react';
import { X, Trash2, Edit3, ArrowRight } from 'lucide-react';
import type { TacticalAction, ActionType } from '../../../types/tactical-sequence';
import type { CanvasPlayer } from '../../../types/canvas';

interface ActionInspectorProps {
  action: TacticalAction | null;
  players: CanvasPlayer[];
  onClose: () => void;
  onUpdate: (actionId: string, updates: Partial<TacticalAction>) => void;
  onDelete: (actionId: string) => void;
}

const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  pass: 'Pass',
  dribble: 'Dribble',
  run: 'Run',
  shot: 'Shot',
  movement: 'Movement',
  pressing: 'Pressing',
  overlap: 'Overlap',
};

export function ActionInspector({
  action,
  players,
  onClose,
  onUpdate,
  onDelete,
}: ActionInspectorProps) {
  const [editingNote, setEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState('');

  const handleStartEditNote = useCallback(() => {
    setNoteValue(action?.coaching_note || '');
    setEditingNote(true);
  }, [action]);

  const handleSaveNote = useCallback(() => {
    if (action) {
      onUpdate(action.action_id, { coaching_note: noteValue });
    }
    setEditingNote(false);
  }, [action, noteValue, onUpdate]);

  const handleDelete = useCallback(() => {
    if (action && confirm('Delete this action from the sequence?')) {
      onDelete(action.action_id);
      onClose();
    }
  }, [action, onDelete, onClose]);

  if (!action) return null;

  const fromPlayer = players.find((p) => p.id === action.from_player_id);
  const toPlayer = action.to_player_id
    ? players.find((p) => p.id === action.to_player_id)
    : null;
  const ballHolderBefore = action.ball_holder_before_id
    ? players.find((p) => p.id === action.ball_holder_before_id)
    : null;
  const ballHolderAfter = action.ball_holder_after_id
    ? players.find((p) => p.id === action.ball_holder_after_id)
    : null;

  const getPlayerLabel = (player: CanvasPlayer) => `#${player.number} ${player.name}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1e293b] border border-white/20 rounded-lg shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500/20 border border-emerald-500/40 rounded flex items-center justify-center text-emerald-400 text-sm font-bold">
              {action.sequence_marker}
            </div>
            <h3 className="text-base font-semibold text-white/90">
              {ACTION_TYPE_LABELS[action.action_type]}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded transition-colors text-white/50 hover:text-white/90"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Players involved */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
              Players
            </label>
            <div className="space-y-2">
              {fromPlayer && (
                <div className="flex items-center gap-2 p-2 bg-white/5 rounded">
                  <span className="text-xs text-white/50">From:</span>
                  <span className="text-sm text-white/90">{getPlayerLabel(fromPlayer)}</span>
                </div>
              )}
              {toPlayer && (
                <div className="flex items-center gap-2 p-2 bg-white/5 rounded">
                  <span className="text-xs text-white/50">To:</span>
                  <span className="text-sm text-white/90">{getPlayerLabel(toPlayer)}</span>
                  <ArrowRight size={14} className="text-white/30 ml-auto" />
                </div>
              )}
            </div>
          </div>

          {/* Ball possession */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
              Ball Possession
            </label>
            <div className="flex items-center gap-2">
              {ballHolderBefore && (
                <div className="flex-1 p-2 bg-amber-500/10 border border-amber-500/30 rounded">
                  <div className="text-xs text-amber-300/70">Before</div>
                  <div className="text-sm text-amber-200">{getPlayerLabel(ballHolderBefore)}</div>
                </div>
              )}
              <ArrowRight size={16} className="text-white/30" />
              {ballHolderAfter ? (
                <div className="flex-1 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded">
                  <div className="text-xs text-emerald-300/70">After</div>
                  <div className="text-sm text-emerald-200">{getPlayerLabel(ballHolderAfter)}</div>
                </div>
              ) : (
                <div className="flex-1 p-2 bg-white/5 border border-white/10 rounded">
                  <div className="text-xs text-white/50">After</div>
                  <div className="text-sm text-white/40">Free ball</div>
                </div>
              )}
            </div>
          </div>

          {/* Action instruction */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
              Instruction
            </label>
            <div className="p-2 bg-white/5 border border-white/10 rounded">
              <p className="text-sm text-white/80">{action.instruction_label}</p>
            </div>
          </div>

          {/* Coaching note */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
                Coaching Note
              </label>
              {!editingNote && (
                <button
                  onClick={handleStartEditNote}
                  className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
                >
                  <Edit3 size={12} />
                  Edit
                </button>
              )}
            </div>
            {editingNote ? (
              <div className="space-y-2">
                <textarea
                  value={noteValue}
                  onChange={(e) => setNoteValue(e.target.value)}
                  rows={3}
                  className="w-full bg-white/5 text-sm text-white/90 border border-white/10 rounded px-3 py-2 outline-none focus:border-emerald-500/50 resize-none"
                  placeholder="Add coaching points, tips, or details..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNote}
                    className="flex-1 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 rounded text-xs font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingNote(false)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 rounded text-xs font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-2 bg-white/5 border border-white/10 rounded min-h-[60px]">
                <p className="text-sm text-white/70">
                  {action.coaching_note || (
                    <span className="text-white/40 italic">No coaching notes added</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-white/10">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 border border-red-500/30 rounded text-sm font-medium transition-colors"
          >
            <Trash2 size={14} />
            Delete Action
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/90 rounded text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
