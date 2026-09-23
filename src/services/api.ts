import { ApiError } from "./errors";
import { serviceConfig } from "./config";

const TOKEN_KEY = "blocksubmit.session";
export function getStoredToken() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(TOKEN_KEY) || "null")?.token ?? null; } catch { return null; }
}
export function persistSession(session: unknown) { if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, JSON.stringify(session)); }
export function clearSession() { if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY); }
export function readSession<T>() { if (typeof window === "undefined") return null; try { return JSON.parse(localStorage.getItem(TOKEN_KEY) || "null") as T | null; } catch { return null; } }

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const token = getStoredToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let response: Response;
  try { response = await fetch(`${serviceConfig.apiUrl}${path}`, { ...init, headers }); }
  catch { throw new ApiError("Backend unavailable. Please try again later.", 503, "NETWORK_ERROR"); }
  if (response.status === 401) { clearSession(); if (typeof window !== "undefined") window.dispatchEvent(new Event("blocksubmit:unauthorized")); throw new ApiError("Your session has expired.", 401, "UNAUTHORIZED"); }
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(payload?.message || "Request failed.", response.status);
  return payload?.data ?? payload;
}
