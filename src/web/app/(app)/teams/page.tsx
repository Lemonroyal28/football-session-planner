import { createClient } from '../../../lib/supabase/server';
import Link from 'next/link';
import { Plus, Users } from 'lucide-react';
import { TeamCard } from '../../../components/teams/team-card';

export default async function TeamsPage() {
  const supabase = await createClient();

  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, age_group, level, season, colors, created_at')
    .order('name');

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Teams</h1>
        <Link
          href="/teams/new"
          className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
        >
          <Plus size={16} />
          New Team
        </Link>
      </div>

      {teams && teams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Users size={40} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No teams yet</p>
          <Link
            href="/teams/new"
            className="mt-4 inline-flex items-center gap-2 text-emerald-400 text-sm hover:text-emerald-300"
          >
            <Plus size={16} />
            Create your first team
          </Link>
        </div>
      )}
    </div>
  );
}
