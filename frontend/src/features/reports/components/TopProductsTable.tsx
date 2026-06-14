"use client";

import React from "react";

interface ProductRow {
  rank: number;
  name: string;
  category: string;
  qty: number;
  revenue: string;
  trend: "up" | "down" | "flat";
}

// Full dataset — period filters how many rows are shown
const allProducts: ProductRow[] = [
  { rank: 1, name: "Espresso Shot",     category: "Espresso",   qty: 284, revenue: "$852",   trend: "up"   },
  { rank: 2, name: "Cold Brew Classic", category: "Cold Brew",  qty: 211, revenue: "$1,055", trend: "up"   },
  { rank: 3, name: "Croissant",         category: "Pastries",   qty: 198, revenue: "$594",   trend: "flat" },
  { rank: 4, name: "Flat White",        category: "Espresso",   qty: 176, revenue: "$704",   trend: "up"   },
  { rank: 5, name: "Club Sandwich",     category: "Sandwiches", qty: 142, revenue: "$994",   trend: "down" },
  { rank: 6, name: "Matcha Latte",      category: "Tea",        qty: 130, revenue: "$585",   trend: "up"   },
];

const periodLimit: Record<string, number> = {
  "Today": 3, "This Week": 6, "This Month": 6, "Custom": 6,
};

const trendBadge: Record<ProductRow["trend"], string> = {
  up:   "bg-success/10 text-success",
  down: "bg-danger/10 text-danger",
  flat: "bg-surface text-text-muted",
};
const trendLabel: Record<ProductRow["trend"], string> = {
  up: "▲ Up", down: "▼ Down", flat: "— Flat",
};

export function TopProductsTable({ period = "This Week" }: { period?: string }) {
  const rows = allProducts.slice(0, periodLimit[period] ?? 6);

  return (
    <div className="bg-surface border border-border-custom rounded-[20px] p-6 hover:-translate-y-0.5 transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] theme-transition">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[18px] font-bold text-text-heading">Top Products</h3>
        <button className="text-[13px] font-semibold text-text-muted hover:text-primary transition-colors bg-surface px-3.5 py-1.5 rounded-[12px] theme-transition">
          Export XLS
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left min-w-[480px]">
          <thead>
            <tr className="bg-surface theme-transition">
              <th className="px-4 py-3 text-[12px] font-bold text-text-heading rounded-l-[12px] w-10">#</th>
              <th className="px-4 py-3 text-[12px] font-bold text-text-heading">Product</th>
              <th className="px-4 py-3 text-[12px] font-bold text-text-heading">Category</th>
              <th className="px-4 py-3 text-[12px] font-bold text-text-heading text-right">Qty Sold</th>
              <th className="px-4 py-3 text-[12px] font-bold text-text-heading text-right">Revenue</th>
              <th className="px-4 py-3 text-[12px] font-bold text-text-heading rounded-r-[12px] text-right">Trend</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.rank} className="h-[52px] border-b border-border-custom/50 last:border-0 hover:bg-primary/[0.03] transition-colors">
                <td className="px-4 py-2 text-[13px] font-bold text-text-muted">{p.rank}</td>
                <td className="px-4 py-2 text-[14px] font-semibold text-text-heading">{p.name}</td>
                <td className="px-4 py-2 text-[13px] font-medium text-text-muted">{p.category}</td>
                <td className="px-4 py-2 text-[14px] font-bold text-text-heading text-right">{p.qty}</td>
                <td className="px-4 py-2 text-[14px] font-bold text-primary text-right">{p.revenue}</td>
                <td className="px-4 py-2 text-right">
                  <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-bold ${trendBadge[p.trend]}`}>
                    {trendLabel[p.trend]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
