export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
}

export const TAX_RATE = 0.08;

export interface AppliedCoupon {
  code: string;
  discountType: "percentage" | "fixed_amount";
  value: number;
  discountAmount?: number;
}

export interface OrderTotals {
  subtotal: number;
  tax: number;
  discountAmt: number;
  total: number;
}

export function calculateOrderTotals(
  items: CartItem[],
  appliedCoupon: AppliedCoupon | null,
  serverTotals?: OrderTotals | null
): OrderTotals {
  if (serverTotals) return serverTotals;

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = subtotal * TAX_RATE;

  let discountAmt = 0;
  if (appliedCoupon) {
    discountAmt =
      appliedCoupon.discountAmount ??
      (appliedCoupon.discountType === "percentage"
        ? subtotal * (appliedCoupon.value / 100)
        : appliedCoupon.value);
  }

  const total = Math.max(0, subtotal + tax - discountAmt);

  return { subtotal, tax, discountAmt, total };
}
