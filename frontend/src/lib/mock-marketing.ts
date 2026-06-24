import { Coupon, Promotion } from "./marketing-types";

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: "1",
    code: "BREW10",
    discountType: "percentage",
    value: 10,
    active: true,
  },
  {
    id: "2",
    code: "WELCOME5",
    discountType: "fixed_amount",
    value: 5,
    active: true,
  },
  {
    id: "3",
    code: "VIP20",
    discountType: "percentage",
    value: 20,
    active: false,
  },
];

export const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: "1",
    name: "Buy 2 Croissants",
    scope: "product",
    productName: "Croissant",
    minQuantity: 2,
    discountType: "percentage",
    discountValue: 15,
    isActive: true,
  },
  {
    id: "2",
    name: "Weekend Brunch Deal",
    scope: "order",
    minOrderAmount: 30,
    discountType: "fixed_amount",
    discountValue: 5,
    isActive: true,
  },
];
