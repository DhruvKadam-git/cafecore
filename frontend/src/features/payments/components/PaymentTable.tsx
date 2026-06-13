"use client";

import React from "react";
import { Pencil, Trash2, GripVertical, Banknote, CreditCard, QrCode } from "lucide-react";
import { PaymentMethod } from "./types";

const typeIconConfig = {
  Cash: { icon: Banknote,    bg: "bg-success/10",      color: "text-success"      },
  Card: { icon: CreditCard,  bg: "bg-sidebar-bg/10",   color: "text-sidebar-bg"   },
  UPI:  { icon: QrCode,      bg: "bg-primary/10",      color: "text-primary"      },
};

const typeBadge: Record<string, string> = {
  Cash: "bg-success/10 text-success",
  Card: "bg-sidebar-bg/10 text-sidebar-bg",
  UPI:  "bg-primary/10 text-primary",
};

interface PaymentTableProps {
  methods: PaymentMethod[];
  onEdit:   (m: PaymentMethod) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export function PaymentTable({ methods, onEdit, onDelete, onToggleActive }: PaymentTableProps) {
  if (methods.length === 0) {
    return (
      <div className="bg-surface border border-border-custom rounded-[20px] flex flex-col items-center justify-center py-16 gap-3 theme-transition">
        <span className="text-4xl">💳</span>
        <p className="text-[15px] font-bold text-text-heading">No payment methods yet</p>
        <p className="text-[13px] text-text-muted">Click &quot;+ New&quot; to add your first payment method.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border-custom rounded-[20px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] theme-transition">
      <div className="grid grid-cols-[32px_1fr_120px_160px_80px_80px] items-center px-5 py-3 bg-surface border-b border-border-custom">
        <span />
        <span className="text-[12px] font-bold text-text-heading uppercase tracking-wider">Payment Method</span>
        <span className="text-[12px] font-bold text-text-heading uppercase tracking-wider">Type</span>
        <span className="text-[12px] font-bold text-text-heading uppercase tracking-wider">ID / Reference</span>
        <span className="text-[12px] font-bold text-text-heading uppercase tracking-wider text-center">Active</span>
        <span className="text-[12px] font-bold text-text-heading uppercase tracking-wider text-center">Action</span>
      </div>

      <div className="divide-y divide-border-custom/60">
        {methods.map(m => (
          <div
            key={m.id}
            className="grid grid-cols-[32px_1fr_120px_160px_80px_80px] items-center px-5 py-4 hover:bg-input/50 transition-colors group theme-transition"
          >
            <div className="flex items-center">
              <GripVertical size={15} className="text-border-custom group-hover:text-text-muted cursor-grab transition-colors" />
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-[10px] border border-border-custom flex items-center justify-center shrink-0 ${typeIconConfig[m.type].bg}`}>
                {(() => { const Icon = typeIconConfig[m.type].icon; return <Icon size={18} strokeWidth={1.75} className={typeIconConfig[m.type].color} />; })()}
              </div>
              <div>
                <p className="text-[14px] font-bold text-text-heading">{m.name}</p>
              </div>
            </div>

            <div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold ${typeBadge[m.type]}`}>
                {m.type}
              </span>
            </div>

            <div>
              {m.type === "UPI" && m.upiId ? (
                <span className="text-[13px] font-mono font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-[8px]">
                  {m.upiId}
                </span>
              ) : (
                <span className="text-[13px] text-text-muted font-medium">—</span>
              )}
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => onToggleActive(m.id)}
                className={`relative inline-flex items-center w-10 h-[22px] rounded-full transition-colors duration-200 shrink-0 ${m.active ? "bg-success" : "bg-border-custom"}`}
              >
                <span className={`absolute left-[3px] w-4 h-4 bg-input rounded-full shadow-sm transition-transform duration-200 ${m.active ? "translate-x-[18px]" : "translate-x-0"}`} />
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5">
              <button
                type="button"
                onClick={() => onEdit(m)}
                className="w-8 h-8 rounded-[9px] flex items-center justify-center bg-surface hover:bg-border-custom text-text-muted hover:text-primary transition-colors"
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(m.id)}
                className="w-8 h-8 rounded-[9px] flex items-center justify-center bg-surface hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
