"use client";

import React, { useState } from "react";

interface CategoryItem {
  name: string;
  percentage: number;
  color: string;
  revenue: string;
}

const categories: CategoryItem[] = [
  { name: "Espresso", percentage: 35, color: "var(--primary)", revenue: "$2,958" },
  { name: "Cold Brew", percentage: 20, color: "var(--sidebar)", revenue: "$1,690" },
  { name: "Pastries", percentage: 18, color: "var(--gold)", revenue: "$1,521" },
  { name: "Sandwiches", percentage: 15, color: "var(--success)", revenue: "$1,268" },
  { name: "Tea", percentage: 12, color: "var(--primary)", revenue: "$1,014" },
];

export function CategoryChart() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Layout geometry adjusted to fit h-[440px] card container
  const radius = 80;
  const strokeWidth = 26;
  const circumference = 2 * Math.PI * radius; // Approx 502.65

  return (
    <div className="bg-surface border border-border-custom rounded-[20px] p-6 flex flex-col hover:translate-y-[-2px] transition-all duration-200 shadow-[0_1px_1px_rgba(0,0,0,0.03)] h-[440px] theme-transition">
      <div className="flex items-center justify-between mb-2 shrink-0">
        <h3 className="text-[18px] font-bold text-text-heading font-sans">
          Top Categories
        </h3>
      </div>

      <div className="relative flex-1 min-h-0 flex justify-center items-center">
        <svg
          viewBox="0 0 220 220"
          className="max-h-[200px] max-w-[200px] w-full h-full transform -rotate-90 select-none overflow-visible"
        >
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="transparent"
            stroke="var(--surface)"
            strokeWidth={strokeWidth}
          />

          {categories.map((cat, idx) => {
            const strokeDash = (cat.percentage * circumference) / 100;
            const prevPercentageSum = categories.slice(0, idx).reduce((sum, c) => sum + c.percentage, 0);
            const strokeOffset = circumference - (prevPercentageSum * circumference) / 100;

            const isHovered = hoveredIdx === idx;

            return (
              <circle
                key={cat.name}
                cx="110"
                cy="110"
                r={radius}
                fill="transparent"
                stroke={cat.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
                strokeDashoffset={strokeOffset}
                strokeLinecap="butt"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none font-sans">
          <span className="text-[13px] font-semibold text-text-muted uppercase tracking-wider">
            {hoveredIdx !== null ? categories[hoveredIdx].name : "Total Sales"}
          </span>
          <span className="text-[24px] font-bold text-text-heading mt-0.5 leading-none">
            {hoveredIdx !== null ? categories[hoveredIdx].percentage + "%" : "$8,452"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 mt-2 shrink-0 select-none">
        {categories.map((cat, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <div
              key={cat.name}
              className={`flex items-center justify-between py-0.5 px-2.5 rounded-xl transition-all duration-200 ${
                isHovered ? "bg-white/80 shadow-sm scale-[1.02]" : "hover:bg-white/40"
              }`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full shrink-0 border border-black/5"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-[14px] font-semibold text-text-body font-sans">
                  {cat.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-medium text-text-muted font-sans">
                  {cat.revenue}
                </span>
                <span className="text-[14px] font-bold text-text-heading font-sans w-8 text-right">
                  {cat.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
