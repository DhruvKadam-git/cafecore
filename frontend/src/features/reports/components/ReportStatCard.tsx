"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface ReportStatCardProps {
  title: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  iconTheme: "orange" | "green" | "gold" | "brown";
}

const themeStyles = {
  orange: { bg: "bg-primary/10", text: "text-primary" },
  green:  { bg: "bg-success/10", text: "text-success" },
  gold:   { bg: "bg-gold/10", text: "text-gold" },
  brown:  { bg: "bg-sidebar-bg/10", text: "text-sidebar-bg" },
};

export function ReportStatCard({ title, value, sub, icon: Icon, iconTheme }: ReportStatCardProps) {
  const theme = themeStyles[iconTheme];
  return (
    <div className="bg-surface border border-border-custom rounded-[18px] p-5 flex items-center justify-between hover:-translate-y-0.5 transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] theme-transition">
      <div className="flex flex-col gap-1">
        <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider select-none">{title}</span>
        <span className="text-[26px] font-bold text-text-heading leading-none">{value}</span>
        <span className="text-[12px] font-medium text-text-muted">{sub}</span>
      </div>
      <div className={`w-[52px] h-[52px] rounded-[16px] flex items-center justify-center shrink-0 ${theme.bg} ${theme.text}`}>
        <Icon size={22} strokeWidth={1.75} />
      </div>
    </div>
  );
}
