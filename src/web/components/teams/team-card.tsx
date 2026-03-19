import Link from 'next/link';
import { Users } from 'lucide-react';

interface TeamCardProps {
  team: {
    id: string;
    name: string;
    age_group: string | null;
    level: string | null;
    season: string | null;
    colors: { primary?: string; secondary?: string } | null;
  };
}

export function TeamCard({ team }: TeamCardProps) {
  const primary = team.colors?.primary || '#1a73e8';
  const secondary = team.colors?.secondary || '#e53935';

  return (
    <Link
      href={`/teams/${team.id}`}
      className="block rounded-lg bg-white/5 border border-white/10 p-4 hover:bg-white/[0.07] hover:border-white/20 transition-colors"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded-full" style={{ background: primary }} />
          <div className="w-4 h-4 rounded-full" style={{ background: secondary }} />
        </div>
        <h3 className="text-sm font-medium text-white">{team.name}</h3>
      </div>
      <div className="flex items-center gap-3 text-xs text-white/40">
        {team.age_group && <span>{team.age_group}</span>}
        {team.level && <span>{team.level}</span>}
        {team.season && <span>{team.season}</span>}
      </div>
    </Link>
  );
}
