/**
 * Tests for POST /api/submit (src/app/api/submit/route.ts)
 */
import { POST } from "@/app/api/submit/route";

const validPayload = {
  name: "John Doe",
  nationalId: "ABC1234",
  dateOfBirth: "1990-01-01",
  gender: "male",
  address: "123 Main Street",
  city: "London",
  state: "England",
  country: "United",
  phone: "+44 1234 5678",
  email: "john@example.com",
  maritalStatus: "single",
  dependents: "0",
  employmentStatus: "employed",
  monthlyIncome: "3000",
  housingStatus: "rent",
  financialSituation: "A".repeat(30),
  employmentCircumstances: "A".repeat(30),
  reasonForApplying: "A".repeat(30),
};

function makeRequest(body: unknown, json = true): Request {
  if (!json) {
    // Send raw non-JSON to trigger parse error
    return new Request("http://localhost/api/submit", {
      method: "POST",
      body: "not-json-{{",
      headers: { "Content-Type": "text/plain" },
    });
  }
  return new Request("http://localhost/api/submit", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/submit", () => {
  it("returns 400 for invalid JSON body", async () => {
    const res = await POST(makeRequest(null, false));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.ok).toBe(false);
  });

  it("returns 400 with validation issues for invalid payload", async () => {
    const res = await POST(makeRequest({ name: "invalid123" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.error).toBe("validation_failed");
    expect(data.issues).toBeDefined();
  });

  it("returns 200 with reference for a valid payload", async () => {
    const res = await POST(makeRequest(validPayload));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(typeof data.reference).toBe("string");
    expect(data.reference).toMatch(/^SSP-\d{4}-[A-Z0-9]+$/);
    expect(data.message).toBeDefined();
  });

  it("generates a unique reference on each call", async () => {
    let tick = 1000000;
    jest.spyOn(Date, "now").mockImplementation(() => tick++);
    try {
      const r1 = await POST(makeRequest(validPayload)).then((r) => r.json());
      const r2 = await POST(makeRequest(validPayload)).then((r) => r.json());
      expect(r1.reference).not.toBe(r2.reference);
    } finally {
      jest.spyOn(Date, "now").mockRestore();
    }
  });
});
