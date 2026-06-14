"use client";

import React, { useState } from "react";
import { Plus, CreditCard, CheckCircle, XCircle, Wallet } from "lucide-react";
import { PaymentMethod } from "@/features/payments/components/types";
import { PaymentTable } from "@/features/payments/components/PaymentTable";
import { PaymentForm } from "@/features/payments/components/PaymentForm";

// ── Seed data ─────────────────────────────────────────────────────────────────
const SEED: PaymentMethod[] = [
  { id: "pm1", name: "Cash",          type: "Cash", upiId: "",            upiQrImage: null, active: true  },
  { id: "pm2", name: "Card",          type: "Card", upiId: "",            upiQrImage: null, active: true  },
  { id: "pm3", name: "UPI – Merchant",type: "UPI",  upiId: "cafe@ybl",    upiQrImage: null, active: true  },
];

let idCounter = 10;
const newId = () => `pm${idCounter++}`;

type FormMode = { kind: "add" } | { kind: "edit"; method: PaymentMethod } | null;

export default function PaymentMethodsPage() {
  const [methods,    setMethods]    = useState<PaymentMethod[]>(SEED);
  const [formMode,   setFormMode]   = useState<FormMode>(null);
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null);
  const [toast,      setToast]      = useState<string | null>(null);

  // ── helpers ──────────────────────────────────────────────────────────────────
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const handleSave = (data: Omit<PaymentMethod, "id">) => {
    if (formMode?.kind === "add") {
      setMethods(prev => [...prev, { id: newId(), ...data }]);
      showToast(`"${data.name}" added`);
    } else if (formMode?.kind === "edit") {
      setMethods(prev => prev.map(m => m.id === formMode.method.id ? { ...m, ...data } : m));
      showToast(`"${data.name}" updated`);
    }
    setFormMode(null);
  };

  const handleToggleActive = (id: string) => {
    setMethods(prev => prev.map(m => m.id === id ? { ...m, active: !m.active } : m));
  };

  const confirmDelete = (id: string) => {
    const found = methods.find(m => m.id === id);
    if (found) setDeleteTarget(found);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setMethods(prev => prev.filter(m => m.id !== deleteTarget.id));
    showToast(`"${deleteTarget.name}" removed`);
    setDeleteTarget(null);
    if (formMode?.kind === "edit" && formMode.method.id === deleteTarget.id) setFormMode(null);
  };

  // ── stats ────────────────────────────────────────────────────────────────────
  const totalActive   = methods.filter(m => m.active).length;
  const totalInactive = methods.filter(m => !m.active).length;
  const hasUpi        = methods.some(m => m.type === "UPI" && m.active);

  const stats = [
    { label: "Total Methods",   value: String(methods.length), icon: CreditCard,   bg: "bg-primary/10",      text: "text-primary"      },
    { label: "Active",          value: String(totalActive),    icon: CheckCircle,  bg: "bg-success/10",      text: "text-success"      },
    { label: "Inactive",        value: String(totalInactive),  icon: XCircle,      bg: "bg-sidebar-bg/10",   text: "text-sidebar-bg"   },
    { label: "UPI Configured",  value: hasUpi ? "Yes" : "No",  icon: Wallet,       bg: "bg-gold/10",         text: "text-gold"         },
  ];

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-[1200px] mx-auto">

      {/* ── Top bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-[13px] text-text-muted">
          {methods.length} method{methods.length !== 1 ? "s" : ""} configured
          &nbsp;·&nbsp;
          {totalActive} active at checkout
        </p>
        <button
          type="button"
          onClick={() => setFormMode(formMode?.kind === "add" ? null : { kind: "add" })}
          className={`flex items-center gap-2 text-[14px] font-bold px-5 py-2.5 rounded-[14px] transition-all hover:-translate-y-0.5 shadow-sm active:scale-[0.97] ${
            formMode?.kind === "add"
              ? "bg-surface text-text-heading hover:bg-border-custom"
              : "bg-primary hover:brightness-105 text-white"
          }`}
        >
          <Plus size={16} strokeWidth={2.5} />
          {formMode?.kind === "add" ? "Cancel" : "+ New"}
        </button>
      </div>

      {/* ── Stat cards ── */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-surface border border-border-custom rounded-[18px] p-4 flex items-center gap-4 hover:-translate-y-0.5 transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] theme-transition">
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

      {/* ── Add form (inline, slides in above table) ── */}
      {formMode?.kind === "add" && (
        <PaymentForm
          mode="add"
          existingNames={methods.map(m => m.name)}
          onSave={handleSave}
          onCancel={() => setFormMode(null)}
        />
      )}

      {/* ── Table ── */}
      <PaymentTable
        methods={methods}
        onEdit={m => setFormMode({ kind: "edit", method: m })}
        onDelete={confirmDelete}
        onToggleActive={handleToggleActive}
      />

      {/* ── Edit form (inline, below table) ── */}
      {formMode?.kind === "edit" && (
        <PaymentForm
          mode="edit"
          initial={formMode.method}
          existingNames={methods.map(m => m.name)}
          onSave={handleSave}
          onCancel={() => setFormMode(null)}
        />
      )}

      {/* ── Delete confirm ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border-custom rounded-[22px] w-full max-w-[380px] p-6 shadow-2xl flex flex-col gap-5 theme-transition">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-[16px] bg-danger/10 flex items-center justify-center text-2xl">
                🗑️
              </div>
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-text-heading">Remove Payment Method?</h3>
              <p className="text-[14px] text-text-muted mt-1.5 leading-relaxed">
                Are you sure you want to remove{" "}
                <span className="font-bold text-text-heading">&quot;{deleteTarget.name}&quot;</span>?
                It will no longer appear at checkout.
              </p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)} className="flex-1 bg-surface hover:bg-border-custom text-text-heading text-[14px] font-bold py-3 rounded-[14px] transition-colors">
                Cancel
              </button>
              <button type="button" onClick={handleDelete} className="flex-1 bg-danger hover:brightness-95 text-white text-[14px] font-bold py-3 rounded-[14px] transition-colors">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-text-heading text-white text-[13px] font-semibold px-5 py-3 rounded-full shadow-xl flex items-center gap-2 animate-fade-in">
          <span className="text-primary">✓</span> {toast}
        </div>
      )}
    </div>
  );
}
