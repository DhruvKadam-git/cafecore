import { apiFetch, unwrapApiResponse } from "./client";
import { ApiCategory } from "./types";

export async function getCategories(): Promise<ApiCategory[]> {
  const res = await apiFetch<unknown>("/categories");
  return unwrapApiResponse<ApiCategory[]>(res) ?? [];
}

export async function getCategoryById(id: string): Promise<ApiCategory> {
  const res = await apiFetch<unknown>(`/categories/${id}`);
  return unwrapApiResponse<ApiCategory>(res) ?? (res as ApiCategory);
}

export async function createCategory(data: Record<string, unknown>): Promise<ApiCategory> {
  const res = await apiFetch<unknown>("/categories", { method: "POST", body: data });
  return unwrapApiResponse<ApiCategory>(res) ?? (res as ApiCategory);
}

export async function updateCategory(id: string, data: Record<string, unknown>): Promise<ApiCategory> {
  const res = await apiFetch<unknown>(`/categories/${id}`, { method: "PATCH", body: data });
  return unwrapApiResponse<ApiCategory>(res) ?? (res as ApiCategory);
}

export async function deleteCategory(id: string): Promise<void> {
  await apiFetch(`/categories/${id}`, { method: "DELETE" });
}

export async function uploadCategoryImage(file: File): Promise<{ imageUrl: string }> {
  const form = new FormData();
  form.append("file", file);
  const res = await apiFetch<unknown>("/categories/upload-image", { method: "POST", body: form });
  return unwrapApiResponse<{ imageUrl: string }>(res) ?? (res as { imageUrl: string });
}
