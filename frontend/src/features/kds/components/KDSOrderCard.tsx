"use client";

import React from "react";
import {
  ArrowRight,
  ChefHat,
  Check,
  AlertTriangle,
  Circle,
  CheckCircle2,
  GripVertical,
} from "lucide-react";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { KDSOrder, KDSStage, getTimerUrgency } from "@/lib/kds-types";
import { KDSStatusBadge } from "./KDSStatusBadge";
import { KDSTimerBadge } from "./KDSTimerBadge";

interface KDSOrderCardProps {
  order: KDSOrder;
  onAdvanceStage: (id: string) => void;
  onDismiss: (id: string) => void;
  onToggleItem: (orderId: string, itemId: number) => void;
  showDragHandle?: boolean;
  isDragging?: boolean;
  dragHandleListeners?: SyntheticListenerMap;
  dragHandleAttributes?: DraggableAttributes;
  setDragHandleRef?: (element: HTMLElement | null) => void;
  isKanban?: boolean;
}

const topBarByStage: Record<KDSStage, string> = {
  "to-cook": "bg-kds-amber",
  preparing: "bg-kds-orange",
  ready: "bg-kds-green",
};

const glowByStage: Record<KDSStage, string> = {
  "to-cook": "shadow-[0_4px_24px_var(--kds-glow-amber)]",
  preparing: "shadow-[0_4px_24px_var(--kds-glow-orange)]",
  ready: "shadow-[0_4px_24px_var(--kds-glow-green)]",
};

const actionConfig: Record<
  KDSStage,
  { label: string; icon: React.ReactNode; className: string }
> = {
  "to-cook": {
    label: "Start Cooking",
    icon: <ChefHat size={18} />,
    className: "bg-kds-amber text-kds-action-primary-text hover:brightness-110",
  },
  preparing: {
    label: "Mark Ready",
    icon: <Check size={18} />,
    className: "bg-kds-orange text-white hover:brightness-110",
  },
  ready: {
    label: "Bump / Dismiss",
    icon: <Check size={18} />,
    className: "bg-kds-green text-white hover:brightness-110",
  },
};

export function KDSOrderCard({
  order,
  onAdvanceStage,
  onDismiss,
  onToggleItem,
  showDragHandle = false,
  isDragging = false,
  dragHandleListeners,
  dragHandleAttributes,
  setDragHandleRef,
  isKanban = false,
}: KDSOrderCardProps) {
  const action = actionConfig[order.stage];
  const urgency = getTimerUrgency(order.elapsed);
  const isOverdue = urgency === "danger";
  const isNew = order.stage === "to-cook" && order.elapsed < 3;

  const handleAction = () => {
    if (order.stage === "ready") {
      onDismiss(order.id);
    } else {
      onAdvanceStage(order.id);
    }
  };

  return (
    <div
      className={`bg-kds-surface rounded-[var(--kds-card-radius)] flex flex-col shrink-0 transition-all duration-200 animate-kds-card-in ${glowByStage[order.stage]} ${
        isOverdue ? "ring-1 ring-kds-danger/40" : ""
      } ${isDragging ? "opacity-50 scale-[1.02] shadow-lg z-50" : ""} ${
        !isKanban ? "hover:-translate-y-0.5" : ""
      }`}
      style={{ boxShadow: `0 4px 20px var(--kds-shadow)` }}
    >
      <div className={`h-1 rounded-t-[var(--kds-card-radius)] ${topBarByStage[order.stage]}`} />

      <div className="px-4 pt-3 pb-2 flex items-start justify-between gap-2 shrink-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <KDSStatusBadge stage={order.stage} isNew={isNew} />
            <KDSTimerBadge elapsed={order.elapsed} />
          </div>
          <h3 className="text-[var(--kds-font-display-size)] font-bold text-kds-text leading-none mt-2 tabular-nums">
            {order.id}
          </h3>
          <p className="text-[var(--kds-font-title-size)] font-semibold text-kds-muted mt-1">
            {order.table} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}
          </p>
        </div>

        {showDragHandle && (
          <button
            type="button"
            ref={setDragHandleRef}
            {...dragHandleListeners}
            {...dragHandleAttributes}
            aria-label={`Drag order ${order.id} to another column`}
            className="kds-focus-ring shrink-0 w-11 h-11 flex items-center justify-center rounded-lg text-kds-muted hover:text-kds-text hover:bg-kds-elevated/80 cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical size={20} aria-hidden />
          </button>
        )}
      </div>

      <div className="flex-none px-4 flex flex-col">
        {order.items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onToggleItem(order.id, item.id)}
            aria-pressed={item.done}
            aria-label={`${item.name}, quantity ${item.quantity}, ${item.done ? "done" : "not done"}`}
            className={`kds-focus-ring flex items-center gap-3 w-full text-left rounded-lg transition-colors hover:bg-kds-elevated/60 ${
              item.done ? "opacity-70" : ""
            }`}
            style={{ minHeight: "var(--kds-item-row-height)" }}
          >
            {item.done ? (
              <CheckCircle2
                size={20}
                className="text-kds-item-done shrink-0 animate-kds-check-in"
                aria-hidden
              />
            ) : (
              <Circle size={20} className="text-kds-muted shrink-0" aria-hidden />
            )}
            <span
              className={`text-[var(--kds-font-body-size)] font-bold shrink-0 tabular-nums ${
                item.done ? "text-kds-item-done" : "text-kds-amber"
              }`}
            >
              ×{item.quantity}
            </span>
            <span
              className={`text-[var(--kds-font-body-size)] font-semibold text-kds-text flex-1 ${
                item.done ? "line-through text-kds-item-done" : ""
              }`}
            >
              {item.name}
            </span>
          </button>
        ))}

        {order.note && (
          <div className="mt-2 mb-2 flex items-start gap-2 rounded-lg bg-kds-note-bg border-l-2 border-kds-amber px-3 py-2">
            <AlertTriangle size={14} className="text-kds-note-text shrink-0 mt-0.5" aria-hidden />
            <p className="text-[var(--kds-font-meta-size)] font-semibold text-kds-note-text">
              {order.note}
            </p>
          </div>
        )}
      </div>

      <div className="p-4 pt-2 shrink-0">
        <button
          type="button"
          onClick={handleAction}
          className={`kds-focus-ring w-full rounded-xl flex items-center justify-center gap-2 text-[15px] font-bold transition-all duration-200 active:scale-[0.98] ${action.className}`}
          style={{ height: "var(--kds-action-height)" }}
        >
          {action.icon}
          {action.label}
          {order.stage === "to-cook" && <ArrowRight size={16} aria-hidden />}
        </button>
      </div>
    </div>
  );
}
