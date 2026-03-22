'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import type { ActiveTool } from '../../../types/tools';
import type { ScreenState, CanvasPlayer, ConeColor } from '../../../types/canvas';
import type { Session } from '../../../types/session';
import type { ActionType } from '../../../types/tactical-sequence';
import { useSessionStore } from '../../store/session-store';
import { useHistory } from '../../hooks/use-history';
import { useKeyboardShortcuts } from '../../hooks/use-keyboard-shortcuts';
import { useAutosave } from '../../hooks/use-autosave';
import { useAnimation } from '../../hooks/use-animation';
import { CanvasContainer } from '../canvas/canvas-container';
import { Toolbar } from '../toolbar/toolbar';
import { AppSidebar } from '../layout/app-sidebar';
import { PlayerPalette } from '../sidebar/player-palette';
import { PitchTypeSelector } from '../sidebar/pitch-type-selector';
import { ConePalette } from '../sidebar/cone-palette';
import { DrawOptions } from '../sidebar/draw-options';
import { ZonePalette } from '../sidebar/zone-palette';
import { FormationSelector, type PlanningMode } from '../sidebar/formation-selector';
import { SequenceBuilderPanel } from '../sidebar/sequence-builder-panel';
import { ActionInspector } from '../sidebar/action-inspector';
import { ScreenTabs } from '../session/screen-tabs';
import { NotesPanel } from '../notes/notes-panel';
import { ExportMenu } from '../export/export-menu';
import { exportPNG, exportFSP, generateShareURL, parseShareURL } from '../../lib/export';
import { exportSessionPDF } from '../../lib/export-pdf';
import { saveSession, loadDraft } from '../../lib/storage';
import { createTacticalSequence, addActionToSequence, getCurrentBallHolder } from '../../lib/sequence-helpers';
import { sequenceToArrows } from '../../lib/sequence-to-arrows';
import { Save } from 'lucide-react';

interface TacticalBoardEditorProps {
  /** If provided, initializes the editor with this session data */
  initialSession?: Session;
  /** Called when the session is saved */
  onSave?: (session: Session) => void;
  /** If true, hides the top header bar (for embedding in session builder) */
  embedded?: boolean;
}

export function TacticalBoardEditor({ initialSession, onSave, embedded }: TacticalBoardEditorProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeTool, setActiveTool] = useState<ActiveTool>('select');
  const [coneColor, setConeColor] = useState<ConeColor>('#ff6b00');
  const [zoneColor, setZoneColor] = useState('#facc15');
  const [drawColor, setDrawColor] = useState('#ffffff');
  const [drawStrokeWidth, setDrawStrokeWidth] = useState(2);
  const [planningMode, setPlanningMode] = useState<PlanningMode>('match');
  const [concurrentMode, setConcurrentMode] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Sequence builder state
  const [sequenceBuilderActive, setSequenceBuilderActive] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);

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

  const history = useHistory(screenState);
  const { anim, play, stop } = useAnimation(screenState);

  const prevScreenRef = useRef(activeScreenIndex);
  useEffect(() => {
    if (prevScreenRef.current !== activeScreenIndex) {
      prevScreenRef.current = activeScreenIndex;
      history.reset(session.screens[activeScreenIndex].state);
    }
  }, [activeScreenIndex, session.screens, history]);

  useEffect(() => {
    if (history.current && history.current !== screenState) {
      updateScreenState(activeScreenIndex, history.current);
    }
  }, [history.current]);

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

  const handleAddPlayer = useCallback(
    (player: CanvasPlayer) => {
      const next = { ...screenState, players: [...screenState.players, player] };
      updateScreenState(activeScreenIndex, next);
      history.push(next);
    },
    [screenState, activeScreenIndex, updateScreenState, history]
  );

  const handleApplyFormation = useCallback(
    (formationPlayers: CanvasPlayer[]) => {
      const isTeamB = formationPlayers.some(
        (p) => p.type === 'team-b' || p.type === 'gk-b'
      );
      const keepTypes = isTeamB
        ? ['team-a', 'gk-a', 'referee', 'mannequin']
        : ['team-b', 'gk-b', 'referee', 'mannequin'];
      const kept = screenState.players.filter((p) =>
        keepTypes.includes(p.type)
      );
      const next = { ...screenState, players: [...kept, ...formationPlayers] };
      updateScreenState(activeScreenIndex, next);
      history.push(next);
    },
    [screenState, activeScreenIndex, updateScreenState, history]
  );

  const handleClearTeam = useCallback(
    (team: 'team-a' | 'team-b') => {
      const removeTypes: string[] =
        team === 'team-a' ? ['team-a', 'gk-a'] : ['team-b', 'gk-b'];
      const next = {
        ...screenState,
        players: screenState.players.filter(
          (p) => !removeTypes.includes(p.type)
        ),
      };
      updateScreenState(activeScreenIndex, next);
      history.push(next);
    },
    [screenState, activeScreenIndex, updateScreenState, history]
  );

  const nextNumbers = (() => {
    const counts: Record<string, number> = {
      'team-a': 1, 'team-b': 1, 'gk-a': 1, 'gk-b': 1, referee: 1, mannequin: 1,
    };
    for (const p of screenState.players) {
      if (p.number >= counts[p.type]) {
        counts[p.type] = p.number + 1;
      }
    }
    return counts as Record<import('../../../types/pitch').PlayerType, number>;
  })();

  const cancelDraw = useCallback(() => {
    setActiveTool('select');
  }, []);

  const handleToggleConcurrent = useCallback(() => {
    setConcurrentMode((prev) => !prev);
  }, []);

  const handleOpenHelp = useCallback(() => {
    setShowHelp(true);
  }, []);

  useKeyboardShortcuts({
    setTool: setActiveTool,
    undo: history.undo,
    redo: history.redo,
    cancelDraw,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    toggleConcurrent: handleToggleConcurrent,
    openHelp: handleOpenHelp,
  });

  useAutosave(session);

  // Load initial session or draft on mount
  useEffect(() => {
    if (initialSession) {
      setSession(initialSession);
      return;
    }
    // Only load from URL/draft in standalone mode
    if (!embedded) {
      const shared = parseShareURL();
      if (shared) {
        setSession(shared);
        return;
      }
      const draft = loadDraft();
      if (draft) setSession(draft);
    }
  }, []);

  const handleExportPNG = useCallback(() => {
    if (svgRef.current) exportPNG(svgRef.current);
  }, []);

  const handleExportFSP = useCallback(() => {
    exportFSP(session);
  }, [session]);

  const handleExportPDF = useCallback(async () => {
    if (!svgRef.current) return;

    // For multi-screen sessions, we only export the current screen's SVG
    // In the future, we could render all screens
    const svgElements = [svgRef.current];

    try {
      await exportSessionPDF(session, svgElements);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    }
  }, [session]);

  const handleShare = useCallback(() => {
    const url = generateShareURL(session);
    navigator.clipboard.writeText(url);
  }, [session]);

  const handleSave = useCallback(() => {
    updateMeta({ updated: new Date().toISOString() });
    if (onSave) {
      onSave(session);
    } else {
      saveSession(session);
    }
  }, [session, updateMeta, onSave]);

  const handlePlay = useCallback(() => {
    if (anim.playing) {
      stop();
    } else {
      play();
    }
  }, [anim.playing, play, stop]);

  // Sequence builder handlers
  const activeSequence = screenState.activeSequenceId
    ? screenState.sequences.find((s) => s.sequence_id === screenState.activeSequenceId) || null
    : null;

  const selectedPlayer = selectedPlayerId
    ? screenState.players.find((p) => p.id === selectedPlayerId) || null
    : null;

  const ballHolderId = activeSequence
    ? getCurrentBallHolder(activeSequence)
    : screenState.ball.ownerId;

  const ballHolder = ballHolderId
    ? screenState.players.find((p) => p.id === ballHolderId) || null
    : null;

  const handleToggleSequenceBuilder = useCallback(() => {
    setSequenceBuilderActive((prev) => !prev);
    if (!sequenceBuilderActive) {
      // When activating, clear selection
      setSelectedPlayerId(null);
    } else {
      // When deactivating, finish active sequence
      if (screenState.activeSequenceId) {
        const next = { ...screenState, activeSequenceId: null };
        updateScreenState(activeScreenIndex, next);
        history.push(next);
      }
    }
  }, [sequenceBuilderActive, screenState, activeScreenIndex, updateScreenState, history]);

  const handlePlayerClick = useCallback(
    (playerId: string) => {
      if (!sequenceBuilderActive) return;
      setSelectedPlayerId(playerId);
    },
    [sequenceBuilderActive]
  );

  const handleCreateSequence = useCallback(
    (startingPlayerId: string, ballHolderId: string) => {
      const newSequence = createTacticalSequence(startingPlayerId, ballHolderId);
      const next = {
        ...screenState,
        sequences: [...screenState.sequences, newSequence],
        activeSequenceId: newSequence.sequence_id,
      };
      updateScreenState(activeScreenIndex, next);
      history.push(next);
    },
    [screenState, activeScreenIndex, updateScreenState, history]
  );

  const handleAddAction = useCallback(
    (actionType: ActionType, toPlayerId?: string) => {
      if (!activeSequence) return;

      const fromPlayerId = selectedPlayerId || getCurrentBallHolder(activeSequence);
      if (!fromPlayerId) {
        alert('No player selected to perform this action');
        return;
      }

      const updatedSequence = addActionToSequence(
        activeSequence,
        actionType,
        fromPlayerId,
        toPlayerId
      );

      const next = {
        ...screenState,
        sequences: screenState.sequences.map((s) =>
          s.sequence_id === updatedSequence.sequence_id ? updatedSequence : s
        ),
      };
      updateScreenState(activeScreenIndex, next);
      history.push(next);

      // Clear selection after adding pass
      if (actionType === 'pass') {
        setSelectedPlayerId(null);
      }
    },
    [activeSequence, selectedPlayerId, screenState, activeScreenIndex, updateScreenState, history]
  );

  const handleDeleteSequence = useCallback(
    (sequenceId: string) => {
      const next = {
        ...screenState,
        sequences: screenState.sequences.filter((s) => s.sequence_id !== sequenceId),
        activeSequenceId: screenState.activeSequenceId === sequenceId ? null : screenState.activeSequenceId,
      };
      updateScreenState(activeScreenIndex, next);
      history.push(next);
    },
    [screenState, activeScreenIndex, updateScreenState, history]
  );

  const handleSelectSequence = useCallback(
    (sequenceId: string | null) => {
      const next = {
        ...screenState,
        activeSequenceId: sequenceId,
      };
      updateScreenState(activeScreenIndex, next);
      history.push(next);
      setSelectedPlayerId(null);
    },
    [screenState, activeScreenIndex, updateScreenState, history]
  );

  const handlePlaySequence = useCallback(
    (sequenceId: string) => {
      // Find the sequence
      const sequence = screenState.sequences.find((s) => s.sequence_id === sequenceId);
      if (!sequence || sequence.actions.length === 0) return;

      // Convert sequence to arrows
      const sequenceArrows = sequenceToArrows(sequence, screenState.players);

      // Store original state
      const originalArrows = screenState.arrows;
      const originalActiveId = screenState.activeSequenceId;

      // Temporarily add sequence arrows to state for animation
      const next = {
        ...screenState,
        arrows: [...originalArrows, ...sequenceArrows],
        activeSequenceId: sequenceId,
      };
      updateScreenState(activeScreenIndex, next);

      // Wait a frame for state update, then play animation
      setTimeout(() => {
        play();

        // After animation completes, restore original state
        const duration = 1200 * sequenceArrows.length; // STEP_DURATION_MS * arrow count
        setTimeout(() => {
          const restored = {
            ...screenState,
            arrows: originalArrows,
            activeSequenceId: originalActiveId,
          };
          updateScreenState(activeScreenIndex, restored);
          stop();
        }, duration + 100);
      }, 16);
    },
    [screenState, activeScreenIndex, updateScreenState, play, stop]
  );

  const handleUpdateSequenceTitle = useCallback(
    (sequenceId: string, title: string) => {
      const next = {
        ...screenState,
        sequences: screenState.sequences.map((s) =>
          s.sequence_id === sequenceId ? { ...s, title, updated_at: new Date().toISOString() } : s
        ),
      };
      updateScreenState(activeScreenIndex, next);
      history.push(next);
    },
    [screenState, activeScreenIndex, updateScreenState, history]
  );

  const handleUpdateAction = useCallback(
    (actionId: string, updates: Partial<import('../../../types/tactical-sequence').TacticalAction>) => {
      const next = {
        ...screenState,
        sequences: screenState.sequences.map((seq) => ({
          ...seq,
          actions: seq.actions.map((action) =>
            action.action_id === actionId
              ? { ...action, ...updates }
              : action
          ),
          updated_at: new Date().toISOString(),
        })),
      };
      updateScreenState(activeScreenIndex, next);
      history.push(next);
    },
    [screenState, activeScreenIndex, updateScreenState, history]
  );

  const handleDeleteAction = useCallback(
    (actionId: string) => {
      const next = {
        ...screenState,
        sequences: screenState.sequences.map((seq) => ({
          ...seq,
          actions: seq.actions.filter((action) => action.action_id !== actionId),
          updated_at: new Date().toISOString(),
        })),
      };
      updateScreenState(activeScreenIndex, next);
      history.push(next);
    },
    [screenState, activeScreenIndex, updateScreenState, history]
  );

  const handleArrowClick = useCallback(
    (arrowId: string) => {
      // Check if this arrow belongs to the active sequence
      if (activeSequence) {
        const action = activeSequence.actions.find((a) => a.action_id === arrowId);
        if (action) {
          setSelectedActionId(arrowId);
        }
      }
    },
    [activeSequence]
  );

  const selectedAction = selectedActionId && activeSequence
    ? activeSequence.actions.find((a) => a.action_id === selectedActionId) || null
    : null;

  if (!currentScreen) return null;

  return (
    <div className={`flex ${embedded ? 'h-full' : 'h-screen'} flex-col overflow-hidden`}>
      {/* Top bar */}
      {!embedded && (
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 lg:gap-4 bg-[#0f172a] border-b border-white/10 px-2 sm:px-4 py-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <h1 className="text-sm font-bold text-white/90 whitespace-nowrap">
              Tactical Board
            </h1>
            <input
              value={session.meta.title}
              onChange={(e) => updateMeta({ title: e.target.value })}
              className="bg-transparent text-sm text-white/70 border-b border-transparent hover:border-white/20 focus:border-white/40 outline-none px-1 py-0.5 flex-1 min-w-0 max-w-[200px] sm:max-w-[300px]"
              placeholder="Session title..."
            />
          </div>

          <div className="flex-1 overflow-hidden">
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
            concurrentMode={concurrentMode}
            onToggleConcurrent={handleToggleConcurrent}
          />
          </div>

          <div className="flex items-center gap-2 shrink-0">
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
              onExportPDF={handleExportPDF}
              onShare={handleShare}
            />
          </div>
        </header>
      )}

      {/* Embedded toolbar */}
      {embedded && (
        <div className="bg-[#1a1a2e] border-b border-white/10 px-3 py-1.5 overflow-x-auto">
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
            concurrentMode={concurrentMode}
            onToggleConcurrent={handleToggleConcurrent}
          />
        </div>
      )}

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
        <aside className="w-56 shrink-0 bg-[#0f172a] border-r border-white/10 p-4 space-y-6 overflow-y-auto">
          <SequenceBuilderPanel
            active={sequenceBuilderActive}
            onToggle={handleToggleSequenceBuilder}
            activeSequence={activeSequence}
            sequences={screenState.sequences}
            players={screenState.players}
            selectedPlayer={selectedPlayer}
            ballHolder={ballHolder}
            onCreateSequence={handleCreateSequence}
            onAddAction={handleAddAction}
            onDeleteSequence={handleDeleteSequence}
            onSelectSequence={handleSelectSequence}
            onPlaySequence={handlePlaySequence}
            onUpdateSequenceTitle={handleUpdateSequenceTitle}
          />
          <PlayerPalette onAddPlayer={handleAddPlayer} nextNumbers={nextNumbers} />
          <FormationSelector
            onApplyFormation={handleApplyFormation}
            onClearTeam={handleClearTeam}
            planningMode={planningMode}
            onPlanningModeChange={setPlanningMode}
          />
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
        </aside>

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
          concurrentMode={concurrentMode}
          sequenceBuilderActive={sequenceBuilderActive}
          onPlayerClick={handlePlayerClick}
          selectedPlayerId={selectedPlayerId}
          onArrowClickProp={handleArrowClick}
        />
      </div>

      {/* Notes panel (floating) */}
      {!embedded && (
        <NotesPanel
          notes={currentScreen.notes}
          onChange={(notes) => updateScreenNotes(activeScreenIndex, notes)}
          screenName={currentScreen.name}
        />
      )}

      {/* Action Inspector Modal */}
      {selectedAction && (
        <ActionInspector
          action={selectedAction}
          players={screenState.players}
          onClose={() => setSelectedActionId(null)}
          onUpdate={handleUpdateAction}
          onDelete={handleDeleteAction}
        />
      )}
    </div>
  );
}
