import { articleUpdateSchema } from "@/lib/validators/articles";
import { fail, ok } from "@/lib/api/envelope";
import { readJsonOrFail, validateOrFail } from "@/lib/api/route-utils";
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
  const jsonResult = await readJsonOrFail(req);
  if (!jsonResult.ok) {
    return jsonResult.response;
  }

  const parsed = validateOrFail(
    articleUpdateSchema,
    jsonResult.data,
    "Invalid article payload",
  );
  if (!parsed.ok) {
    return parsed.response;
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
