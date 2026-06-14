export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export const AUTH_TOKEN_KEY = "cafe-pos-token";
export const AUTH_USER_KEY = "cafe-pos-user";

export function getApiUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function getAssetUrl(relativePath?: string | null): string {
  if (!relativePath) return "";
  if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
    return relativePath;
  }
  const base = API_BASE_URL.replace(/\/$/, "");
  return `${base}${relativePath.startsWith("/") ? relativePath : `/${relativePath}`}`;
}
