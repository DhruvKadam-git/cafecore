"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { POSOrder } from "@/lib/pos-order-types";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrderDetailsDrawerProps {
  order: POSOrder;
  onClose: () => void;
}

export function OrderDetailsDrawer({ order, onClose }: OrderDetailsDrawerProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  const subtotal = order.lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = order.tax ?? 0;
  const total = order.amount;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  return (
    <>
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`fixed right-0 top-0 h-full w-full max-w-[480px] bg-background z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out theme-transition ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-[6px] w-full shrink-0 bg-primary" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-border-custom shrink-0 bg-surface theme-transition">
          <div>
            <p className="text-[13px] font-medium text-text-muted">Order details</p>
            <h2 className="text-[22px] font-bold text-text-heading">{order.orderNumber}</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="w-9 h-9 rounded-[12px] flex items-center justify-center bg-background hover:bg-surface text-text-muted hover:text-text-heading transition-colors theme-transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="flex items-center justify-between">
            <OrderStatusBadge status={order.status} />
            <span className="text-[13px] text-text-muted">
              {order.date} · {order.time}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Customer", value: order.customer },
              { label: "Table", value: order.table },
              { label: "Employee", value: order.employee },
            ].map(({ label, value }) => (
              <div key={label} className="bg-surface border border-border-custom rounded-[14px] p-3 theme-transition">
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">{label}</p>
                <p className="text-[14px] font-semibold text-text-heading mt-1">{value}</p>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-[14px] font-bold text-text-heading mb-3">Line items</h3>
            <div className="flex flex-col gap-2">
              {order.lineItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 bg-surface border border-border-custom rounded-[12px] p-3 theme-transition"
                >
                  {item.emoji && <span className="text-xl shrink-0">{item.emoji}</span>}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-text-heading truncate">{item.name}</p>
                    <p className="text-[12px] text-text-muted">
                      {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <span className="text-[14px] font-bold text-text-heading shrink-0">
                    ${(item.quantity * item.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border-custom rounded-[14px] p-4 space-y-2 theme-transition">
            <div className="flex justify-between text-[13px] text-text-muted">
              <span>Subtotal</span>
              <span className="text-text-heading font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between text-[13px] text-text-muted">
                <span>Tax</span>
                <span className="text-text-heading font-semibold">${tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-[16px] font-bold text-text-heading border-t border-border-custom pt-2">
              <span>Total</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border-custom shrink-0 bg-surface flex gap-3 theme-transition">
          {order.status === "Draft" && (
            <button
              type="button"
              onClick={() => router.push("/pos")}
              className="flex-1 h-[48px] rounded-[14px] bg-primary hover:brightness-95 text-white text-[15px] font-bold transition-all active:scale-[0.98]"
            >
              Reopen Order
            </button>
          )}
          {order.status === "Paid" && (
            <button
              type="button"
              onClick={() => showToast("Receipt preview coming soon")}
              className="flex-1 h-[48px] rounded-[14px] bg-primary hover:brightness-95 text-white text-[15px] font-bold transition-all active:scale-[0.98]"
            >
              View Receipt
            </button>
          )}
          {order.status === "Cancelled" && (
            <button
              type="button"
              disabled
              className="flex-1 h-[48px] rounded-[14px] bg-surface border border-border-custom text-text-muted text-[15px] font-bold cursor-not-allowed"
            >
              Order Cancelled
            </button>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] bg-sidebar-bg text-white text-[13px] font-semibold px-5 py-2.5 rounded-full shadow-lg animate-fade-in">
          {toast}
        </div>
      )}
    </>
  );
}
