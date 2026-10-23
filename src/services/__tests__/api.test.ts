process.env["VITE_USE_MOCK_API"] = "false";
process.env["VITE_API_URL"] = "http://localhost:5000/api";

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { apiRequest, clearSession, getStoredToken, persistSession, readSession } from "../api";
import { serviceConfig } from "../config";

describe("Frontend API Client & Session Security", () => {
  // Mock localStorage for node environment
  const store: Record<string, string> = {};
  const mockLocalStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, val: string) => {
      store[key] = val;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
  };

  (globalThis as any).localStorage = mockLocalStorage;
  (globalThis as any).window = {
    dispatchEvent: (_event: any) => true,
  };

  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it("serviceConfig.useMock evaluates to false in live mode", () => {
    assert.strictEqual(serviceConfig.useMock, false);
  });

  it("getStoredToken rejects and purges mock 'demo-' tokens in live mode", () => {
    persistSession({ token: "demo-professor-session", user: { id: "1" } });
    const token = getStoredToken();
    assert.strictEqual(token, null);
    // Verified it was cleared
    assert.strictEqual(mockLocalStorage.getItem("blocksubmit.session"), null);
  });

  it("getStoredToken preserves valid live JWT tokens", () => {
    const validJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid-token";
    persistSession({ token: validJwt, user: { id: "1" } });
    const token = getStoredToken();
    assert.strictEqual(token, validJwt);
  });

  it("readSession purges mock tokens in live mode", () => {
    persistSession({ token: "demo-student-session", user: { id: "2" } });
    const session = readSession();
    assert.strictEqual(session, null);
    assert.strictEqual(mockLocalStorage.getItem("blocksubmit.session"), null);
  });

  it("apiRequest does NOT attach Authorization header to /auth/login even if token exists", async () => {
    const validJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token";
    persistSession({ token: validJwt, user: { id: "1" } });

    let capturedHeaders: Headers | undefined;
    (globalThis as any).fetch = async (_url: string, init: any) => {
      capturedHeaders = init.headers;
      return new Response(JSON.stringify({ token: "new-token", user: { id: "1" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    await apiRequest("/auth/login", { method: "POST", body: JSON.stringify({ email: "a", password: "b" }) });
    assert.ok(capturedHeaders);
    assert.strictEqual(capturedHeaders.has("Authorization"), false);
  });

  it("apiRequest attaches Authorization header to authenticated endpoints", async () => {
    const validJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token";
    persistSession({ token: validJwt, user: { id: "1" } });

    let capturedHeaders: Headers | undefined;
    (globalThis as any).fetch = async (_url: string, init: any) => {
      capturedHeaders = init.headers;
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    await apiRequest("/assignments");
    assert.ok(capturedHeaders);
    assert.strictEqual(capturedHeaders.get("Authorization"), `Bearer ${validJwt}`);
  });

  it("apiRequest on /auth/login returns real backend 401 error message without claiming session expired", async () => {
    (globalThis as any).fetch = async () => {
      return new Response(JSON.stringify({ message: "Invalid email or password." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    };

    await assert.rejects(
      async () => {
        await apiRequest("/auth/login", { method: "POST", body: JSON.stringify({ email: "test", password: "bad" }) });
      },
      (err: any) => {
        assert.strictEqual(err.message, "Invalid email or password.");
        assert.notStrictEqual(err.message, "Your session has expired.");
        assert.strictEqual(err.status, 401);
        return true;
      }
    );
  });

  it("apiRequest on authenticated endpoint clears session and throws session expired on 401", async () => {
    const validJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token";
    persistSession({ token: validJwt, user: { id: "1" } });

    let dispatched = false;
    (globalThis as any).window = {
      dispatchEvent: (event: any) => {
        if (event.type === "blocksubmit:unauthorized") dispatched = true;
        return true;
      },
    };

    (globalThis as any).fetch = async () => {
      return new Response(JSON.stringify({ message: "jwt expired" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    };

    await assert.rejects(
      async () => {
        await apiRequest("/assignments");
      },
      (err: any) => {
        assert.strictEqual(err.message, "jwt expired");
        assert.strictEqual(err.status, 401);
        return true;
      }
    );

    assert.strictEqual(dispatched, true);
    assert.strictEqual(mockLocalStorage.getItem("blocksubmit.session"), null);
  });
});
