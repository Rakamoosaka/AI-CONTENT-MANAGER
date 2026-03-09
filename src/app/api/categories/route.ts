import { categoryCreateSchema } from "@/lib/validators/categories";
import { created, ok } from "@/lib/api/envelope";
import {
  mapDomainError,
  readJsonOrFail,
  validateOrFail,
} from "@/lib/api/route-utils";
import {
  createCategory,
  listCategories,
} from "@/lib/db/repositories/categories";

export async function GET() {
  const categories = await listCategories();
  return ok(categories);
}

export async function POST(req: Request) {
  const jsonResult = await readJsonOrFail(req);
  if (!jsonResult.ok) {
    return jsonResult.response;
  }

  const parsed = validateOrFail(
    categoryCreateSchema,
    jsonResult.data,
    "Invalid category payload",
  );
  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const category = await createCategory(parsed.data);
    return created(category);
  } catch (error) {
    return mapDomainError(
      error,
      {
        SLUG_EXISTS: {
          code: "SLUG_EXISTS",
          message: "Category slug already exists",
          status: 409,
        },
      },
      {
        code: "INTERNAL_ERROR",
        message: "Failed to create category",
        status: 500,
      },
    );
  }
}
