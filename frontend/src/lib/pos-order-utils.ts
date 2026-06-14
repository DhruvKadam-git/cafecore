export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
}

export const TAX_RATE = 0.08;

// Coupon codes — kept in sync with mock-marketing.ts INITIAL_COUPONS
// BREW10 = 10% off, WELCOME5 = $5 off (fixed), VIP20 = 20% off
export const COUPON_CODES: Record<string, number> = {
  BREW10:   0.10,  // 10% — percentage (value < 1)
  WELCOME5: 5,     // $5 flat off — fixed (value ≥ 1)
  VIP20:    0.20,  // 20% — percentage (value < 1)
};

export function calculateOrderTotals(
  items: CartItem[],
  appliedCoupon: { code: string; value: number } | null
) {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = subtotal * TAX_RATE;

  let discountAmt = 0;
  if (appliedCoupon) {
    discountAmt =
      appliedCoupon.value < 1
        ? subtotal * appliedCoupon.value
        : appliedCoupon.value;
  }

  const total = Math.max(0, subtotal + tax - discountAmt);

  return { subtotal, tax, discountAmt, total };
}
