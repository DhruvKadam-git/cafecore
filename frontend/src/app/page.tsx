"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, ShoppingBag, CreditCard, Coffee } from "lucide-react";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { SalesChart } from "@/features/dashboard/components/SalesChart";
import { CategoryChart } from "@/features/dashboard/components/CategoryChart";
import { ProductsTable } from "@/features/dashboard/components/ProductsTable";
import { OrdersTable } from "@/features/dashboard/components/OrdersTable";

const formatDateToYYYYMMDD = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // States for DB data
  const [salesData, setSalesData] = useState<any>(null);
  const [tablesData, setTablesData] = useState<any[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  // Auto-login to obtain JWT token
  useEffect(() => {
    async function autoLogin() {
      try {
        const response = await fetch("http://localhost:3000/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "admin@cafe.com",
            password: "Admin@123",
          }),
        });
        if (response.ok) {
          const data = await response.json();
          setToken(data.accessToken);
        }
      } catch (err) {
        console.error("Dashboard auto-login error:", err);
      }
    }
    autoLogin();
  }, []);

  // Fetch dashboard stats (last 7 days range)
  useEffect(() => {
    if (!token) return;

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const start = formatDateToYYYYMMDD(sevenDaysAgo);
    const end = formatDateToYYYYMMDD(today);

    async function fetchDashboard() {
      setIsLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [salesRes, trendRes, catsRes, productsRes, ordersRes, tablesRes] = await Promise.all([
          fetch(`http://localhost:3000/reports/sales?startDate=${start}&endDate=${end}`, { headers }),
          fetch(`http://localhost:3000/reports/revenue-trend?startDate=${start}&endDate=${end}`, { headers }),
          fetch(`http://localhost:3000/reports/categories?startDate=${start}&endDate=${end}`, { headers }),
          fetch(`http://localhost:3000/reports/top-products?startDate=${start}&endDate=${end}`, { headers }),
          fetch(`http://localhost:3000/orders?limit=10`, { headers }),
          fetch(`http://localhost:3000/tables`, { headers }),
        ]);

        if (salesRes.ok) setSalesData(await salesRes.json());
        if (trendRes.ok) setRevenueTrend(await trendRes.json());
        if (catsRes.ok) {
          const catReport = await catsRes.json();
          setCategoriesData(catReport.categories || []);
        }
        if (productsRes.ok) setTopProducts(await productsRes.json());
        if (ordersRes.ok) {
          const ordersReport = await ordersRes.json();
          setRecentOrders(ordersReport.data || []);
        }
        if (tablesRes.ok) setTablesData(await tablesRes.json());
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboard();
  }, [token]);

  // Calculate table metrics
  const activeTablesCount = tablesData.filter((t) => t.status !== "AVAILABLE").length;
  const totalTablesCount = tablesData.length;

  // Map category data to CategoryChart structure
  const colors = ["var(--primary)", "var(--sidebar)", "var(--gold)", "var(--success)", "var(--danger)"];
  const mappedCategories = categoriesData.slice(0, 5).map((cat, idx) => ({
    name: cat.name,
    percentage: cat.pct,
    color: colors[idx % colors.length],
    revenue: cat.revenue,
  }));

  // Map product data to ProductsTable structure
  const mappedProducts = topProducts.slice(0, 5).map((p) => ({
    name: p.productName,
    category: p.categoryName,
    units: p.quantity,
    revenue: p.revenue,
  }));

  // Map orders data to OrdersTable structure
  const mappedOrders = recentOrders.slice(0, 5).map((o) => {
    let status: "Paid" | "Draft" | "Cancelled" = "Paid";
    if (o.status === "CANCELLED") status = "Cancelled";
    else if (o.paidAt) status = "Paid";
    else if (o.status === "DRAFT" || o.status === "SENT_TO_KITCHEN" || o.status === "PREPARING") status = "Draft";

    return {
      id: `#${o.orderNumber || o.id.slice(0, 4)}`,
      table: o.table?.tableNumber || `Table ${o.tableId?.slice(0, 3)}`,
      staff: o.createdByUser?.name || "Staff",
      amount: Number(o.grandTotal),
      status,
    };
  });

  // Map trend data to SalesChart structure
  const mappedTrend = revenueTrend.map((t) => ({
    day: t.label,
    sales: t.revenue,
    orders: t.orders,
  }));

  const formatGrowthText = (val: number | undefined) => {
    if (val === undefined) return "Calculating...";
    const prefix = val >= 0 ? "+" : "";
    return `${prefix}${val.toFixed(1)}% this week`;
  };

  return (
    <div className={`flex flex-col gap-6 md:gap-8 max-w-[1600px] mx-auto transition-opacity duration-300 ${isLoading ? "opacity-75" : "opacity-100"}`}>
      {/* 4 KPI Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Total Revenue"
          value={salesData ? `$${salesData.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00"}
          deltaText={formatGrowthText(salesData?.revenueGrowth)}
          isPositive={(salesData?.revenueGrowth || 0) >= 0}
          icon={DollarSign}
          iconTheme="orange"
        />
        <StatCard
          title="Total Orders"
          value={salesData ? `${salesData.totalOrders} orders` : "0 orders"}
          deltaText={formatGrowthText(salesData?.ordersGrowth)}
          isPositive={(salesData?.ordersGrowth || 0) >= 0}
          icon={ShoppingBag}
          iconTheme="brown"
        />
        <StatCard
          title="Avg. Ticket Value"
          value={salesData ? `$${salesData.averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00"}
          deltaText={formatGrowthText(salesData?.aovGrowth)}
          isPositive={(salesData?.aovGrowth || 0) >= 0}
          icon={CreditCard}
          iconTheme="gold"
        />
        <StatCard
          title="Active Tables"
          value={totalTablesCount > 0 ? `${activeTablesCount} / ${totalTablesCount}` : "0 / 0"}
          deltaText={totalTablesCount > 0 ? `${totalTablesCount - activeTablesCount} tables available` : "0 tables available"}
          isPositive={totalTablesCount - activeTablesCount > 0}
          icon={Coffee}
          iconTheme="green"
        />
      </section>

      {/* Charts / Analytics Section (2fr 1fr Grid) */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 min-w-0">
          <SalesChart data={mappedTrend} isLoading={isLoading} />
        </div>
        <div className="min-w-0">
          <CategoryChart categories={mappedCategories} totalRevenue={salesData?.totalRevenue || 0} isLoading={isLoading} />
        </div>
      </section>

      {/* Tables Section (1fr 1fr Grid) */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <div className="min-w-0">
          <ProductsTable products={mappedProducts} isLoading={isLoading} />
        </div>
        <div className="min-w-0">
          <OrdersTable orders={mappedOrders} isLoading={isLoading} />
        </div>
      </section>
    </div>
  );
}
