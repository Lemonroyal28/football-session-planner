'use client';

interface NotesFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}

export function NotesField({ label, value, onChange, rows = 3 }: NotesFieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-md bg-white/5 text-white text-sm px-3 py-2 border border-white/10 focus:outline-none focus:ring-1 focus:ring-white/30 resize-y"
        placeholder={`Enter ${label.toLowerCase()}...`}
      />
    </div>
  );
}
