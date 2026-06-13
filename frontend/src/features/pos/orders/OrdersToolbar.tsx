"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { POSOrderStatusFilter } from "@/lib/pos-order-types";

const FILTERS: POSOrderStatusFilter[] = ["All", "Draft", "Paid", "Cancelled"];

interface OrdersToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  activeFilter: POSOrderStatusFilter;
  onFilterChange: (filter: POSOrderStatusFilter) => void;
}

export function OrdersToolbar({
  search,
  onSearchChange,
  activeFilter,
  onFilterChange,
}: OrdersToolbarProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-5">
      <div className="flex items-center gap-3">
        <div className="relative w-full sm:w-[300px]">
          <Search
            size={18}
            strokeWidth={2}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search order, customer, date..."
            className="w-full h-[42px] bg-surface border border-border-custom rounded-[14px] pl-10 pr-4 text-[14px] font-medium text-text-heading placeholder:text-text-muted outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-all theme-transition"
          />
        </div>
        <button
          type="button"
          aria-label="Filter options"
          className="w-[42px] h-[42px] shrink-0 flex items-center justify-center rounded-[14px] border border-border-custom bg-surface text-text-muted hover:bg-background transition-colors theme-transition"
        >
          <SlidersHorizontal size={18} strokeWidth={2} />
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => onFilterChange(filter)}
            className={`h-[34px] px-4 rounded-full text-[14px] font-semibold transition-all duration-200 theme-transition ${
              activeFilter === filter
                ? "bg-sidebar-bg text-white"
                : "bg-surface text-text-body hover:bg-background"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}
