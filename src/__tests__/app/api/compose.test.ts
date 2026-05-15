/**
 * Tests for POST /api/compose (src/app/api/compose/route.ts)
 * Mocks global fetch to avoid real network calls.
 */
import { POST } from "@/app/api/compose/route";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeRequest(body: unknown, rawBody?: string): Request {
  return new Request("http://localhost/api/compose", {
    method: "POST",
    body: rawBody ?? JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

function mockFetchOk(choice: { content?: string | null; reasoning?: string | null }) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: jest.fn().mockResolvedValue({
      choices: [{ message: choice }],
    }),
    text: jest.fn().mockResolvedValue(""),
  });
}

function mockFetchError(status: number, body = "") {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    status,
    text: jest.fn().mockResolvedValue(body),
    json: jest.fn().mockResolvedValue({}),
  });
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
const OLD_ENV = process.env;

beforeEach(() => {
  process.env = { ...OLD_ENV, GROQ_API_KEY: "test-key" };
  global.fetch = jest.fn();
  jest.useFakeTimers();
});

afterEach(() => {
  process.env = OLD_ENV;
  jest.useRealTimers();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("POST /api/compose – missing API key", () => {
  it("returns 503 when GROQ_API_KEY is not set", async () => {
    process.env = { ...OLD_ENV, GROQ_API_KEY: "" };
    const res = await POST(makeRequest({ fieldKey: "financialSituation" }));
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.error).toBe("missing_api_key");
  });
});

describe("POST /api/compose – request validation", () => {
  it("returns 400 for invalid JSON body", async () => {
    const req = makeRequest(null, "not-json-{{");
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid JSON body");
  });

  it("returns 400 for unsupported fieldKey", async () => {
    const res = await POST(makeRequest({ fieldKey: "unknownField" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Unsupported field");
  });

  it("returns 400 when fieldKey is missing", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });
});

describe("POST /api/compose – successful responses", () => {
  it.each([
    "financialSituation",
    "employmentCircumstances",
    "reasonForApplying",
  ] as const)("returns suggestion for field: %s", async (fieldKey) => {
    mockFetchOk({ content: "Generated paragraph text." });
    const res = await POST(makeRequest({ fieldKey }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.suggestion).toBe("Generated paragraph text.");
  });

  it("uses reasoning when content is empty", async () => {
    mockFetchOk({ content: "", reasoning: "Reasoning text." });
    const res = await POST(makeRequest({ fieldKey: "financialSituation" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.suggestion).toBe("Reasoning text.");
  });

  it("returns 502 when both content and reasoning are empty", async () => {
    mockFetchOk({ content: "", reasoning: "" });
    const res = await POST(makeRequest({ fieldKey: "financialSituation" }));
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.error).toBe("empty_response");
  });

  it("returns 502 when choices array is empty", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ choices: [] }),
      text: jest.fn().mockResolvedValue(""),
    });
    const res = await POST(makeRequest({ fieldKey: "financialSituation" }));
    expect(res.status).toBe(502);
  });
});

describe("POST /api/compose – language and hints", () => {
  it("sends Arabic language when language=ar", async () => {
    mockFetchOk({ content: "Arabic paragraph." });
    await POST(makeRequest({ fieldKey: "financialSituation", language: "ar" }));
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(fetchCall[1].body as string);
    expect(body.messages[1].content).toContain("Arabic");
  });

  it("sends English language when language is not ar", async () => {
    mockFetchOk({ content: "English paragraph." });
    await POST(makeRequest({ fieldKey: "financialSituation", language: "en" }));
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body as string);
    expect(body.messages[1].content).toContain("English");
  });

  it("includes hint lines when hints are provided", async () => {
    mockFetchOk({ content: "Result." });
    await POST(
      makeRequest({
        fieldKey: "financialSituation",
        hints: {
          employmentStatus: "Unemployed",
          monthlyIncome: "0",
          housingStatus: "temporary",
          maritalStatus: "single",
        },
      }),
    );
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body as string);
    const userMsg: string = body.messages[1].content;
    expect(userMsg).toContain("Unemployed");
    expect(userMsg).toContain("temporary");
  });

  it("omits hint block when hints are absent", async () => {
    mockFetchOk({ content: "Result." });
    await POST(makeRequest({ fieldKey: "financialSituation" }));
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body as string);
    const userMsg: string = body.messages[1].content;
    expect(userMsg).not.toContain("applicant provided");
  });
});

describe("POST /api/compose – provider error responses", () => {
  it("returns 401 for invalid API key", async () => {
    mockFetchError(401);
    const res = await POST(makeRequest({ fieldKey: "financialSituation" }));
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("invalid_api_key");
  });

  it("returns 429 with insufficient_quota when quota code present", async () => {
    mockFetchError(429, JSON.stringify({ error: { code: "insufficient_quota", message: "quota exceeded" } }));
    const res = await POST(makeRequest({ fieldKey: "financialSituation" }));
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toBe("insufficient_quota");
  });

  it("returns 429 with rate_limit when quota code absent", async () => {
    mockFetchError(429, JSON.stringify({ error: { code: "rate_limit_exceeded", message: "slow down" } }));
    const res = await POST(makeRequest({ fieldKey: "financialSituation" }));
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toBe("rate_limit");
  });

  it("returns 429 with insufficient_quota when billing keyword in message", async () => {
    mockFetchError(429, JSON.stringify({ error: { code: "other", message: "billing issue detected" } }));
    const res = await POST(makeRequest({ fieldKey: "financialSituation" }));
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toBe("insufficient_quota");
  });

  it("returns 502 for other provider errors", async () => {
    mockFetchError(500, "Internal server error");
    const res = await POST(makeRequest({ fieldKey: "financialSituation" }));
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.error).toBe("provider_error");
  });

  it("returns 502 for provider error with non-JSON response body", async () => {
    mockFetchError(500, "plain text error");
    const res = await POST(makeRequest({ fieldKey: "financialSituation" }));
    expect(res.status).toBe(502);
  });
});

describe("POST /api/compose – network/timeout errors", () => {
  it("returns 504 when fetch is aborted (timeout)", async () => {
    const abortErr = new DOMException("The operation was aborted.", "AbortError");
    (global.fetch as jest.Mock).mockRejectedValueOnce(abortErr);
    const res = await POST(makeRequest({ fieldKey: "financialSituation" }));
    expect(res.status).toBe(504);
    const data = await res.json();
    expect(data.error).toBe("timeout");
  });

  it("returns 502 for generic network errors", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network failure"));
    const res = await POST(makeRequest({ fieldKey: "financialSituation" }));
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.error).toBe("network");
  });
});

describe("POST /api/compose – GPT-OSS model extras", () => {
  it("adds reasoning_effort and include_reasoning for gpt-oss model", async () => {
    process.env = { ...OLD_ENV, GROQ_API_KEY: "test-key", GROQ_CHAT_MODEL: "openai/gpt-oss-120b" };
    mockFetchOk({ content: "Result." });
    await POST(makeRequest({ fieldKey: "financialSituation" }));
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body as string);
    expect(body.include_reasoning).toBe(false);
    expect(body.reasoning_effort).toBe("low");
  });

  it("does not add reasoning fields for non-gpt-oss models", async () => {
    process.env = { ...OLD_ENV, GROQ_API_KEY: "test-key", GROQ_CHAT_MODEL: "llama3-8b-8192" };
    mockFetchOk({ content: "Result." });
    await POST(makeRequest({ fieldKey: "financialSituation" }));
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body as string);
    expect(body.include_reasoning).toBeUndefined();
    expect(body.reasoning_effort).toBeUndefined();
  });
});
