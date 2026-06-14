"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChefHat, Wifi, Monitor, LogOut } from "lucide-react";
import { KDSFilterStage, KDSStage, KDS_STAGE_LABELS } from "@/lib/kds-types";

interface KDSHeaderProps {
  counts: Record<KDSStage, number>;
  filter: KDSFilterStage;
  onFilterChange: (filter: KDSFilterStage) => void;
}

const counterConfig: {
  stage: KDSStage;
  filterKey: KDSFilterStage;
  dotClass: string;
  bgClass: string;
  textClass: string;
}[] = [
  {
    stage: "to-cook",
    filterKey: "to-cook",
    dotClass: "bg-kds-amber",
    bgClass: "bg-kds-amber-bg/60 border-kds-amber/30",
    textClass: "text-kds-amber",
  },
  {
    stage: "preparing",
    filterKey: "preparing",
    dotClass: "bg-kds-orange",
    bgClass: "bg-kds-orange-bg/60 border-kds-orange/30",
    textClass: "text-kds-orange",
  },
  {
    stage: "ready",
    filterKey: "ready",
    dotClass: "bg-kds-green",
    bgClass: "bg-kds-green-bg/60 border-kds-green/30",
    textClass: "text-kds-green",
  },
];

export function KDSHeader({ counts, filter, onFilterChange }: KDSHeaderProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
      );
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="h-[72px] shrink-0 flex flex-wrap items-center justify-between gap-4 px-7 border-b border-kds-border bg-kds-bg shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
      <div className="flex items-center gap-3">
        <ChefHat size={28} strokeWidth={1.75} className="text-kds-amber" />
        <div>
          <h1 className="text-[22px] font-bold text-kds-text leading-none">Kitchen Display</h1>
          <p className="text-[12px] font-medium text-kds-muted mt-0.5">
            {time} · Morning Shift
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 order-last w-full sm:order-none sm:w-auto justify-center">
        {counterConfig.map(({ stage, filterKey, bgClass, textClass }) => {
          const isActive = filter === filterKey;
          return (
            <button
              key={stage}
              type="button"
              onClick={() => onFilterChange(isActive ? "all" : filterKey)}
              aria-pressed={isActive}
              className={`kds-focus-ring flex items-center gap-3 px-4 py-2 rounded-xl border transition-all duration-200 ${bgClass} ${
                isActive ? "ring-2 ring-offset-1 ring-offset-kds-bg ring-current scale-[1.02]" : "hover:brightness-110"
              } ${textClass}`}
            >
              <span className="text-[12px] font-bold uppercase tracking-wider opacity-80">
                {KDS_STAGE_LABELS[stage]}
              </span>
              <span className="text-[24px] font-bold tabular-nums leading-none">
                {counts[stage]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <div className="h-9 px-3 rounded-full bg-kds-green/10 flex items-center gap-2">
          <Wifi size={14} className="text-kds-online" />
          <span className="text-[12px] font-semibold text-kds-online">Online</span>
          <span className="w-1.5 h-1.5 rounded-full bg-kds-online" />
        </div>

        <Link
          href="/pos"
          aria-label="Open POS"
          className="kds-focus-ring w-9 h-9 rounded-lg bg-kds-elevated border border-kds-border flex items-center justify-center text-kds-muted hover:text-kds-text hover:bg-kds-surface transition-colors"
        >
          <Monitor size={16} />
        </Link>

        <button
          type="button"
          aria-label="Logout"
          className="kds-focus-ring w-9 h-9 rounded-lg bg-kds-elevated border border-kds-border flex items-center justify-center text-kds-muted hover:text-kds-text hover:bg-kds-surface transition-colors"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
