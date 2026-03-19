'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface CalendarSession {
  id: string;
  title: string;
  session_date: string;
  status: string;
  duration_minutes: number;
}

const STATUS_DOT: Record<string, string> = {
  draft: 'bg-white/40',
  planned: 'bg-blue-400',
  completed: 'bg-emerald-400',
};

export default function CalendarPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<CalendarSession[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const loadSessions = async () => {
      const supabase = createClient();
      const start = new Date(year, month, 1).toISOString().split('T')[0];
      const end = new Date(year, month + 1, 0).toISOString().split('T')[0];

      const { data } = await supabase
        .from('sessions')
        .select('id, title, session_date, status, duration_minutes')
        .gte('session_date', start)
        .lte('session_date', end)
        .order('session_date');

      if (data) setSessions(data);
    };
    loadSessions();
  }, [year, month]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];

    // Leading empty cells (start week on Monday)
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < offset; i++) days.push(null);

    for (let d = 1; d <= daysInMonth; d++) days.push(d);

    return days;
  }, [year, month]);

  const getSessionsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return sessions.filter((s) => s.session_date === dateStr);
  };

  const monthName = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const daySessions = getSessionsForDay(day);
    if (daySessions.length === 1) {
      router.push(`/sessions/${daySessions[0].id}`);
    } else {
      router.push(`/sessions/new?date=${dateStr}`);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Calendar</h1>
        <div className="flex items-center gap-4">
          <button onClick={handlePrevMonth} className="text-white/40 hover:text-white/70 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium text-white/80 w-40 text-center">{monthName}</span>
          <button onClick={handleNextMonth} className="text-white/40 hover:text-white/70 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="text-center text-xs text-white/40 py-2">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-white/5 rounded-lg overflow-hidden">
        {calendarDays.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="bg-[#0f172a] min-h-24" />;
          }

          const daySessions = getSessionsForDay(day);
          const isToday =
            day === new Date().getDate() &&
            month === new Date().getMonth() &&
            year === new Date().getFullYear();

          return (
            <div
              key={day}
              onClick={() => handleDayClick(day)}
              className="bg-[#0f172a] min-h-24 p-2 cursor-pointer hover:bg-white/[0.03] transition-colors"
            >
              <span className={`text-xs ${isToday ? 'bg-emerald-600 text-white px-1.5 py-0.5 rounded-full' : 'text-white/50'}`}>
                {day}
              </span>
              <div className="mt-1 space-y-1">
                {daySessions.slice(0, 3).map((s) => (
                  <div
                    key={s.id}
                    onClick={(e) => { e.stopPropagation(); router.push(`/sessions/${s.id}`); }}
                    className="flex items-center gap-1 text-xs text-white/60 truncate hover:text-white/80"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[s.status] || STATUS_DOT.draft}`} />
                    <span className="truncate">{s.title}</span>
                  </div>
                ))}
                {daySessions.length > 3 && (
                  <span className="text-xs text-white/30">+{daySessions.length - 3} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
