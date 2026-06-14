export type POSOrderStatus = "Paid" | "Draft" | "Cancelled";

export interface POSOrderLineItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  emoji?: string;
}

export interface POSOrder {
  id: string;
  orderNumber: string;
  date: string;
  time: string;
  customer: string;
  table: string;
  employee: string;
  amount: number;
  status: POSOrderStatus;
  lineItems: POSOrderLineItem[];
  tax?: number;
  discount?: number;
}

export type POSOrderStatusFilter = "All" | POSOrderStatus;
