import type { ZodType } from "zod";
import { fail } from "@/lib/api/envelope";

export type DomainErrorMap = {
  code: string;
  message: string;
  status: number;
};

export async function readJsonOrFail(
  req: Request,
): Promise<{ ok: true; data: unknown } | { ok: false; response: Response }> {
  try {
    return { ok: true, data: await req.json() };
  } catch {
    return {
      ok: false,
      response: fail("INVALID_JSON", "Invalid JSON body", 400),
    };
  }
}

export function validateOrFail<T>(
  schema: ZodType<T>,
  input: unknown,
  message: string,
): { ok: true; data: T } | { ok: false; response: Response } {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      response: fail("VALIDATION_ERROR", message, 422, parsed.error.flatten()),
    };
  }

  return { ok: true, data: parsed.data };
}

export function mapDomainError(
  error: unknown,
  mappings: Record<string, DomainErrorMap>,
  fallback: DomainErrorMap,
) {
  if (error instanceof Error && mappings[error.message]) {
    const mapped = mappings[error.message];
    return fail(mapped.code, mapped.message, mapped.status);
  }

  return fail(fallback.code, fallback.message, fallback.status, {
    message: error instanceof Error ? error.message : String(error),
    name: error instanceof Error ? error.name : "UnknownError",
  });
}
