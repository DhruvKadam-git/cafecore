"use client";

import React, { useState } from "react";
import { X, Banknote, CreditCard, QrCode, CheckCircle } from "lucide-react";
import { useToast } from "@/components/toast/use-toast";
import { toastApiError } from "@/components/toast/toast-utils";
import { marketingApi } from "@/lib/api";
import { CartItem } from "@/lib/pos-order-utils";

type PaymentMethod = "cash" | "card" | "upi";

interface PaymentModalProps {
  total: number;
  orderId: string | null;
  cartItems: CartItem[];
  tableId?: string;
  onEnsureOrder: () => Promise<string>;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentModal({
  total,
  orderId,
  onEnsureOrder,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const toast = useToast();
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [cardRef, setCardRef] = useState("");
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(false);

  const change = method === "cash" && cashReceived ? Math.max(0, parseFloat(cashReceived) - total) : 0;
  const canPay =
    method === "card" ? cardRef.trim().length > 0 :
    method === "cash" ? parseFloat(cashReceived) >= total :
    true;

  const handlePay = async () => {
    if (!canPay || loading) return;
    setLoading(true);
    try {
      const id = orderId ?? (await onEnsureOrder());
      if (method === "cash") {
        await marketingApi.processCashPayment(id, total);
      } else if (method === "card") {
        await marketingApi.processCardPayment(id, total, cardRef);
      } else {
        await marketingApi.processUpiPayment(id, total, "UPI-POS");
      }
      setPaid(true);
      setTimeout(() => onSuccess(), 1800);
    } catch (err) {
      toastApiError(toast, err);
    } finally {
      setLoading(false);
    }
  };

  const methods = [
    { id: "cash" as PaymentMethod, label: "Cash", icon: Banknote },
    { id: "card" as PaymentMethod, label: "Card", icon: CreditCard },
    { id: "upi" as PaymentMethod, label: "UPI QR", icon: QrCode },
  ];

  if (paid) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-surface border border-border-custom rounded-[22px] w-full max-w-[380px] p-8 flex flex-col items-center text-center shadow-2xl theme-transition">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
            <CheckCircle size={36} className="text-success" />
          </div>
          <h3 className="text-[20px] font-bold text-text-heading">Payment Successful</h3>
          <p className="text-text-muted text-[14px] mt-2">Order marked as paid</p>
          <p className="text-[28px] font-bold text-primary mt-3">${total.toFixed(2)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border-custom rounded-[22px] w-full max-w-[440px] shadow-2xl overflow-hidden theme-transition">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-custom">
          <div>
            <h2 className="text-[20px] font-bold text-text-heading">Payment</h2>
            <p className="text-[13px] text-text-muted mt-0.5">
              Total due: <span className="text-primary font-bold">${total.toFixed(2)}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-[12px] hover:bg-surface text-text-muted transition-colors theme-transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div className="grid grid-cols-3 gap-2">
            {methods.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`flex flex-col items-center gap-2 py-3 rounded-[14px] border-2 transition-all font-sans ${
                    method === m.id
                      ? "bg-primary border-primary text-white"
                      : "bg-surface border-border-custom text-text-muted hover:border-primary hover:text-text-heading"
                  }`}
                >
                  <Icon size={20} strokeWidth={1.75} />
                  <span className="text-[12px] font-bold">{m.label}</span>
                </button>
              );
            })}
          </div>

          {method === "cash" && (
            <div className="flex flex-col gap-3">
              <label className="text-[13px] font-semibold text-text-muted">Amount Received</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder="0.00"
                className="bg-surface border border-border-custom rounded-[12px] px-4 py-3 text-[18px] font-bold text-text-heading outline-none focus:border-primary transition-colors theme-transition"
              />
              {cashReceived && parseFloat(cashReceived) >= total && (
                <div className="flex justify-between bg-success/10 rounded-[12px] px-4 py-3">
                  <span className="text-[14px] font-semibold text-success">Change Due</span>
                  <span className="text-[18px] font-bold text-success">${change.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          {method === "card" && (
            <div className="flex flex-col gap-3">
              <label className="text-[13px] font-semibold text-text-muted">Transaction Reference</label>
              <input
                type="text"
                value={cardRef}
                onChange={(e) => setCardRef(e.target.value)}
                placeholder="e.g. TXN-20260613-001"
                className="bg-surface border border-border-custom rounded-[12px] px-4 py-3 text-[14px] font-semibold text-text-heading outline-none focus:border-primary transition-colors theme-transition"
              />
            </div>
          )}

          {method === "upi" && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-[22px] font-bold text-primary">${total.toFixed(2)}</p>
              <p className="text-[12px] text-text-muted">Confirm after customer completes UPI payment</p>
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={!canPay || loading}
            className="w-full bg-primary hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[15px] font-bold py-3.5 rounded-[14px] transition-colors"
          >
            {loading ? "Processing..." : method === "upi" ? "Confirm Payment" : `Charge $${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
