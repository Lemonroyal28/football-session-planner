'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { createClient } from '../../lib/supabase/client';
import { POSITION_OPTIONS, calculateOverall, type Player, type Position } from '../../lib/players';

interface PlayerFormModalProps {
  teamId: string;
  player?: Player;
  onClose: () => void;
  onSaved: () => void;
}

const RATING_FIELDS = [
  { key: 'rating_pace', label: 'Pace' },
  { key: 'rating_shooting', label: 'Shooting' },
  { key: 'rating_passing', label: 'Passing' },
  { key: 'rating_dribbling', label: 'Dribbling' },
  { key: 'rating_defending', label: 'Defending' },
  { key: 'rating_physical', label: 'Physical' },
] as const;

export function PlayerFormModal({ teamId, player, onClose, onSaved }: PlayerFormModalProps) {
  const [name, setName] = useState(player?.name ?? '');
  const [number, setNumber] = useState(player?.number?.toString() ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(player?.date_of_birth ?? '');
  const [primaryPosition, setPrimaryPosition] = useState<Position | ''>(player?.primary_position ?? '');
  const [secondaryPositions, setSecondaryPositions] = useState<Position[]>(player?.secondary_positions ?? []);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(player?.photo_url ?? null);
  const [ratings, setRatings] = useState({
    rating_pace: player?.rating_pace ?? 50,
    rating_shooting: player?.rating_shooting ?? 50,
    rating_passing: player?.rating_passing ?? 50,
    rating_dribbling: player?.rating_dribbling ?? 50,
    rating_defending: player?.rating_defending ?? 50,
    rating_physical: player?.rating_physical ?? 50,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const overall = calculateOverall(ratings);

  const toggleSecondaryPosition = (position: Position) => {
    setSecondaryPositions((prev) =>
      prev.includes(position) ? prev.filter((p) => p !== position) : [...prev, position]
    );
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const uploadPhoto = async (playerId: string): Promise<string | null> => {
    if (!photoFile) return player?.photo_url ?? null;

    const supabase = createClient();
    const ext = photoFile.name.split('.').pop() ?? 'jpg';
    const path = `${teamId}/${playerId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('player-photos')
      .upload(path, photoFile, { upsert: true });

    if (uploadError) {
      setError(`Photo upload failed: ${uploadError.message}`);
      return player?.photo_url ?? null;
    }

    return path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const payload = {
      team_id: teamId,
      name: name.trim(),
      number: number ? Number(number) : null,
      date_of_birth: dateOfBirth || null,
      primary_position: primaryPosition || null,
      secondary_positions: secondaryPositions,
      ...ratings,
    };

    if (player) {
      const photoUrl = await uploadPhoto(player.id);
      const { error: updateError } = await supabase
        .from('players')
        .update({ ...payload, photo_url: photoUrl })
        .eq('id', player.id);

      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
    } else {
      const { data, error: insertError } = await supabase
        .from('players')
        .insert(payload)
        .select('id')
        .single();

      if (insertError || !data) {
        setError(insertError?.message ?? 'Failed to create player');
        setSaving(false);
        return;
      }

      const photoUrl = await uploadPhoto(data.id);
      if (photoUrl) {
        await supabase.from('players').update({ photo_url: photoUrl }).eq('id', data.id);
      }
    }

    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-neutral-900 border border-white/10 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">{player ? 'Edit Player' : 'New Player'}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white/30 text-xs">Photo</span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="text-xs text-white/50 file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:text-white hover:file:bg-white/20"
            />
          </div>

          <div className="flex gap-3">
            <div className="w-16">
              <label className="block text-xs font-medium text-white/70 mb-1">#</label>
              <input
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                type="number"
                className="w-full rounded-md bg-white/5 border border-white/10 px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-white/70 mb-1">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Date of Birth</label>
            <input
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              type="date"
              className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Primary Position</label>
            <select
              value={primaryPosition}
              onChange={(e) => setPrimaryPosition(e.target.value as Position | '')}
              className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">Select...</option>
              {POSITION_OPTIONS.map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-2">Secondary Positions</label>
            <div className="flex flex-wrap gap-1.5">
              {POSITION_OPTIONS.filter((pos) => pos !== primaryPosition).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => toggleSecondaryPosition(pos)}
                  className={`px-2 py-1 rounded-md text-xs transition-colors ${
                    secondaryPositions.includes(pos)
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-white/70">Ratings</label>
              <span className="text-sm font-bold text-emerald-400">
                Overall {overall ?? '-'}
              </span>
            </div>
            <div className="space-y-3">
              {RATING_FIELDS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-20 text-xs text-white/50">{label}</span>
                  <input
                    type="range"
                    min={1}
                    max={99}
                    value={ratings[key]}
                    onChange={(e) => setRatings((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                    className="flex-1 accent-emerald-500"
                  />
                  <span className="w-7 text-right text-xs text-white/70">{ratings[key]}</span>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : player ? 'Save Changes' : 'Add Player'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
