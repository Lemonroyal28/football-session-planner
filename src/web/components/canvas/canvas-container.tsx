'use client';

import React, { useCallback, useState } from 'react';
import type { ActiveTool } from '../../../types/tools';
import type {
  ArrowStyle,
  CanvasPlayer,
  CanvasArrow,
  CanvasZone,
  CanvasCone,
  CanvasScribble,
  ScreenState,
  ConeColor,
} from '../../../types/canvas';
import type { PitchType } from '../../../types/pitch';
import { PitchMarkings } from '../pitch/pitch-markings';
import { PitchHalfAttack } from '../pitch/pitch-half-attack';
import { PitchHalfDefend } from '../pitch/pitch-half-defend';
import { PitchSmallSided } from '../pitch/pitch-small-sided';
import { PitchFutsal } from '../pitch/pitch-futsal';
import { PitchThirdsOverlay } from '../pitch/pitch-thirds-overlay';
import { SvgDefs } from './svg-defs';
import { ZoneLayer } from './zone-layer';
import { ConeLayer } from './cone-layer';
import { ScribbleLayer } from './scribble-layer';
import { ArrowLayer } from './arrow-layer';
import { ArrowPreview } from './arrow-preview';
import { ZonePreview } from './zone-preview';
import { PlayerLayer } from './player-layer';
import { AnimationOverlay } from './animation-overlay';
import { BallElement } from './ball-element';
import { useDrag } from '../../hooks/use-drag';
import { useArrowDraw } from '../../hooks/use-arrow-draw';
import { useZoneDraw } from '../../hooks/use-zone-draw';
import { useScribbleDraw } from '../../hooks/use-scribble-draw';
import { usePathDraw } from '../../hooks/use-path-draw';
import type { AnimationState } from '../../hooks/use-animation';
import type { ActionType } from '../../../types/tactical-sequence';
import { clientToSVG, clampToPitch } from '../../lib/svg-utils';
import { newId } from '../../lib/id';
import { getSequenceArrows } from '../../lib/sequence-to-arrows';
import { PathDrawPreview } from './path-draw-preview';

function getViewBox(pitchType: PitchType): string {
  switch (pitchType) {
    case 'half-attack': return '525 40 525 600';
    case 'half-defend': return '0 40 525 600';
    default: return '0 0 1050 680';
  }
}

interface CanvasContainerProps {
  state: ScreenState;
  pitchType: PitchType;
  activeTool: ActiveTool;
  onStateChange: (state: ScreenState) => void;
  onHistoryPush: (state: ScreenState) => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
  coneColor: ConeColor;
  zoneColor: string;
  drawColor: string;
  drawStrokeWidth: number;
  animState: AnimationState;
  concurrentMode: boolean;
  sequenceBuilderActive?: boolean;
  onPlayerClick?: (playerId: string) => void;
  selectedPlayerId?: string | null;
  onArrowClickProp?: (arrowId: string) => void;
  pathDrawingMode?: { active: boolean; actionType: ActionType; fromPlayerId: string } | null;
  onPathComplete?: (actionType: ActionType, fromPlayerId: string, points: { x: number; y: number }[]) => void;
}

export function CanvasContainer({
  state,
  pitchType,
  activeTool,
  onStateChange,
  onHistoryPush,
  svgRef,
  coneColor,
  zoneColor,
  drawColor,
  drawStrokeWidth,
  animState,
  concurrentMode,
  sequenceBuilderActive = false,
  onPlayerClick: onPlayerClickProp,
  selectedPlayerId,
  onArrowClickProp,
  pathDrawingMode = null,
  onPathComplete: onPathCompleteProp,
}: CanvasContainerProps) {

  // Ball drag (free ball only)
  const [ballDragging, setBallDragging] = useState<{ offsetX: number; offsetY: number } | null>(null);

  const handleBallMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (state.ball.ownerId || activeTool !== 'select') return;
      e.stopPropagation();
      const svg = svgRef.current;
      if (!svg) return;
      const pt = clientToSVG(e.nativeEvent, svg);
      setBallDragging({ offsetX: pt.x - state.ball.x, offsetY: pt.y - state.ball.y });
    },
    [svgRef, state.ball, activeTool]
  );

  const handleBallDragMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ballDragging) return;
      const svg = svgRef.current;
      if (!svg) return;
      const pt = clientToSVG(e.nativeEvent, svg);
      const clamped = clampToPitch(pt.x - ballDragging.offsetX, pt.y - ballDragging.offsetY);
      onStateChange({ ...state, ball: { ...state.ball, x: clamped.x, y: clamped.y } });
    },
    [ballDragging, svgRef, state, onStateChange]
  );

  const handleBallDragUp = useCallback(() => {
    if (ballDragging) {
      setBallDragging(null);
      onHistoryPush(state);
    }
  }, [ballDragging, state, onHistoryPush]);

  // Player drag
  const setPlayers = useCallback(
    (fn: (prev: CanvasPlayer[]) => CanvasPlayer[]) => {
      onStateChange({ ...state, players: fn(state.players) });
    },
    [state, onStateChange]
  );

  const onDragEnd = useCallback(() => {
    onHistoryPush(state);
  }, [state, onHistoryPush]);

  const { dragging, handlePlayerMouseDown, handleMouseMove: dragMouseMove, handleMouseUp: dragMouseUp } =
    useDrag(svgRef, state.players, setPlayers, onDragEnd);

  // Arrow draw
  const arrowStyle: ArrowStyle | null =
    activeTool === 'arrow-pass' ? 'pass' :
    activeTool === 'arrow-run' ? 'run' :
    activeTool === 'arrow-dribble' ? 'dribble' :
    activeTool === 'arrow-movement' ? 'movement' :
    activeTool === 'arrow-pressing' ? 'pressing' :
    activeTool === 'arrow-overlap' ? 'overlap' : null;

  const onArrowCommit = useCallback(
    (arrow: CanvasArrow) => {
      // Auto-detect nearest player as the fromPlayerId
      let fromPlayerId: string | undefined;
      let bestDist = 40;
      for (const p of state.players) {
        const d = Math.hypot(p.x - arrow.x1, p.y - arrow.y1);
        if (d < bestDist) {
          fromPlayerId = p.id;
          bestDist = d;
        }
      }

      // Calculate timing group for concurrent actions
      const lastArrow = state.arrows[state.arrows.length - 1];
      let timingGroup = 0;

      if (lastArrow) {
        // If the last arrow was concurrent, continue in the same group
        if (lastArrow.isConcurrent) {
          timingGroup = lastArrow.timingGroup ?? 0;
        } else {
          // Otherwise, start a new group
          timingGroup = (lastArrow.timingGroup ?? 0) + 1;
        }
      }

      const enrichedArrow = {
        ...arrow,
        fromPlayerId,
        isConcurrent: concurrentMode,
        timingGroup,
      };

      // Auto-transfer ball on pass arrows: move ownership to nearest player at endpoint
      let nextBall = state.ball;
      if (arrow.style === 'pass' && fromPlayerId && state.ball.ownerId === fromPlayerId) {
        let targetPlayerId: string | null = null;
        let targetDist = 40;
        for (const p of state.players) {
          if (p.id === fromPlayerId) continue;
          const d = Math.hypot(p.x - arrow.x2, p.y - arrow.y2);
          if (d < targetDist) {
            targetPlayerId = p.id;
            targetDist = d;
          }
        }
        if (targetPlayerId) {
          const target = state.players.find((p) => p.id === targetPlayerId)!;
          nextBall = { x: target.x, y: target.y, ownerId: targetPlayerId };
        }
      }

      const next = { ...state, arrows: [...state.arrows, enrichedArrow], ball: nextBall };
      onStateChange(next);
      onHistoryPush(next);
    },
    [state, onStateChange, onHistoryPush, concurrentMode]
  );

  const arrowDraw = useArrowDraw(svgRef, arrowStyle || 'pass', onArrowCommit);

  // Zone draw
  const onZoneCommit = useCallback(
    (zone: CanvasZone) => {
      const next = { ...state, zones: [...state.zones, zone] };
      onStateChange(next);
      onHistoryPush(next);
    },
    [state, onStateChange, onHistoryPush]
  );

  const zoneDraw = useZoneDraw(svgRef, zoneColor, onZoneCommit);

  // Scribble draw
  const onScribbleCommit = useCallback(
    (scribble: CanvasScribble) => {
      const next = { ...state, scribbles: [...state.scribbles, scribble] };
      onStateChange(next);
      onHistoryPush(next);
    },
    [state, onStateChange, onHistoryPush]
  );

  const scribbleDraw = useScribbleDraw(svgRef, drawColor, drawStrokeWidth, onScribbleCommit);

  // Path drawing for sequences
  const handlePathComplete = useCallback(
    (actionType: ActionType, fromPlayerId: string, points: { x: number; y: number }[]) => {
      if (onPathCompleteProp) {
        onPathCompleteProp(actionType, fromPlayerId, points);
      }
    },
    [onPathCompleteProp]
  );

  const pathDraw = usePathDraw(svgRef, handlePathComplete);

  // Start path drawing when mode activates
  React.useEffect(() => {
    if (pathDrawingMode?.active && !pathDraw.state.isDrawing) {
      const player = state.players.find((p) => p.id === pathDrawingMode.fromPlayerId);
      if (player) {
        pathDraw.startDrawing(pathDrawingMode.actionType, pathDrawingMode.fromPlayerId, player.x, player.y);
      }
    }
  }, [pathDrawingMode, pathDraw, state.players]);

  // Cone placement — single click places a cone
  const handleConePlacement = useCallback(
    (e: React.MouseEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      const pt = clientToSVG(e.nativeEvent, svg);
      const clamped = clampToPitch(pt.x, pt.y);
      const cone: CanvasCone = {
        id: newId(),
        x: clamped.x,
        y: clamped.y,
        color: coneColor,
      };
      const next = { ...state, cones: [...state.cones, cone] };
      onStateChange(next);
      onHistoryPush(next);
    },
    [svgRef, coneColor, state, onStateChange, onHistoryPush]
  );

  // Delete handler
  const handleDelete = useCallback(
    (id: string) => {
      const next = {
        ...state,
        players: state.players.filter((p) => p.id !== id),
        arrows: state.arrows.filter((a) => a.id !== id),
        zones: state.zones.filter((z) => z.id !== id),
        cones: state.cones.filter((c) => c.id !== id),
        scribbles: state.scribbles.filter((s) => s.id !== id),
      };
      onStateChange(next);
      onHistoryPush(next);
    },
    [state, onStateChange, onHistoryPush]
  );

  // Event routing
  const handleSvgMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (animState.playing) return;

      // Path drawing preview
      if (pathDraw.state.isDrawing) {
        const svg = svgRef.current;
        if (svg) {
          const pt = clientToSVG(e.nativeEvent, svg);
          pathDraw.updatePreview(pt.x, pt.y);
        }
        return;
      }

      if (activeTool === 'select') { handleBallDragMove(e); dragMouseMove(e); }
      else if (arrowStyle) arrowDraw.handleMouseMove(e);
      else if (activeTool === 'zone') zoneDraw.handleMouseMove(e);
      else if (activeTool === 'draw') scribbleDraw.handleMouseMove(e);
    },
    [activeTool, arrowStyle, handleBallDragMove, dragMouseMove, arrowDraw, zoneDraw, scribbleDraw, animState.playing, pathDraw, svgRef]
  );

  const handleSvgMouseUp = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (animState.playing) return;
      if (activeTool === 'select') { handleBallDragUp(); dragMouseUp(); }
      else if (activeTool === 'zone') zoneDraw.handleMouseUp(e);
      else if (activeTool === 'draw') scribbleDraw.handleMouseUp();
    },
    [activeTool, handleBallDragUp, dragMouseUp, zoneDraw, scribbleDraw, animState.playing]
  );

  const handleSvgMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (animState.playing) return;
      if (activeTool === 'zone') zoneDraw.handleMouseDown(e);
      else if (activeTool === 'draw') scribbleDraw.handleMouseDown(e);
    },
    [activeTool, zoneDraw, scribbleDraw, animState.playing]
  );

  const handleSvgClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (animState.playing) return;

      // Path drawing - add point
      if (pathDraw.state.isDrawing) {
        const svg = svgRef.current;
        if (svg) {
          const pt = clientToSVG(e.nativeEvent, svg);
          const clamped = clampToPitch(pt.x, pt.y);
          pathDraw.addPoint(clamped.x, clamped.y);
        }
        return;
      }

      if (arrowStyle) arrowDraw.handleClick(e);
      else if (activeTool === 'cone') handleConePlacement(e);
    },
    [arrowStyle, arrowDraw, activeTool, handleConePlacement, animState.playing, pathDraw, svgRef]
  );

  // Ball assignment — double-click a player to give/remove ball
  const handleBallAssign = useCallback(
    (playerId: string) => {
      const newOwnerId = state.ball.ownerId === playerId ? null : playerId;
      const player = state.players.find((p) => p.id === playerId);
      const next = {
        ...state,
        ball: {
          x: player ? player.x : state.ball.x,
          y: player ? player.y : state.ball.y,
          ownerId: newOwnerId,
        },
      };
      onStateChange(next);
      onHistoryPush(next);
    },
    [state, onStateChange, onHistoryPush]
  );

  const handlePlayerClick = useCallback(
    (e: React.MouseEvent, player: CanvasPlayer) => {
      if (activeTool === 'delete') {
        e.stopPropagation();
        handleDelete(player.id);
      } else if (sequenceBuilderActive && onPlayerClickProp) {
        e.stopPropagation();
        onPlayerClickProp(player.id);
      }
    },
    [activeTool, handleDelete, sequenceBuilderActive, onPlayerClickProp]
  );

  const handlePlayerDoubleClick = useCallback(
    (e: React.MouseEvent, player: CanvasPlayer) => {
      if (activeTool === 'select') {
        e.stopPropagation();
        handleBallAssign(player.id);
      }
    },
    [activeTool, handleBallAssign]
  );

  const handleArrowClick = useCallback(
    (e: React.MouseEvent, arrow: CanvasArrow) => {
      if (activeTool === 'delete') {
        e.stopPropagation();
        handleDelete(arrow.id);
      } else if (sequenceBuilderActive && onArrowClickProp) {
        e.stopPropagation();
        onArrowClickProp(arrow.id);
      }
    },
    [activeTool, handleDelete, sequenceBuilderActive, onArrowClickProp]
  );

  const handleZoneClick = useCallback(
    (e: React.MouseEvent, zone: CanvasZone) => {
      if (activeTool === 'delete') {
        e.stopPropagation();
        handleDelete(zone.id);
      }
    },
    [activeTool, handleDelete]
  );

  const handleConeClick = useCallback(
    (e: React.MouseEvent, cone: CanvasCone) => {
      if (activeTool === 'delete') {
        e.stopPropagation();
        handleDelete(cone.id);
      }
    },
    [activeTool, handleDelete]
  );

  const handleScribbleClick = useCallback(
    (e: React.MouseEvent, scribble: CanvasScribble) => {
      if (activeTool === 'delete') {
        e.stopPropagation();
        handleDelete(scribble.id);
      }
    },
    [activeTool, handleDelete]
  );

  const cursor =
    pathDraw.state.isDrawing ? 'crosshair' :
    activeTool === 'delete' ? 'crosshair' :
    activeTool === 'zone' ? 'crosshair' :
    activeTool === 'cone' ? 'copy' :
    activeTool === 'draw' ? 'crosshair' :
    arrowStyle ? 'crosshair' :
    (dragging || ballDragging) ? 'grabbing' : 'default';

  const renderPitchMarkings = () => {
    switch (pitchType) {
      case 'half-attack': return <PitchHalfAttack />;
      case 'half-defend': return <PitchHalfDefend />;
      case 'small-sided': return <PitchSmallSided />;
      case 'futsal': return <PitchFutsal />;
      case 'thirds': return <PitchThirdsOverlay />;
      default: return <PitchMarkings />;
    }
  };

  const viewBox = getViewBox(pitchType);

  return (
    <div className="flex-1 bg-[#1a1a2e] p-4 flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-5xl aspect-[1050/680]">
        <svg
          ref={svgRef}
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full select-none rounded-lg shadow-2xl"
          style={{ cursor, touchAction: 'none' }}
          onMouseMove={handleSvgMouseMove}
          onMouseUp={handleSvgMouseUp}
          onMouseDown={handleSvgMouseDown}
          onClick={handleSvgClick}
          onTouchMove={handleSvgMouseMove as any}
          onTouchEnd={handleSvgMouseUp as any}
          onTouchStart={handleSvgMouseDown as any}
        >
          {/* Pitch surface */}
          <rect x={0} y={0} width={1050} height={680} fill="var(--pitch-green)" />

          <SvgDefs />

          {/* Z-order: zones → scribbles → pitch markings → cones → ball → players → arrows → animation → previews */}
          <ZoneLayer zones={state.zones} onZoneClick={handleZoneClick} />
          <ScribbleLayer scribbles={state.scribbles} onScribbleClick={handleScribbleClick} />

          {renderPitchMarkings()}

          <ConeLayer cones={state.cones} onConeClick={handleConeClick} />

          {/* Ball — always visible */}
          {(() => {
            const owner = state.ball.ownerId
              ? state.players.find((p) => p.id === state.ball.ownerId)
              : null;
            const bx = owner ? owner.x + 14 : state.ball.x;
            const by = owner ? owner.y + 14 : state.ball.y;
            return <BallElement cx={bx} cy={by} owned={!!owner} onMouseDown={handleBallMouseDown} />;
          })()}

          <PlayerLayer
            players={state.players.map((p) => ({
              ...p,
              selected: sequenceBuilderActive && selectedPlayerId === p.id,
              hasBall: state.ball.ownerId === p.id,
            }))}
            ballOwnerId={state.ball.ownerId}
            onPlayerMouseDown={activeTool === 'select' ? handlePlayerMouseDown : undefined}
            onPlayerClick={handlePlayerClick}
            onPlayerDoubleClick={handlePlayerDoubleClick}
          />

          <ArrowLayer
            arrows={[
              ...state.arrows,
              ...getSequenceArrows(state.sequences, state.players, state.activeSequenceId),
            ]}
            onArrowClick={handleArrowClick}
          />

          {/* Animation overlay */}
          <AnimationOverlay basePlayersState={state.players} anim={animState} />

          {/* Arrow preview */}
          {arrowStyle && arrowDraw.drawStart && arrowDraw.preview && (
            <ArrowPreview
              style={arrowStyle}
              x1={arrowDraw.drawStart.x}
              y1={arrowDraw.drawStart.y}
              x2={arrowDraw.preview.x}
              y2={arrowDraw.preview.y}
            />
          )}

          {/* Zone preview */}
          {activeTool === 'zone' && zoneDraw.preview && (
            <ZonePreview
              x={zoneDraw.preview.x}
              y={zoneDraw.preview.y}
              width={zoneDraw.preview.width}
              height={zoneDraw.preview.height}
              color={zoneColor}
            />
          )}

          {/* Live scribble */}
          {activeTool === 'draw' && scribbleDraw.livePath && (
            <path
              d={scribbleDraw.livePath}
              fill="none"
              stroke={drawColor}
              strokeWidth={drawStrokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity={0.7}
              style={{ pointerEvents: 'none' }}
            />
          )}

          {/* Path drawing preview */}
          {pathDraw.state.isDrawing && <PathDrawPreview state={pathDraw.state} />}
        </svg>
      </div>
    </div>
  );
}
