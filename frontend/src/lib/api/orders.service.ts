import { apiFetch, unwrapApiResponse } from "./client";
import { ApiOrder } from "./types";

function extractApiOrder(payload: unknown): ApiOrder {
  const root = unwrapApiResponse<unknown>(payload) ?? payload;
  if (root && typeof root === "object") {
    const record = root as Record<string, unknown>;
    if (record.order && typeof record.order === "object") {
      return record.order as ApiOrder;
    }
    if (typeof record.id === "string") {
      return record as unknown as ApiOrder;
    }
  }
  return payload as ApiOrder;
}

export async function getOrders(): Promise<ApiOrder[]> {
  const res = await apiFetch<unknown>("/orders");
  const data = unwrapApiResponse<unknown>(res) ?? res;
  if (Array.isArray(data)) return data as ApiOrder[];
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.orders)) return record.orders as ApiOrder[];
    if (Array.isArray(record.data)) return record.data as ApiOrder[];
  }
  return [];
}

export async function getOrderById(id: string): Promise<ApiOrder> {
  const res = await apiFetch<unknown>(`/orders/${id}`);
  return extractApiOrder(res);
}

export async function createOrder(data: Record<string, unknown>): Promise<ApiOrder> {
  const res = await apiFetch<unknown>("/orders", { method: "POST", body: data });
  return extractApiOrder(res);
}

export async function updateOrder(id: string, data: Record<string, unknown>): Promise<ApiOrder> {
  const res = await apiFetch<unknown>(`/orders/${id}`, { method: "PATCH", body: data });
  return extractApiOrder(res);
}

export async function deleteOrder(id: string): Promise<void> {
  await apiFetch(`/orders/${id}`, { method: "DELETE" });
}

export async function sendOrderToKitchen(id: string): Promise<ApiOrder> {
  const res = await apiFetch<unknown>(`/orders/${id}/send-to-kitchen`, { method: "POST" });
  return extractApiOrder(res);
}

export async function cancelOrder(id: string): Promise<ApiOrder> {
  const res = await apiFetch<unknown>(`/orders/${id}/cancel`, { method: "POST" });
  return extractApiOrder(res);
}

export async function getSessionOrders(sessionId: string): Promise<ApiOrder[]> {
  const res = await apiFetch<unknown>(`/orders/session/${sessionId}`);
  return unwrapApiResponse<ApiOrder[]>(res) ?? [];
}

export async function getTableOrder(tableId: string): Promise<ApiOrder | null> {
  try {
    const res = await apiFetch<unknown>(`/orders/table/${tableId}`);
    const order = extractApiOrder(res);
    return order?.id ? order : null;
  } catch {
    return null;
  }
}
