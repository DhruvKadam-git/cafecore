import { apiFetch, unwrapApiResponse } from "./client";
import { ApiKdsTicket } from "./types";

export async function getKdsTickets(): Promise<ApiKdsTicket[]> {
  const res = await apiFetch<unknown>("/kds/tickets");
  return unwrapApiResponse<ApiKdsTicket[]>(res) ?? [];
}

export async function updateKdsTicketStage(id: string, stage: string): Promise<ApiKdsTicket> {
  const res = await apiFetch<unknown>(`/kds/tickets/${id}/stage`, {
    method: "PATCH",
    body: { stage },
  });
  return unwrapApiResponse<ApiKdsTicket>(res) ?? (res as ApiKdsTicket);
}

export async function completeOrderItem(orderItemId: string): Promise<void> {
  await apiFetch(`/kds/items/${orderItemId}/complete`, { method: "PATCH" });
}

export async function searchKdsTickets(query: string): Promise<ApiKdsTicket[]> {
  const res = await apiFetch<unknown>(`/kds/search?q=${encodeURIComponent(query)}`);
  return unwrapApiResponse<ApiKdsTicket[]>(res) ?? [];
}
