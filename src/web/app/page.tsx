'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import type { ActiveTool } from '../../types/tools';
import type { ScreenState, CanvasPlayer, ConeColor } from '../../types/canvas';
import type { PlayerType } from '../../types/pitch';
import { useSessionStore } from '../store/session-store';
import { useHistory } from '../hooks/use-history';
import { useKeyboardShortcuts } from '../hooks/use-keyboard-shortcuts';
import { useAutosave } from '../hooks/use-autosave';
import { useAnimation } from '../hooks/use-animation';
import { CanvasContainer } from '../components/canvas/canvas-container';
import { Toolbar } from '../components/toolbar/toolbar';
import { AppSidebar } from '../components/layout/app-sidebar';
import { PlayerPalette } from '../components/sidebar/player-palette';
import { PitchTypeSelector } from '../components/sidebar/pitch-type-selector';
import { ConePalette } from '../components/sidebar/cone-palette';
import { DrawOptions } from '../components/sidebar/draw-options';
import { ZonePalette } from '../components/sidebar/zone-palette';
import { ScreenTabs } from '../components/session/screen-tabs';
import { NotesPanel } from '../components/notes/notes-panel';
import { ExportMenu } from '../components/export/export-menu';
import { exportPNG, exportFSP, generateShareURL, parseShareURL } from '../lib/export';
import { saveSession, loadDraft } from '../lib/storage';
import { Save } from 'lucide-react';

export default function Home() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeTool, setActiveTool] = useState<ActiveTool>('select');
  const [coneColor, setConeColor] = useState<ConeColor>('#ff6b00');
  const [zoneColor, setZoneColor] = useState('#facc15');
  const [drawColor, setDrawColor] = useState('#ffffff');
  const [drawStrokeWidth, setDrawStrokeWidth] = useState(2);

  const {
    session,
    activeScreenIndex,
    setSession,
    setActiveScreen,
    addScreen,
    removeScreen,
    renameScreen,
    setPitchType,
    updateScreenState,
    updateScreenNotes,
    updateMeta,
  } = useSessionStore();

  const currentScreen = session.screens[activeScreenIndex];
  const screenState = currentScreen?.state;

  // History for current screen
  const history = useHistory(screenState);

  // Animation
  const { anim, play, stop } = useAnimation(screenState);

  // Sync history with screen switches
  const prevScreenRef = useRef(activeScreenIndex);
  useEffect(() => {
    if (prevScreenRef.current !== activeScreenIndex) {
      prevScreenRef.current = activeScreenIndex;
      history.reset(session.screens[activeScreenIndex].state);
    }
  }, [activeScreenIndex, session.screens, history]);

  // Sync history state back to store
  useEffect(() => {
    if (history.current && history.current !== screenState) {
      updateScreenState(activeScreenIndex, history.current);
    }
  }, [history.current]);

  // Live state update (non-history, e.g., mid-drag)
  const handleStateChange = useCallback(
    (state: ScreenState) => {
      updateScreenState(activeScreenIndex, state);
    },
    [activeScreenIndex, updateScreenState]
  );

  const handleHistoryPush = useCallback(
    (state: ScreenState) => {
      history.push(state);
    },
    [history]
  );

  // Add player from palette
  const handleAddPlayer = useCallback(
    (player: CanvasPlayer) => {
      const next = { ...screenState, players: [...screenState.players, player] };
      updateScreenState(activeScreenIndex, next);
      history.push(next);
    },
    [screenState, activeScreenIndex, updateScreenState, history]
  );

  // Compute next available numbers per player type
  const nextNumbers = (() => {
    const counts: Record<PlayerType, number> = {
      'team-a': 1,
      'team-b': 1,
      'gk-a': 1,
      'gk-b': 1,
      referee: 1,
      mannequin: 1,
    };
    for (const p of screenState.players) {
      if (p.number >= counts[p.type]) {
        counts[p.type] = p.number + 1;
      }
    }
    return counts;
  })();

  // Keyboard shortcuts
  const cancelDraw = useCallback(() => {
    setActiveTool('select');
  }, []);

  useKeyboardShortcuts({
    setTool: setActiveTool,
    undo: history.undo,
    redo: history.redo,
    cancelDraw,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
  });

  // Autosave
  useAutosave(session);

  // Load from share URL or draft on mount
  useEffect(() => {
    const shared = parseShareURL();
    if (shared) {
      setSession(shared);
      return;
    }
    const draft = loadDraft();
    if (draft) setSession(draft);
  }, []);

  // Export handlers
  const handleExportPNG = useCallback(() => {
    if (svgRef.current) exportPNG(svgRef.current);
  }, []);

  const handleExportFSP = useCallback(() => {
    exportFSP(session);
  }, [session]);

  const handleShare = useCallback(() => {
    const url = generateShareURL(session);
    navigator.clipboard.writeText(url);
  }, [session]);

  const handleSave = useCallback(() => {
    updateMeta({ updated: new Date().toISOString() });
    saveSession(session);
  }, [session, updateMeta]);

  // Animation controls
  const handlePlay = useCallback(() => {
    if (anim.playing) {
      stop();
    } else {
      play();
    }
  }, [anim.playing, play, stop]);

  if (!currentScreen) return null;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-4 bg-[#0f172a] border-b border-white/10 px-4 py-2">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-bold text-white/90 whitespace-nowrap">
            Football Session Planner
          </h1>
          <input
            value={session.meta.title}
            onChange={(e) => updateMeta({ title: e.target.value })}
            className="bg-transparent text-sm text-white/70 border-b border-transparent hover:border-white/20 focus:border-white/40 outline-none px-1 py-0.5 w-48"
            placeholder="Session title..."
          />
        </div>

        <Toolbar
          activeTool={activeTool}
          setTool={setActiveTool}
          canUndo={history.canUndo}
          canRedo={history.canRedo}
          onUndo={history.undo}
          onRedo={history.redo}
          onExportPNG={handleExportPNG}
          isPlaying={anim.playing}
          onPlay={handlePlay}
          onStop={stop}
          hasArrows={screenState.arrows.length > 0}
        />

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Save session"
          >
            <Save size={16} />
            <span className="hidden sm:inline">Save</span>
          </button>
          <ExportMenu
            onExportPNG={handleExportPNG}
            onExportFSP={handleExportFSP}
            onShare={handleShare}
          />
        </div>
      </header>

      {/* Screen tabs */}
      <div className="bg-[#0f172a] border-b border-white/10">
        <ScreenTabs
          screens={session.screens}
          activeIndex={activeScreenIndex}
          onSelect={setActiveScreen}
          onAdd={addScreen}
          onRename={renameScreen}
          onRemove={removeScreen}
        />
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar>
          <PlayerPalette onAddPlayer={handleAddPlayer} nextNumbers={nextNumbers} />
          <PitchTypeSelector
            value={currentScreen.pitchType}
            onChange={(type) => setPitchType(activeScreenIndex, type)}
          />
          {activeTool === 'zone' && (
            <ZonePalette selectedColor={zoneColor} onSelectColor={setZoneColor} />
          )}
          {activeTool === 'cone' && (
            <ConePalette selectedColor={coneColor} onSelectColor={setConeColor} />
          )}
          {activeTool === 'draw' && (
            <DrawOptions
              color={drawColor}
              strokeWidth={drawStrokeWidth}
              onColorChange={setDrawColor}
              onStrokeWidthChange={setDrawStrokeWidth}
            />
          )}
        </AppSidebar>

        <CanvasContainer
          state={screenState}
          pitchType={currentScreen.pitchType}
          activeTool={activeTool}
          onStateChange={handleStateChange}
          onHistoryPush={handleHistoryPush}
          svgRef={svgRef}
          coneColor={coneColor}
          zoneColor={zoneColor}
          drawColor={drawColor}
          drawStrokeWidth={drawStrokeWidth}
          animState={anim}
        />
      </div>

      {/* Notes panel (floating) */}
      <NotesPanel
        notes={currentScreen.notes}
        onChange={(notes) => updateScreenNotes(activeScreenIndex, notes)}
        screenName={currentScreen.name}
      />
    </div>
  );
}
