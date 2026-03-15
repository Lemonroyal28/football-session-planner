'use client';

import React from 'react';

interface AppSidebarProps {
  children: React.ReactNode;
}

export function AppSidebar({ children }: AppSidebarProps) {
  return (
    <aside className="w-56 shrink-0 bg-[#0f172a] border-r border-white/10 p-4 space-y-6 overflow-y-auto">
      {children}
    </aside>
  );
}
