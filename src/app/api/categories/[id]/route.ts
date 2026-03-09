import { categoryUpdateSchema } from "@/lib/validators/categories";
import { fail, ok } from "@/lib/api/envelope";
import {
  mapDomainError,
  readJsonOrFail,
  validateOrFail,
} from "@/lib/api/route-utils";
import {
  deleteCategory,
  updateCategory,
} from "@/lib/db/repositories/categories";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const jsonResult = await readJsonOrFail(req);
  if (!jsonResult.ok) {
    return jsonResult.response;
  }

  const parsed = validateOrFail(
    categoryUpdateSchema,
    jsonResult.data,
    "Invalid category payload",
  );
  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const category = await updateCategory(id, parsed.data);
    if (!category) {
      return fail("NOT_FOUND", "Category not found", 404);
    }
    return ok(category);
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
        message: "Failed to update category",
        status: 500,
      },
    );
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params;
  try {
    await deleteCategory(id);
    return ok({ deleted: true });
  } catch (error) {
    return mapDomainError(
      error,
      {
        CATEGORY_IN_USE: {
          code: "CATEGORY_IN_USE",
          message:
            "Category is in use by one or more articles and cannot be deleted",
          status: 409,
        },
      },
      {
        code: "INTERNAL_ERROR",
        message: "Failed to delete category",
        status: 500,
      },
    );
  }
}
