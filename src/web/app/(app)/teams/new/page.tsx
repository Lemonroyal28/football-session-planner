'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../lib/supabase/client';

export default function NewTeamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [level, setLevel] = useState('');
  const [season, setSeason] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#1a73e8');
  const [secondaryColor, setSecondaryColor] = useState('#e53935');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('teams')
      .insert({
        user_id: user?.id ?? null,
        name,
        age_group: ageGroup || null,
        level: level || null,
        season: season || null,
        colors: { primary: primaryColor, secondary: secondaryColor },
      })
      .select('id')
      .single();

    if (error) {
      setLoading(false);
      return;
    }

    router.push(`/teams/${data.id}`);
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-white mb-6">New Team</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Team Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. U14 Blues"
            className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Age Group</label>
            <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
              <option value="">Select...</option>
              {['U7', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16', 'U17', 'U18', 'U21', 'Senior'].map((ag) => (
                <option key={ag} value={ag}>{ag}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Level</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
              <option value="">Select...</option>
              {['Grassroots', 'Academy', 'Semi-Pro', 'Professional'].map((lv) => (
                <option key={lv} value={lv}>{lv}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Season</label>
          <input
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            placeholder="e.g. 2025/26"
            className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Team Colors</label>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
              <span className="text-xs text-white/50">Primary</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
              <span className="text-xs text-white/50">Secondary</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="flex-1 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors">
            {loading ? 'Creating...' : 'Create Team'}
          </button>
          <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded-md text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
        </div>
      </form>
    </div>
  );
}
