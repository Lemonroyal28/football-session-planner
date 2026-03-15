'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { ScreenState, CanvasArrow, CanvasPlayer } from '../../types/canvas';

export interface AnimationState {
  playing: boolean;
  currentStep: number;
  totalSteps: number;
  /** Animated player positions overlay — keyed by player ID */
  playerPositions: Record<string, { x: number; y: number }>;
  /** Progress along current arrow (0..1) */
  progress: number;
  /** Animated ball position (visible during pass arrows) */
  ballPosition: { x: number; y: number } | null;
  /** Whether the ball is currently traveling (pass arrow) */
  ballVisible: boolean;
}

const STEP_DURATION_MS = 1200;
const FRAME_MS = 16;

/**
 * Builds an ordered list of movements from arrows.
 * Each arrow with a `fromPlayerId` moves that player from (x1,y1) to (x2,y2).
 * Arrows without a fromPlayerId animate a ghost dot along the arrow path.
 * If a ball owner is set, arrows from the ball holder are placed first.
 */
function buildMovementPlan(state: ScreenState): {
  arrow: CanvasArrow;
  playerId: string | null;
}[] {
  const steps = state.arrows.map((arrow) => ({
    arrow,
    playerId: arrow.fromPlayerId ?? findNearestPlayer(state.players, arrow.x1, arrow.y1),
  }));

  // Reorder: arrows from the ball holder go first
  if (state.ball.ownerId) {
    const ballOwnerId = state.ball.ownerId;
    const ownerSteps = steps.filter((s) => s.playerId === ballOwnerId);
    const otherSteps = steps.filter((s) => s.playerId !== ballOwnerId);
    return [...ownerSteps, ...otherSteps];
  }

  return steps;
}

function findNearestPlayer(
  players: CanvasPlayer[],
  x: number,
  y: number
): string | null {
  let best: CanvasPlayer | null = null;
  let bestDist = 40; // max snap distance
  for (const p of players) {
    const d = Math.hypot(p.x - x, p.y - y);
    if (d < bestDist) {
      best = p;
      bestDist = d;
    }
  }
  return best?.id ?? null;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpBezier(
  x1: number, y1: number,
  x2: number, y2: number,
  style: string,
  t: number
): { x: number; y: number } {
  if (style === 'dribble') {
    const cx = (x1 + x2) / 2 - (y2 - y1) * 0.25;
    const cy = (y1 + y2) / 2 + (x2 - x1) * 0.25;
    const u = 1 - t;
    return {
      x: u * u * x1 + 2 * u * t * cx + t * t * x2,
      y: u * u * y1 + 2 * u * t * cy + t * t * y2,
    };
  }
  return { x: lerp(x1, x2, t), y: lerp(y1, y2, t) };
}

export function useAnimation(baseState: ScreenState) {
  const [anim, setAnim] = useState<AnimationState>({
    playing: false,
    currentStep: -1,
    totalSteps: 0,
    playerPositions: {},
    progress: 0,
    ballPosition: null,
    ballVisible: false,
  });

  const rafRef = useRef<number>(0);
  const startTimeRef = useRef(0);
  const planRef = useRef<ReturnType<typeof buildMovementPlan>>([]);
  const positionsRef = useRef<Record<string, { x: number; y: number }>>({});

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setAnim({
      playing: false,
      currentStep: -1,
      totalSteps: 0,
      playerPositions: {},
      progress: 0,
      ballPosition: null,
      ballVisible: false,
    });
    positionsRef.current = {};
  }, []);

  const play = useCallback(() => {
    const plan = buildMovementPlan(baseState);
    if (plan.length === 0) return;

    planRef.current = plan;
    // Snapshot starting positions from base state
    const startPos: Record<string, { x: number; y: number }> = {};
    for (const p of baseState.players) {
      startPos[p.id] = { x: p.x, y: p.y };
    }
    positionsRef.current = startPos;

    // Ball starts at the ball holder's position if set
    const ballOwner = baseState.ball.ownerId ? startPos[baseState.ball.ownerId] : null;

    setAnim({
      playing: true,
      currentStep: 0,
      totalSteps: plan.length,
      playerPositions: { ...startPos },
      progress: 0,
      ballPosition: ballOwner ?? { x: baseState.ball.x, y: baseState.ball.y },
      ballVisible: true,
    });

    startTimeRef.current = performance.now();
    runStep(0, startPos, plan);
  }, [baseState]);

  const runStep = useCallback(
    (
      stepIdx: number,
      positions: Record<string, { x: number; y: number }>,
      plan: ReturnType<typeof buildMovementPlan>
    ) => {
      if (stepIdx >= plan.length) {
        // Done — hold for a moment then stop
        setTimeout(() => stop(), 600);
        return;
      }

      const { arrow, playerId } = plan[stepIdx];
      const stepStart = performance.now();

      // The start position is the player's current position (or arrow start)
      const fromX = playerId && positions[playerId] ? positions[playerId].x : arrow.x1;
      const fromY = playerId && positions[playerId] ? positions[playerId].y : arrow.y1;

      // For pass arrows, the ball travels along the arrow path
      // For run/dribble arrows, the player moves (ball stays with holder or at last position)
      const isPass = arrow.style === 'pass';

      const tick = (now: number) => {
        const elapsed = now - stepStart;
        const t = Math.min(1, elapsed / STEP_DURATION_MS);

        const pos = lerpBezier(fromX, fromY, arrow.x2, arrow.y2, arrow.style, t);

        const newPositions = { ...positions };
        let ballPos: { x: number; y: number } | null = null;

        if (isPass) {
          // Ball travels from arrow start to arrow end
          ballPos = lerpBezier(arrow.x1, arrow.y1, arrow.x2, arrow.y2, 'pass', t);
          // Player doesn't move during a pass — the ball does
        } else {
          // Player moves along the arrow (run/dribble)
          if (playerId) {
            newPositions[playerId] = pos;
          }
          // Ball follows the player if they have it
          if (playerId) {
            ballPos = pos;
          }
        }

        setAnim({
          playing: true,
          currentStep: stepIdx,
          totalSteps: plan.length,
          playerPositions: { ...newPositions },
          progress: t,
          ballPosition: ballPos,
          ballVisible: true,
        });

        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          // Commit final position and move to next step
          if (!isPass && playerId) {
            positions[playerId] = { x: arrow.x2, y: arrow.y2 };
          }
          positionsRef.current = { ...positions };
          runStep(stepIdx + 1, { ...positions }, plan);
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    },
    [stop]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return { anim, play, stop };
}
