import { fail, ok } from "@/lib/api/envelope";
import { agentActionSchema, runContentAgentAction } from "@/mastra";

const DEFAULT_TIMEOUT_MS = 90000;

function resolveTimeoutMs() {
  const parsed = Number(process.env.AI_ACTION_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);

  if (!Number.isFinite(parsed)) {
    return DEFAULT_TIMEOUT_MS;
  }

  return Math.max(10000, Math.min(parsed, 180000));
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("TIMEOUT")), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

export async function POST(req: Request) {
  let json: unknown;

  try {
    json = await req.json();
  } catch {
    return fail("INVALID_JSON", "Invalid JSON body", 400);
  }

  const parsed = agentActionSchema.safeParse(json);

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Invalid agent payload", 422, parsed.error.flatten());
  }

  try {
    const timeoutMs = resolveTimeoutMs();
    const result = await withTimeout(runContentAgentAction(parsed.data), timeoutMs);

    return ok(result);
  } catch (error) {
    if (error instanceof Error && error.message === "TIMEOUT") {
      return fail(
        "AI_TIMEOUT",
        "AI request timed out. Please retry.",
        504,
        { timeoutMs: resolveTimeoutMs() },
        {
          headers: {
            "Retry-After": "2",
          },
        },
      );
    }

    return fail(
      "AI_FAILED",
      "AI service temporarily unavailable. Please retry.",
      502,
      {
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : "UnknownError",
      },
      {
        headers: {
          "Retry-After": "1",
        },
      },
    );
  }
}
