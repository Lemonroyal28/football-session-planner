'use client';

import { useState, useCallback } from 'react';
import { Play, Trash2, Edit3, Plus, User, Circle } from 'lucide-react';
import type { TacticalSequence, ActionType } from '../../../types/tactical-sequence';
import type { CanvasPlayer } from '../../../types/canvas';

interface SequenceBuilderPanelProps {
  /** Whether sequence builder mode is active */
  active: boolean;
  /** Toggle sequence builder mode */
  onToggle: () => void;
  /** Current active sequence being built */
  activeSequence: TacticalSequence | null;
  /** All sequences in the current screen */
  sequences: TacticalSequence[];
  /** Players in the current screen */
  players: CanvasPlayer[];
  /** Selected player for next action */
  selectedPlayer: CanvasPlayer | null;
  /** Current ball holder */
  ballHolder: CanvasPlayer | null;
  /** Create a new sequence */
  onCreateSequence: (startingPlayerId: string, ballHolderId: string) => void;
  /** Add action to current sequence */
  onAddAction: (actionType: ActionType, toPlayerId?: string) => void;
  /** Delete sequence */
  onDeleteSequence: (sequenceId: string) => void;
  /** Select sequence to edit */
  onSelectSequence: (sequenceId: string | null) => void;
  /** Play sequence animation */
  onPlaySequence: (sequenceId: string) => void;
}

export function SequenceBuilderPanel({
  active,
  onToggle,
  activeSequence,
  sequences,
  players,
  selectedPlayer,
  ballHolder,
  onCreateSequence,
  onAddAction,
  onDeleteSequence,
  onSelectSequence,
  onPlaySequence,
}: SequenceBuilderPanelProps) {
  const [showSequenceList, setShowSequenceList] = useState(false);

  const handleStartSequence = useCallback(() => {
    if (!selectedPlayer) {
      alert('Please select a player to start the sequence');
      return;
    }
    onCreateSequence(selectedPlayer.id, selectedPlayer.id);
  }, [selectedPlayer, onCreateSequence]);

  const handleAddPass = useCallback(() => {
    if (!selectedPlayer) {
      alert('Please select a target player for the pass');
      return;
    }
    onAddAction('pass', selectedPlayer.id);
  }, [selectedPlayer, onAddAction]);

  const handleAddDribble = useCallback(() => {
    onAddAction('dribble');
  }, [onAddAction]);

  const handleAddRun = useCallback(() => {
    onAddAction('run');
  }, [onAddAction]);

  const handleAddShot = useCallback(() => {
    onAddAction('shot');
  }, [onAddAction]);

  const handleAddMovement = useCallback(() => {
    onAddAction('movement');
  }, [onAddAction]);

  const getPlayerLabel = (player: CanvasPlayer) => {
    return `#${player.number} ${player.name}`;
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/90">Sequence Builder</h3>
        <button
          onClick={onToggle}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            active
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
          }`}
        >
          {active ? 'Active' : 'Inactive'}
        </button>
      </div>

      {active && (
        <>
          {/* Ball Possession Indicator */}
          {ballHolder && (
            <div className="flex items-center gap-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded">
              <Circle size={12} className="text-amber-400 fill-amber-400" />
              <span className="text-xs text-amber-200">
                Ball: {getPlayerLabel(ballHolder)}
              </span>
            </div>
          )}

          {/* Selected Player */}
          {selectedPlayer && (
            <div className="flex items-center gap-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded">
              <User size={12} className="text-blue-400" />
              <span className="text-xs text-blue-200">
                Selected: {getPlayerLabel(selectedPlayer)}
              </span>
            </div>
          )}

          {/* Start Sequence or Add Actions */}
          {!activeSequence ? (
            <button
              onClick={handleStartSequence}
              disabled={!selectedPlayer}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 disabled:bg-white/5 disabled:text-white/30 text-emerald-400 border border-emerald-500/40 disabled:border-white/10 rounded text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Start New Sequence
            </button>
          ) : (
            <>
              {/* Current Sequence Info */}
              <div className="p-3 bg-white/5 border border-white/10 rounded space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white/70">
                    Building Pattern
                  </span>
                  <span className="text-xs text-emerald-400">
                    {activeSequence.actions.length} actions
                  </span>
                </div>
                <input
                  value={activeSequence.title || 'Untitled Pattern'}
                  onChange={(e) => {
                    // TODO: Add update sequence title handler
                  }}
                  className="w-full bg-white/5 text-xs text-white/90 border border-white/10 rounded px-2 py-1 outline-none focus:border-emerald-500/50"
                  placeholder="Pattern name..."
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <p className="text-xs text-white/50">Add Action:</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleAddPass}
                    disabled={!selectedPlayer}
                    className="flex items-center justify-center gap-1 px-2 py-2 bg-blue-500/20 hover:bg-blue-500/30 disabled:bg-white/5 disabled:text-white/30 text-blue-400 border border-blue-500/40 disabled:border-white/10 rounded text-xs font-medium transition-colors"
                  >
                    Pass
                  </button>
                  <button
                    onClick={handleAddDribble}
                    className="flex items-center justify-center gap-1 px-2 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/40 rounded text-xs font-medium transition-colors"
                  >
                    Dribble
                  </button>
                  <button
                    onClick={handleAddRun}
                    className="flex items-center justify-center gap-1 px-2 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/40 rounded text-xs font-medium transition-colors"
                  >
                    Run
                  </button>
                  <button
                    onClick={handleAddShot}
                    className="flex items-center justify-center gap-1 px-2 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 rounded text-xs font-medium transition-colors"
                  >
                    Shot
                  </button>
                  <button
                    onClick={handleAddMovement}
                    className="col-span-2 flex items-center justify-center gap-1 px-2 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40 rounded text-xs font-medium transition-colors"
                  >
                    Movement
                  </button>
                </div>
              </div>

              {/* Finish Sequence */}
              <button
                onClick={() => onSelectSequence(null)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 rounded text-sm font-medium transition-colors"
              >
                Finish Sequence
              </button>
            </>
          )}

          {/* Sequence List */}
          <div className="space-y-2">
            <button
              onClick={() => setShowSequenceList(!showSequenceList)}
              className="w-full flex items-center justify-between px-3 py-2 bg-white/5 hover:bg-white/10 rounded text-xs font-medium text-white/70 transition-colors"
            >
              <span>Saved Patterns ({sequences.length})</span>
              <span className="text-white/40">{showSequenceList ? '▼' : '▶'}</span>
            </button>

            {showSequenceList && (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {sequences.length === 0 ? (
                  <p className="text-xs text-white/40 text-center py-4">
                    No patterns yet
                  </p>
                ) : (
                  sequences.map((seq) => (
                    <div
                      key={seq.sequence_id}
                      className="flex items-center justify-between gap-2 p-2 bg-white/5 hover:bg-white/10 rounded group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white/80 truncate">
                          {seq.title || 'Untitled'}
                        </p>
                        <p className="text-xs text-white/40">
                          {seq.actions.length} actions
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onPlaySequence(seq.sequence_id)}
                          className="p-1 hover:bg-white/10 rounded text-emerald-400"
                          title="Play sequence"
                        >
                          <Play size={14} />
                        </button>
                        <button
                          onClick={() => onSelectSequence(seq.sequence_id)}
                          className="p-1 hover:bg-white/10 rounded text-blue-400"
                          title="Edit sequence"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteSequence(seq.sequence_id)}
                          className="p-1 hover:bg-white/10 rounded text-red-400"
                          title="Delete sequence"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded">
            <p className="text-xs text-blue-200/70 leading-relaxed">
              {!activeSequence ? (
                <>
                  <strong>Getting started:</strong> Click a player on the pitch to select them, then click "Start New Sequence" to begin building a tactical pattern.
                </>
              ) : (
                <>
                  <strong>Building pattern:</strong> Click players to select them as targets for passes. Use action buttons to add movements to your sequence.
                </>
              )}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
