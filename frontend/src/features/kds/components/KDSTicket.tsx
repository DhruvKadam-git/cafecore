"use client";

import React from "react";
import { Clock, ChevronRight } from "lucide-react";

export type KDSStage = "to-cook" | "preparing" | "completed";

export interface KDSItem {
  id: number;
  name: string;
  quantity: number;
  done: boolean;
}

export interface KDSOrder {
  id: string;
  table: string;
  stage: KDSStage;
  items: KDSItem[];
  sentAt: string;
  elapsed: number; // minutes
  completedAt?: string;
}

interface KDSTicketProps {
  order: KDSOrder;
  onAdvanceStage: (id: string) => void;
  onToggleItem: (orderId: string, itemId: number) => void;
}

const stageConfig = {
  "to-cook":   { label: "To Cook",   bg: "bg-danger/10", text: "text-danger", dot: "bg-danger" },
  "preparing": { label: "Preparing", bg: "bg-gold/10", text: "text-gold", dot: "bg-gold" },
  "completed": { label: "Completed", bg: "bg-success/10", text: "text-success", dot: "bg-success" },
};

const urgencyColor = (elapsed: number) => {
  if (elapsed >= 15) return "border-danger";
  if (elapsed >= 8)  return "border-gold";
  return "border-border-custom";
};

export function KDSTicket({ order, onAdvanceStage, onToggleItem }: KDSTicketProps) {
  const stage = stageConfig[order.stage];
  const allDone = order.items.every(i => i.done);

  return (
    <div className={`bg-surface border-2 ${urgencyColor(order.elapsed)} rounded-[20px] flex flex-col overflow-hidden hover:-translate-y-0.5 transition-all duration-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)]`}>
      {/* Ticket Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border-custom theme-transition">
        <div className="flex items-center gap-2">
          <span className="text-[16px] font-bold text-text-heading">{order.id}</span>
          <span className="text-[12px] font-semibold text-text-muted bg-white border border-border-custom px-2 py-0.5 rounded-full">
            {order.table}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${stage.bg} ${stage.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${stage.dot} ${order.stage !== "completed" ? "animate-pulse" : ""}`} />
            {stage.label}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 px-4 py-3 flex flex-col gap-2">
        {order.items.map(item => (
          <button
            key={item.id}
            onClick={() => onToggleItem(order.id, item.id)}
            className={`flex items-center gap-3 py-2 px-3 rounded-[12px] text-left transition-all hover:bg-white/50 ${
              item.done ? "opacity-50" : ""
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
              item.done ? "border-success bg-success" : "border-border-custom"
            }`}>
              {item.done && <span className="text-white text-[10px]">✓</span>}
            </div>
            <span className={`flex-1 text-[14px] font-semibold text-text-heading ${item.done ? "line-through text-text-muted" : ""}`}>
              {item.name}
            </span>
            <span className={`text-[13px] font-bold shrink-0 ${item.done ? "text-text-muted" : "text-primary"}`}>
              ×{item.quantity}
            </span>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border-custom flex items-center justify-between">
        {order.stage === "completed" ? (
          <div className="flex items-center gap-1 text-[12px] font-semibold text-success">
            <Clock size={12} />
            Completed at {order.completedAt || order.sentAt}
          </div>
        ) : (
          <div className={`flex items-center gap-1 text-[12px] font-semibold ${order.elapsed >= 15 ? "text-danger" : order.elapsed >= 8 ? "text-gold" : "text-text-muted"}`}>
            <Clock size={12} />
            {order.elapsed}m ago
          </div>
        )}
        {order.stage !== "completed" && (
          <button
            onClick={() => onAdvanceStage(order.id)}
            className={`flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-[10px] transition-all ${
              allDone || order.stage === "to-cook"
                ? "bg-primary hover:brightness-105 text-white"
                : "bg-surface hover:bg-border-custom/30 text-text-heading"
            }`}
          >
            {order.stage === "to-cook" ? "Start" : "Ready"}
            <ChevronRight size={13} />
          </button>
        )}
        {order.stage === "completed" && (
          <span className="text-[12px] font-bold text-success">✓ Done</span>
        )}
      </div>
    </div>
  );
}
