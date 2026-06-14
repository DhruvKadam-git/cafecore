"use client";

import { useMemo, useState } from "react";
import { POSOrder, POSOrderStatusFilter } from "@/lib/pos-order-types";
import { POSOrdersShell } from "./POSOrdersShell";
import { OrdersPageHeader } from "./OrdersPageHeader";
import { OrdersToolbar } from "./OrdersToolbar";
import { OrdersTable } from "./OrdersTable";
import { OrdersCardList } from "./OrdersCardList";
import { OrderDetailsDrawer } from "./OrderDetailsDrawer";
import { useAsyncData } from "@/hooks/use-async-data";
import { mapOrderToPOSOrder, ordersApi } from "@/lib/api";

function filterOrders(
  orders: POSOrder[],
  search: string,
  statusFilter: POSOrderStatusFilter
): POSOrder[] {
  const query = search.trim().toLowerCase();

  return orders.filter((order) => {
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    if (!matchesStatus) return false;
    if (!query) return true;

    const haystack = [
      order.orderNumber,
      order.customer,
      order.date,
      order.time,
      order.employee,
      order.table,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function POSOrdersPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<POSOrderStatusFilter>("All");
  const [selectedOrder, setSelectedOrder] = useState<POSOrder | null>(null);

  const { data, loading, error, reload } = useAsyncData(async () => {
    const apiOrders = await ordersApi.getOrders();
    return apiOrders.map(mapOrderToPOSOrder);
  }, [], { toastOnError: true });

  const orders = data ?? [];

  const filteredOrders = useMemo(
    () => filterOrders(orders, search, activeFilter),
    [orders, search, activeFilter]
  );

  return (
    <POSOrdersShell>
      <div className="px-5 md:px-8 py-6 md:py-8 space-y-6">
        <OrdersPageHeader />
        {error && (
          <div className="flex items-center justify-between bg-danger/10 text-danger rounded-[12px] px-4 py-3 text-[13px] font-semibold">
            <span>{error}</span>
            <button type="button" onClick={reload} className="underline">
              Retry
            </button>
          </div>
        )}
        <OrdersToolbar
          search={search}
          onSearchChange={setSearch}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
        {loading ? (
          <div className="text-center py-16 text-text-muted">Loading orders...</div>
        ) : (
          <>
            <div className="hidden sm:block">
              <OrdersTable orders={filteredOrders} onSelectOrder={setSelectedOrder} />
            </div>
            <div className="sm:hidden">
              <OrdersCardList orders={filteredOrders} onSelectOrder={setSelectedOrder} />
            </div>
          </>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailsDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </POSOrdersShell>
  );
}
