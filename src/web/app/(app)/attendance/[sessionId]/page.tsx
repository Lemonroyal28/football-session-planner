'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '../../../../lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Users } from 'lucide-react';
import { AttendanceChecklist } from '../../../../components/attendance/attendance-checklist';

interface SessionInfo {
  id: string;
  title: string;
  session_date: string | null;
  team_id: string | null;
}

interface Player {
  id: string;
  name: string;
  number: number | null;
}

interface AttendanceRecord {
  id: string;
  player_id: string;
  status: string;
  notes: string;
}

export default function AttendancePage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const supabase = createClient();

    const { data: sessionData } = await supabase
      .from('sessions')
      .select('id, title, session_date, team_id')
      .eq('id', sessionId)
      .single();

    if (sessionData) {
      setSession(sessionData);

      if (sessionData.team_id) {
        const { data: playerData } = await supabase
          .from('players')
          .select('id, name, number')
          .eq('team_id', sessionData.team_id)
          .eq('active', true)
          .order('number');

        if (playerData) setPlayers(playerData);
      }

      const { data: attendanceData } = await supabase
        .from('attendance_records')
        .select('id, player_id, status, notes')
        .eq('session_id', sessionId);

      if (attendanceData) setRecords(attendanceData);
    }

    setLoading(false);
  }, [sessionId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleStatusChange = async (playerId: string, status: string) => {
    const supabase = createClient();
    const existing = records.find((r) => r.player_id === playerId);

    if (existing) {
      await supabase
        .from('attendance_records')
        .update({ status })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('attendance_records')
        .insert({ session_id: sessionId, player_id: playerId, status });
    }

    loadData();
  };

  const handleMarkAllPresent = async () => {
    const supabase = createClient();
    const upserts = players.map((p) => ({
      session_id: sessionId,
      player_id: p.id,
      status: 'present',
    }));

    // Delete existing and insert fresh
    await supabase.from('attendance_records').delete().eq('session_id', sessionId);
    await supabase.from('attendance_records').insert(upserts);
    loadData();
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center"><p className="text-white/40 text-sm">Loading...</p></div>;
  }

  if (!session) {
    return <div className="flex h-full items-center justify-center"><p className="text-white/40 text-sm">Session not found</p></div>;
  }

  const presentCount = records.filter((r) => r.status === 'present').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;
  const lateCount = records.filter((r) => r.status === 'late').length;
  const injuredCount = records.filter((r) => r.status === 'injured').length;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/sessions/${sessionId}`} className="text-white/40 hover:text-white/70 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Attendance</h1>
          <p className="text-sm text-white/50">{session.title} {session.session_date ? `- ${session.session_date}` : ''}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-white/50">Present: {presentCount}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-white/50">Absent: {absentCount}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="text-white/50">Late: {lateCount}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-orange-400" />
          <span className="text-white/50">Injured: {injuredCount}</span>
        </div>
      </div>

      {players.length === 0 ? (
        <div className="text-center py-12">
          <Users size={40} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No team assigned to this session</p>
          <p className="text-white/30 text-xs mt-1">Assign a team in the session builder to take attendance</p>
        </div>
      ) : (
        <>
          <button
            onClick={handleMarkAllPresent}
            className="flex items-center gap-2 rounded-md bg-emerald-600/20 border border-emerald-500/30 px-4 py-2 text-sm text-emerald-400 hover:bg-emerald-600/30 transition-colors"
          >
            <CheckCircle2 size={16} />
            Mark All Present
          </button>

          <AttendanceChecklist
            players={players}
            records={records}
            onStatusChange={handleStatusChange}
          />
        </>
      )}
    </div>
  );
}
