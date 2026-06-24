import { apiFetch, unwrapApiResponse } from "./client";
import { ApiError } from "./errors";
import { ApiSession, ApiSessionDashboardInfo } from "./types";

const EMPTY_DASHBOARD: ApiSessionDashboardInfo = {
  lastSessionDate: null,
  lastClosingAmount: null,
  currentSessionStatus: null,
};

export async function getCurrentSession(): Promise<ApiSession | null> {
  try {
    return await apiFetch<ApiSession>("/sessions/current");
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function getSessionHistory(): Promise<ApiSession[]> {
  try {
    const res = await apiFetch<unknown>("/sessions");
    return unwrapApiResponse<ApiSession[]>(res) ?? [];
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) return [];
    throw err;
  }
}

export async function getSessionById(id: string): Promise<ApiSession> {
  return apiFetch<ApiSession>(`/sessions/${id}`);
}

export async function getSessionSummary(id: string): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>(`/sessions/${id}/summary`);
}

export async function openSession(openingAmount: number): Promise<ApiSession> {
  return apiFetch<ApiSession>("/sessions/open", {
    method: "POST",
    body: { openingAmount },
  });
}

export async function closeSession(id: string, closingAmount?: number): Promise<ApiSession> {
  return apiFetch<ApiSession>(`/sessions/${id}/close`, {
    method: "POST",
    body: closingAmount != null ? { closingAmount } : {},
  });
}

export async function getDashboardInfo(): Promise<ApiSessionDashboardInfo> {
  try {
    return await apiFetch<ApiSessionDashboardInfo>("/sessions/dashboard/info");
  } catch {
    return EMPTY_DASHBOARD;
  }
}
