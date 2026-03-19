'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '../../../../lib/supabase/client';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Player {
  id: string;
  name: string;
  number: number | null;
  preferred_positions: string[];
  active: boolean;
}

interface Team {
  id: string;
  name: string;
  age_group: string | null;
  level: string | null;
  season: string | null;
  colors: { primary?: string; secondary?: string } | null;
}

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  // Add player form
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newPosition, setNewPosition] = useState('');

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const id = params.id as string;

    const { data: teamData } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single();

    if (teamData) setTeam(teamData);

    const { data: playerData } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', id)
      .order('number', { ascending: true, nullsFirst: false });

    if (playerData) setPlayers(playerData);
    setLoading(false);
  }, [params.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAddPlayer = async () => {
    if (!newName.trim() || !team) return;
    const supabase = createClient();

    await supabase.from('players').insert({
      team_id: team.id,
      name: newName.trim(),
      number: newNumber ? Number(newNumber) : null,
      preferred_positions: newPosition ? [newPosition] : [],
    });

    setNewName('');
    setNewNumber('');
    setNewPosition('');
    setShowAddPlayer(false);
    loadData();
  };

  const handleDeletePlayer = async (playerId: string) => {
    const supabase = createClient();
    await supabase.from('players').delete().eq('id', playerId);
    loadData();
  };

  const handleToggleActive = async (player: Player) => {
    const supabase = createClient();
    await supabase.from('players').update({ active: !player.active }).eq('id', player.id);
    loadData();
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center"><p className="text-white/40 text-sm">Loading...</p></div>;
  }

  if (!team) {
    return <div className="flex h-full items-center justify-center"><p className="text-white/40 text-sm">Team not found</p></div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/teams" className="text-white/40 hover:text-white/70 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded-full" style={{ background: team.colors?.primary || '#1a73e8' }} />
            <div className="w-4 h-4 rounded-full" style={{ background: team.colors?.secondary || '#e53935' }} />
          </div>
          <h1 className="text-xl font-bold text-white">{team.name}</h1>
        </div>
      </div>

      <div className="flex gap-4 text-sm text-white/50">
        {team.age_group && <span>{team.age_group}</span>}
        {team.level && <span>{team.level}</span>}
        {team.season && <span>{team.season}</span>}
      </div>

      {/* Players table */}
      <div className="rounded-lg bg-white/5 border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white/70">Players ({players.length})</h2>
          <button
            onClick={() => setShowAddPlayer(!showAddPlayer)}
            className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
          >
            <Plus size={14} /> Add Player
          </button>
        </div>

        {/* Add player form */}
        {showAddPlayer && (
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
            <input
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              type="number"
              placeholder="#"
              className="w-14 rounded-md bg-white/5 border border-white/10 px-2 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Player name"
              className="flex-1 rounded-md bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
            />
            <input
              value={newPosition}
              onChange={(e) => setNewPosition(e.target.value)}
              placeholder="Position"
              className="w-24 rounded-md bg-white/5 border border-white/10 px-2 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <button
              onClick={handleAddPlayer}
              className="px-3 py-1.5 rounded-md bg-emerald-600 text-sm text-white hover:bg-emerald-500 transition-colors"
            >
              Add
            </button>
          </div>
        )}

        {players.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-white/40 border-b border-white/10">
                <th className="px-4 py-2 w-14">#</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Position</th>
                <th className="px-4 py-2 w-20">Status</th>
                <th className="px-4 py-2 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-2 text-sm text-white/50">{player.number ?? '-'}</td>
                  <td className="px-4 py-2 text-sm text-white/80">{player.name}</td>
                  <td className="px-4 py-2 text-sm text-white/50">
                    {player.preferred_positions.join(', ') || '-'}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleToggleActive(player)}
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        player.active
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-white/10 text-white/40'
                      }`}
                    >
                      {player.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleDeletePlayer(player.id)}
                      className="text-white/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-4 py-8 text-center text-sm text-white/30">
            No players yet. Add your first player above.
          </div>
        )}
      </div>
    </div>
  );
}
