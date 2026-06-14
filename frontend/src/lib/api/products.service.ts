import { apiFetch, unwrapApiResponse } from "./client";
import { ApiPosProduct, ApiProduct } from "./types";

export async function getPosData(): Promise<ApiPosProduct[]> {
  const res = await apiFetch<unknown>("/products/pos-data");
  return unwrapApiResponse<ApiPosProduct[]>(res) ?? [];
}

export async function getProducts(): Promise<ApiProduct[]> {
  const res = await apiFetch<unknown>("/products");
  return unwrapApiResponse<ApiProduct[]>(res) ?? [];
}

export async function getProductById(id: string): Promise<ApiProduct> {
  const res = await apiFetch<unknown>(`/products/${id}`);
  return unwrapApiResponse<ApiProduct>(res) ?? (res as ApiProduct);
}

export async function createProduct(data: Record<string, unknown>): Promise<ApiProduct> {
  const res = await apiFetch<unknown>("/products", { method: "POST", body: data });
  return unwrapApiResponse<ApiProduct>(res) ?? (res as ApiProduct);
}

export async function updateProduct(id: string, data: Record<string, unknown>): Promise<ApiProduct> {
  const res = await apiFetch<unknown>(`/products/${id}`, { method: "PATCH", body: data });
  return unwrapApiResponse<ApiProduct>(res) ?? (res as ApiProduct);
}

export async function deleteProduct(id: string): Promise<void> {
  await apiFetch(`/products/${id}`, { method: "DELETE" });
}

export async function uploadProductImage(file: File): Promise<{ imageUrl: string }> {
  const form = new FormData();
  form.append("file", file);
  const res = await apiFetch<unknown>("/products/upload-image", { method: "POST", body: form });
  return unwrapApiResponse<{ imageUrl: string }>(res) ?? (res as { imageUrl: string });
}
