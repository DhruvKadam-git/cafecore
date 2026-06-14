"use client";

import React, { useState } from "react";
import { DollarSign, ShoppingBag, TrendingUp, Users, Download } from "lucide-react";
import { ReportStatCard } from "@/features/reports/components/ReportStatCard";
import { RevenueChart } from "@/features/reports/components/RevenueChart";
import { TopProductsTable } from "@/features/reports/components/TopProductsTable";
import { TopOrdersTable } from "@/features/reports/components/TopOrdersTable";
import { CategoryBreakdown } from "@/features/reports/components/CategoryBreakdown";

const periods = ["Today", "This Week", "This Month", "Custom"] as const;
type Period = (typeof periods)[number];

// KPI data keyed by period — so the cards change when the filter changes
const kpiData: Record<Period, { revenue: string; orders: string; avg: string; customers: string }> = {
  "Today":      { revenue: "$1,240",  orders: "48",  avg: "$25.80", customers: "38"  },
  "This Week":  { revenue: "$8,452",  orders: "342", avg: "$24.70", customers: "218" },
  "This Month": { revenue: "$32,180", orders: "1,284", avg: "$25.06", customers: "740" },
  "Custom":     { revenue: "$8,452",  orders: "342", avg: "$24.70", customers: "218" },
};

export default function ReportsPage() {
  const [activePeriod, setActivePeriod] = useState<Period>("This Week");
  const [exportToast, setExportToast] = useState(false);

  const kpi = kpiData[activePeriod];

  const handleExport = () => {
    // Stub — real export would call backend /reports/export endpoint
    setExportToast(true);
    setTimeout(() => setExportToast(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-[1600px] mx-auto">

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold text-text-heading">Sales Reports</h2>
          <p className="text-[13px] text-text-muted mt-0.5">
            Stats, charts, and tables update when you change the period filter.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Period filter — now wired */}
          <div className="flex bg-surface rounded-[14px] p-1 gap-1 theme-transition border border-border-custom">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => setActivePeriod(p)}
                className={`px-3 py-1.5 rounded-[11px] text-[13px] font-semibold transition-all ${
                  activePeriod === p
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-muted hover:text-text-body"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Export button — now functional (stub) */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-primary hover:brightness-105 active:scale-[0.97] text-white text-[13px] font-semibold px-4 py-2 rounded-[12px] transition-all"
          >
            <Download size={15} />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards — update with period */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <ReportStatCard
          title="Total Revenue"
          value={kpi.revenue}
          sub={activePeriod === "Today" ? "vs yesterday" : `vs last ${activePeriod === "This Week" ? "week" : "month"}`}
          icon={DollarSign}
          iconTheme="orange"
        />
        <ReportStatCard
          title="Total Orders"
          value={kpi.orders}
          sub={`${activePeriod} orders`}
          icon={ShoppingBag}
          iconTheme="brown"
        />
        <ReportStatCard
          title="Avg Order Value"
          value={kpi.avg}
          sub="+4.3% vs prev period"
          icon={TrendingUp}
          iconTheme="gold"
        />
        <ReportStatCard
          title="Unique Customers"
          value={kpi.customers}
          sub="+6.1% vs prev period"
          icon={Users}
          iconTheme="green"
        />
      </section>

      {/* Revenue Chart — period passed in */}
      <section>
        <RevenueChart period={activePeriod} />
      </section>

      {/* Tables Row — period passed in */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TopOrdersTable period={activePeriod} />
        <TopProductsTable period={activePeriod} />
      </section>

      {/* Category Breakdown — period passed in */}
      <section>
        <CategoryBreakdown period={activePeriod} />
      </section>

      {/* Export toast */}
      {exportToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-text-heading text-white text-[13px] font-semibold px-5 py-3 rounded-full shadow-xl flex items-center gap-2 animate-fade-in">
          <Download size={14} className="text-primary" />
          Export started — file will download shortly
        </div>
      )}
    </div>
  );
}
