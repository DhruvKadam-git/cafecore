import { POSOrder, POSOrderLineItem, POSOrderStatus } from "@/lib/pos-order-types";
import { POSCustomer } from "@/lib/pos-customer-types";
import { POSFloor, POSTable, TableStatus } from "@/lib/pos-table-types";
import { POSProduct } from "@/lib/pos-product-types";
import { KDSOrder, KDSStage } from "@/lib/kds-types";
import { Product } from "@/lib/product-types";
import { Category } from "@/features/categories/components/types";
import { POSSessionSummary, SessionStats, SessionTable } from "@/lib/pos-session-types";
import { getAssetUrl } from "@/lib/api/config";
import {
  Coupon,
  CouponDiscountType,
  CouponFormData,
  Promotion,
  PromotionFormData,
} from "@/lib/marketing-types";
import { AppliedCoupon, OrderTotals } from "@/lib/pos-order-utils";
import { User } from "@/features/users/components/types";
import {
  ApiCategory,
  ApiCoupon,
  ApiCustomer,
  ApiFloor,
  ApiKdsTicket,
  ApiOrder,
  ApiPosProduct,
  ApiProduct,
  ApiPromotion,
  ApiSession,
  ApiSessionDashboardInfo,
  ApiTable,
  ApiUser,
} from "@/lib/api/types";

function toNumber(value: string | number | undefined | null): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : parseFloat(value) || 0;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function mapOrderStatus(status: string): POSOrderStatus {
  const s = status.toUpperCase();
  if (s.includes("CANCEL")) return "Cancelled";
  if (s.includes("PAID") || s.includes("COMPLET") || s.includes("SENT")) return "Paid";
  return "Draft";
}

export function mapOrderToPOSOrder(order: ApiOrder): POSOrder {
  const lineItems: POSOrderLineItem[] =
    order.items?.map((item, idx) => ({
      id: item.id ?? String(idx),
      name: item.product?.name ?? "Item",
      quantity: item.quantity,
      price: toNumber(item.unitPrice ?? item.product?.price),
      emoji: "☕",
    })) ?? [];

  return {
    id: order.id,
    orderNumber: order.orderNumber ?? `#${order.id.slice(0, 4)}`,
    date: formatDate(order.createdAt),
    time: formatTime(order.createdAt),
    customer: order.customer?.name ?? "Walk-in",
    table: order.table?.tableNumber ?? order.table?.name ?? "—",
    employee: order.createdByUser?.name ?? "Staff",
    amount: toNumber(order.grandTotal ?? order.subtotal),
    status: mapOrderStatus(order.status),
    tax: toNumber(order.taxTotal),
    lineItems,
  };
}

function mapTableStatus(status: string): TableStatus {
  const s = status.toUpperCase();
  if (s === "AVAILABLE" || s === "FREE") return "available";
  return "occupied";
}

export function mapFloorsToPOSTables(floors: ApiFloor[]): POSFloor[] {
  return floors.map((floor) => ({
    id: floor.id,
    name: floor.name,
    tables: (floor.tables ?? []).map((table) => mapTableToPOSTable(table, floor.id)),
  }));
}

function mapTableToPOSTable(table: ApiTable, floorId: string): POSTable {
  const occupied = mapTableStatus(table.status) === "occupied";
  const activeOrder = table.activeOrder;
  return {
    id: table.id,
    label: table.tableNumber ?? table.name ?? "T",
    floorId,
    seats: table.seats ?? table.capacity ?? 2,
    status: mapTableStatus(table.status),
    revenue: activeOrder ? toNumber(activeOrder.grandTotal ?? activeOrder.subtotal) : undefined,
    customer: activeOrder?.customer?.name,
    orderNumber: activeOrder?.orderNumber,
    elapsedMinutes: activeOrder
      ? Math.max(0, Math.floor((Date.now() - new Date(activeOrder.createdAt).getTime()) / 60000))
      : undefined,
  };
}

export function mapCustomerToPOSCustomer(customer: ApiCustomer): POSCustomer {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone ?? "",
    orderCount: customer.orderCount ?? 0,
    totalSpent: toNumber(customer.totalSpent),
    memberSince: formatDate(customer.createdAt).replace(/,\s*\d{4}$/, " " + new Date(customer.createdAt).getFullYear()),
  };
}

const CATEGORY_EMOJI: Record<string, string> = {
  coffee: "☕",
  espresso: "☕",
  dessert: "🧁",
  pastry: "🥐",
  tea: "🍵",
  sandwich: "🥪",
};

function emojiForCategory(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(CATEGORY_EMOJI)) {
    if (lower.includes(key)) return emoji;
  }
  return "🍽️";
}

export function mapPosDataToTerminal(products: ApiPosProduct[]): {
  categories: string[];
  products: POSProduct[];
} {
  const categorySet = new Set<string>();
  const mapped = products.map((p) => {
    const category = p.category?.name ?? "Other";
    categorySet.add(category);
    return {
      id: p.id,
      name: p.name,
      price: toNumber(p.price),
      category,
      emoji: emojiForCategory(category),
    };
  });
  return { categories: ["All", ...Array.from(categorySet)], products: mapped };
}

function mapKdsStage(stage: string): KDSStage {
  const s = stage.toUpperCase();
  if (s.includes("READY")) return "ready";
  if (s.includes("PREPAR") || s.includes("COOK")) return "preparing";
  return "to-cook";
}

export function mapKdsTicketToOrder(ticket: ApiKdsTicket): KDSOrder {
  const order = ticket.order;
  const elapsed = Math.max(
    0,
    Math.floor((Date.now() - new Date(ticket.createdAt).getTime()) / 60000)
  );
  const items =
    ticket.items?.map((item, idx) => ({
      id: idx + 1,
      orderItemId: item.id,
      name: item.name ?? item.product?.name ?? "Item",
      quantity: item.quantity,
      done: Boolean(item.isCompleted),
    })) ??
    order?.items?.map((item, idx) => ({
      id: idx + 1,
      orderItemId: item.id,
      name: item.product?.name ?? "Item",
      quantity: item.quantity,
      done: false,
    })) ??
    [];

  return {
    id: order?.orderNumber ?? ticket.orderId,
    ticketId: ticket.id,
    table: order?.table?.tableNumber ?? order?.table?.name ?? "—",
    stage: mapKdsStage(ticket.stage),
    items,
    elapsed,
    note: order?.notes ?? undefined,
  };
}

export function mapProductToUI(product: ApiProduct): Product {
  return {
    id: product.id,
    name: product.name,
    categoryId: product.categoryId ?? product.category?.id ?? "",
    category: product.category?.name ?? "Other",
    price: toNumber(product.price),
    uom: product.unitOfMeasure ?? "ea",
    tax: `${toNumber(product.taxRate)}%`,
    active: product.isActive ?? true,
    imageUrl: getAssetUrl(product.imageUrl) || "/placeholder-product.png",
    sizes: ["Regular"],
    defaultSize: "Regular",
  };
}

export function mapCategoryToUI(category: ApiCategory, productCount = 0): Category {
  return {
    id: category.id,
    name: category.name,
    color: category.color ?? "#C9783A",
    image: category.imageUrl ? getAssetUrl(category.imageUrl) : null,
    productCount,
    revenue: "$0",
    createdAt: category.createdAt
      ? formatDate(category.createdAt)
      : new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  };
}

export function mapSessionToSummary(session: ApiSession): POSSessionSummary {
  const date = session.closedAt ?? session.openedAt ?? session.createdAt ?? new Date().toISOString();
  return {
    date: new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    closedBy: session.openedByUser?.name ?? "Staff",
    hours: session.openedAt
      ? `${formatTime(session.openedAt)}${session.closedAt ? ` - ${formatTime(session.closedAt)}` : ""}`
      : "—",
  };
}

export function mapSessionToStats(session: ApiSession): SessionStats {
  return {
    closingAmount: toNumber(session.closingAmount ?? session.totalSales),
    totalOrders: session.totalOrders ?? 0,
  };
}

export function mapDashboardInfoToSessionUI(info: ApiSessionDashboardInfo | null) {
  const dateSource = info?.lastSessionDate ?? new Date().toISOString();
  return {
    summary: {
      date: new Date(dateSource).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      closedBy: "—",
      hours: "—",
    },
    stats: {
      closingAmount: toNumber(info?.lastClosingAmount),
      totalOrders: 0,
    },
  };
}

export function mapFloorsToSessionTables(floors: ApiFloor[]): SessionTable[] {
  const tables: SessionTable[] = [];
  for (const floor of floors) {
    for (const table of floor.tables ?? []) {
      tables.push({
        id: tables.length + 1,
        number: table.tableNumber ?? table.name ?? String(tables.length + 1),
        hasActiveOrder: mapTableStatus(table.status) === "occupied",
      });
    }
  }
  return tables;
}

const AVATAR_COLORS = ["#C9783A", "#5B8FA8", "#789658", "#866443", "#9B6A9B"];

function couponTypeToUI(type?: string): CouponDiscountType {
  if (!type) return "percentage";
  return type.toUpperCase().includes("FIXED") ? "fixed_amount" : "percentage";
}

export function mapCouponToUI(coupon: ApiCoupon): Coupon {
  const typeSource = coupon.discountType ?? coupon.type;
  const discountType = typeSource ? couponTypeToUI(typeSource) : "percentage";
  const value = toNumber(
    coupon.discountValue ?? coupon.value ?? coupon.discountPercentage
  );
  const active =
    coupon.isActive !== undefined
      ? coupon.isActive
      : coupon.validTo
        ? new Date(coupon.validTo) > new Date()
        : coupon.expiryDate
          ? new Date(coupon.expiryDate) > new Date()
          : true;

  return {
    id: coupon.id,
    code: coupon.code,
    discountType,
    value,
    active,
  };
}

export function buildCouponPayload(data: CouponFormData): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    code: data.code,
    discountType: data.discountType === "percentage" ? "PERCENTAGE" : "FIXED",
    discountValue: Number(data.value),
    validTo: new Date(Date.now() + 90 * 86400000).toISOString(),
  };
  if (data.discountType === "percentage") {
    payload.maxDiscount = 200;
  }
  return payload;
}

export function parseValidatedCoupon(
  res: unknown,
  code: string,
  subtotal: number
): AppliedCoupon | null {
  const root =
    res && typeof res === "object" ? (res as Record<string, unknown>) : null;
  if (!root) return null;

  const data =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;

  if (data.valid === false) return null;

  const typeRaw = String(data.type ?? data.discountType ?? "").toUpperCase();
  const discountType: CouponDiscountType = typeRaw.includes("FIXED")
    ? "fixed_amount"
    : "percentage";

  const rawValue = Number(
    data.discountValue ?? data.value ?? data.discountPercentage
  );
  if (!isNaN(rawValue) && rawValue > 0) {
    return { code: String(data.couponCode ?? data.code ?? code), discountType, value: rawValue };
  }

  const discountAmount = Number(data.discountAmount);
  if (!isNaN(discountAmount) && discountAmount > 0) {
    return { code: String(data.couponCode ?? data.code ?? code), discountType: "fixed_amount", value: discountAmount };
  }

  return null;
}

export function parseAppliedCouponResponse(
  res: unknown,
  code: string
): { appliedCoupon: AppliedCoupon; totals: OrderTotals } | null {
  const root =
    res && typeof res === "object" ? (res as Record<string, unknown>) : null;
  if (!root) return null;

  const data =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;

  const order =
    data.order && typeof data.order === "object"
      ? (data.order as Record<string, unknown>)
      : null;
  const couponRaw =
    data.coupon && typeof data.coupon === "object"
      ? (data.coupon as Record<string, unknown>)
      : order?.coupon && typeof order.coupon === "object"
        ? (order.coupon as Record<string, unknown>)
        : null;

  const couponCode = String(data.couponCode ?? couponRaw?.code ?? code);
  const typeRaw = String(couponRaw?.discountType ?? data.discountType ?? "").toUpperCase();
  const discountType: CouponDiscountType = typeRaw.includes("FIXED")
    ? "fixed_amount"
    : "percentage";
  const value = Number(couponRaw?.discountValue ?? data.discountValue ?? 0);
  const discountAmount = Number(
    data.discountAmount ?? order?.discountTotal ?? 0
  );

  const subtotal = Number(order?.subtotal ?? 0);
  const tax = Number(order?.taxTotal ?? 0);
  const total = Number(data.newTotal ?? order?.grandTotal ?? 0);

  if (!couponCode) return null;

  return {
    appliedCoupon: {
      code: couponCode,
      discountType,
      value: isNaN(value) ? 0 : value,
      discountAmount: isNaN(discountAmount) ? 0 : discountAmount,
    },
    totals: {
      subtotal: isNaN(subtotal) ? 0 : subtotal,
      tax: isNaN(tax) ? 0 : tax,
      discountAmt: isNaN(discountAmount) ? 0 : discountAmount,
      total: isNaN(total) ? 0 : total,
    },
  };
}

function promotionTypeToUI(type?: string): Promotion["discountType"] {
  if (!type) return "percentage";
  return type.toUpperCase().includes("FIXED") ? "fixed_amount" : "percentage";
}

export function mapPromotionToUI(promo: ApiPromotion): Promotion {
  const typeSource = promo.discountType ?? promo.type;
  const scope =
    String(promo.scope ?? "ORDER").toUpperCase() === "PRODUCT" ? "product" : "order";
  const minQuantity = toNumber(promo.minQuantity);
  const minOrderAmount = toNumber(promo.minOrderAmount);

  return {
    id: promo.id,
    name: promo.name,
    scope,
    productId: promo.productId ?? undefined,
    productName: promo.product?.name,
    minQuantity: minQuantity > 0 ? minQuantity : undefined,
    minOrderAmount: minOrderAmount > 0 ? minOrderAmount : undefined,
    discountType: promotionTypeToUI(typeSource),
    discountValue: toNumber(promo.discountValue ?? promo.value),
    isActive: promo.isActive ?? true,
  };
}

export function buildPromotionPayload(data: PromotionFormData): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    name: data.name,
    scope: data.scope === "product" ? "PRODUCT" : "ORDER",
    discountType: data.discountType === "percentage" ? "PERCENTAGE" : "FIXED",
    discountValue: Number(data.discountValue),
  };

  if (data.scope === "product") {
    if (data.productId) payload.productId = data.productId;
    if (data.minQuantity) payload.minQuantity = Number(data.minQuantity);
  } else if (data.minOrderAmount) {
    payload.minOrderAmount = Number(data.minOrderAmount);
  }

  return payload;
}

export function mapUserToUI(user: ApiUser, index = 0): User {
  const roleMap = { ADMIN: "Admin", EMPLOYEE: "Employee" } as const;
  const statusMap = { ACTIVE: "Active", INACTIVE: "Archived", ARCHIVED: "Archived" } as const;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: roleMap[user.role] ?? "Employee",
    status: (statusMap[user.status] ?? "Active") as User["status"],
    joinedAt: formatDate(user.createdAt),
    avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
  };
}

export function kdsStageToApi(stage: string): string {
  if (stage === "preparing") return "PREPARING";
  if (stage === "ready") return "READY";
  return "TO_COOK";
}
