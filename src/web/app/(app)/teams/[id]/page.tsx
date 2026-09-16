'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '../../../../lib/supabase/client';
import { ArrowLeft, Plus, Trash2, Pencil } from 'lucide-react';
import Link from 'next/link';
import { PlayerFormModal } from '../../../../components/players/player-form-modal';
import { PlayerAvatar } from '../../../../components/players/player-avatar';
import { OverallBadge } from '../../../../components/players/overall-badge';
import { calculateAge, getPlayerPhotoUrl, type Player } from '../../../../lib/players';

type SortKey = 'number' | 'overall' | 'position';

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
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | undefined>(undefined);
  const [sortKey, setSortKey] = useState<SortKey>('number');
  const [positionFilter, setPositionFilter] = useState('');

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

    if (playerData) {
      setPlayers(playerData);
      const urlEntries = await Promise.all(
        playerData.map(async (p) => [p.id, await getPlayerPhotoUrl(supabase, p.photo_url)] as const)
      );
      setPhotoUrls(Object.fromEntries(urlEntries.filter(([, url]) => url)));
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => { loadData(); }, [loadData]);

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

  const openNewPlayerForm = () => {
    setEditingPlayer(undefined);
    setFormOpen(true);
  };

  const openEditPlayerForm = (player: Player) => {
    setEditingPlayer(player);
    setFormOpen(true);
  };

  const visiblePlayers = useMemo(() => {
    let result = players;
    if (positionFilter) {
      result = result.filter(
        (p) => p.primary_position === positionFilter || p.secondary_positions.includes(positionFilter as never)
      );
    }
    return [...result].sort((a, b) => {
      if (sortKey === 'overall') return (b.overall_rating ?? -1) - (a.overall_rating ?? -1);
      if (sortKey === 'position') return (a.primary_position ?? '').localeCompare(b.primary_position ?? '');
      return (a.number ?? 999) - (b.number ?? 999);
    });
  }, [players, sortKey, positionFilter]);

  const positionOptions = useMemo(() => {
    const set = new Set<string>();
    players.forEach((p) => {
      if (p.primary_position) set.add(p.primary_position);
    });
    return Array.from(set).sort();
  }, [players]);

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
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 gap-3">
          <h2 className="text-sm font-semibold text-white/70 shrink-0">Players ({players.length})</h2>
          <div className="flex items-center gap-2">
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="rounded-md bg-white/5 border border-white/10 px-2 py-1 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">All positions</option>
              {positionOptions.map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="rounded-md bg-white/5 border border-white/10 px-2 py-1 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="number">Sort: #</option>
              <option value="overall">Sort: Overall</option>
              <option value="position">Sort: Position</option>
            </select>
            <button
              onClick={openNewPlayerForm}
              className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
            >
              <Plus size={14} /> Add Player
            </button>
          </div>
        </div>

        {visiblePlayers.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-white/40 border-b border-white/10">
                <th className="px-4 py-2 w-14">#</th>
                <th className="px-4 py-2">Player</th>
                <th className="px-4 py-2">Age</th>
                <th className="px-4 py-2">Position</th>
                <th className="px-4 py-2 w-16">OVR</th>
                <th className="px-4 py-2 w-20">Status</th>
                <th className="px-4 py-2 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {visiblePlayers.map((player) => (
                <tr key={player.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-2 text-sm text-white/50">{player.number ?? '-'}</td>
                  <td className="px-4 py-2">
                    <Link href={`/players/${player.id}`} className="flex items-center gap-2 group">
                      <PlayerAvatar name={player.name} photoUrl={photoUrls[player.id] ?? null} size="sm" />
                      <span className="text-sm text-white/80 group-hover:text-white transition-colors">{player.name}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-sm text-white/50">{calculateAge(player.date_of_birth) ?? '-'}</td>
                  <td className="px-4 py-2 text-sm text-white/50">
                    {player.primary_position ?? '-'}
                    {player.secondary_positions.length > 0 && (
                      <span className="text-white/30"> / {player.secondary_positions.join(', ')}</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <OverallBadge overall={player.overall_rating} size="sm" />
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditPlayerForm(player)}
                        className="text-white/20 hover:text-white/70 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDeletePlayer(player.id)}
                        className="text-white/20 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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

      {formOpen && team && (
        <PlayerFormModal
          teamId={team.id}
          player={editingPlayer}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
