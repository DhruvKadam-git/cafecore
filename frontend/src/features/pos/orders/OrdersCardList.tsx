"use client";

import { ChevronRight } from "lucide-react";
import { POSOrder } from "@/lib/pos-order-types";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrdersCardListProps {
  orders: POSOrder[];
  onSelectOrder: (order: POSOrder) => void;
}

export function OrdersCardList({ orders, onSelectOrder }: OrdersCardListProps) {
  if (orders.length === 0) {
    return (
      <div className="sm:hidden py-16 text-center text-text-muted text-[14px] font-semibold">
        No orders match your search or filter.
      </div>
    );
  }

  return (
    <div className="sm:hidden flex flex-col gap-3">
      {orders.map((order) => (
        <button
          key={order.id}
          type="button"
          onClick={() => onSelectOrder(order)}
          className="w-full text-left bg-background border border-border-custom rounded-[18px] p-4 hover:bg-surface transition-colors duration-200 theme-transition"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[18px] font-semibold text-primary">{order.orderNumber}</p>
              <p className="text-[16px] font-medium text-text-heading mt-1 truncate">{order.customer}</p>
              <p className="text-[13px] text-text-muted mt-1">
                {order.date} · {order.time}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className="text-[18px] font-bold text-text-heading">${order.amount.toFixed(2)}</span>
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <ChevronRight size={18} className="text-text-muted" />
          </div>
        </button>
      ))}
    </div>
  );
}
