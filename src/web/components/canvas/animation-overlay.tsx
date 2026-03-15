'use client';

import type { CanvasPlayer } from '../../../types/canvas';
import type { AnimationState } from '../../hooks/use-animation';
import { PLAYER_COLORS } from '../../../types/pitch';

interface AnimationOverlayProps {
  basePlayersState: CanvasPlayer[];
  anim: AnimationState;
}

export function AnimationOverlay({ basePlayersState, anim }: AnimationOverlayProps) {
  if (!anim.playing) return null;

  return (
    <g className="animation-overlay">
      {basePlayersState.map((player) => {
        const pos = anim.playerPositions[player.id];
        if (!pos) return null;
        const fill = PLAYER_COLORS[player.type];
        const isGk = player.type === 'gk-a' || player.type === 'gk-b';
        const label = isGk ? 'GK' : String(player.number);

        return (
          <g key={`anim-${player.id}`} style={{ pointerEvents: 'none' }}>
            {/* Ghost of original position */}
            <circle
              cx={player.x}
              cy={player.y}
              r={18}
              fill={fill}
              opacity={0.2}
              stroke="#ffffff"
              strokeWidth={1}
              strokeOpacity={0.3}
            />
            {/* Animated position */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={18}
              fill={fill}
              stroke="#ffffff"
              strokeWidth={2.5}
            />
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#ffffff"
              fontSize={11}
              fontWeight="bold"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {label}
            </text>
          </g>
        );
      })}

      {/* Animated ball */}
      {anim.ballVisible && anim.ballPosition && (
        <g style={{ pointerEvents: 'none' }}>
          <circle
            cx={anim.ballPosition.x}
            cy={anim.ballPosition.y}
            r={8}
            fill="#ffffff"
            stroke="#333333"
            strokeWidth={1.5}
          />
          {/* Motion trail */}
          <circle
            cx={anim.ballPosition.x}
            cy={anim.ballPosition.y}
            r={12}
            fill="none"
            stroke="#ffffff"
            strokeWidth={1}
            opacity={0.3}
          />
        </g>
      )}

      {/* Step indicator */}
      <g style={{ pointerEvents: 'none' }}>
        <rect x={460} y={6} width={130} height={26} rx={13} fill="rgba(0,0,0,0.7)" />
        <text
          x={525}
          y={19}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#ffffff"
          fontSize={11}
          fontWeight="600"
          style={{ userSelect: 'none' }}
        >
          Step {anim.currentStep + 1} / {anim.totalSteps}
        </text>
      </g>
    </g>
  );
}
