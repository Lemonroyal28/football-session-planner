'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface ScreenTabProps {
  name: string;
  active: boolean;
  canClose: boolean;
  onClick: () => void;
  onRename: (name: string) => void;
  onClose: () => void;
}

export function ScreenTab({ name, active, canClose, onClick, onRename, onClose }: ScreenTabProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commitRename = () => {
    const trimmed = editValue.trim();
    if (trimmed) onRename(trimmed);
    else setEditValue(name);
    setEditing(false);
  };

  return (
    <div
      onClick={onClick}
      onDoubleClick={() => {
        setEditing(true);
        setEditValue(name);
      }}
      className={`
        group flex items-center gap-1 px-3 py-1.5 rounded-t-md text-sm cursor-pointer transition-colors
        ${active ? 'bg-[#3a7d44] text-white' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80'}
      `}
    >
      {editing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitRename();
            if (e.key === 'Escape') {
              setEditValue(name);
              setEditing(false);
            }
          }}
          className="bg-transparent border-b border-white/40 outline-none text-sm w-20"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="truncate max-w-[100px]">{name}</span>
      )}
      {canClose && !editing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 hover:text-red-400"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
