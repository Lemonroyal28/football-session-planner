import Link from 'next/link';
import { Clock, Calendar } from 'lucide-react';

interface SessionCardProps {
  session: {
    id: string;
    title: string;
    session_date: string | null;
    duration_minutes: number;
    status: string;
    tags: string[];
    category: string;
    age_group: string | null;
  };
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-white/10 text-white/50',
  planned: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-emerald-500/20 text-emerald-400',
};

export function SessionCard({ session }: SessionCardProps) {
  return (
    <Link
      href={`/sessions/${session.id}`}
      className="block rounded-lg bg-white/5 border border-white/10 p-4 hover:bg-white/[0.07] hover:border-white/20 transition-colors"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-sm font-medium text-white truncate">{session.title}</h3>
        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[session.status] || STATUS_STYLES.draft}`}>
          {session.status}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-white/40">
        {session.session_date && (
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {session.session_date}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {session.duration_minutes}min
        </span>
      </div>

      {session.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {session.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs bg-white/5 text-white/40 px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
