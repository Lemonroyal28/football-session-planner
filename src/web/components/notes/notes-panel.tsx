'use client';

import { PanelRightOpen, PanelRightClose, StickyNote } from 'lucide-react';
import { useState } from 'react';
import type { ScreenNotes } from '../../../types/notes';
import { NotesField } from './notes-field';
import { NotesListField } from './notes-list-field';

interface NotesPanelProps {
  notes: ScreenNotes;
  onChange: (notes: ScreenNotes) => void;
  screenName: string;
}

export function NotesPanel({ notes, onChange, screenName }: NotesPanelProps) {
  const [open, setOpen] = useState(false);

  const update = (key: keyof ScreenNotes, value: string | string[]) =>
    onChange({ ...notes, [key]: value });

  const hasContent =
    notes.organisation || notes.objective || notes.instructions ||
    notes.progressions.length > 0 || notes.keyIdeas.length > 0;

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={`fixed right-4 top-16 z-30 flex items-center gap-1.5 px-3 py-2 rounded-md shadow-lg transition-colors text-sm font-medium ${
          open
            ? 'bg-[#3a7d44] text-white'
            : hasContent
              ? 'bg-[#1e293b] text-[#3a7d44] ring-1 ring-[#3a7d44]/40'
              : 'bg-[#1e293b] text-white/70 hover:text-white'
        }`}
        title={open ? 'Hide Notes' : 'Show Notes'}
      >
        {open ? <PanelRightClose size={16} /> : <StickyNote size={16} />}
        <span className="hidden sm:inline">Notes</span>
      </button>

      {open && (
        <aside className="fixed right-0 top-0 bottom-0 w-80 bg-[#0f172a] border-l border-white/10 z-20 overflow-y-auto p-4 space-y-4 pt-14">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/80">
              Coaching Notes
            </h2>
            <span className="text-xs text-white/40 truncate max-w-[120px]">{screenName}</span>
          </div>

          <NotesField
            label="Organisation"
            value={notes.organisation}
            onChange={(v) => update('organisation', v)}
          />
          <NotesField
            label="Objective"
            value={notes.objective}
            onChange={(v) => update('objective', v)}
          />
          <NotesField
            label="Instructions"
            value={notes.instructions}
            onChange={(v) => update('instructions', v)}
            rows={4}
          />
          <NotesListField
            label="Progressions"
            items={notes.progressions}
            onChange={(v) => update('progressions', v)}
          />
          <NotesListField
            label="Key Ideas"
            items={notes.keyIdeas}
            onChange={(v) => update('keyIdeas', v)}
          />
          <NotesListField
            label="Defending Points"
            items={notes.defendingPoints}
            onChange={(v) => update('defendingPoints', v)}
          />
          <NotesListField
            label="Attacking Points"
            items={notes.attackingPoints}
            onChange={(v) => update('attackingPoints', v)}
          />
          <NotesField
            label="Scoring"
            value={notes.scoring}
            onChange={(v) => update('scoring', v)}
            rows={2}
          />
        </aside>
      )}
    </>
  );
}
