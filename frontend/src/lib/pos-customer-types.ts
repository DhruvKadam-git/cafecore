export interface POSCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  memberSince: string;
}

export type POSCustomerFormData = Pick<POSCustomer, "name" | "email" | "phone">;
