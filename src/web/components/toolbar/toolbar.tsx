'use client';

import {
  MousePointer2,
  MoveRight,
  Footprints,
  Waypoints,
  Square,
  Trash2,
  Undo2,
  Redo2,
  Download,
  Cone,
  Pencil,
  Play,
  StopCircle,
  UserRound,
  Shield,
  TrendingUp,
  Link,
} from 'lucide-react';
import type { ActiveTool } from '../../../types/tools';
import { ToolButton } from './tool-button';

interface ToolbarProps {
  activeTool: ActiveTool;
  setTool: (tool: ActiveTool) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onExportPNG: () => void;
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
  hasArrows: boolean;
  concurrentMode: boolean;
  onToggleConcurrent: () => void;
}

export function Toolbar({
  activeTool,
  setTool,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onExportPNG,
  isPlaying,
  onPlay,
  onStop,
  hasArrows,
  concurrentMode,
  onToggleConcurrent,
}: ToolbarProps) {
  const isArrowTool = activeTool.startsWith('arrow-');

  return (
    <div className="flex items-center gap-1 bg-[#1e293b] rounded-lg px-2 py-1 shadow-lg">
      <ToolButton
        icon={<MousePointer2 size={16} />}
        label="Select"
        shortcut="S"
        active={activeTool === 'select'}
        onClick={() => setTool('select')}
      />
      <ToolButton
        icon={<MoveRight size={16} />}
        label="Pass"
        shortcut="P"
        active={activeTool === 'arrow-pass'}
        onClick={() => setTool('arrow-pass')}
      />
      <ToolButton
        icon={<Footprints size={16} />}
        label="Run"
        shortcut="R"
        active={activeTool === 'arrow-run'}
        onClick={() => setTool('arrow-run')}
      />
      <ToolButton
        icon={<Waypoints size={16} />}
        label="Dribble"
        shortcut="D"
        active={activeTool === 'arrow-dribble'}
        onClick={() => setTool('arrow-dribble')}
      />
      <ToolButton
        icon={<UserRound size={16} />}
        label="Movement"
        shortcut="M"
        active={activeTool === 'arrow-movement'}
        onClick={() => setTool('arrow-movement')}
      />
      <ToolButton
        icon={<Shield size={16} />}
        label="Pressing"
        shortcut="E"
        active={activeTool === 'arrow-pressing'}
        onClick={() => setTool('arrow-pressing')}
      />
      <ToolButton
        icon={<TrendingUp size={16} />}
        label="Overlap"
        shortcut="O"
        active={activeTool === 'arrow-overlap'}
        onClick={() => setTool('arrow-overlap')}
      />

      {isArrowTool && (
        <>
          <div className="w-px h-6 bg-white/20 mx-1" />
          <ToolButton
            icon={<Link size={16} />}
            label="Concurrent"
            shortcut="L"
            active={concurrentMode}
            onClick={onToggleConcurrent}
          />
        </>
      )}

      <div className="w-px h-6 bg-white/20 mx-1" />

      <ToolButton
        icon={<Square size={16} />}
        label="Zone"
        shortcut="Z"
        active={activeTool === 'zone'}
        onClick={() => setTool('zone')}
      />
      <ToolButton
        icon={<Cone size={16} />}
        label="Cone"
        shortcut="C"
        active={activeTool === 'cone'}
        onClick={() => setTool('cone')}
      />
      <ToolButton
        icon={<Pencil size={16} />}
        label="Draw"
        shortcut="X"
        active={activeTool === 'draw'}
        onClick={() => setTool('draw')}
      />
      <ToolButton
        icon={<Trash2 size={16} />}
        label="Delete"
        shortcut="Del"
        active={activeTool === 'delete'}
        onClick={() => setTool('delete')}
      />

      <div className="w-px h-6 bg-white/20 mx-1" />

      {isPlaying ? (
        <ToolButton
          icon={<StopCircle size={16} />}
          label="Stop"
          onClick={onStop}
          active
        />
      ) : (
        <ToolButton
          icon={<Play size={16} />}
          label="Play"
          disabled={!hasArrows}
          onClick={onPlay}
        />
      )}

      <div className="w-px h-6 bg-white/20 mx-1" />

      <ToolButton
        icon={<Undo2 size={16} />}
        label="Undo"
        shortcut="Cmd+Z"
        disabled={!canUndo}
        onClick={onUndo}
      />
      <ToolButton
        icon={<Redo2 size={16} />}
        label="Redo"
        shortcut="Cmd+Shift+Z"
        disabled={!canRedo}
        onClick={onRedo}
      />

      <div className="w-px h-6 bg-white/20 mx-1" />

      <ToolButton
        icon={<Download size={16} />}
        label="PNG"
        onClick={onExportPNG}
      />
    </div>
  );
}
