export type UserRole = "ADMIN" | "EMPLOYEE";
export type UserStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AuthLoginResponse {
  accessToken: string;
  user: ApiUser;
}

export interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination?: ApiPagination;
}

export interface ApiCategory {
  id: string;
  name: string;
  color?: string;
  imageUrl?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiProduct {
  id: string;
  categoryId?: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  price: string | number;
  taxRate?: string | number;
  unitOfMeasure?: string | null;
  preparationTime?: number | null;
  isKdsVisible?: boolean;
  isActive?: boolean;
  category?: ApiCategory;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiPosProduct {
  id: string;
  name: string;
  price: string | number;
  unitOfMeasure?: string | null;
  imageUrl?: string | null;
  isKdsVisible?: boolean;
  category: ApiCategory;
}

export interface ApiOrderItem {
  id?: string;
  productId: string;
  quantity: number;
  unitPrice?: string | number;
  product?: ApiProduct;
}

export interface ApiOrder {
  id: string;
  orderNumber?: string;
  sessionId?: string;
  tableId?: string | null;
  customerId?: string | null;
  createdByUserId?: string;
  status: string;
  subtotal?: string | number;
  taxTotal?: string | number;
  discountTotal?: string | number;
  grandTotal?: string | number;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
  customer?: { id: string; name: string; email?: string; phone?: string | null };
  table?: { id: string; tableNumber?: string; name?: string };
  createdByUser?: ApiUser;
  items?: ApiOrderItem[];
}

export interface ApiTable {
  id: string;
  tableNumber?: string;
  name?: string;
  seats?: number;
  capacity?: number;
  status: string;
  floorId?: string;
  activeOrder?: ApiOrder | null;
}

export interface ApiFloor {
  id: string;
  name: string;
  sortOrder?: number;
  floorNumber?: number;
  isActive?: boolean;
  tables?: ApiTable[];
}

export interface ApiCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  createdAt: string;
  updatedAt?: string;
  orderCount?: number;
  totalSpent?: string | number;
}

export interface ApiSession {
  id: string;
  openedByUserId?: string;
  status: string;
  openingAmount?: string | number;
  closingAmount?: string | number | null;
  totalSales?: string | number;
  totalOrders?: number;
  openedAt?: string;
  closedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  openedByUser?: ApiUser;
  description?: string;
}

export interface ApiSessionDashboardInfo {
  lastSessionDate?: string | null;
  lastClosingAmount?: string | number | null;
  currentSessionStatus?: string | null;
}

export interface ApiKdsTicket {
  id: string;
  orderId: string;
  stage: string;
  createdAt: string;
  updatedAt?: string;
  order?: ApiOrder;
  items?: Array<{
    id: string;
    productId?: string;
    name?: string;
    quantity: number;
    isCompleted?: boolean;
    product?: ApiProduct;
  }>;
}

export interface ApiCoupon {
  id: string;
  code: string;
  description?: string;
  discountType?: string;
  discountValue?: number | string;
  minimumAmount?: number | string | null;
  maxDiscount?: number | string | null;
  validFrom?: string | null;
  validTo?: string | null;
  type?: string;
  value?: number;
  isActive?: boolean;
  discountPercentage?: number;
  minOrderAmount?: number | null;
  expiryDate?: string;
  maxUsageCount?: number;
  currentUsageCount?: number;
}

export interface ApiValidatedCoupon {
  code?: string;
  discountType?: string;
  discountValue?: number;
  type?: string;
  value?: number;
  discountPercentage?: number;
  discountAmount?: number;
  valid?: boolean;
}

export interface ApiPromotion {
  id: string;
  name: string;
  scope: "PRODUCT" | "ORDER" | string;
  discountType?: string;
  discountValue?: number | string;
  minQuantity?: number | string | null;
  minOrderAmount?: number | string | null;
  productId?: string | null;
  isActive?: boolean;
  validFrom?: string | null;
  validTo?: string | null;
  product?: { id: string; name: string };
  description?: string;
  type?: string;
  value?: number;
  startDate?: string;
  endDate?: string;
}

export interface ApiPayment {
  id: string;
  orderId: string;
  amount: number | string;
  method: string;
  status: string;
  createdAt: string;
}
