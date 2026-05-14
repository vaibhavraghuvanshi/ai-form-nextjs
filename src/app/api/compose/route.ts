import { NextResponse } from "next/server";

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_CHAT_MODEL = "openai/gpt-oss-120b";
const REQUEST_TIMEOUT_MS = 45_000;

function getGroqApiKey(): string | undefined {
  const v = process.env.GROQ_API_KEY?.trim();
  return v || undefined;
}

function getChatModel(): string {
  const m = process.env.GROQ_CHAT_MODEL?.trim();
  return m || DEFAULT_CHAT_MODEL;
}

function parseProviderError(text: string): { code?: string; message?: string } {
  try {
    const j = JSON.parse(text) as {
      error?: { code?: string; message?: string };
    };
    return {
      code: typeof j?.error?.code === "string" ? j.error.code : undefined,
      message: typeof j?.error?.message === "string" ? j.error.message : undefined,
    };
  } catch {
    return {};
  }
}

type Body = {
  fieldKey: string;
  language?: string;
  hints?: {
    employmentStatus?: string;
    monthlyIncome?: string;
    housingStatus?: string;
    maritalStatus?: string;
  };
};

function buildUserMessage(fieldKey: string, language: string, hints: Body["hints"]) {
  const hintLines: string[] = [];
  if (hints?.employmentStatus) {
    hintLines.push(`Employment status (label only): ${hints.employmentStatus}`);
  }
  if (hints?.monthlyIncome) {
    hintLines.push(`Monthly income (as entered): ${hints.monthlyIncome}`);
  }
  if (hints?.housingStatus) {
    hintLines.push(`Housing status (label only): ${hints.housingStatus}`);
  }
  if (hints?.maritalStatus) {
    hintLines.push(`Marital status (label only): ${hints.maritalStatus}`);
  }

  const hintBlock =
    hintLines.length > 0
      ? `\nThe applicant provided these non-identifying labels to ground the tone (do not invent facts beyond them):\n${hintLines.join("\n")}\n`
      : "";

  const fieldInstructions: Record<string, string> = {
    financialSituation:
      "Write one concise paragraph describing financial hardship for a government social support application. Do not include names, IDs, or addresses. Use a respectful, factual tone.",
    employmentCircumstances:
      "Write one concise paragraph about employment circumstances (job loss, reduced hours, informal work, etc.) suitable for a government assistance form. Do not invent employers or dates. No names or IDs.",
    reasonForApplying:
      "Write one concise paragraph explaining why the applicant is seeking support. Stay general and dignified. No names or IDs.",
  };

  const instruction =
    fieldInstructions[fieldKey] ??
    "Write one short paragraph suitable for a government assistance application form.";

  return [
    `Language for the answer: ${language === "ar" ? "Arabic" : "English"}.`,
    instruction,
    hintBlock,
    "Output only the paragraph text, no bullet points or headings.",
  ].join("\n\n");
}

export async function POST(request: Request) {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "missing_api_key",
        hint: "Set GROQ_API_KEY in .env.local (project root). Restart npm run dev after saving.",
      },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const fieldKey = typeof body.fieldKey === "string" ? body.fieldKey.trim() : "";
  const allowed = new Set([
    "financialSituation",
    "employmentCircumstances",
    "reasonForApplying",
  ]);
  if (!allowed.has(fieldKey)) {
    return NextResponse.json({ error: "Unsupported field" }, { status: 400 });
  }

  const language = body.language === "ar" ? "ar" : "en";
  const userMessage = buildUserMessage(fieldKey, language, body.hints);
  const model = getChatModel();
  const isGptOss = model.includes("gpt-oss");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const requestBody: Record<string, unknown> = {
      model,
      messages: [
        {
          role: "system",
          content:
            "You help citizens draft neutral, factual paragraphs for social support application forms. Never include personally identifiable information. If hints are sparse, write a template-style paragraph the applicant can edit.",
        },
        { role: "user", content: userMessage },
      ],
      temperature: 0.6,
      max_tokens: 400,
    };

    if (isGptOss) {
      // GPT-OSS can return empty `content` when reasoning is split out; force answer in `content`.
      requestBody.include_reasoning = false;
      requestBody.reasoning_effort = "low";
    }

    const res = await fetch(GROQ_CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      const parsed = parseProviderError(errText);

      if (res.status === 401) {
        return NextResponse.json({ error: "invalid_api_key" }, { status: 401 });
      }

      if (res.status === 429) {
        const quotaLike =
          parsed.code === "insufficient_quota" ||
          /billing|quota|credit/i.test(parsed.message ?? "");
        return NextResponse.json(
          { error: quotaLike ? "insufficient_quota" : "rate_limit" },
          { status: 429 },
        );
      }

      return NextResponse.json(
        { error: "provider_error", detail: errText.slice(0, 200) },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{
        message?: {
          content?: string | null;
          reasoning?: string | null;
        };
      }>;
    };
    const msg = data.choices?.[0]?.message;
    const content = typeof msg?.content === "string" ? msg.content.trim() : "";
    const reasoning =
      typeof msg?.reasoning === "string" ? msg.reasoning.trim() : "";
    const text = content || reasoning;
    if (!text) {
      return NextResponse.json({ error: "empty_response" }, { status: 502 });
    }

    return NextResponse.json({ suggestion: text });
  } catch (e) {
    clearTimeout(timeout);
    const aborted = e instanceof Error && e.name === "AbortError";
    return NextResponse.json(
      { error: aborted ? "timeout" : "network" },
      { status: aborted ? 504 : 502 },
    );
  }
}
