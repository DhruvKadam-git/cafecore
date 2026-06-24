"use client";

import React from "react";
import { POSOrder } from "@/lib/pos-order-types";

interface OrdersTableProps {
  orders?: POSOrder[];
}

export function OrdersTable({ orders = [] }: OrdersTableProps) {
  const statusStyles = {
    Paid: "bg-success/10 text-success",
    Draft: "bg-gold/10 text-gold",
    Cancelled: "bg-danger/10 text-danger",
  };

  const rows = orders.length > 0
    ? orders.map((o) => ({
        id: o.orderNumber,
        table: o.table,
        staff: o.employee,
        amount: `$${o.amount.toFixed(2)}`,
        status: o.status,
      }))
    : [];

  return (
    <div className="bg-surface border border-border-custom rounded-[20px] p-6 hover:translate-y-[-2px] transition-all duration-200 shadow-[0_1px_1px_rgba(0,0,0,0.03)] h-[440px] flex flex-col justify-between theme-transition">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[18px] font-bold text-text-heading font-sans">
            Recent Orders
          </h3>
          <button className="text-[13px] font-semibold text-text-muted hover:text-primary transition-colors bg-surface px-3.5 py-1.5 rounded-[12px] cursor-pointer select-none theme-transition">
            Export
          </button>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left font-sans min-w-[420px]">
            <thead>
              <tr className="bg-surface rounded-xl overflow-hidden theme-transition">
                <th className="px-4 py-3 text-[13px] font-bold text-text-heading rounded-l-[14px]">
                  Order
                </th>
                <th className="px-4 py-3 text-[13px] font-bold text-text-heading">
                  Table
                </th>
                <th className="px-4 py-3 text-[13px] font-bold text-text-heading">
                  Staff
                </th>
                <th className="px-4 py-3 text-[13px] font-bold text-text-heading">
                  Amount
                </th>
                <th className="px-4 py-3 text-[13px] font-bold text-text-heading rounded-r-[14px] text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-muted text-[14px]">
                    No recent orders
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                <tr
                  key={row.id}
                  className="h-[56px] border-b border-border-custom/60 last:border-0 hover:bg-white/40 transition-colors"
                >
                  <td className="px-4 py-2 text-[14px] font-bold text-primary">
                    {row.id}
                  </td>
                  <td className="px-4 py-2 text-[14px] font-semibold text-text-body">
                    {row.table}
                  </td>
                  <td className="px-4 py-2 text-[14px] font-semibold text-text-muted">
                    {row.staff}
                  </td>
                  <td className="px-4 py-2 text-[14px] font-bold text-text-heading">
                    {row.amount}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span
                      className={`inline-flex items-center justify-center min-w-[72px] h-[28px] px-3 rounded-full text-[12px] font-bold select-none ${
                        statusStyles[row.status]
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
