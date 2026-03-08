import { fail, ok } from "@/lib/api/envelope";
import { agentActionSchema, runContentAgentAction } from "@/mastra";

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = agentActionSchema.safeParse(json);

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Invalid agent payload", 422, parsed.error.flatten());
  }

  try {
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("TIMEOUT")), 45000);
    });

    const result = await Promise.race([
      runContentAgentAction(parsed.data),
      timeout,
    ]);

    return ok(result);
  } catch (error) {
    if (error instanceof Error && error.message === "TIMEOUT") {
      return fail("AI_TIMEOUT", "AI request timed out", 504);
    }

    return fail("AI_FAILED", "Unable to process AI action", 500, {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : "UnknownError",
    });
  }
}
