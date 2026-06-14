import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { OccupancySummary } from "./OccupancySummary";

interface TableViewHeaderProps {
  occupied: number;
  available: number;
}

export function TableViewHeader({ occupied, available }: TableViewHeaderProps) {
  return (
    <div className="flex items-center justify-between h-20 px-6 md:px-8 shrink-0">
      <div className="flex items-center gap-4 min-w-0">
        <Link
          href="/pos"
          className="flex items-center gap-2 h-10 text-[14px] font-semibold text-primary hover:brightness-110 transition-colors theme-transition shrink-0"
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
          Back
        </Link>
        <div className="w-px h-7 bg-border-custom shrink-0 theme-transition" />
        <h1 className="text-[24px] font-bold text-text-heading leading-tight tracking-tight theme-transition truncate">
          Table View
        </h1>
      </div>
      <OccupancySummary occupied={occupied} available={available} />
    </div>
  );
}
