"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  deltaText: string;
  isPositive: boolean;
  icon: LucideIcon;
  iconTheme: "orange" | "green" | "gold" | "brown";
}

export function StatCard({
  title,
  value,
  deltaText,
  isPositive,
  icon: Icon,
  iconTheme,
}: StatCardProps) {
  const themeStyles = {
    orange: {
      bg: "bg-primary/10",
      text: "text-primary",
    },
    green: {
      bg: "bg-success/10",
      text: "text-success",
    },
    gold: {
      bg: "bg-gold/10",
      text: "text-gold",
    },
    brown: {
      bg: "bg-sidebar-bg/10",
      text: "text-sidebar-bg",
    },
  };

  const selectedTheme = themeStyles[iconTheme];

  return (
    <div className="h-[110px] bg-surface border border-border-custom rounded-[18px] p-4 flex items-center justify-between hover:translate-y-[-2px] transition-all duration-200 shadow-[0_1px_1px_rgba(0,0,0,0.03)] theme-transition">
      <div className="flex flex-col justify-between h-full py-1">
        <span className="text-[13px] font-semibold text-text-muted font-sans select-none uppercase tracking-wider">
          {title}
        </span>
        <span className="text-[26px] sm:text-[28px] font-bold text-text-heading leading-none font-sans mt-0.5">
          {value}
        </span>
        <span
          className={`text-[12px] font-semibold mt-1 font-sans ${
            isPositive ? "text-success" : "text-danger"
          }`}
        >
          {deltaText}
        </span>
      </div>

      <div
        className={`w-[56px] h-[56px] rounded-[18px] flex items-center justify-center shrink-0 ${selectedTheme.bg} ${selectedTheme.text}`}
      >
        <Icon size={24} strokeWidth={1.75} />
      </div>
    </div>
  );
}
