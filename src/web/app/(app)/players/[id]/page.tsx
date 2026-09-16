'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil } from 'lucide-react';
import { createClient } from '../../../../lib/supabase/client';
import { PlayerFormModal } from '../../../../components/players/player-form-modal';
import { PlayerAvatar } from '../../../../components/players/player-avatar';
import { OverallBadge } from '../../../../components/players/overall-badge';
import { calculateAge, getPlayerPhotoUrl, type Player } from '../../../../lib/players';

const ATTRIBUTE_FIELDS = [
  { key: 'rating_pace', label: 'Pace' },
  { key: 'rating_shooting', label: 'Shooting' },
  { key: 'rating_passing', label: 'Passing' },
  { key: 'rating_dribbling', label: 'Dribbling' },
  { key: 'rating_defending', label: 'Defending' },
  { key: 'rating_physical', label: 'Physical' },
] as const;

export default function PlayerDetailPage() {
  const params = useParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  const loadPlayer = useCallback(async () => {
    const supabase = createClient();
    const id = params.id as string;

    const { data } = await supabase.from('players').select('*').eq('id', id).single();
    if (data) {
      setPlayer(data);
      setPhotoUrl(await getPlayerPhotoUrl(supabase, data.photo_url));
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => { loadPlayer(); }, [loadPlayer]);

  if (loading) {
    return <div className="flex h-full items-center justify-center"><p className="text-white/40 text-sm">Loading...</p></div>;
  }

  if (!player) {
    return <div className="flex h-full items-center justify-center"><p className="text-white/40 text-sm">Player not found</p></div>;
  }

  const age = calculateAge(player.date_of_birth);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/teams/${player.team_id}`} className="text-white/40 hover:text-white/70 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-bold text-white">Player Profile</h1>
      </div>

      <div className="rounded-lg bg-white/5 border border-white/10 p-6 flex items-center gap-5">
        <PlayerAvatar name={player.name} photoUrl={photoUrl} size="lg" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">{player.name}</h2>
            {player.number !== null && <span className="text-sm text-white/40">#{player.number}</span>}
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-white/50">
            {age !== null && <span>{age} yrs</span>}
            {player.primary_position && <span>{player.primary_position}</span>}
            {player.secondary_positions.length > 0 && (
              <span className="text-white/30">/ {player.secondary_positions.join(', ')}</span>
            )}
          </div>
        </div>
        <OverallBadge overall={player.overall_rating} />
        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors"
        >
          <Pencil size={14} /> Edit
        </button>
      </div>

      <div className="rounded-lg bg-white/5 border border-white/10 p-6">
        <h3 className="text-sm font-semibold text-white/70 mb-4">Attributes</h3>
        <div className="space-y-3">
          {ATTRIBUTE_FIELDS.map(({ key, label }) => {
            const value = player[key];
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="w-24 text-sm text-white/50">{label}</span>
                <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${value ?? 0}%` }}
                  />
                </div>
                <span className="w-8 text-right text-sm text-white/70">{value ?? '-'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {formOpen && (
        <PlayerFormModal
          teamId={player.team_id}
          player={player}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            loadPlayer();
          }}
        />
      )}
    </div>
  );
}
