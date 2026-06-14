"use client";

import React, { useEffect, useRef, useState } from "react";

interface DataPoint { label: string; revenue: number; orders: number; }

const weeklyData: DataPoint[] = [
  { label: "Mon", revenue: 1240, orders: 48 },
  { label: "Tue", revenue: 1580, orders: 63 },
  { label: "Wed", revenue: 1350, orders: 54 },
  { label: "Thu", revenue: 1900, orders: 76 },
  { label: "Fri", revenue: 2200, orders: 88 },
  { label: "Sat", revenue: 2050, orders: 82 },
  { label: "Sun", revenue: 1680, orders: 67 },
];

const monthlyData: DataPoint[] = [
  { label: "Week 1", revenue: 8200, orders: 328 },
  { label: "Week 2", revenue: 9400, orders: 376 },
  { label: "Week 3", revenue: 8800, orders: 352 },
  { label: "Week 4", revenue: 10200, orders: 408 },
];

type Mode = "weekly" | "monthly";
type Metric = "revenue" | "orders";

// Map period filter → chart mode
const periodToMode: Record<string, Mode> = {
  "Today":      "weekly",
  "This Week":  "weekly",
  "This Month": "monthly",
  "Custom":     "monthly",
};

const SVG_H = 200;
const P_L = 42;
const P_R = 8;
const P_T = 16;
const P_B = 28;

export function RevenueChart({ period = "This Week" }: { period?: string }) {
  const [metric, setMetric] = useState<Metric>("revenue");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [svgW, setSvgW] = useState(620);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync mode with the external period filter
  const mode: Mode = periodToMode[period] ?? "weekly";

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      const width = el.getBoundingClientRect().width;
      if (width > 0) setSvgW(width);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const data = mode === "weekly" ? weeklyData : monthlyData;
  const values = data.map((d) => (metric === "revenue" ? d.revenue : d.orders));
  const maxVal = Math.max(...values);

  const cW = svgW - P_L - P_R;
  const cH = SVG_H - P_T - P_B;

  const getX = (i: number) => P_L + (i / (data.length - 1)) * cW;
  const getY = (v: number) => P_T + (1 - v / maxVal) * cH;

  const pts: [number, number][] = values.map((v, i) => [getX(i), getY(v)]);

  const path = pts.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt[0]} ${pt[1]}`;
    const prev = arr[i - 1];
    const cp1x = prev[0] + (pt[0] - prev[0]) / 3;
    const cp2x = prev[0] + (2 * (pt[0] - prev[0])) / 3;
    return `${acc} C ${cp1x} ${prev[1]}, ${cp2x} ${pt[1]}, ${pt[0]} ${pt[1]}`;
  }, "");

  const areaPath =
    path +
    ` L ${pts[pts.length - 1][0]} ${P_T + cH} L ${pts[0][0]} ${P_T + cH} Z`;

  const yTicks = [
    0,
    Math.round(maxVal * 0.25),
    Math.round(maxVal * 0.5),
    Math.round(maxVal * 0.75),
    maxVal,
  ];

  const fmt = (v: number) =>
    metric === "revenue"
      ? `$${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v}`
      : `${v}`;

  return (
    <div className="bg-surface border border-border-custom rounded-[20px] px-4 py-6 hover:-translate-y-0.5 transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] theme-transition">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h3 className="text-[18px] font-bold text-text-heading">Revenue Trend</h3>
        <div className="flex items-center gap-2">
          <div className="flex bg-surface rounded-[12px] p-1 gap-1 theme-transition">
            {(["revenue", "orders"] as Metric[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMetric(m)}
                className={`px-3 py-1 rounded-[10px] text-[13px] font-semibold transition-all capitalize ${metric === m ? "bg-white text-primary shadow-sm" : "text-text-muted hover:text-text-body"}`}
              >
                {m}
              </button>
            ))}
          </div>
          <span className="text-[12px] font-semibold text-text-muted px-2 py-1 bg-surface rounded-[10px] theme-transition capitalize">
            {period}
          </span>
        </div>
      </div>

      <div ref={containerRef} className="relative w-full">
        <svg
          viewBox={`0 0 ${svgW} ${SVG_H}`}
          className="w-full h-[200px] overflow-visible"
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={P_L}
                y1={getY(tick)}
                x2={svgW - P_R}
                y2={getY(tick)}
                stroke="var(--border-color)"
                strokeWidth={0.75}
                strokeDasharray="4 4"
                opacity={0.5}
              />
              <text
                x={P_L - 6}
                y={getY(tick) + 4}
                textAnchor="end"
                fontSize={10}
                fill="var(--text-muted)"
                fontWeight={600}
              >
                {fmt(tick)}
              </text>
            </g>
          ))}

          {data.map((d, i) => (
            <text
              key={d.label}
              x={getX(i)}
              y={SVG_H - 6}
              textAnchor="middle"
              fontSize={11}
              fill="var(--text-muted)"
              fontWeight={600}
            >
              {d.label}
            </text>
          ))}

          <path d={areaPath} fill="url(#areaGrad)" />
          <path
            d={path}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          {hoveredIdx !== null && (
            <line
              x1={getX(hoveredIdx)}
              y1={P_T}
              x2={getX(hoveredIdx)}
              y2={P_T + cH}
              stroke="var(--border-color)"
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />
          )}

          {pts.map((pt, i) => (
            <circle
              key={i}
              cx={pt[0]}
              cy={pt[1]}
              r={hoveredIdx === i ? 6 : 4}
              fill="var(--primary)"
              stroke="white"
              strokeWidth={2}
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}

          {data.map((_, i) => {
            const segW = cW / Math.max(data.length - 1, 1);
            return (
              <rect
                key={i}
                x={getX(i) - segW / 2}
                y={P_T}
                width={segW}
                height={cH}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {hoveredIdx !== null && (
          <div
            className="absolute top-4 bg-white border border-border-custom rounded-[12px] p-2.5 shadow-md pointer-events-none z-10 text-xs font-semibold text-text-body"
            style={{
              left: `${((getX(hoveredIdx) - P_L) / cW) * 100}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="text-[11px] font-bold text-text-heading mb-1">
              {data[hoveredIdx].label}
            </div>
            <div>Revenue: ${data[hoveredIdx].revenue.toLocaleString()}</div>
            <div>Orders: {data[hoveredIdx].orders}</div>
          </div>
        )}
      </div>
    </div>
  );
}
