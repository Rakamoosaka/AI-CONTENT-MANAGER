import { categoryCreateSchema } from "@/lib/validators/categories";
import { created, fail, ok } from "@/lib/api/envelope";
import { createCategory, listCategories } from "@/lib/db/repositories/categories";

export async function GET() {
  const categories = await listCategories();
  return ok(categories);
}

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = categoryCreateSchema.safeParse(json);

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Invalid category payload", 422, parsed.error.flatten());
  }

  try {
    const category = await createCategory(parsed.data);
    return created(category);
  } catch (error) {
    if (error instanceof Error && error.message === "SLUG_EXISTS") {
      return fail("SLUG_EXISTS", "Category slug already exists", 409);
    }
    return fail("INTERNAL_ERROR", "Failed to create category", 500);
  }
}
