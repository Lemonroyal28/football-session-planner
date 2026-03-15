'use client';

import React from 'react';

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  shortcut?: string;
}

export function ToolButton({ icon, label, active, disabled, onClick, shortcut }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={shortcut ? `${label} (${shortcut})` : label}
      className={`
        inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium
        transition-colors
        ${active ? 'bg-white/20 text-white ring-1 ring-white/30' : 'text-white/70 hover:text-white hover:bg-white/10'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
