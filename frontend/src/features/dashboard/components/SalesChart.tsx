"use client";

import React, { useState } from "react";

interface ChartDataPoint {
  day: string;
  sales: number;
  orders: number;
}

const chartData: ChartDataPoint[] = [
  { day: "Jun 7", sales: 1950, orders: 135 },
  { day: "Jun 8", sales: 1350, orders: 98 },
  { day: "Jun 9", sales: 1300, orders: 92 },
  { day: "Jun 10", sales: 1750, orders: 120 },
  { day: "Jun 11", sales: 1780, orders: 118 },
  { day: "Jun 12", sales: 2100, orders: 145 },
  { day: "Jun 13", sales: 450, orders: 40 },
];

export function SalesChart() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Layout geometry adjusted to fit h-[440px] card container
  const svgWidth = 680;
  const svgHeight = 310;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const maxVal = 2200;

  const getX = (index: number) => {
    return paddingLeft + (index / (chartData.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return paddingTop + (1 - val / maxVal) * chartHeight;
  };

  const orangePoints = chartData.map((d, i) => [getX(i), getY(d.sales)] as [number, number]);
  const greenPoints = chartData.map((d, i) => [getX(i), getY(d.orders)] as [number, number]);

  const getBezierPath = (points: [number, number][]) => {
    return points.reduce((acc, point, i, arr) => {
      if (i === 0) return `M ${point[0]} ${point[1]}`;
      const prev = arr[i - 1];
      const cpX1 = prev[0] + (point[0] - prev[0]) / 3;
      const cpY1 = prev[1];
      const cpX2 = prev[0] + (2 * (point[0] - prev[0])) / 3;
      const cpY2 = point[1];
      return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${point[0]} ${point[1]}`;
    }, "");
  };

  const orangePath = getBezierPath(orangePoints);
  const greenPath = getBezierPath(greenPoints);

  const yTicks = [0, 550, 1100, 1650, 2200];

  return (
    <div className="bg-surface border border-border-custom rounded-[20px] p-6 flex flex-col justify-between hover:translate-y-[-2px] transition-all duration-200 shadow-[0_1px_1px_rgba(0,0,0,0.03)] h-[440px] relative theme-transition">
      
      {/* Title & Legend row */}
      <div className="flex items-center justify-between mb-2 select-none">
        <h3 className="text-[18px] font-bold text-text-heading font-sans">
          Sales Trend
        </h3>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded-full bg-primary border-t-2 border-primary"></span>
            <span className="text-text-body">Sales</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded-full bg-success border-t-2 border-success"></span>
            <span className="text-text-body">Orders</span>
          </div>
        </div>
      </div>

      {/* SVG Plot Wrapper */}
      <div className="relative flex-1 w-full">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
        >
          {/* Y ticks & dash lines */}
          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick} className="opacity-40">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="var(--border-color)"
                  strokeWidth={0.75}
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-text-muted text-[11px] font-semibold font-sans"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* X axis day labels */}
          {chartData.map((d, i) => {
            const x = getX(i);
            return (
              <text
                key={d.day}
                x={x}
                y={svgHeight - 8}
                textAnchor="middle"
                className="fill-text-muted text-[11px] font-semibold font-sans select-none"
              >
                {d.day}
              </text>
            );
          })}

          {/* Curves */}
          <path
            d={orangePath}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={3}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
          <path
            d={greenPath}
            fill="none"
            stroke="var(--success)"
            strokeWidth={3}
            strokeLinecap="round"
            className="transition-all duration-300"
          />

          {/* Hover Indicator Vertical Line */}
          {hoveredIdx !== null && (
            <line
              x1={getX(hoveredIdx)}
              y1={paddingTop}
              x2={getX(hoveredIdx)}
              y2={svgHeight - paddingBottom}
              stroke="var(--border-color)"
              strokeWidth={1.5}
              strokeDasharray="2 2"
            />
          )}

          {/* Orange Nodes */}
          {orangePoints.map((pt, i) => (
            <circle
              key={`o-${i}`}
              cx={pt[0]}
              cy={pt[1]}
              r={hoveredIdx === i ? 6 : 4}
              className="fill-primary stroke-white stroke-2 cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}

          {/* Green Nodes */}
          {greenPoints.map((pt, i) => (
            <circle
              key={`g-${i}`}
              cx={pt[0]}
              cy={pt[1]}
              r={hoveredIdx === i ? 6 : 4}
              className="fill-success stroke-white stroke-2 cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}

          {/* Invisible hover regions */}
          {chartData.map((_, i) => {
            const x = getX(i);
            const w = chartWidth / (chartData.length - 1);
            return (
              <rect
                key={`hit-${i}`}
                x={x - w / 2}
                y={paddingTop}
                width={w}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Floating Custom HTML Tooltip */}
        {hoveredIdx !== null && (
          <div
            className="absolute bg-surface border border-border-custom rounded-xl p-3 px-4 shadow-[0_4px_12px_rgba(0,0,0,0.06)] pointer-events-none transition-all duration-150 z-20 font-sans min-w-[120px] theme-transition"
            style={{
              left: `${((getX(hoveredIdx) - paddingLeft) / chartWidth) * 82 + 8}%`,
              top: "60px",
              transform: "translateX(-50%)",
            }}
          >
            <div className="text-[13px] font-bold text-text-heading mb-1.5 font-sans">
              {chartData[hoveredIdx].day}
            </div>
            <div className="flex flex-col gap-1 text-[12px] font-semibold font-sans">
              <div className="text-primary flex items-center justify-between gap-4">
                <span>revenue :</span>
                <span>{chartData[hoveredIdx].sales}</span>
              </div>
              <div className="text-success flex items-center justify-between gap-4">
                <span>orders :</span>
                <span>{chartData[hoveredIdx].orders}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
