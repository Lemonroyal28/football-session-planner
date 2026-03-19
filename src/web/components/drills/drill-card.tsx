import Link from 'next/link';
import { Clock, Star, Tag } from 'lucide-react';

interface DrillCardProps {
  drill: {
    id: string;
    title: string;
    category: string;
    age_groups: string[];
    tags: string[];
    duration_minutes: number;
    is_favorite: boolean;
    equipment: string[];
  };
}

export function DrillCard({ drill }: DrillCardProps) {
  return (
    <Link
      href={`/drills/${drill.id}`}
      className="block rounded-lg bg-white/5 border border-white/10 p-4 hover:bg-white/[0.07] hover:border-white/20 transition-colors"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-medium text-white truncate">{drill.title}</h3>
        {drill.is_favorite && <Star size={14} className="text-yellow-400 fill-yellow-400 shrink-0" />}
      </div>

      {drill.category && (
        <span className="inline-block text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded mb-2">
          {drill.category}
        </span>
      )}

      <div className="flex items-center gap-3 text-xs text-white/40 mt-2">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {drill.duration_minutes}min
        </span>
        {drill.age_groups.length > 0 && (
          <span>{drill.age_groups.slice(0, 2).join(', ')}</span>
        )}
      </div>

      {drill.equipment.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {drill.equipment.slice(0, 3).map((eq) => (
            <span key={eq} className="text-xs bg-white/5 text-white/40 px-1.5 py-0.5 rounded">
              {eq}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
