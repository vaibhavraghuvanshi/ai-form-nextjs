import { NextResponse } from "next/server";
import { applicationPayloadSchema } from "@/lib/application-validation";

function newApplicationReference(): string {
  const y = new Date().getUTCFullYear();
  const raw = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const seg = raw.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 8);
  return `SSP-${y}-${seg}`;
}

/**
 * Mock submission endpoint — validates payload server-side, then returns success.
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = applicationPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "validation_failed",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  if (process.env.NODE_ENV === "development") {
    console.info(
      "[mock-submit] validated keys:",
      Object.keys(parsed.data),
    );
  }

  return NextResponse.json({
    ok: true,
    reference: newApplicationReference(),
    message: "Your application has been recorded.",
  });
}
