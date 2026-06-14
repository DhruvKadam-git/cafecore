"use client";

import React from "react";
import { Plus, Sparkles } from "lucide-react";
import { MarketingTab } from "@/lib/marketing-types";
import { MarketingTabs } from "./MarketingTabs";

interface MarketingToolbarProps {
  activeTab: MarketingTab;
  onTabChange: (tab: MarketingTab) => void;
  onNewClick: () => void;
  onAiClick?: () => void;
  isAiLoading?: boolean;
}

export function MarketingToolbar({
  activeTab,
  onTabChange,
  onNewClick,
  onAiClick,
  isAiLoading,
}: MarketingToolbarProps) {
  const ctaLabel =
    activeTab === "coupons" ? "New Coupon" : "New Promotion";

  return (
    <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 select-none">
      <MarketingTabs value={activeTab} onChange={onTabChange} />

      <div className="flex items-center gap-2">
        {activeTab === "promotions" && onAiClick && (
          <button
            type="button"
            onClick={onAiClick}
            disabled={isAiLoading}
            title="Generate with AI"
            className="h-[42px] px-3.5 rounded-[14px] border border-primary/30 bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            <Sparkles size={18} className={`${isAiLoading ? "animate-spin" : "animate-pulse"}`} />
          </button>
        )}
        <button
          type="button"
          onClick={onNewClick}
          className="h-[42px] px-5 rounded-[14px] bg-primary text-white text-[15px] font-semibold flex items-center gap-2 hover:brightness-[1.04] hover:translate-y-[-1px] transition-all duration-200 cursor-pointer"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>{ctaLabel}</span>
        </button>
      </div>
    </div>
  );
}
