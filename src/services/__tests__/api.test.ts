process.env["VITE_USE_MOCK_API"] = "false";
process.env["VITE_API_URL"] = "http://localhost:5000/api";

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { apiRequest, clearSession, getStoredToken, persistSession, readSession } from "../api";
import { serviceConfig } from "../config";
import { computeHashMatchStatus } from "../../components/blocksubmit/shared";
import { mockRepository } from "../mock/repository";
import { student } from "../mock/data";

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

describe("Scenario 6: Frontend Hash Comparison Badge Logic", () => {
  it("displays MATCH for identical hash strings (case-insensitive and trimmed)", () => {
    const hashA = "a6f4d53e8b6d7c0298ccdf57f92a4eb72c556bf8856ff581a35f6d891f87a420";
    const hashB = "A6F4D53E8B6D7C0298CCDF57F92A4EB72C556BF8856FF581A35F6D891F87A420";
    assert.strictEqual(computeHashMatchStatus(hashA, hashB), "MATCH");
    assert.strictEqual(computeHashMatchStatus(`  ${hashA}  `, hashA), "MATCH");
  });

  it("displays MISMATCH for genuinely differing hash strings", () => {
    const hashA = "a6f4d53e8b6d7c0298ccdf57f92a4eb72c556bf8856ff581a35f6d891f87a420";
    const hashB = "8dc841d9e73f180763318afd082829ecbb3fa2f08c27f6c54f145fc5ee76c210";
    assert.strictEqual(computeHashMatchStatus(hashA, hashB), "MISMATCH");
  });

  it("displays NOT_CHECKED when currentHash is uncalculated or null", () => {
    const hashA = "a6f4d53e8b6d7c0298ccdf57f92a4eb72c556bf8856ff581a35f6d891f87a420";
    assert.strictEqual(computeHashMatchStatus(hashA, null), "NOT_CHECKED");
    assert.strictEqual(computeHashMatchStatus(hashA, undefined), "NOT_CHECKED");
    assert.strictEqual(computeHashMatchStatus(hashA, ""), "NOT_CHECKED");
  });

  it("preserves MATCH even if overall verification or blockchain check failed elsewhere", () => {
    // When identical hashes exist on a submission object, computeHashMatchStatus returns MATCH regardless of blockchain status
    const identicalHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    assert.strictEqual(computeHashMatchStatus(identicalHash, identicalHash), "MATCH");
  });
});

describe("Duplicate Submission & Activity Feed Mock Parity", () => {
  it("rejects duplicate submission with 409 ApiError when student has already submitted for assignment", async () => {
    // a-1 has an existing submission by Aarav Menon (student)
    const mockFile = new File(["dummy pdf bytes"], "test.pdf", { type: "application/pdf" });
    await assert.rejects(
      async () => {
        await mockRepository.submit("a-1", mockFile, () => {});
      },
      (err: any) => {
        assert.strictEqual(err.status, 409);
        assert.match(err.message, /already submitted a document/i);
        return true;
      }
    );
  });

  it("filters activity feed for student to only include their own events and assignment announcements", async () => {
    const studentFeed = await mockRepository.getActivities("student");
    // Verify Aarav Menon's event is present
    const ownEvent = studentFeed.find((a) => a.detail.includes(student.name));
    assert.ok(ownEvent, "Student's own event should be in feed");

    // Verify other students' names are NOT in the student feed
    const hasOtherStudent = studentFeed.some(
      (a) => a.detail.includes("Meera Iyer") || a.detail.includes("Rohan Shah")
    );
    assert.strictEqual(hasOtherStudent, false, "Other students' events must be filtered out");

    // Verify other students' tampering warnings are NOT in the student feed
    const hasTamperingWarning = studentFeed.some((a) => a.type === "warning");
    assert.strictEqual(hasTamperingWarning, false, "Tampering warnings must not leak to other students");

    // Verify generic assignment announcements remain present
    const hasAssignment = studentFeed.some((a) => a.type === "assignment");
    assert.strictEqual(hasAssignment, true, "Assignment announcements must remain visible");
  });

  it("returns full institution-wide activity feed for professor", async () => {
    const profFeed = await mockRepository.getActivities("professor");
    const hasMeera = profFeed.some((a) => a.detail.includes("Meera Iyer"));
    const hasRohanWarning = profFeed.some((a) => a.detail.includes("Rohan Shah") && a.type === "warning");
    assert.strictEqual(hasMeera, true, "Professor must see Meera's submission");
    assert.strictEqual(hasRohanWarning, true, "Professor must see Rohan's warning");
  });
});

describe("Assignment Lifecycle & Safe Delete Mock Parity", () => {
  it("allows professor to edit an assignment and extend deadline to reactivate it", async () => {
    const futureDeadline = new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString();
    const updated = await mockRepository.updateAssignment("a-3", {
      title: "Cryptographic Hash Functions (Extended)",
      deadline: futureDeadline,
    });
    assert.strictEqual(updated.title, "Cryptographic Hash Functions (Extended)");
    assert.strictEqual(updated.status, "ACTIVE");
  });

  it("blocks deleting an assignment with existing submissions (409 Conflict)", async () => {
    // a-1 has submissions
    await assert.rejects(
      async () => {
        await mockRepository.deleteAssignment("a-1");
      },
      (err: any) => {
        assert.strictEqual(err.status, 409);
        assert.match(err.message, /Cannot delete an assignment with existing submissions/i);
        return true;
      }
    );
  });

  it("allows deleting an assignment with ZERO submissions", async () => {
    const created = await mockRepository.createAssignment({
      title: "Temporary Test Assignment",
      description: "Assignment without submissions to be deleted",
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    });

    const res = await mockRepository.deleteAssignment(created.id);
    assert.match(res.message, /deleted successfully/i);
    assert.strictEqual(res.id, created.id);
  });

  it("rejects submissions to expired assignments with 400 ApiError", async () => {
    // Set a-2 deadline in the past
    await mockRepository.updateAssignment("a-2", {
      deadline: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    });

    const mockFile = new File(["dummy bytes"], "test.pdf", { type: "application/pdf" });
    await assert.rejects(
      async () => {
        await mockRepository.submit("a-2", mockFile, () => {});
      },
      (err: any) => {
        assert.strictEqual(err.status, 400);
        assert.match(err.message, /deadline has passed|closed/i);
        return true;
      }
    );
  });
});
