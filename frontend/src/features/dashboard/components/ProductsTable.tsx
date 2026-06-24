"use client";

import React from "react";

interface ProductRow {
  name: string;
  category: string;
  units: number;
  revenue: string;
}

const productsData: ProductRow[] = [
  { name: "Flat White", category: "Espresso", units: 312, revenue: "$1,716" },
  { name: "Nitro Cold Brew", category: "Cold Brew", units: 248, revenue: "$1,612" },
  { name: "Butter Croissant", category: "Pastries", units: 430, revenue: "$1,935" },
  { name: "Avocado Toast", category: "Sandwiches", units: 198, revenue: "$1,782" },
  { name: "Oat Milk Latte", category: "Espresso", units: 276, revenue: "$1,656" },
];

export function ProductsTable() {
  return (
    <div className="bg-surface border border-border-custom rounded-[20px] p-6 hover:translate-y-[-2px] transition-all duration-200 shadow-[0_1px_1px_rgba(0,0,0,0.03)] h-[440px] flex flex-col justify-between theme-transition">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[18px] font-bold text-text-heading font-sans">
            Top Products
          </h3>
          <button className="text-[13px] font-semibold text-text-muted hover:text-primary transition-colors bg-surface px-3.5 py-1.5 rounded-[12px] cursor-pointer select-none theme-transition">
            View All
          </button>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left font-sans min-w-[400px]">
            <thead>
              <tr className="bg-surface rounded-xl overflow-hidden theme-transition">
                <th className="px-4 py-3 text-[13px] font-bold text-text-heading rounded-l-[14px]">
                  Product
                </th>
                <th className="px-4 py-3 text-[13px] font-bold text-text-heading">
                  Category
                </th>
                <th className="px-4 py-3 text-[13px] font-bold text-text-heading">
                  Units
                </th>
                <th className="px-4 py-3 text-[13px] font-bold text-text-heading rounded-r-[14px] text-right">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {productsData.map((row) => (
                <tr
                  key={row.name}
                  className="h-[56px] border-b border-border-custom/60 last:border-0 hover:bg-white/40 transition-colors"
                >
                  <td className="px-4 py-2 text-[14px] font-bold text-text-heading">
                    {row.name}
                  </td>
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-surface text-text-body text-[12px] font-semibold select-none border border-border-custom/30 theme-transition">
                      {row.category}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-[14px] font-semibold text-text-body">
                    {row.units}
                  </td>
                  <td className="px-4 py-2 text-[14px] font-bold text-success text-right">
                    {row.revenue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
