interface OverallBadgeProps {
  overall: number | null;
  size?: 'sm' | 'md';
}

function badgeColor(overall: number): string {
  if (overall >= 80) return 'bg-emerald-500/20 text-emerald-400';
  if (overall >= 65) return 'bg-blue-500/20 text-blue-400';
  if (overall >= 50) return 'bg-amber-500/20 text-amber-400';
  return 'bg-white/10 text-white/50';
}

export function OverallBadge({ overall, size = 'md' }: OverallBadgeProps) {
  const sizeClasses = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';

  if (overall === null) {
    return (
      <div className={`flex items-center justify-center rounded-full bg-white/5 text-white/30 font-semibold ${sizeClasses}`}>
        -
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center rounded-full font-bold ${badgeColor(overall)} ${sizeClasses}`}>
      {overall}
    </div>
  );
}
