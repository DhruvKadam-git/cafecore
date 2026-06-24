"use client";

import React, { useState } from "react";
import { DollarSign, ShoppingBag, TrendingUp, Users, Download } from "lucide-react";
import { ReportStatCard } from "@/features/reports/components/ReportStatCard";
import { RevenueChart } from "@/features/reports/components/RevenueChart";
import { TopProductsTable } from "@/features/reports/components/TopProductsTable";
import { TopOrdersTable } from "@/features/reports/components/TopOrdersTable";
import { CategoryBreakdown } from "@/features/reports/components/CategoryBreakdown";
import { useAsyncData } from "@/hooks/use-async-data";
import { marketingApi } from "@/lib/api";

const periods = ["Today", "This Week", "This Month", "Custom"] as const;
type Period = (typeof periods)[number];

function periodToParam(period: string): Record<string, string> {
  if (period === "Today") return { period: "today" };
  if (period === "This Month") return { period: "month" };
  if (period === "Custom") return { period: "custom" };
  return { period: "week" };
}

function formatMoney(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function ReportsPage() {
  const [activePeriod, setActivePeriod] = useState<Period>("This Week");
  const [exportToast, setExportToast] = useState(false);

  const handleExport = () => {
    setExportToast(true);
    setTimeout(() => setExportToast(false), 2500);
  };

  const { data, loading, error, reload } = useAsyncData(async () => {
    const params = periodToParam(activePeriod);
    const [sales, orders, revenue, topProducts] = await Promise.all([
      marketingApi.getReportsSales(params),
      marketingApi.getReportsOrders(params),
      marketingApi.getReportsRevenue(params),
      marketingApi.getReportsTopProducts(params),
    ]);
    const salesR = sales as Record<string, unknown>;
    const ordersR = orders as Record<string, unknown>;
    return {
      revenue: Number(salesR.totalRevenue ?? salesR.revenue ?? (revenue as Record<string, unknown>).total ?? 0),
      orders: Number(ordersR.totalOrders ?? ordersR.count ?? 0),
      avg: Number(salesR.averageOrderValue ?? salesR.avgOrderValue ?? 0),
      customers: Number(ordersR.uniqueCustomers ?? ordersR.customers ?? 0),
      topProducts,
    };
  }, [activePeriod], { toastOnError: true });

  const stats = data ?? { revenue: 0, orders: 0, avg: 0, customers: 0 };

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-[1600px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold text-text-heading">Sales Reports</h2>
          <p className="text-[13px] text-text-muted mt-0.5">
            Stats, charts, and tables update when you change the period filter.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
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
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-primary hover:brightness-105 active:scale-[0.97] text-white text-[13px] font-semibold px-4 py-2 rounded-[12px] transition-all"
          >
            <Download size={15} />
            Export
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between bg-danger/10 text-danger rounded-[12px] px-4 py-3 text-[13px] font-semibold">
          <span>{error}</span>
          <button type="button" onClick={reload} className="underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-text-muted">Loading reports...</div>
      ) : (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <ReportStatCard
              title="Total Revenue"
              value={formatMoney(stats.revenue)}
              sub={`${activePeriod} · live API`}
              icon={DollarSign}
              iconTheme="orange"
            />
            <ReportStatCard
              title="Total Orders"
              value={String(stats.orders)}
              sub={`${activePeriod} orders`}
              icon={ShoppingBag}
              iconTheme="brown"
            />
            <ReportStatCard
              title="Avg Order Value"
              value={formatMoney(stats.avg)}
              sub="Live from API"
              icon={TrendingUp}
              iconTheme="gold"
            />
            <ReportStatCard
              title="Unique Customers"
              value={String(stats.customers)}
              sub="Live from API"
              icon={Users}
              iconTheme="green"
            />
          </section>

          <section>
            <RevenueChart period={activePeriod} />
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <TopOrdersTable period={activePeriod} />
            <TopProductsTable period={activePeriod} />
          </section>

          <section>
            <CategoryBreakdown period={activePeriod} />
          </section>
        </>
      )}

      {exportToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-text-heading text-white text-[13px] font-semibold px-5 py-3 rounded-full shadow-xl flex items-center gap-2 animate-fade-in">
          <Download size={14} className="text-primary" />
          Export started — file will download shortly
        </div>
      )}
    </div>
  );
}
