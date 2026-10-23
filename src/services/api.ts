import { ApiError } from "./errors";
import { serviceConfig } from "./config";

const TOKEN_KEY = "blocksubmit.session";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    const token = session?.token;
    if (typeof token !== "string" || !token.trim()) return null;
    // In live API mode, ignore and purge legacy/mock tokens
    if (!serviceConfig.useMock && token.startsWith("demo-")) {
      clearSession();
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

export function persistSession(session: unknown): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(session));
  }
}

export function clearSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function readSession<T>(): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    // In live mode, purge mock tokens
    if (
      !serviceConfig.useMock &&
      typeof session?.token === "string" &&
      session.token.startsWith("demo-")
    ) {
      clearSession();
      return null;
    }
    return session as T | null;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const isAuthEndpoint = path.startsWith("/auth/login") || path.startsWith("/auth/register");
  const token = getStoredToken();
  if (token && !isAuthEndpoint && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${serviceConfig.apiUrl}${path}`, { ...init, headers });
  } catch {
    throw new ApiError("Backend unavailable. Please try again later.", 503, "NETWORK_ERROR");
  }

  const payload = await response.json().catch(() => null);

  if (response.status === 401) {
    if (isAuthEndpoint) {
      throw new ApiError(payload?.message || "Invalid email or password.", 401, "UNAUTHORIZED");
    }
    clearSession();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("blocksubmit:unauthorized"));
    }
    throw new ApiError(payload?.message || "Your session has expired.", 401, "UNAUTHORIZED");
  }

  if (!response.ok) {
    throw new ApiError(payload?.message || "Request failed.", response.status);
  }

  return payload?.data ?? payload;
}

export async function apiBlobRequest(path: string, init: RequestInit = {}): Promise<Blob> {
  const headers = new Headers(init.headers);
  const token = getStoredToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${serviceConfig.apiUrl}${path}`, { ...init, headers });
  } catch {
    throw new ApiError("Backend unavailable. Please try again later.", 503, "NETWORK_ERROR");
  }

  if (response.status === 401) {
    clearSession();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("blocksubmit:unauthorized"));
    }
    throw new ApiError("Your session has expired.", 401, "UNAUTHORIZED");
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new ApiError(payload?.message || "Failed to download document.", response.status);
  }

  return response.blob();
}
