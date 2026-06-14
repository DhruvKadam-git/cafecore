import { apiFetch, unwrapApiResponse } from "./client";
import { ApiUser } from "./types";

export async function getUsers(): Promise<ApiUser[]> {
  try {
    const res = await apiFetch<unknown>("/users");
    return unwrapApiResponse<ApiUser[]>(res) ?? [];
  } catch {
    return [];
  }
}

export async function getUserById(id: string): Promise<ApiUser> {
  const res = await apiFetch<unknown>(`/users/${id}`);
  return unwrapApiResponse<ApiUser>(res) ?? (res as ApiUser);
}

export async function createUser(data: Record<string, unknown>): Promise<ApiUser> {
  const res = await apiFetch<unknown>("/users", { method: "POST", body: data });
  return unwrapApiResponse<ApiUser>(res) ?? (res as ApiUser);
}

export async function updateUser(id: string, data: Record<string, unknown>): Promise<ApiUser> {
  const res = await apiFetch<unknown>(`/users/${id}`, { method: "PATCH", body: data });
  return unwrapApiResponse<ApiUser>(res) ?? (res as ApiUser);
}

export async function deleteUser(id: string): Promise<void> {
  await apiFetch(`/users/${id}`, { method: "DELETE" });
}
