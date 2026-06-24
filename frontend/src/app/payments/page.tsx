"use client";

import React from "react";
import { CreditCard, CheckCircle, DollarSign, Wallet } from "lucide-react";
import { useAsyncData } from "@/hooks/use-async-data";
import { marketingApi } from "@/lib/api";
import { ApiPayment } from "@/lib/api/types";

function formatMoney(value: number | string): string {
  const n = typeof value === "number" ? value : parseFloat(value) || 0;
  return `$${n.toFixed(2)}`;
}

function methodLabel(method: string): string {
  const m = method.toUpperCase();
  if (m.includes("CASH")) return "Cash";
  if (m.includes("CARD")) return "Card";
  if (m.includes("UPI")) return "UPI";
  return method;
}

export default function PaymentMethodsPage() {
  const { data, loading, error, reload } = useAsyncData(async () => {
    const [payments, stats] = await Promise.all([
      marketingApi.getPayments(),
      marketingApi.getPaymentStats(),
    ]);
    return { payments, stats: stats as Record<string, unknown> };
  }, [], { toastOnError: true });

  const payments = data?.payments ?? [];
  const stats = data?.stats ?? {};

  const totalAmount = payments.reduce((sum, p) => sum + (parseFloat(String(p.amount)) || 0), 0);
  const byMethod = payments.reduce<Record<string, number>>((acc, p) => {
    const key = methodLabel(p.method);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const statCards = [
    { label: "Total Payments", value: String(payments.length), icon: CreditCard, bg: "bg-primary/10", text: "text-primary" },
    { label: "Total Collected", value: formatMoney(Number(stats.totalAmount ?? totalAmount)), icon: DollarSign, bg: "bg-success/10", text: "text-success" },
    { label: "Successful", value: String(payments.filter((p) => p.status?.toUpperCase() === "COMPLETED" || p.status?.toUpperCase() === "SUCCESS").length), icon: CheckCircle, bg: "bg-gold/10", text: "text-gold" },
    { label: "Methods Used", value: String(Object.keys(byMethod).length), icon: Wallet, bg: "bg-sidebar-bg/10", text: "text-sidebar-bg" },
  ];

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-[1200px] mx-auto">
      <div>
        <h2 className="text-[22px] font-bold text-text-heading">Payments</h2>
        <p className="text-[13px] text-text-muted mt-0.5">Transaction history from the live API.</p>
      </div>

      {error && (
        <div className="flex items-center justify-between bg-danger/10 text-danger rounded-[12px] px-4 py-3 text-[13px] font-semibold">
          <span>{error}</span>
          <button type="button" onClick={reload} className="underline">Retry</button>
        </div>
      )}

      <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-surface border border-border-custom rounded-[18px] p-4 flex items-center gap-4 theme-transition">
              <div className={`w-[48px] h-[48px] rounded-[14px] flex items-center justify-center shrink-0 ${s.bg} ${s.text}`}>
                <Icon size={20} strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">{s.label}</p>
                <p className="text-[22px] font-bold text-text-heading leading-none mt-0.5">{s.value}</p>
              </div>
            </div>
          );
        })}
      </section>

      <div className="bg-surface border border-border-custom rounded-[20px] overflow-hidden theme-transition">
        {loading ? (
          <div className="text-center py-16 text-text-muted">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-16 text-text-muted">No payments recorded yet</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-custom bg-surface">
                <th className="px-5 py-3 text-[13px] font-bold text-text-heading">Date</th>
                <th className="px-5 py-3 text-[13px] font-bold text-text-heading">Method</th>
                <th className="px-5 py-3 text-[13px] font-bold text-text-heading">Amount</th>
                <th className="px-5 py-3 text-[13px] font-bold text-text-heading">Status</th>
                <th className="px-5 py-3 text-[13px] font-bold text-text-heading">Order</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p: ApiPayment) => (
                <tr key={p.id} className="border-b border-border-custom/60 last:border-0 hover:bg-white/40">
                  <td className="px-5 py-3 text-[14px] text-text-body">
                    {new Date(p.createdAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-[14px] font-semibold text-text-heading">{methodLabel(p.method)}</td>
                  <td className="px-5 py-3 text-[14px] font-bold text-primary">{formatMoney(p.amount)}</td>
                  <td className="px-5 py-3 text-[14px] text-text-muted">{p.status}</td>
                  <td className="px-5 py-3 text-[14px] text-text-muted font-mono">{p.orderId.slice(0, 8)}…</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
