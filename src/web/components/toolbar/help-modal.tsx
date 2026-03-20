'use client';

import React from 'react';
import { X, Zap, Keyboard, Mouse } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-[#1e293b] rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Tactical Board Guide</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close help"
          >
            <X size={20} className="text-white/70" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-white/90">
          {/* Keyboard Shortcuts */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Keyboard size={18} className="text-emerald-400" />
              <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <ShortcutRow shortcut="S" action="Select tool" />
              <ShortcutRow shortcut="P" action="Pass arrow" />
              <ShortcutRow shortcut="R" action="Run arrow" />
              <ShortcutRow shortcut="D" action="Dribble arrow" />
              <ShortcutRow shortcut="M" action="Movement arrow" />
              <ShortcutRow shortcut="E" action="Pressing arrow" />
              <ShortcutRow shortcut="O" action="Overlap arrow" />
              <ShortcutRow shortcut="L" action="Toggle concurrent mode" highlight />
              <ShortcutRow shortcut="Z" action="Zone tool" />
              <ShortcutRow shortcut="C" action="Cone tool" />
              <ShortcutRow shortcut="X" action="Draw/Scribble tool" />
              <ShortcutRow shortcut="Del" action="Delete tool" />
              <ShortcutRow shortcut="Esc" action="Cancel / Select" />
              <ShortcutRow shortcut="Cmd+Z" action="Undo" />
              <ShortcutRow shortcut="Cmd+Shift+Z" action="Redo" />
            </div>
          </section>

          {/* Concurrent Actions */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Zap size={18} className="text-blue-400" />
              <h3 className="text-lg font-semibold">Concurrent Actions</h3>
            </div>
            <div className="space-y-3 text-sm">
              <p className="text-white/70">
                Draw multiple arrows that execute simultaneously during animation playback.
              </p>

              <div className="bg-[#0f172a] rounded-lg p-4 space-y-2">
                <p className="font-semibold text-emerald-400">Example: Pass + Run to Space</p>
                <ol className="list-decimal list-inside space-y-1 text-white/70 ml-2">
                  <li>Press <kbd className="kbd">P</kbd> to select Pass tool</li>
                  <li>Draw arrow from player to open space (ball travels)</li>
                  <li>Press <kbd className="kbd">R</kbd> to select Run tool</li>
                  <li>Press <kbd className="kbd">L</kbd> to enable concurrent mode (⚡ appears)</li>
                  <li>Draw arrow showing player running to same spot</li>
                  <li>Both arrows show ⚡ badge - they'll animate together!</li>
                  <li>Press Play to see player and ball arrive simultaneously</li>
                </ol>
              </div>

              <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 rounded p-3">
                <Zap size={16} className="text-blue-400 mt-0.5 shrink-0" />
                <div className="text-xs text-white/70">
                  <strong className="text-white">Tip:</strong> The ⚡ badge appears on arrows that will execute concurrently.
                  Toggle concurrent mode ON to group actions, OFF to sequence them.
                </div>
              </div>
            </div>
          </section>

          {/* Arrow Types */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Mouse size={18} className="text-orange-400" />
              <h3 className="text-lg font-semibold">Arrow Types</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <ArrowType name="Pass" style="Solid white" description="Ball travels along path" />
              <ArrowType name="Run" style="Dashed yellow" description="Player runs without ball" />
              <ArrowType name="Dribble" style="Curved orange" description="Player dribbles ball" />
              <ArrowType name="Movement" style="Dotted blue" description="General player movement" />
              <ArrowType name="Pressing" style="Thick red" description="Defensive pressure" />
              <ArrowType name="Overlap" style="Zigzag green" description="Overlapping run" />
            </div>
          </section>

          {/* Quick Tips */}
          <section>
            <h3 className="text-lg font-semibold mb-3">Quick Tips</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 shrink-0">•</span>
                <span>Click and drag to draw arrows, zones, or scribbles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 shrink-0">•</span>
                <span>Arrows auto-detect nearest player at start point</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 shrink-0">•</span>
                <span>Ball ownership transfers automatically on pass arrows</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 shrink-0">•</span>
                <span>Press Play to animate your tactical sequences</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 shrink-0">•</span>
                <span>Export your diagrams as PNG or share via URL</span>
              </li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

function ShortcutRow({ shortcut, action, highlight }: { shortcut: string; action: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-2 px-2 py-1 rounded ${highlight ? 'bg-blue-500/10' : ''}`}>
      <kbd className="kbd">{shortcut}</kbd>
      <span className="text-white/70 text-right flex-1">{action}</span>
    </div>
  );
}

function ArrowType({ name, style, description }: { name: string; style: string; description: string }) {
  return (
    <div className="bg-[#0f172a] rounded p-3">
      <div className="font-semibold text-white mb-1">{name}</div>
      <div className="text-xs text-white/50 mb-1">{style}</div>
      <div className="text-xs text-white/70">{description}</div>
    </div>
  );
}
