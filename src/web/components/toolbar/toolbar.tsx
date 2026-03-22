'use client';

import {
  MousePointer2,
  Square,
  Trash2,
  Undo2,
  Redo2,
  Download,
  Cone,
  Pencil,
  Play,
  StopCircle,
  Link,
  Info,
  ArrowRight,
  MoveRight,
  Waves,
  Navigation,
} from 'lucide-react';
import type { ActiveTool } from '../../../types/tools';
import type { ActionType, LineStyle } from '../../../types/tactical-sequence';
import { ToolButton } from './tool-button';
import { HelpModal } from './help-modal';
import { ActionButtonGroup } from './action-button-group';
import { useState } from 'react';

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
  selectedActionType: ActionType;
  selectedLineStyle: LineStyle;
  onActionTypeChange: (actionType: ActionType) => void;
  onLineStyleChange: (lineStyle: LineStyle) => void;
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
  selectedActionType,
  selectedLineStyle,
  onActionTypeChange,
  onLineStyleChange,
}: ToolbarProps) {
  const isDrawMode = activeTool === 'arrow-action';
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <div className="toolbar-container overflow-x-auto overflow-y-hidden">
        <div className="flex items-center gap-1 bg-[#1e293b] rounded-lg px-2 py-1 shadow-lg min-w-max">
      <ToolButton
        icon={<MousePointer2 size={16} />}
        label="Select"
        shortcut="S"
        active={activeTool === 'select'}
        onClick={() => setTool('select')}
      />
      <ToolButton
        icon={<Info size={16} />}
        label="Help"
        shortcut="?"
        onClick={() => setShowHelp(true)}
      />

      <div className="w-px h-6 bg-white/20 mx-1" />

      {/* Football Action Buttons with Line Style Variants */}
      <div className="flex items-center gap-1.5">
        <ActionButtonGroup
          actionType="pass"
          icon={<ArrowRight size={16} />}
          label="Pass"
          color="text-emerald-400"
          active={activeTool === 'arrow-action' && selectedActionType === 'pass'}
          currentLineStyle={selectedLineStyle}
          onSelect={(actionType, lineStyle) => {
            onActionTypeChange(actionType);
            onLineStyleChange(lineStyle);
            setTool('arrow-action');
          }}
        />
        <ActionButtonGroup
          actionType="run"
          icon={<MoveRight size={16} />}
          label="Run"
          color="text-blue-400"
          active={activeTool === 'arrow-action' && selectedActionType === 'run'}
          currentLineStyle={selectedLineStyle}
          onSelect={(actionType, lineStyle) => {
            onActionTypeChange(actionType);
            onLineStyleChange(lineStyle);
            setTool('arrow-action');
          }}
        />
        <ActionButtonGroup
          actionType="dribble"
          icon={<Waves size={16} />}
          label="Dribble"
          color="text-amber-400"
          active={activeTool === 'arrow-action' && selectedActionType === 'dribble'}
          currentLineStyle={selectedLineStyle}
          onSelect={(actionType, lineStyle) => {
            onActionTypeChange(actionType);
            onLineStyleChange(lineStyle);
            setTool('arrow-action');
          }}
        />
        <ActionButtonGroup
          actionType="movement"
          icon={<Navigation size={16} />}
          label="Movement"
          color="text-purple-400"
          active={activeTool === 'arrow-action' && selectedActionType === 'movement'}
          currentLineStyle={selectedLineStyle}
          onSelect={(actionType, lineStyle) => {
            onActionTypeChange(actionType);
            onLineStyleChange(lineStyle);
            setTool('arrow-action');
          }}
        />
      </div>

      {isDrawMode && (
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
    </div>
    </>
  );
}
