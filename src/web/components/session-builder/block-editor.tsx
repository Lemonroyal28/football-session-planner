'use client';

import { useState } from 'react';
import type { SessionBlock, BlockType } from '../../store/session-builder-store';
import { TacticalBoardBlock } from './tactical-board-block';

interface BlockEditorProps {
  block: SessionBlock;
  onUpdate: (updates: Partial<SessionBlock>) => void;
}

export function BlockEditor({ block, onUpdate }: BlockEditorProps) {
  const [newCoachingPoint, setNewCoachingPoint] = useState('');
  const [newEquipment, setNewEquipment] = useState('');

  const addCoachingPoint = () => {
    if (!newCoachingPoint.trim()) return;
    onUpdate({ coaching_points: [...block.coaching_points, newCoachingPoint.trim()] });
    setNewCoachingPoint('');
  };

  const removeCoachingPoint = (index: number) => {
    onUpdate({ coaching_points: block.coaching_points.filter((_, i) => i !== index) });
  };

  const addEquipment = () => {
    if (!newEquipment.trim()) return;
    onUpdate({ equipment: [...block.equipment, newEquipment.trim()] });
    setNewEquipment('');
  };

  const removeEquipment = (index: number) => {
    onUpdate({ equipment: block.equipment.filter((_, i) => i !== index) });
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      {/* Title & type */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-white/50 mb-1">Block Title</label>
          <input
            value={block.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1">Duration (min)</label>
            <input
              type="number"
              value={block.duration_minutes}
              onChange={(e) => onUpdate({ duration_minutes: Number(e.target.value) })}
              min={1}
              max={120}
              className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1">Intensity</label>
            <select
              value={block.intensity}
              onChange={(e) => onUpdate({ intensity: e.target.value as 'low' | 'medium' | 'high' })}
              className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1">Type</label>
            <select
              value={block.block_type}
              onChange={(e) => onUpdate({ block_type: e.target.value as BlockType })}
              className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="warmup">Warm Up</option>
              <option value="drill">Drill</option>
              <option value="tactical_board">Tactical Board</option>
              <option value="game">Game</option>
              <option value="cooldown">Cool Down</option>
            </select>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-white/50 mb-1">Description</label>
        <textarea
          value={block.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          rows={3}
          className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
          placeholder="Describe the activity..."
        />
      </div>

      {/* Coaching points */}
      <div>
        <label className="block text-xs font-medium text-white/50 mb-1">Coaching Points</label>
        <div className="space-y-1.5 mb-2">
          {block.coaching_points.map((cp, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-sm text-white/70 flex-1">{cp}</span>
              <button
                onClick={() => removeCoachingPoint(i)}
                className="text-white/30 hover:text-red-400 text-xs"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newCoachingPoint}
            onChange={(e) => setNewCoachingPoint(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCoachingPoint()}
            placeholder="Add coaching point..."
            className="flex-1 rounded-md bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          <button
            onClick={addCoachingPoint}
            className="px-3 py-1.5 rounded-md bg-white/5 text-sm text-white/60 hover:bg-white/10"
          >
            Add
          </button>
        </div>
      </div>

      {/* Equipment */}
      <div>
        <label className="block text-xs font-medium text-white/50 mb-1">Equipment</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {block.equipment.map((eq, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 text-xs bg-white/5 text-white/60 px-2 py-1 rounded"
            >
              {eq}
              <button onClick={() => removeEquipment(i)} className="text-white/30 hover:text-red-400">
                &times;
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newEquipment}
            onChange={(e) => setNewEquipment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addEquipment()}
            placeholder="Add equipment..."
            className="flex-1 rounded-md bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          <button
            onClick={addEquipment}
            className="px-3 py-1.5 rounded-md bg-white/5 text-sm text-white/60 hover:bg-white/10"
          >
            Add
          </button>
        </div>
      </div>

      {/* Tactical board (for tactical_board blocks) */}
      {block.block_type === 'tactical_board' && (
        <TacticalBoardBlock
          data={block.tactical_board_data}
          onSave={(data) => onUpdate({ tactical_board_data: data })}
        />
      )}
    </div>
  );
}
