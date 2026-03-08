import { bulkCategorizeSchema } from "@/lib/validators/articles";
import { fail, ok } from "@/lib/api/envelope";
import { bulkCategorize } from "@/lib/db/repositories/articles";

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = bulkCategorizeSchema.safeParse(json);

  if (!parsed.success) {
    return fail(
      "VALIDATION_ERROR",
      "Invalid assignments payload",
      422,
      parsed.error.flatten(),
    );
  }

  await bulkCategorize(parsed.data.assignments);
  return ok({ updated: parsed.data.assignments.length });
}
