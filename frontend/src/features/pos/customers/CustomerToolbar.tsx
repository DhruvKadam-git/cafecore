"use client";

import { Plus, Search } from "lucide-react";

interface CustomerToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onAddCustomer: () => void;
}

export function CustomerToolbar({ search, onSearchChange, onAddCustomer }: CustomerToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 md:px-8 pb-6 shrink-0">
      <div className="relative w-full sm:w-[300px]">
        <Search
          size={18}
          strokeWidth={2}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, email, phone."
          className="w-full h-11 bg-surface border border-border-custom rounded-[14px] pl-11 pr-4 text-[14px] font-medium text-text-heading placeholder:text-text-muted outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-all theme-transition"
        />
      </div>
      <button
        type="button"
        onClick={onAddCustomer}
        className="flex items-center justify-center gap-2 h-11 px-5 rounded-[14px] bg-primary hover:brightness-95 text-white text-[14px] font-bold transition-all active:scale-[0.98] shrink-0"
      >
        <Plus size={18} strokeWidth={2.5} />
        New Customer
      </button>
    </div>
  );
}
