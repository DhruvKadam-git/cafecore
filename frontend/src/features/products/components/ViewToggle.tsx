"use client";

import React from "react";
import { LayoutGrid, List, LucideIcon } from "lucide-react";
import { ProductViewMode } from "@/lib/product-types";

interface ViewToggleProps {
  value: ProductViewMode;
  onChange: (mode: ProductViewMode) => void;
}

const VIEW_OPTIONS: { mode: ProductViewMode; label: string; icon: LucideIcon }[] = [
  { mode: "grid", label: "Grid", icon: LayoutGrid },
  { mode: "list", label: "List", icon: List },
];

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Product view mode"
      className="relative z-10 flex items-stretch h-[40px] p-1 bg-surface border border-border-custom rounded-[14px] select-none min-w-[180px] theme-transition"
    >
      {VIEW_OPTIONS.map(({ mode, label, icon: Icon }) => {
        const isActive = value === mode;
        return (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(mode)}
            className={`flex flex-1 items-center justify-center gap-1.5 min-h-[32px] rounded-[10px] text-[14px] font-semibold transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-primary text-white shadow-sm"
                : "bg-transparent text-text-muted hover:text-text-heading"
            }`}
          >
            <Icon size={18} strokeWidth={1.75} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
