export type MarketingTab = "coupons" | "promotions";

export type CouponDiscountType = "percentage" | "fixed_amount";

export type PromotionScope = "product" | "order";

export type PromotionDiscountType = "percentage" | "fixed_amount";

export interface Coupon {
  id: string;
  code: string;
  discountType: CouponDiscountType;
  value: number;
  active: boolean;
}

export interface Promotion {
  id: string;
  name: string;
  scope: PromotionScope;
  productId?: string;
  productName?: string;
  minQuantity?: number;
  minOrderAmount?: number;
  discountType: PromotionDiscountType;
  discountValue: number;
  isActive: boolean;
}

export type CouponFormData = Pick<
  Coupon,
  "code" | "discountType" | "value" | "active"
> & { id?: string };

export type PromotionFormData = Omit<Promotion, "id" | "productName" | "isActive"> & {
  id?: string;
};

export function formatCouponDiscountType(type: CouponDiscountType): string {
  return type === "percentage" ? "Percentage" : "Fixed amount";
}

export function formatCouponValue(type: CouponDiscountType, value: number): string {
  return type === "percentage" ? `${value}%` : `$${value.toFixed(2)}`;
}

export function formatPromotionTrigger(
  promo: Pick<Promotion, "scope" | "minQuantity" | "minOrderAmount">
): string {
  if (promo.scope === "product" && promo.minQuantity) {
    return `Min Qty: ${promo.minQuantity}`;
  }
  if (promo.minOrderAmount) {
    return `Min Amount: $${promo.minOrderAmount}`;
  }
  return "—";
}

export function formatPromotionDiscount(
  type: PromotionDiscountType,
  value: number
): string {
  return type === "percentage" ? `${value}% off` : `$${value} off`;
}
