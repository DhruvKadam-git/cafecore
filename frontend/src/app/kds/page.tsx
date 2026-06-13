"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  KDSFilterStage,
  KDSOrder,
  KDSStage,
  KDSViewMode,
  sortOrders,
} from "@/lib/kds-types";
import { INITIAL_KDS_ORDERS } from "@/lib/mock-kds-orders";
import { KDSHeader } from "@/features/kds/components/KDSHeader";
import { KDSToolbar } from "@/features/kds/components/KDSToolbar";
import { KDSOrderCard } from "@/features/kds/components/KDSOrderCard";
import { KDSKanbanBoard } from "@/features/kds/components/KDSKanbanBoard";
import { KDSFooter } from "@/features/kds/components/KDSFooter";

const VIEW_STORAGE_KEY = "brewhouse-kds-view";

export default function KDSPage() {
  const [orders, setOrders] = useState<KDSOrder[]>(INITIAL_KDS_ORDERS);
  const [filter, setFilter] = useState<KDSFilterStage>("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<KDSViewMode>("kanban");
  const [announcement, setAnnouncement] = useState("");
  const prevCountRef = useRef(orders.length);

  useEffect(() => {
    try {
      const storedView = localStorage.getItem(VIEW_STORAGE_KEY);
      if (storedView === "kanban" || storedView === "grid") setViewMode(storedView);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (orders.length > prevCountRef.current) {
      setAnnouncement(`New order received. ${orders.length} active orders.`);
    }
    prevCountRef.current = orders.length;
  }, [orders.length]);

  const handleViewModeChange = (mode: KDSViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  };

  const handleFilterChange = (next: KDSFilterStage) => {
    setFilter(next);
    if (next !== "all" && viewMode === "kanban") {
      const el = document.getElementById(`kds-column-${next}`);
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const advanceStage = useCallback((id: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const next: KDSStage =
          o.stage === "to-cook" ? "preparing" : o.stage === "preparing" ? "ready" : "ready";
        setAnnouncement(`Order ${o.id} moved to ${next === "preparing" ? "preparing" : "ready"}.`);
        return { ...o, stage: next };
      })
    );
  }, []);

  const moveOrder = useCallback((id: string, targetStage: KDSStage) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        if (o.stage === targetStage) return o;
        setAnnouncement(
          `Order ${o.id} moved to ${targetStage === "to-cook" ? "to cook" : targetStage}.`
        );
        return { ...o, stage: targetStage };
      })
    );
  }, []);

  const dismissOrder = useCallback((id: string) => {
    setOrders((prev) => {
      const order = prev.find((o) => o.id === id);
      if (order) setAnnouncement(`Order ${order.id} dismissed.`);
      return prev.filter((o) => o.id !== id);
    });
  }, []);

  const toggleItem = (orderId: string, itemId: number) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          items: o.items.map((i) =>
            i.id === itemId ? { ...i, done: !i.done } : i
          ),
        };
      })
    );
  };

  const counts = useMemo(
    () => ({
      "to-cook": orders.filter((o) => o.stage === "to-cook").length,
      preparing: orders.filter((o) => o.stage === "preparing").length,
      ready: orders.filter((o) => o.stage === "ready").length,
    }),
    [orders]
  );

  const avgWaitMinutes = useMemo(() => {
    if (orders.length === 0) return 0;
    return Math.round(orders.reduce((sum, o) => sum + o.elapsed, 0) / orders.length);
  }, [orders]);

  const filtered = useMemo(() => {
    const matched = orders.filter((o) => {
      const matchStage = filter === "all" || o.stage === filter;
      const q = search.toLowerCase();
      const matchSearch =
        q === "" ||
        o.id.toLowerCase().includes(q) ||
        o.table.toLowerCase().includes(q) ||
        o.items.some((i) => i.name.toLowerCase().includes(q));
      return matchStage && matchSearch;
    });
    return sortOrders(matched, "elapsed");
  }, [orders, filter, search]);

  const highlightStage = filter !== "all" ? filter : null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      const focused = filtered[0];
      if (!focused) return;

      if (e.code === "Space") {
        e.preventDefault();
        if (focused.stage === "ready") {
          dismissOrder(focused.id);
        } else {
          advanceStage(focused.id);
        }
      }
      if (e.key === "d" || e.key === "D") {
        if (focused.stage === "ready") {
          dismissOrder(focused.id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filtered, advanceStage, dismissOrder]);

  return (
    <>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      <KDSHeader counts={counts} filter={filter} onFilterChange={handleFilterChange} />
      <KDSToolbar
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={handleFilterChange}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />

      <main
        className={`flex-1 px-7 py-6 min-h-0 ${
          viewMode === "kanban" && filtered.length > 0
            ? "overflow-hidden flex flex-col"
            : "overflow-y-auto no-scrollbar"
        }`}
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-kds-muted gap-3">
            <span className="text-4xl" aria-hidden>🍳</span>
            <p className="text-[16px] font-semibold text-kds-text">Waiting for orders from POS</p>
            <p className="text-[13px] font-medium">No orders match your current filter</p>
          </div>
        ) : viewMode === "kanban" ? (
          <KDSKanbanBoard
            orders={filtered}
            onAdvanceStage={advanceStage}
            onDismiss={dismissOrder}
            onToggleItem={toggleItem}
            onMoveOrder={moveOrder}
            highlightStage={highlightStage}
          />
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
            style={{ gap: "var(--kds-card-gap)" }}
          >
            {filtered.map((order) => (
              <KDSOrderCard
                key={order.id}
                order={order}
                onAdvanceStage={advanceStage}
                onDismiss={dismissOrder}
                onToggleItem={toggleItem}
              />
            ))}
          </div>
        )}
      </main>

      <KDSFooter activeCount={orders.length} avgWaitMinutes={avgWaitMinutes} />
    </>
  );
}
