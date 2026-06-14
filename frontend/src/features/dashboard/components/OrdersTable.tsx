"use client";

import React from "react";

interface OrderRow {
  id: string;
  table: string;
  staff: string;
  amount: number;
  status: "Paid" | "Draft" | "Cancelled";
}

interface OrdersTableProps {
  orders?: OrderRow[];
  isLoading?: boolean;
}

export function OrdersTable({ orders = [], isLoading = false }: OrdersTableProps) {
  const statusStyles = {
    Paid: "bg-success/10 text-success",
    Draft: "bg-gold/10 text-gold",
    Cancelled: "bg-danger/10 text-danger",
  };

  if (isLoading) {
    return (
      <div className="bg-surface border border-border-custom rounded-[20px] p-6 hover:translate-y-[-2px] transition-all duration-200 shadow-[0_1px_1px_rgba(0,0,0,0.03)] h-[440px] flex items-center justify-center theme-transition">
        <div className="text-text-muted animate-pulse font-semibold">Loading recent orders...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-surface border border-border-custom rounded-[20px] p-6 hover:translate-y-[-2px] transition-all duration-200 shadow-[0_1px_1px_rgba(0,0,0,0.03)] h-[440px] flex flex-col items-center justify-center theme-transition">
        <span className="text-text-muted font-semibold">No recent orders available</span>
        <p className="text-[12px] text-text-muted/60 mt-1">Try check-ins later.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border-custom rounded-[20px] p-6 hover:translate-y-[-2px] transition-all duration-200 shadow-[0_1px_1px_rgba(0,0,0,0.03)] h-[440px] flex flex-col justify-between theme-transition">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[18px] font-bold text-text-heading font-sans">
            Recent Orders
          </h3>
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
              {orders.slice(0, 5).map((row) => (
                <tr
                  key={row.id}
                  className="h-[56px] border-b border-border-custom/60 last:border-0 hover:bg-white/40 transition-colors"
                >
                  <td className="px-4 py-2 text-[14px] font-bold text-primary">
                    {row.id}
                  </td>
                  <td className="px-4 py-2 text-[14px] font-semibold text-text-body font-sans">
                    {row.table}
                  </td>
                  <td className="px-4 py-2 text-[14px] font-semibold text-text-muted truncate max-w-[100px] font-sans">
                    {row.staff}
                  </td>
                  <td className="px-4 py-2 text-[14px] font-bold text-text-heading font-sans">
                    ${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
