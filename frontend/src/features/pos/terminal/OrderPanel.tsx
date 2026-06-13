"use client";

import { useState } from "react";
import { Minus, Plus, Trash2, Tag, Send, ChefHat, UtensilsCrossed } from "lucide-react";
import {
  CartItem,
  COUPON_CODES,
  calculateOrderTotals,
} from "@/lib/pos-order-utils";

interface OrderPanelProps {
  items: CartItem[];
  onUpdateQty: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
  onSendToKitchen: () => void;
  onCheckout: (total: number) => void;
}

export function OrderPanel({
  items,
  onUpdateQty,
  onRemove,
  onSendToKitchen,
  onCheckout,
}: OrderPanelProps) {
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
    <div className="flex flex-col h-full bg-[#F7F3EE] border-l border-[#D8CCC0] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#D7C9BB] shrink-0">
        <h3 className="text-[18px] font-bold text-[#1F1712]">Current Order</h3>
        {items.length > 0 && (
          <p className="text-[12px] text-[#8E7A68] mt-0.5">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pos-terminal-scrollbar px-4 py-3 flex flex-col gap-2 min-h-0">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <UtensilsCrossed size={64} className="text-[#9B8571] opacity-25 mb-4" strokeWidth={1.5} />
            <span className="text-[18px] font-medium text-[#9B8571]">No items added yet</span>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 bg-white/60 rounded-[14px] border border-[#D7C9BB] p-3"
            >
              <span className="text-xl shrink-0">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-[#1F1712] truncate">{item.name}</p>
                <p className="text-[12px] text-[#D17A3B] font-semibold">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onUpdateQty(item.id, -1)}
                  className="w-6 h-6 rounded-full bg-[#E7DFD4] hover:bg-[#D7C9BB] flex items-center justify-center transition-colors"
                >
                  <Minus size={10} className="text-[#1F1712]" />
                </button>
                <span className="text-[13px] font-bold text-[#1F1712] w-5 text-center">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => onUpdateQty(item.id, 1)}
                  className="w-6 h-6 rounded-full bg-[#D17A3B] hover:bg-[#BF6D34] flex items-center justify-center transition-colors"
                >
                  <Plus size={10} className="text-white" />
                </button>
              </div>
              <span className="text-[13px] font-bold text-[#1F1712] w-14 text-right shrink-0">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="p-1 rounded-lg hover:bg-red-50 text-[#8E7A68] hover:text-red-500 transition-colors shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="px-5 py-4 border-t border-[#D7C9BB] flex flex-col gap-2.5 shrink-0">
        <div className="flex justify-between text-[13px] text-[#8E7A68] font-medium">
          <span>Subtotal</span>
          <span className="text-[#1F1712] font-semibold">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[13px] text-[#8E7A68] font-medium">
          <span>Tax (8%)</span>
          <span className="text-[#1F1712] font-semibold">${tax.toFixed(2)}</span>
        </div>
        {appliedCoupon && (
          <div className="flex justify-between text-[13px] font-semibold text-[#769E4D]">
            <span className="flex items-center gap-1">
              <Tag size={12} /> {appliedCoupon.code}
            </span>
            <span>-${discountAmt.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-[16px] font-bold text-[#1F1712] border-t border-[#D7C9BB] pt-2.5 mt-0.5">
          <span>Total</span>
          <span className="text-[#D17A3B]">${total.toFixed(2)}</span>
        </div>

        <div>
          {!showCoupon && !appliedCoupon && (
            <button
              type="button"
              onClick={() => setShowCoupon(true)}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-[#8E7A68] hover:text-[#D17A3B] transition-colors"
            >
              <Tag size={14} /> Apply coupon
            </button>
          )}
          {showCoupon && (
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value);
                  setCouponError("");
                }}
                placeholder="Enter code"
                className="flex-1 bg-white border border-[#D7C9BB] rounded-[10px] px-3 py-2 text-[13px] font-semibold outline-none focus:border-[#D17A3B] transition-colors uppercase"
              />
              <button
                type="button"
                onClick={applyCoupon}
                className="bg-[#D17A3B] hover:bg-[#BF6D34] text-white text-[13px] font-semibold px-3 py-2 rounded-[10px] transition-colors"
              >
                Apply
              </button>
            </div>
          )}
          {couponError && (
            <p className="text-[12px] text-red-500 font-semibold mt-1">{couponError}</p>
          )}
        </div>

        <div className="flex gap-2 mt-1">
          <button
            type="button"
            onClick={onSendToKitchen}
            disabled={items.length === 0}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-[#D7C9BB] hover:bg-[#F5F1EB] disabled:opacity-40 disabled:cursor-not-allowed text-[#1F1712] text-[13px] font-bold py-2.5 rounded-[12px] transition-colors"
          >
            <ChefHat size={15} /> Kitchen
          </button>
          <button
            type="button"
            onClick={() => onCheckout(total)}
            disabled={items.length === 0}
            className="flex-1 flex items-center justify-center gap-2 bg-[#D17A3B] hover:bg-[#BF6D34] disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-bold py-2.5 rounded-[12px] transition-colors"
          >
            <Send size={15} /> Pay ${total.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}
