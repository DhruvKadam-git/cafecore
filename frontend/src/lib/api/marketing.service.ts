import { apiFetch, unwrapApiResponse } from "./client";
import { ApiCoupon, ApiPromotion, ApiPayment } from "./types";

export async function getCoupons(): Promise<ApiCoupon[]> {
  const res = await apiFetch<unknown>("/coupons");
  return unwrapApiResponse<ApiCoupon[]>(res) ?? [];
}

export async function createCoupon(data: Record<string, unknown>): Promise<ApiCoupon> {
  const res = await apiFetch<unknown>("/coupons", { method: "POST", body: data });
  return unwrapApiResponse<ApiCoupon>(res) ?? (res as ApiCoupon);
}

export async function updateCoupon(id: string, data: Record<string, unknown>): Promise<ApiCoupon> {
  const res = await apiFetch<unknown>(`/coupons/${id}`, { method: "PATCH", body: data });
  return unwrapApiResponse<ApiCoupon>(res) ?? (res as ApiCoupon);
}

export async function deleteCoupon(id: string): Promise<void> {
  await apiFetch(`/coupons/${id}`, { method: "DELETE" });
}

export async function validateCoupon(code: string, orderAmount: number): Promise<unknown> {
  return apiFetch("/coupons/validate/check", {
    method: "POST",
    body: { couponCode: code, orderAmount: Number(orderAmount) },
  });
}

export async function applyCoupon(orderId: string, couponCode: string): Promise<unknown> {
  if (!orderId) {
    throw new Error("Order ID is required to apply a coupon.");
  }
  return apiFetch("/coupons/apply", {
    method: "POST",
    body: { orderId: String(orderId), couponCode },
  });
}

export async function getPromotions(): Promise<ApiPromotion[]> {
  const res = await apiFetch<unknown>("/promotions");
  return unwrapApiResponse<ApiPromotion[]>(res) ?? [];
}

export async function createPromotion(data: Record<string, unknown>): Promise<ApiPromotion> {
  const res = await apiFetch<unknown>("/promotions", { method: "POST", body: data });
  return unwrapApiResponse<ApiPromotion>(res) ?? (res as ApiPromotion);
}

export async function updatePromotion(id: string, data: Record<string, unknown>): Promise<ApiPromotion> {
  const res = await apiFetch<unknown>(`/promotions/${id}`, { method: "PATCH", body: data });
  return unwrapApiResponse<ApiPromotion>(res) ?? (res as ApiPromotion);
}

export async function deletePromotion(id: string): Promise<void> {
  await apiFetch(`/promotions/${id}`, { method: "DELETE" });
}

export async function getPayments(): Promise<ApiPayment[]> {
  const res = await apiFetch<unknown>("/payments");
  return unwrapApiResponse<ApiPayment[]>(res) ?? [];
}

export async function getPaymentStats(): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>("/payments/stats/summary");
}

export async function processCashPayment(orderId: string, amount: number): Promise<unknown> {
  return apiFetch("/payments/cash", { method: "POST", body: { orderId, amount } });
}

export async function processCardPayment(orderId: string, amount: number, reference?: string): Promise<unknown> {
  return apiFetch("/payments/card", { method: "POST", body: { orderId, amount, reference } });
}

export async function processUpiPayment(orderId: string, amount: number, reference?: string): Promise<unknown> {
  return apiFetch("/payments/upi", { method: "POST", body: { orderId, amount, reference } });
}

export async function getReportsSales(params?: Record<string, string>): Promise<Record<string, unknown>> {
  const qs = params ? `?${new URLSearchParams(params)}` : "";
  return apiFetch<Record<string, unknown>>(`/reports/sales${qs}`);
}

export async function getReportsRevenue(params?: Record<string, string>): Promise<Record<string, unknown>> {
  const qs = params ? `?${new URLSearchParams(params)}` : "";
  return apiFetch<Record<string, unknown>>(`/reports/revenue${qs}`);
}

export async function getReportsTopProducts(params?: Record<string, string>): Promise<Record<string, unknown>> {
  const qs = params ? `?${new URLSearchParams(params)}` : "";
  return apiFetch<Record<string, unknown>>(`/reports/top-products${qs}`);
}

export async function getReportsOrders(params?: Record<string, string>): Promise<Record<string, unknown>> {
  const qs = params ? `?${new URLSearchParams(params)}` : "";
  return apiFetch<Record<string, unknown>>(`/reports/orders${qs}`);
}

export async function chatReports(message: string, history?: unknown[]): Promise<{ reply: string }> {
  const res = await apiFetch<unknown>("/reports/chat", {
    method: "POST",
    body: { message, history },
  });
  return unwrapApiResponse<{ reply: string }>(res) ?? (res as { reply: string });
}
