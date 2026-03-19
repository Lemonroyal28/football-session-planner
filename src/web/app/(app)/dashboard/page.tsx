import { createClient } from '../../../lib/supabase/server';
import Link from 'next/link';
import {
  ClipboardList,
  Plus,
  Target,
  Users,
  Calendar,
} from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: { full_name: string | null; club_name: string | null } | null = null;
  let upcomingSessions: { id: string; title: string; session_date: string; status: string; duration_minutes: number }[] = [];
  let recentSessions: { id: string; title: string; session_date: string | null; status: string; duration_minutes: number }[] = [];
  let sessionCount = 0;
  let drillCount = 0;
  let teamCount = 0;

  if (user) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, club_name')
      .eq('id', user.id)
      .single();
    profile = profileData;

    const { data: upcoming } = await supabase
      .from('sessions')
      .select('id, title, session_date, status, duration_minutes')
      .gte('session_date', new Date().toISOString().split('T')[0])
      .order('session_date', { ascending: true })
      .limit(5);
    upcomingSessions = upcoming || [];

    const { data: recent } = await supabase
      .from('sessions')
      .select('id, title, session_date, status, duration_minutes')
      .order('updated_at', { ascending: false })
      .limit(5);
    recentSessions = recent || [];

    const { count: sc } = await supabase.from('sessions').select('*', { count: 'exact', head: true });
    const { count: dc } = await supabase.from('drills').select('*', { count: 'exact', head: true });
    const { count: tc } = await supabase.from('teams').select('*', { count: 'exact', head: true });
    sessionCount = sc ?? 0;
    drillCount = dc ?? 0;
    teamCount = tc ?? 0;
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Coach';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome{user ? ` back, ${displayName}` : ' to Session Planner'}
        </h1>
        {profile?.club_name && (
          <p className="text-sm text-white/50 mt-1">{profile.club_name}</p>
        )}
        {!user && (
          <p className="text-sm text-white/50 mt-1">
            <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300">Sign in</Link> to save your sessions to the cloud.
          </p>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/sessions/new"
          className="flex items-center gap-3 rounded-lg bg-emerald-600/20 border border-emerald-500/30 p-4 text-emerald-400 hover:bg-emerald-600/30 transition-colors"
        >
          <Plus size={20} />
          <span className="text-sm font-medium">New Session</span>
        </Link>
        <Link
          href="/tactical-board"
          className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/10 p-4 text-white/70 hover:bg-white/10 transition-colors"
        >
          <Target size={20} />
          <span className="text-sm font-medium">Tactical Board</span>
        </Link>
        <Link
          href="/teams"
          className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/10 p-4 text-white/70 hover:bg-white/10 transition-colors"
        >
          <Users size={20} />
          <span className="text-sm font-medium">Teams</span>
        </Link>
        <Link
          href="/calendar"
          className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/10 p-4 text-white/70 hover:bg-white/10 transition-colors"
        >
          <Calendar size={20} />
          <span className="text-sm font-medium">Calendar</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Sessions', count: sessionCount, icon: ClipboardList },
          { label: 'Drills', count: drillCount, icon: Target },
          { label: 'Teams', count: teamCount, icon: Users },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg bg-white/5 border border-white/10 p-4"
          >
            <div className="flex items-center gap-2 text-white/50 text-xs mb-2">
              <stat.icon size={14} />
              {stat.label}
            </div>
            <p className="text-2xl font-bold text-white">{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Sessions lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg bg-white/5 border border-white/10 p-5">
          <h2 className="text-sm font-semibold text-white/80 mb-4">Upcoming Sessions</h2>
          {upcomingSessions.length > 0 ? (
            <div className="space-y-2">
              {upcomingSessions.map((s) => (
                <Link
                  key={s.id}
                  href={`/sessions/${s.id}`}
                  className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2 hover:bg-white/10 transition-colors"
                >
                  <div>
                    <p className="text-sm text-white/80">{s.title}</p>
                    <p className="text-xs text-white/40">{s.session_date} &middot; {s.duration_minutes}min</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    s.status === 'planned' ? 'bg-blue-500/20 text-blue-400' :
                    s.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-white/10 text-white/50'
                  }`}>{s.status}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/40">No upcoming sessions</p>
          )}
        </div>

        <div className="rounded-lg bg-white/5 border border-white/10 p-5">
          <h2 className="text-sm font-semibold text-white/80 mb-4">Recent Sessions</h2>
          {recentSessions.length > 0 ? (
            <div className="space-y-2">
              {recentSessions.map((s) => (
                <Link
                  key={s.id}
                  href={`/sessions/${s.id}`}
                  className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2 hover:bg-white/10 transition-colors"
                >
                  <div>
                    <p className="text-sm text-white/80">{s.title}</p>
                    <p className="text-xs text-white/40">{s.session_date || 'No date'} &middot; {s.duration_minutes}min</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    s.status === 'planned' ? 'bg-blue-500/20 text-blue-400' :
                    s.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-white/10 text-white/50'
                  }`}>{s.status}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/40">No sessions yet. Create your first one!</p>
          )}
        </div>
      </div>
    </div>
  );
}
