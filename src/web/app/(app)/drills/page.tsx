import { createClient } from '../../../lib/supabase/server';
import Link from 'next/link';
import { Plus, Search, Star } from 'lucide-react';
import { DrillCard } from '../../../components/drills/drill-card';

export default async function DrillsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; favorite?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('drills')
    .select('id, title, category, age_groups, tags, duration_minutes, is_favorite, equipment, updated_at')
    .order('updated_at', { ascending: false });

  if (params.q) {
    query = query.ilike('title', `%${params.q}%`);
  }
  if (params.category) {
    query = query.eq('category', params.category);
  }
  if (params.favorite === 'true') {
    query = query.eq('is_favorite', true);
  }

  const { data: drills } = await query;

  const categories = ['Passing', 'Shooting', 'Dribbling', 'Defending', 'Possession', 'Set Pieces', 'Fitness', 'Goalkeeping'];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Drill Library</h1>
        <Link
          href="/drills/new"
          className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
        >
          <Plus size={16} />
          New Drill
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <form className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Search drills..."
            className="w-full rounded-md bg-white/5 border border-white/10 pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </form>
        <Link
          href={params.favorite === 'true' ? '/drills' : '/drills?favorite=true'}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            params.favorite === 'true'
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'text-white/50 hover:text-white/70 hover:bg-white/5'
          }`}
        >
          <Star size={12} />
          Favorites
        </Link>
        <div className="flex gap-1 flex-wrap">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={params.category === cat ? '/drills' : `/drills?category=${cat}`}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                params.category === cat
                  ? 'bg-emerald-600/20 text-emerald-400'
                  : 'text-white/50 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* Drills grid */}
      {drills && drills.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {drills.map((drill) => (
            <DrillCard key={drill.id} drill={drill} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-white/40 text-sm">No drills found</p>
          <Link
            href="/drills/new"
            className="mt-4 inline-flex items-center gap-2 text-emerald-400 text-sm hover:text-emerald-300"
          >
            <Plus size={16} />
            Create your first drill
          </Link>
        </div>
      )}
    </div>
  );
}
