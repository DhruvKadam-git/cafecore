"use client";

import React from "react";
import { Search, LayoutGrid, Columns3 } from "lucide-react";
import { KDSFilterStage, KDSViewMode } from "@/lib/kds-types";

interface KDSToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: KDSFilterStage;
  onFilterChange: (filter: KDSFilterStage) => void;
  viewMode: KDSViewMode;
  onViewModeChange: (mode: KDSViewMode) => void;
}

const filters: { key: KDSFilterStage; label: string }[] = [
  { key: "all", label: "All" },
  { key: "to-cook", label: "To Cook" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
];

export function KDSToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  viewMode,
  onViewModeChange,
}: KDSToolbarProps) {
  return (
    <div className="shrink-0 flex flex-wrap items-center gap-3 px-7 py-3 border-b border-kds-border/60 bg-kds-bg/50">
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-kds-muted pointer-events-none"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search order or table..."
          className="kds-focus-ring w-full h-11 pl-10 pr-4 rounded-xl bg-kds-search-bg border border-kds-border text-[15px] font-medium text-kds-text placeholder:text-kds-muted outline-none focus:border-kds-amber transition-colors"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => onFilterChange(f.key)}
            className={`kds-focus-ring h-11 px-4 rounded-full text-[13px] font-semibold transition-all duration-200 ${
              filter === f.key
                ? "bg-kds-filter-active-bg text-kds-filter-active-text scale-[1.02]"
                : "bg-transparent border border-kds-border text-kds-text hover:border-kds-amber/50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl bg-kds-elevated border border-kds-border">
        <button
          type="button"
          onClick={() => onViewModeChange("kanban")}
          aria-pressed={viewMode === "kanban"}
          aria-label="Column view"
          className={`kds-focus-ring flex items-center gap-1.5 h-9 px-3 rounded-lg text-[12px] font-semibold transition-colors ${
            viewMode === "kanban"
              ? "bg-kds-amber text-kds-action-primary-text"
              : "text-kds-muted hover:text-kds-text"
          }`}
        >
          <Columns3 size={14} />
          Columns
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange("grid")}
          aria-pressed={viewMode === "grid"}
          aria-label="Grid view"
          className={`kds-focus-ring flex items-center gap-1.5 h-9 px-3 rounded-lg text-[12px] font-semibold transition-colors ${
            viewMode === "grid"
              ? "bg-kds-amber text-kds-action-primary-text"
              : "text-kds-muted hover:text-kds-text"
          }`}
        >
          <LayoutGrid size={14} />
          Grid
        </button>
      </div>
    </div>
  );
}
