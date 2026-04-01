interface BarProps {
  color: string;
  max: number;
  value: number;
}

export function Bar({ color, max, value }: BarProps) {
  const pct = Math.max(2, (value / max) * 100);

  return (
    <div className="flex items-center gap-2 text-sm">
      <div
        className="h-5 rounded transition-all duration-500"
        style={{ backgroundColor: color, width: `${pct}%` }}
      />
      <span className="whitespace-nowrap tabular-nums">{Math.round(value)}</span>
    </div>
  );
}
