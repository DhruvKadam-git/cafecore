import { apiFetch, unwrapApiResponse } from "./client";
import { ApiCustomer } from "./types";

export async function getCustomers(search?: string): Promise<ApiCustomer[]> {
  const path = search?.trim()
    ? `/customers/pos-search?q=${encodeURIComponent(search.trim())}`
    : "/customers";
  const res = await apiFetch<unknown>(path);
  return unwrapApiResponse<ApiCustomer[]>(res) ?? [];
}

export async function getCustomerById(id: string): Promise<ApiCustomer> {
  const res = await apiFetch<unknown>(`/customers/${id}`);
  return unwrapApiResponse<ApiCustomer>(res) ?? (res as ApiCustomer);
}

export async function createCustomer(data: { name: string; email: string; phone?: string }): Promise<ApiCustomer> {
  const res = await apiFetch<unknown>("/customers", { method: "POST", body: data });
  return unwrapApiResponse<ApiCustomer>(res) ?? (res as ApiCustomer);
}

export async function updateCustomer(
  id: string,
  data: { name?: string; email?: string; phone?: string }
): Promise<ApiCustomer> {
  const res = await apiFetch<unknown>(`/customers/${id}`, { method: "PATCH", body: data });
  return unwrapApiResponse<ApiCustomer>(res) ?? (res as ApiCustomer);
}

export async function deleteCustomer(id: string): Promise<void> {
  await apiFetch(`/customers/${id}`, { method: "DELETE" });
}
