'use client';

import React, { useState } from 'react';
import { FORMATIONS, mirrorFormation, type Formation } from '../../lib/formations';
import type { CanvasPlayer } from '../../../types/canvas';
import type { PlayerType } from '../../../types/pitch';
import { newId } from '../../lib/id';

type Team = 'team-a' | 'team-b';
export type PlanningMode = 'match' | 'training';

interface FormationSelectorProps {
  onApplyFormation: (players: CanvasPlayer[]) => void;
  onClearTeam: (team: Team) => void;
  planningMode: PlanningMode;
  onPlanningModeChange: (mode: PlanningMode) => void;
}

function buildPlayers(formation: Formation, team: Team): CanvasPlayer[] {
  const isB = team === 'team-b';
  const positions = isB ? mirrorFormation(formation) : formation.players;
  const gkType: PlayerType = isB ? 'gk-b' : 'gk-a';
  const outfieldType: PlayerType = isB ? 'team-b' : 'team-a';

  return positions.map((p) => ({
    id: newId(),
    x: p.x,
    y: p.y,
    type: p.number === 1 ? gkType : outfieldType,
    number: p.number,
    name: p.name,
  }));
}

export function FormationSelector({
  onApplyFormation,
  onClearTeam,
  planningMode,
  onPlanningModeChange,
}: FormationSelectorProps) {
  const [team, setTeam] = useState<Team>('team-a');

  const handleSelect = (formation: Formation) => {
    onApplyFormation(buildPlayers(formation, team));
  };

  return (
    <div className="space-y-3">
      {/* Planning mode toggle */}
      <div className="space-y-1.5">
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
          Mode
        </h3>
        <div className="flex rounded-md overflow-hidden border border-white/10">
          <button
            onClick={() => onPlanningModeChange('match')}
            className={`flex-1 text-xs py-1.5 font-medium transition-colors ${
              planningMode === 'match'
                ? 'bg-emerald-600 text-white'
                : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            Match
          </button>
          <button
            onClick={() => onPlanningModeChange('training')}
            className={`flex-1 text-xs py-1.5 font-medium transition-colors ${
              planningMode === 'training'
                ? 'bg-amber-600 text-white'
                : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            Training
          </button>
        </div>
      </div>

      {/* Formations */}
      <div className="space-y-1.5">
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
          Formations
        </h3>

        {/* Team toggle */}
        <div className="flex rounded-md overflow-hidden border border-white/10">
          <button
            onClick={() => setTeam('team-a')}
            className={`flex-1 text-xs py-1.5 font-medium transition-colors ${
              team === 'team-a'
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            Team A
          </button>
          {planningMode === 'match' && (
            <button
              onClick={() => setTeam('team-b')}
              className={`flex-1 text-xs py-1.5 font-medium transition-colors ${
                team === 'team-b'
                  ? 'bg-red-600 text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              Team B
            </button>
          )}
        </div>

        {/* Formation grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {FORMATIONS.map((f) => (
            <button
              key={f.id}
              onClick={() => handleSelect(f)}
              className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors text-xs text-white/80 font-mono text-center"
              title={`Apply ${f.label} for ${team === 'team-a' ? 'Team A' : 'Team B'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Clear team button */}
        <button
          onClick={() => onClearTeam(team)}
          className="w-full px-2 py-1.5 rounded-md border border-white/10 hover:bg-red-500/20 hover:border-red-500/30 transition-colors text-xs text-white/50 hover:text-red-300"
        >
          Clear {team === 'team-a' ? 'Team A' : 'Team B'}
        </button>
      </div>
    </div>
  );
}
