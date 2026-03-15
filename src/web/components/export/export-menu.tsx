'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, FileJson, Share2, ChevronDown } from 'lucide-react';

interface ExportMenuProps {
  onExportPNG: () => void;
  onExportFSP: () => void;
  onShare: () => void;
}

export function ExportMenu({ onExportPNG, onExportFSP, onShare }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
      >
        <Download size={16} />
        Export
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-[#1e293b] border border-white/10 rounded-md shadow-xl z-50 min-w-[160px]">
          <button
            onClick={() => { onExportPNG(); setOpen(false); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
          >
            <Download size={14} /> PNG Image
          </button>
          <button
            onClick={() => { onExportFSP(); setOpen(false); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
          >
            <FileJson size={14} /> FSP File
          </button>
          <button
            onClick={() => { onShare(); setOpen(false); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
          >
            <Share2 size={14} /> Share Link
          </button>
        </div>
      )}
    </div>
  );
}
