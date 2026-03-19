'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../lib/supabase/client';

const CATEGORIES = ['Passing', 'Shooting', 'Dribbling', 'Defending', 'Possession', 'Set Pieces', 'Fitness', 'Goalkeeping'];
const AGE_GROUPS = ['U7', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16', 'U17', 'U18', 'U21', 'Senior'];

export default function NewDrillPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [ageGroups, setAgeGroups] = useState<string[]>([]);
  const [duration, setDuration] = useState(15);
  const [description, setDescription] = useState('');
  const [coachingPoints, setCoachingPoints] = useState<string[]>([]);
  const [newCP, setNewCP] = useState('');
  const [equipment, setEquipment] = useState<string[]>([]);
  const [newEq, setNewEq] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const toggleAgeGroup = (ag: string) => {
    setAgeGroups((prev) =>
      prev.includes(ag) ? prev.filter((a) => a !== ag) : [...prev, ag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('drills')
      .insert({
        user_id: user?.id ?? null,
        title,
        category,
        age_groups: ageGroups,
        duration_minutes: duration,
        description,
        coaching_points: coachingPoints,
        equipment,
        tags,
      })
      .select('id')
      .single();

    if (error) {
      setLoading(false);
      return;
    }

    router.push(`/drills/${data.id}`);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-white mb-6">New Drill</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Basic Info</h2>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Rondo 4v2"
              className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="">Select...</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Duration (min)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min={5}
                max={60}
                className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>
        </section>

        {/* Age groups */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Age Groups</h2>
          <div className="flex flex-wrap gap-2">
            {AGE_GROUPS.map((ag) => (
              <button
                key={ag}
                type="button"
                onClick={() => toggleAgeGroup(ag)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  ageGroups.includes(ag)
                    ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                }`}
              >
                {ag}
              </button>
            ))}
          </div>
        </section>

        {/* Description */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Description</h2>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe the drill setup, rules, and variations..."
            className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
          />
        </section>

        {/* Coaching points */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Coaching Points</h2>
          {coachingPoints.map((cp, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-white/70">
              <span className="flex-1">{cp}</span>
              <button type="button" onClick={() => setCoachingPoints(coachingPoints.filter((_, j) => j !== i))} className="text-white/30 hover:text-red-400 text-xs">Remove</button>
            </div>
          ))}
          <div className="flex gap-2">
            <input value={newCP} onChange={(e) => setNewCP(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newCP.trim()) { setCoachingPoints([...coachingPoints, newCP.trim()]); setNewCP(''); } } }} placeholder="Add coaching point..." className="flex-1 rounded-md bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
            <button type="button" onClick={() => { if (newCP.trim()) { setCoachingPoints([...coachingPoints, newCP.trim()]); setNewCP(''); } }} className="px-3 py-1.5 rounded-md bg-white/5 text-sm text-white/60 hover:bg-white/10">Add</button>
          </div>
        </section>

        {/* Equipment */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Equipment</h2>
          <div className="flex flex-wrap gap-1.5">
            {equipment.map((eq, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-xs bg-white/5 text-white/60 px-2 py-1 rounded">
                {eq}
                <button type="button" onClick={() => setEquipment(equipment.filter((_, j) => j !== i))} className="text-white/30 hover:text-red-400">&times;</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newEq} onChange={(e) => setNewEq(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newEq.trim()) { setEquipment([...equipment, newEq.trim()]); setNewEq(''); } } }} placeholder="Add equipment..." className="flex-1 rounded-md bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
            <button type="button" onClick={() => { if (newEq.trim()) { setEquipment([...equipment, newEq.trim()]); setNewEq(''); } }} className="px-3 py-1.5 rounded-md bg-white/5 text-sm text-white/60 hover:bg-white/10">Add</button>
          </div>
        </section>

        {/* Tags */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Tags</h2>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-xs bg-white/5 text-white/60 px-2 py-1 rounded">
                {tag}
                <button type="button" onClick={() => setTags(tags.filter((_, j) => j !== i))} className="text-white/30 hover:text-red-400">&times;</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newTag.trim()) { setTags([...tags, newTag.trim()]); setNewTag(''); } } }} placeholder="Add tag..." className="flex-1 rounded-md bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
            <button type="button" onClick={() => { if (newTag.trim()) { setTags([...tags, newTag.trim()]); setNewTag(''); } }} className="px-3 py-1.5 rounded-md bg-white/5 text-sm text-white/60 hover:bg-white/10">Add</button>
          </div>
        </section>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating...' : 'Create Drill'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 rounded-md text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
