interface PlayerAvatarProps {
  name: string;
  photoUrl: string | null;
  size?: 'sm' | 'md' | 'lg';
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function PlayerAvatar({ name, photoUrl, size = 'md' }: PlayerAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
  }[size];

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photoUrl} alt={name} className={`rounded-full object-cover border border-white/10 ${sizeClasses}`} />
    );
  }

  return (
    <div className={`flex items-center justify-center rounded-full bg-white/10 text-white/60 font-semibold border border-white/10 ${sizeClasses}`}>
      {initials(name)}
    </div>
  );
}
