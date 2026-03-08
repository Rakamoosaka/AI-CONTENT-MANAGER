import { articleUpdateSchema } from "@/lib/validators/articles";
import { fail, ok } from "@/lib/api/envelope";
import {
  deleteArticle,
  getArticleById,
  updateArticle,
} from "@/lib/db/repositories/articles";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    return fail("NOT_FOUND", "Article not found", 404);
  }

  return ok(article);
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const json = await req.json();
  const parsed = articleUpdateSchema.safeParse(json);

  if (!parsed.success) {
    return fail(
      "VALIDATION_ERROR",
      "Invalid article payload",
      422,
      parsed.error.flatten(),
    );
  }

  const updated = await updateArticle(id, parsed.data);
  if (!updated) {
    return fail("NOT_FOUND", "Article not found", 404);
  }

  return ok(updated);
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params;
  await deleteArticle(id);
  return ok({ deleted: true });
}
