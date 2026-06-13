"use client";

import React, { useState } from "react";
import { Minus, Plus, Trash2, Tag, Send, ChefHat } from "lucide-react";
import {
  CartItem,
  COUPON_CODES,
  calculateOrderTotals,
} from "@/lib/pos-order-utils";

export type { CartItem };

interface CartProps {
  items: CartItem[];
  onUpdateQty: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
  onSendToKitchen: () => void;
  onCheckout: () => void;
}

export function Cart({ items, onUpdateQty, onRemove, onSendToKitchen, onCheckout }: CartProps) {
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; value: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [showCoupon, setShowCoupon] = useState(false);

  const { subtotal, tax, discountAmt, total } = calculateOrderTotals(items, appliedCoupon);

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    const val = COUPON_CODES[code];
    if (val !== undefined) {
      setAppliedCoupon({ code, value: val });
      setCouponError("");
      setShowCoupon(false);
      setCouponInput("");
    } else {
      setCouponError("Invalid coupon code");
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface border border-border-custom rounded-[20px] overflow-hidden theme-transition">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border-custom">
        <h3 className="text-[16px] font-bold text-text-heading">Current Order</h3>
        <p className="text-[12px] text-text-muted mt-0.5">{items.length} item{items.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 flex flex-col gap-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-muted py-8">
            <span className="text-3xl mb-2">🛒</span>
            <span className="text-[13px] font-semibold">Cart is empty</span>
            <span className="text-[12px] mt-1">Add products from the left panel</span>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="flex items-center gap-3 bg-surface rounded-[14px] p-3 theme-transition">
              <span className="text-xl">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-text-heading truncate">{item.name}</p>
                <p className="text-[12px] text-primary font-semibold">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => onUpdateQty(item.id, -1)} className="w-6 h-6 rounded-full bg-border-custom hover:bg-border-custom/80 flex items-center justify-center transition-colors">
                  <Minus size={10} className="text-text-heading" />
                </button>
                <span className="text-[13px] font-bold text-text-heading w-5 text-center">{item.quantity}</span>
                <button onClick={() => onUpdateQty(item.id, 1)} className="w-6 h-6 rounded-full bg-primary hover:brightness-105 flex items-center justify-center transition-colors">
                  <Plus size={10} className="text-white" />
                </button>
              </div>
              <span className="text-[13px] font-bold text-text-heading w-14 text-right">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
              <button onClick={() => onRemove(item.id)} className="p-1 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="px-5 py-4 border-t border-border-custom flex flex-col gap-2.5">
        <div className="flex justify-between text-[13px] text-text-muted font-medium">
          <span>Subtotal</span><span className="text-text-body font-semibold">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[13px] text-text-muted font-medium">
          <span>Tax (8%)</span><span className="text-text-body font-semibold">${tax.toFixed(2)}</span>
        </div>
        {appliedCoupon && (
          <div className="flex justify-between text-[13px] font-semibold text-success">
            <span className="flex items-center gap-1"><Tag size={12} /> {appliedCoupon.code}</span>
            <span>-${discountAmt.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-[16px] font-bold text-text-heading border-t border-border-custom pt-2.5 mt-0.5">
          <span>Total</span><span className="text-primary">${total.toFixed(2)}</span>
        </div>

        {/* Coupon */}
        <div>
          {!showCoupon && !appliedCoupon && (
            <button onClick={() => setShowCoupon(true)} className="flex items-center gap-1.5 text-[13px] font-semibold text-text-muted hover:text-primary transition-colors">
              <Tag size={14} /> Apply coupon
            </button>
          )}
          {showCoupon && (
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={couponInput}
                onChange={e => { setCouponInput(e.target.value); setCouponError(""); }}
                placeholder="Enter code"
                className="flex-1 bg-surface border border-border-custom rounded-[10px] px-3 py-2 text-[13px] font-semibold outline-none focus:border-primary transition-colors uppercase theme-transition"
              />
              <button onClick={applyCoupon} className="bg-primary hover:brightness-105 text-white text-[13px] font-semibold px-3 py-2 rounded-[10px] transition-colors">
                Apply
              </button>
            </div>
          )}
          {couponError && <p className="text-[12px] text-danger font-semibold mt-1">{couponError}</p>}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-1">
          <button
            onClick={onSendToKitchen}
            disabled={items.length === 0}
            className="flex-1 flex items-center justify-center gap-2 bg-surface hover:bg-border-custom/30 disabled:opacity-40 disabled:cursor-not-allowed text-text-heading text-[13px] font-bold py-2.5 rounded-[12px] transition-colors theme-transition"
          >
            <ChefHat size={15} /> Kitchen
          </button>
          <button
            onClick={onCheckout}
            disabled={items.length === 0}
            className="flex-1 flex items-center justify-center gap-2 bg-primary hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-bold py-2.5 rounded-[12px] transition-colors"
          >
            <Send size={15} /> Pay ${total.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}
