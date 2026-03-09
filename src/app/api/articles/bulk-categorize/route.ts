import { bulkCategorizeSchema } from "@/lib/validators/articles";
import { ok } from "@/lib/api/envelope";
import { readJsonOrFail, validateOrFail } from "@/lib/api/route-utils";
import { bulkCategorize } from "@/lib/db/repositories/articles";

export async function POST(req: Request) {
  const jsonResult = await readJsonOrFail(req);
  if (!jsonResult.ok) {
    return jsonResult.response;
  }

  const parsed = validateOrFail(
    bulkCategorizeSchema,
    jsonResult.data,
    "Invalid assignments payload",
  );
  if (!parsed.ok) {
    return parsed.response;
  }

  await bulkCategorize(parsed.data.assignments);
  return ok({ updated: parsed.data.assignments.length });
}
