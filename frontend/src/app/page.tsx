"use client";

import React from "react";
import { DollarSign, ShoppingBag, CreditCard, Coffee } from "lucide-react";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { SalesChart } from "@/features/dashboard/components/SalesChart";
import { CategoryChart } from "@/features/dashboard/components/CategoryChart";
import { ProductsTable } from "@/features/dashboard/components/ProductsTable";
import { OrdersTable } from "@/features/dashboard/components/OrdersTable";
import { useAsyncData } from "@/hooks/use-async-data";
import {
  floorsApi,
  mapOrderToPOSOrder,
  marketingApi,
  ordersApi,
  productsApi,
} from "@/lib/api";

function formatMoney(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Home() {
  const { data, loading, error, reload } = useAsyncData(async () => {
    const [sales, ordersReport, orders, floors, products] = await Promise.all([
      marketingApi.getReportsSales(),
      marketingApi.getReportsOrders(),
      ordersApi.getOrders(),
      floorsApi.getFloorsWithTables(),
      productsApi.getProducts(),
    ]);

    const salesData = sales as Record<string, unknown>;
    const ordersData = ordersReport as Record<string, unknown>;
    const revenue = Number(salesData.totalRevenue ?? salesData.revenue ?? 0);
    const orderCount = Number(ordersData.totalOrders ?? ordersData.count ?? orders.length);
    const avgTicket = orderCount > 0 ? revenue / orderCount : 0;

    let totalTables = 0;
    let occupiedTables = 0;
    for (const floor of floors) {
      for (const table of floor.tables ?? []) {
        totalTables += 1;
        if (table.status?.toUpperCase() !== "AVAILABLE" && table.status?.toUpperCase() !== "FREE") {
          occupiedTables += 1;
        }
      }
    }

    const mappedOrders = orders.slice(0, 5).map(mapOrderToPOSOrder);

    return {
      revenue,
      orderCount,
      avgTicket,
      totalTables,
      occupiedTables,
      recentOrders: mappedOrders,
      productCount: products.length,
    };
  }, [], { toastOnError: true });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-text-muted">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <p className="text-danger font-semibold">{error}</p>
        <button type="button" onClick={reload} className="text-primary font-bold">
          Retry
        </button>
      </div>
    );
  }

  const stats = data ?? {
    revenue: 0,
    orderCount: 0,
    avgTicket: 0,
    totalTables: 0,
    occupiedTables: 0,
    recentOrders: [],
    productCount: 0,
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-[1600px] mx-auto">
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Total Revenue"
          value={formatMoney(stats.revenue)}
          deltaText="Live from API"
          isPositive={true}
          icon={DollarSign}
          iconTheme="orange"
        />
        <StatCard
          title="Total Orders"
          value={`${stats.orderCount} orders`}
          deltaText="Live from API"
          isPositive={true}
          icon={ShoppingBag}
          iconTheme="brown"
        />
        <StatCard
          title="Avg. Ticket Value"
          value={formatMoney(stats.avgTicket)}
          deltaText="Live from API"
          isPositive={true}
          icon={CreditCard}
          iconTheme="gold"
        />
        <StatCard
          title="Active Tables"
          value={`${stats.occupiedTables} / ${stats.totalTables}`}
          deltaText={`${stats.productCount} products`}
          isPositive={true}
          icon={Coffee}
          iconTheme="green"
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 min-w-0">
          <SalesChart />
        </div>
        <div className="min-w-0">
          <CategoryChart />
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <div className="min-w-0">
          <ProductsTable />
        </div>
        <div className="min-w-0">
          <OrdersTable orders={stats.recentOrders} />
        </div>
      </section>
    </div>
  );
}
