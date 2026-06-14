"use client";

import React from "react";

interface OrderRow {
  id: string;
  customer: string;
  table: string;
  items: number;
  amount: string;
  status: "Paid" | "Draft" | "Cancelled";
  date: string;
}

const allOrders: OrderRow[] = [
  { id: "#0844", customer: "Alex M.",   table: "Table 3",  items: 5, amount: "$87.50", status: "Paid",      date: "Jun 13" },
  { id: "#0843", customer: "Sarah L.",  table: "Table 7",  items: 4, amount: "$72.00", status: "Paid",      date: "Jun 13" },
  { id: "#0839", customer: "Daniel K.", table: "Table 11", items: 6, amount: "$68.50", status: "Paid",      date: "Jun 12" },
  { id: "#0835", customer: "Maya P.",   table: "Bar",      items: 3, amount: "$61.00", status: "Paid",      date: "Jun 12" },
  { id: "#0831", customer: "Walk-in",   table: "Table 2",  items: 7, amount: "$55.50", status: "Cancelled", date: "Jun 11" },
];

// Today shows only the most recent 2 orders; everything else shows all 5
const periodLimit: Record<string, number> = {
  "Today": 2, "This Week": 5, "This Month": 5, "Custom": 5,
};

const statusStyles: Record<OrderRow["status"], string> = {
  Paid:      "bg-success/10 text-success",
  Draft:     "bg-gold/10 text-gold",
  Cancelled: "bg-danger/10 text-danger",
};

export function TopOrdersTable({ period = "This Week" }: { period?: string }) {
  const rows = allOrders.slice(0, periodLimit[period] ?? 5);

  return (
    <div className="bg-surface border border-border-custom rounded-[20px] p-6 hover:-translate-y-0.5 transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] theme-transition">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[18px] font-bold text-text-heading">Top Orders</h3>
        <button className="text-[13px] font-semibold text-text-muted hover:text-primary transition-colors bg-surface px-3.5 py-1.5 rounded-[12px] theme-transition">
          Export PDF
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left min-w-[480px]">
          <thead>
            <tr className="bg-surface theme-transition">
              <th className="px-4 py-3 text-[12px] font-bold text-text-heading rounded-l-[12px]">Order</th>
              <th className="px-4 py-3 text-[12px] font-bold text-text-heading">Customer</th>
              <th className="px-4 py-3 text-[12px] font-bold text-text-heading">Table</th>
              <th className="px-4 py-3 text-[12px] font-bold text-text-heading text-center">Items</th>
              <th className="px-4 py-3 text-[12px] font-bold text-text-heading text-right">Amount</th>
              <th className="px-4 py-3 text-[12px] font-bold text-text-heading rounded-r-[12px] text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="h-[52px] border-b border-border-custom/50 last:border-0 hover:bg-primary/[0.03] transition-colors">
                <td className="px-4 py-2">
                  <span className="text-[14px] font-bold text-primary">{o.id}</span>
                  <span className="block text-[11px] text-text-muted font-medium">{o.date}</span>
                </td>
                <td className="px-4 py-2 text-[14px] font-semibold text-text-body">{o.customer}</td>
                <td className="px-4 py-2 text-[13px] font-medium text-text-muted">{o.table}</td>
                <td className="px-4 py-2 text-[14px] font-bold text-text-heading text-center">{o.items}</td>
                <td className="px-4 py-2 text-[14px] font-bold text-text-heading text-right">{o.amount}</td>
                <td className="px-4 py-2 text-right">
                  <span className={`inline-flex items-center justify-center px-2.5 h-[26px] rounded-full text-[12px] font-bold ${statusStyles[o.status]}`}>
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
