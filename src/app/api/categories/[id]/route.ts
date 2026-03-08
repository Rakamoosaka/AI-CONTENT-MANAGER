import { categoryUpdateSchema } from "@/lib/validators/categories";
import { fail, ok } from "@/lib/api/envelope";
import {
  deleteCategory,
  updateCategory,
} from "@/lib/db/repositories/categories";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const json = await req.json();
  const parsed = categoryUpdateSchema.safeParse(json);

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Invalid category payload", 422, parsed.error.flatten());
  }

  try {
    const category = await updateCategory(id, parsed.data);
    if (!category) {
      return fail("NOT_FOUND", "Category not found", 404);
    }
    return ok(category);
  } catch (error) {
    if (error instanceof Error && error.message === "SLUG_EXISTS") {
      return fail("SLUG_EXISTS", "Category slug already exists", 409);
    }
    return fail("INTERNAL_ERROR", "Failed to update category", 500);
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params;
  try {
    await deleteCategory(id);
    return ok({ deleted: true });
  } catch (error) {
    if (error instanceof Error && error.message === "CATEGORY_IN_USE") {
      return fail(
        "CATEGORY_IN_USE",
        "Category is in use by one or more articles and cannot be deleted",
        409,
      );
    }

    return fail("INTERNAL_ERROR", "Failed to delete category", 500);
  }
}
