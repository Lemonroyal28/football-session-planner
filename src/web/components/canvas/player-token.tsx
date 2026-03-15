'use client';

import React from 'react';
import type { CanvasPlayer } from '../../../types/canvas';
import { PLAYER_COLORS } from '../../../types/pitch';

interface PlayerTokenProps {
  player: CanvasPlayer;
  hasBall?: boolean;
  onMouseDown?: (e: React.MouseEvent, player: CanvasPlayer) => void;
  onClick?: (e: React.MouseEvent, player: CanvasPlayer) => void;
  onDoubleClick?: (e: React.MouseEvent, player: CanvasPlayer) => void;
}

export function PlayerToken({ player, hasBall, onMouseDown, onClick, onDoubleClick }: PlayerTokenProps) {
  const fill = PLAYER_COLORS[player.type];
  const isMannequin = player.type === 'mannequin';
  const isGk = player.type === 'gk-a' || player.type === 'gk-b';
  const label = isMannequin ? '' : isGk ? 'GK' : String(player.number);

  return (
    <g
      className="player-token"
      style={{ cursor: 'pointer' }}
      onMouseDown={(e) => onMouseDown?.(e, player)}
      onClick={(e) => onClick?.(e, player)}
      onDoubleClick={(e) => onDoubleClick?.(e, player)}
    >
      {isMannequin ? (
        <>
          {/* Mannequin: tall rounded rectangle */}
          <rect
            x={player.x - 10}
            y={player.y - 20}
            width={20}
            height={40}
            rx={5}
            fill={fill}
            stroke="#ffffff"
            strokeWidth={2}
          />
          {/* Cross mark */}
          <line x1={player.x - 5} y1={player.y - 5} x2={player.x + 5} y2={player.y + 5} stroke="#ffffff" strokeWidth={2} />
          <line x1={player.x + 5} y1={player.y - 5} x2={player.x - 5} y2={player.y + 5} stroke="#ffffff" strokeWidth={2} />
        </>
      ) : (
        <circle
          cx={player.x}
          cy={player.y}
          r={18}
          fill={fill}
          stroke="#ffffff"
          strokeWidth={2}
        />
      )}
      {label && (
        <text
          x={player.x}
          y={player.y}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#ffffff"
          fontSize={11}
          fontWeight="bold"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {label}
        </text>
      )}
      {player.name && !isMannequin && (
        <text
          x={player.x}
          y={player.y + 28}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={9}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {player.name.slice(0, 8)}
        </text>
      )}
      {/* Ball indicator */}
      {hasBall && (
        <g style={{ pointerEvents: 'none' }}>
          <circle
            cx={player.x + 14}
            cy={player.y - 14}
            r={6}
            fill="#ffffff"
            stroke="#333333"
            strokeWidth={1}
          />
          {/* Pentagon pattern hint */}
          <circle
            cx={player.x + 14}
            cy={player.y - 14}
            r={3}
            fill="none"
            stroke="#333333"
            strokeWidth={0.5}
          />
        </g>
      )}
    </g>
  );
}
