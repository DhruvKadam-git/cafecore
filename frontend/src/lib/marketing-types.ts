export type MarketingTab = "coupons" | "promotions";

export type CouponDiscountType = "percentage" | "fixed_amount";

export type PromotionScope = "product" | "order";

export type PromotionTriggerType = "min_qty" | "min_amount";

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
  triggerType: PromotionTriggerType;
  triggerValue: number;
  discountType: PromotionDiscountType;
  discountValue: number;
}

export type CouponFormData = Pick<
  Coupon,
  "code" | "discountType" | "value" | "active"
> & { id?: string };

export type PromotionFormData = Omit<Promotion, "id"> & { id?: string };

export function formatCouponDiscountType(type: CouponDiscountType): string {
  return type === "percentage" ? "Percentage" : "Fixed amount";
}

export function formatCouponValue(type: CouponDiscountType, value: number): string {
  return type === "percentage" ? `${value}%` : `$${value.toFixed(2)}`;
}

export function formatPromotionTrigger(
  type: PromotionTriggerType,
  value: number
): string {
  return type === "min_qty" ? `Min Qty: ${value}` : `Min Amount: $${value}`;
}

export function formatPromotionDiscount(
  type: PromotionDiscountType,
  value: number
): string {
  return type === "percentage" ? `${value}% off` : `$${value} off`;
}
