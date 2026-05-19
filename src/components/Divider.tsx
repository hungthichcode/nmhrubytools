interface DividerProps {
  color?: string;
  label?: string;
}

export function Divider({ color = '#1E90FF', label }: DividerProps) {
  if (label) {
    return (
      <div className="flex items-center gap-2 py-1">
        <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${color}44)` }} />
        <span className="text-xs font-mono" style={{ color: `${color}88` }}>
          {label}
        </span>
        <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${color}44, transparent)` }} />
      </div>
    );
  }
  return (
    <div
      className="h-px w-full"
      style={{
        background: `linear-gradient(90deg, transparent, ${color}55, transparent)`,
        boxShadow: `0 0 4px ${color}33`,
      }}
    />
  );
}
