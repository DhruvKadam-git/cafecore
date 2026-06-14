"use client";

import { useMemo, useState } from "react";
import { MOCK_POS_ORDERS } from "@/lib/mock-pos-orders";
import { POSOrder, POSOrderStatusFilter } from "@/lib/pos-order-types";
import { POSOrdersShell } from "./POSOrdersShell";
import { OrdersPageHeader } from "./OrdersPageHeader";
import { OrdersToolbar } from "./OrdersToolbar";
import { OrdersTable } from "./OrdersTable";
import { OrdersCardList } from "./OrdersCardList";
import { OrderDetailsDrawer } from "./OrderDetailsDrawer";

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

  const filteredOrders = useMemo(
    () => filterOrders(MOCK_POS_ORDERS, search, activeFilter),
    [search, activeFilter]
  );

  return (
    <POSOrdersShell>
      <div className="px-5 md:px-8 py-6 md:py-8 space-y-6">
        <OrdersPageHeader />
        <OrdersToolbar
          search={search}
          onSearchChange={setSearch}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
        {/* Responsive: table on sm+, card list below sm — only one mounted at a time */}
        <div className="hidden sm:block">
          <OrdersTable orders={filteredOrders} onSelectOrder={setSelectedOrder} />
        </div>
        <div className="sm:hidden">
          <OrdersCardList orders={filteredOrders} onSelectOrder={setSelectedOrder} />
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </POSOrdersShell>
  );
}
