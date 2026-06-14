"use client";

import { ChevronRight } from "lucide-react";
import { POSOrder } from "@/lib/pos-order-types";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrdersTableProps {
  orders: POSOrder[];
  onSelectOrder: (order: POSOrder) => void;
}

export function OrdersTable({ orders, onSelectOrder }: OrdersTableProps) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full border-collapse text-left font-sans min-w-[720px]">
        <thead>
          <tr className="h-12 border-b border-border-custom theme-transition">
            <th className="px-4 py-3 text-[14px] font-semibold text-text-heading w-[11%]">Order #</th>
            <th className="px-4 py-3 text-[14px] font-semibold text-text-heading w-[16%]">Date</th>
            <th className="px-4 py-3 text-[14px] font-semibold text-text-heading w-[19%]">Customer</th>
            <th className="px-4 py-3 text-[14px] font-semibold text-text-heading w-[12%] hidden lg:table-cell">Table</th>
            <th className="px-4 py-3 text-[14px] font-semibold text-text-heading w-[14%] hidden lg:table-cell">Employee</th>
            <th className="px-4 py-3 text-[14px] font-semibold text-text-heading w-[11%]">Amount</th>
            <th className="px-4 py-3 text-[14px] font-semibold text-text-heading w-[11%]">Status</th>
            <th className="px-4 py-3 w-[6%]" />
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              onClick={() => onSelectOrder(order)}
              className="group h-[74px] border-b border-border-custom last:border-0 hover:bg-surface cursor-pointer transition-colors duration-200 theme-transition"
            >
              <td className="px-4 py-3">
                <span className="text-[18px] font-semibold text-primary">{order.orderNumber}</span>
              </td>
              <td className="px-4 py-3">
                <span className="block text-[16px] font-medium text-text-heading">{order.date}</span>
                <span className="block text-[14px] text-text-muted mt-0.5">{order.time}</span>
              </td>
              <td className="px-4 py-3 text-[16px] font-medium text-text-heading">{order.customer}</td>
              <td className="px-4 py-3 text-[16px] font-medium text-text-body hidden lg:table-cell">{order.table}</td>
              <td className="px-4 py-3 text-[16px] font-medium text-text-body hidden lg:table-cell">{order.employee}</td>
              <td className="px-4 py-3 text-[18px] font-bold text-text-heading">
                ${order.amount.toFixed(2)}
              </td>
              <td className="px-4 py-3">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="px-4 py-3 text-right">
                <ChevronRight
                  size={20}
                  className="text-text-muted group-hover:translate-x-0.5 transition-transform duration-200 inline-block"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {orders.length === 0 && (
        <div className="py-16 text-center text-text-muted text-[14px] font-semibold">
          No orders match your search or filter.
        </div>
      )}
    </div>
  );
}
