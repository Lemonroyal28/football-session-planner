'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { getSessionList, deleteSession } from '../../lib/storage';

interface SessionListEntry {
  id: string;
  title: string;
  updated: string;
  tags: string[];
}

interface SessionListProps {
  onSelect: (id: string) => void;
  onNew: () => void;
}

export function SessionList({ onSelect, onNew }: SessionListProps) {
  const [sessions, setSessions] = useState<SessionListEntry[]>([]);

  useEffect(() => {
    setSessions(getSessionList());
  }, []);

  const handleDelete = (id: string) => {
    deleteSession(id);
    setSessions(getSessionList());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Sessions</h2>
        <button
          onClick={onNew}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#3a7d44] text-white text-sm hover:bg-[#3a7d44]/80 transition-colors"
        >
          <Plus size={14} /> New
        </button>
      </div>
      {sessions.length === 0 ? (
        <p className="text-sm text-white/40">No saved sessions yet.</p>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => onSelect(s.id)}
              className="flex items-center justify-between p-3 rounded-md bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-white/80">{s.title}</p>
                <p className="text-xs text-white/40">
                  {new Date(s.updated).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(s.id);
                }}
                className="text-white/30 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
