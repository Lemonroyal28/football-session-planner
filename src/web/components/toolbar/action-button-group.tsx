'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import type { ActionType, LineStyle } from '../../../types/tactical-sequence';

interface ActionVariant {
  lineStyle: LineStyle;
  icon: string;
  label: string;
}

interface ActionButtonGroupProps {
  actionType: ActionType;
  icon: React.ReactNode;
  label: string;
  color: string;
  active: boolean;
  currentLineStyle: LineStyle;
  onSelect: (actionType: ActionType, lineStyle: LineStyle) => void;
}

const LINE_STYLE_VARIANTS: ActionVariant[] = [
  { lineStyle: 'straight', icon: '─', label: 'Straight' },
  { lineStyle: 'curved', icon: '⌒', label: 'Curved' },
  { lineStyle: 'free_draw', icon: '∿', label: 'Free Draw' },
];

export function ActionButtonGroup({
  actionType,
  icon,
  label,
  color,
  active,
  currentLineStyle,
  onSelect,
}: ActionButtonGroupProps) {
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!expanded) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expanded]);

  const handleMainClick = () => {
    // If already active, toggle dropdown. Otherwise, select with current line style
    if (active) {
      setExpanded(!expanded);
    } else {
      onSelect(actionType, currentLineStyle);
    }
  };

  const handleVariantClick = (lineStyle: LineStyle) => {
    onSelect(actionType, lineStyle);
    setExpanded(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Main button */}
      <button
        onClick={handleMainClick}
        className={`
          group relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
          transition-all duration-200
          ${
            active
              ? 'bg-white/20 text-white shadow-lg ring-2 ring-white/30'
              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white/90'
          }
        `}
        title={`${label} (click to expand variants)`}
      >
        <span className={`${active ? color : 'text-white/70'}`}>{icon}</span>
        <span className="hidden sm:inline">{label}</span>
        <ChevronDown
          size={14}
          className={`
            transition-transform duration-200
            ${expanded ? 'rotate-180' : ''}
            ${active ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'}
          `}
        />
      </button>

      {/* Dropdown variants */}
      {expanded && (
        <div className="absolute top-full left-0 mt-1 bg-[#1e293b] border border-white/20 rounded-lg shadow-2xl z-50 min-w-[160px] overflow-hidden">
          <div className="p-1">
            {LINE_STYLE_VARIANTS.map((variant) => (
              <button
                key={variant.lineStyle}
                onClick={() => handleVariantClick(variant.lineStyle)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded text-sm
                  transition-colors
                  ${
                    active && currentLineStyle === variant.lineStyle
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <span className="text-lg font-mono w-6 text-center">{variant.icon}</span>
                <span className="flex-1 text-left">{variant.label}</span>
                {active && currentLineStyle === variant.lineStyle && (
                  <span className="text-emerald-400">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
