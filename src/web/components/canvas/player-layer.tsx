'use client';

import React from 'react';
import type { CanvasPlayer } from '../../../types/canvas';
import { PlayerToken } from './player-token';

interface PlayerLayerProps {
  players: CanvasPlayer[];
  ballOwnerId?: string | null;
  onPlayerMouseDown?: (e: React.MouseEvent, player: CanvasPlayer) => void;
  onPlayerClick?: (e: React.MouseEvent, player: CanvasPlayer) => void;
  onPlayerDoubleClick?: (e: React.MouseEvent, player: CanvasPlayer) => void;
}

export function PlayerLayer({ players, ballOwnerId, onPlayerMouseDown, onPlayerClick, onPlayerDoubleClick }: PlayerLayerProps) {
  return (
    <g className="player-layer">
      {players.map((player) => (
        <PlayerToken
          key={player.id}
          player={player}
          hasBall={ballOwnerId === player.id}
          onMouseDown={onPlayerMouseDown}
          onClick={onPlayerClick}
          onDoubleClick={onPlayerDoubleClick}
        />
      ))}
    </g>
  );
}
