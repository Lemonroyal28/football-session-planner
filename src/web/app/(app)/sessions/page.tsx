import { createClient } from '../../../lib/supabase/server';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { SessionCard } from '../../../components/sessions/session-card';

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('sessions')
    .select('id, title, session_date, duration_minutes, status, tags, category, age_group, updated_at')
    .order('updated_at', { ascending: false });

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status);
  }

  if (params.q) {
    query = query.ilike('title', `%${params.q}%`);
  }

  const { data: sessions } = await query;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Sessions</h1>
        <Link
          href="/sessions/new"
          className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
        >
          <Plus size={16} />
          New Session
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <form className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Search sessions..."
            className="w-full rounded-md bg-white/5 border border-white/10 pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </form>
        <div className="flex gap-1">
          {['all', 'draft', 'planned', 'completed'].map((s) => (
            <Link
              key={s}
              href={`/sessions${s === 'all' ? '' : `?status=${s}`}`}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                (params.status || 'all') === s
                  ? 'bg-emerald-600/20 text-emerald-400'
                  : 'text-white/50 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Link>
          ))}
        </div>
      </div>

      {/* Sessions grid */}
      {sessions && sessions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-white/40 text-sm">No sessions found</p>
          <Link
            href="/sessions/new"
            className="mt-4 inline-flex items-center gap-2 text-emerald-400 text-sm hover:text-emerald-300"
          >
            <Plus size={16} />
            Create your first session
          </Link>
        </div>
      )}
    </div>
  );
}
