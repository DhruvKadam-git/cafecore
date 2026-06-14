import { apiFetch, unwrapApiResponse } from "./client";
import { ApiFloor, ApiTable } from "./types";

export async function getFloorsWithTables(): Promise<ApiFloor[]> {
  const res = await apiFetch<unknown>("/floors/with-tables/all");
  return unwrapApiResponse<ApiFloor[]>(res) ?? [];
}

export async function getFloors(): Promise<ApiFloor[]> {
  const res = await apiFetch<unknown>("/floors");
  return unwrapApiResponse<ApiFloor[]>(res) ?? [];
}

export async function getTables(): Promise<ApiTable[]> {
  const res = await apiFetch<unknown>("/tables");
  return unwrapApiResponse<ApiTable[]>(res) ?? [];
}

export async function updateTableStatus(id: string, status: string): Promise<ApiTable> {
  return apiFetch<ApiTable>(`/tables/${id}/status/${status}`, { method: "PATCH" });
}
