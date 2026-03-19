'use client';

const STATUSES = ['present', 'absent', 'late', 'injured'] as const;

const STATUS_STYLES: Record<string, string> = {
  present: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  absent: 'bg-red-500/20 text-red-400 border-red-500/30',
  late: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  injured: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

interface Player {
  id: string;
  name: string;
  number: number | null;
}

interface AttendanceRecord {
  player_id: string;
  status: string;
}

interface AttendanceChecklistProps {
  players: Player[];
  records: AttendanceRecord[];
  onStatusChange: (playerId: string, status: string) => void;
}

export function AttendanceChecklist({ players, records, onStatusChange }: AttendanceChecklistProps) {
  const getStatus = (playerId: string) => {
    return records.find((r) => r.player_id === playerId)?.status || '';
  };

  const cycleStatus = (playerId: string) => {
    const current = getStatus(playerId);
    const idx = STATUSES.indexOf(current as typeof STATUSES[number]);
    const next = STATUSES[(idx + 1) % STATUSES.length];
    onStatusChange(playerId, next);
  };

  return (
    <div className="space-y-2">
      {players.map((player) => {
        const status = getStatus(player.id);
        return (
          <div
            key={player.id}
            className="flex items-center justify-between rounded-md bg-white/5 border border-white/10 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/40 w-8 text-right">{player.number ?? '-'}</span>
              <span className="text-sm text-white/80">{player.name}</span>
            </div>
            <div className="flex gap-1">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => onStatusChange(player.id, s)}
                  className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                    status === s
                      ? STATUS_STYLES[s]
                      : 'bg-transparent text-white/30 border-transparent hover:bg-white/5'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
