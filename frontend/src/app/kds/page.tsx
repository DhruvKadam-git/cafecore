"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  KDSFilterStage,
  KDSOrder,
  KDSStage,
  KDSViewMode,
  sortOrders,
} from "@/lib/kds-types";
import { KDSHeader } from "@/features/kds/components/KDSHeader";
import { KDSToolbar } from "@/features/kds/components/KDSToolbar";
import { KDSOrderCard } from "@/features/kds/components/KDSOrderCard";
import { KDSKanbanBoard } from "@/features/kds/components/KDSKanbanBoard";
import { KDSFooter } from "@/features/kds/components/KDSFooter";
import { kdsApi, kdsStageToApi, mapKdsTicketToOrder } from "@/lib/api";
import { useToast } from "@/components/toast/use-toast";
import { toastApiError } from "@/components/toast/toast-utils";
import { getErrorMessage } from "@/lib/api/errors";

const VIEW_STORAGE_KEY = "brewhouse-kds-view";
const POLL_MS = 10000;

export default function KDSPage() {
  const toast = useToast();
  const [orders, setOrders] = useState<KDSOrder[]>([]);
  const [filter, setFilter] = useState<KDSFilterStage>("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<KDSViewMode>("kanban");
  const [announcement, setAnnouncement] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevCountRef = useRef(orders.length);
  const initialLoadRef = useRef(true);

  const loadTickets = useCallback(async () => {
    const toastOnLoadFailure = initialLoadRef.current;
    try {
      const tickets = search.trim()
        ? await kdsApi.searchKdsTickets(search.trim())
        : await kdsApi.getKdsTickets();
      setOrders(tickets.map(mapKdsTicketToOrder));
      setError(null);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      if (toastOnLoadFailure) toast.error(message);
    } finally {
      setLoading(false);
      initialLoadRef.current = false;
    }
  }, [search, toast]);

  useEffect(() => {
    loadTickets();
    const id = setInterval(loadTickets, POLL_MS);
    return () => clearInterval(id);
  }, [loadTickets]);

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

  const advanceStage = useCallback(async (id: string) => {
    const order = orders.find((o) => o.id === id);
    if (!order?.ticketId) return;
    const next: KDSStage =
      order.stage === "to-cook" ? "preparing" : order.stage === "preparing" ? "ready" : "ready";
    try {
      await kdsApi.updateKdsTicketStage(order.ticketId, kdsStageToApi(next));
      toast.success(`Order ${order.id} moved to ${next === "preparing" ? "preparing" : "ready"}`);
      setAnnouncement(`Order ${order.id} moved to ${next === "preparing" ? "preparing" : "ready"}.`);
      await loadTickets();
    } catch (err) {
      toastApiError(toast, err);
    }
  }, [orders, loadTickets, toast]);

  const moveOrder = useCallback(async (id: string, targetStage: KDSStage) => {
    const order = orders.find((o) => o.id === id);
    if (!order?.ticketId || order.stage === targetStage) return;
    try {
      await kdsApi.updateKdsTicketStage(order.ticketId, kdsStageToApi(targetStage));
      toast.success(`Order ${order.id} moved to ${targetStage === "to-cook" ? "to cook" : targetStage}`);
      setAnnouncement(
        `Order ${order.id} moved to ${targetStage === "to-cook" ? "to cook" : targetStage}.`
      );
      await loadTickets();
    } catch (err) {
      toastApiError(toast, err);
    }
  }, [orders, loadTickets, toast]);

  const dismissOrder = useCallback(async (id: string) => {
    const order = orders.find((o) => o.id === id);
    if (!order?.ticketId) return;
    try {
      await kdsApi.updateKdsTicketStage(order.ticketId, "COMPLETED");
      toast.success(`Order ${order.id} dismissed`);
      setAnnouncement(`Order ${order.id} dismissed.`);
      await loadTickets();
    } catch (err) {
      toastApiError(toast, err);
    }
  }, [orders, loadTickets, toast]);

  const toggleItem = async (orderId: string, itemId: number) => {
    const order = orders.find((o) => o.id === orderId);
    const item = order?.items.find((i) => i.id === itemId);
    if (!item?.orderItemId || item.done) return;
    try {
      await kdsApi.completeOrderItem(item.orderItemId);
      toast.success(`Item marked complete`);
      await loadTickets();
    } catch (err) {
      toastApiError(toast, err);
    }
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

      {error && (
        <div className="mx-7 mt-4 flex items-center justify-between bg-danger/10 text-danger rounded-[12px] px-4 py-3 text-[13px] font-semibold">
          <span>{error}</span>
          <button type="button" onClick={() => { setError(null); loadTickets(); }} className="underline">
            Retry
          </button>
        </div>
      )}

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
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-kds-muted gap-3">
            <p className="text-[16px] font-semibold text-kds-text">Loading kitchen tickets...</p>
          </div>
        ) : filtered.length === 0 ? (
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
