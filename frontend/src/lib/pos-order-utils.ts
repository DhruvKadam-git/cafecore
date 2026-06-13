export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
}

export const TAX_RATE = 0.08;

export const COUPON_CODES: Record<string, number> = {
  BREW10: 0.1,
  CAFE20: 0.2,
  SAVE5: 5,
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
