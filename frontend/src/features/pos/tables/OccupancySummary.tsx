interface OccupancySummaryProps {
  occupied: number;
  available: number;
}

export function OccupancySummary({ occupied, available }: OccupancySummaryProps) {
  return (
    <div className="flex items-center gap-6 text-[14px] font-semibold theme-transition">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
        <span className="text-primary">{occupied} Occupied</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full border-2 border-border-custom shrink-0" />
        <span className="text-text-muted">{available} Available</span>
      </div>
    </div>
  );
}
