"use client";

import React from "react";
import { MarketingTab } from "@/lib/marketing-types";

interface MarketingTabsProps {
  value: MarketingTab;
  onChange: (tab: MarketingTab) => void;
}

const TABS: { id: MarketingTab; label: string }[] = [
  { id: "coupons", label: "Coupons" },
  { id: "promotions", label: "Promotions" },
];

export function MarketingTabs({ value, onChange }: MarketingTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Marketing section"
      className="flex items-center gap-3 select-none"
    >
      {TABS.map(({ id, label }) => {
        const isActive = value === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(id)}
            className={`h-[42px] px-5 rounded-[14px] text-[15px] font-semibold transition-colors duration-200 cursor-pointer ${
              isActive
                ? "bg-primary text-white shadow-sm"
                : "bg-border-custom/30 text-text-muted hover:text-text-body"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
