import { apiFetch, unwrapApiResponse } from "./client";
import { AuthLoginResponse, ApiUser } from "./types";

export async function login(email: string, password: string): Promise<AuthLoginResponse> {
  return apiFetch<AuthLoginResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });
}

export async function signup(
  name: string,
  email: string,
  password: string,
  role: "ADMIN" | "EMPLOYEE" = "EMPLOYEE"
): Promise<{ message: string; user: ApiUser }> {
  return apiFetch("/auth/signup", {
    method: "POST",
    auth: false,
    body: { name, email, password, role },
  });
}

export async function getMe(): Promise<ApiUser> {
  const res = await apiFetch<unknown>("/auth/me");
  return unwrapApiResponse<ApiUser>(res) ?? (res as ApiUser);
}
