import {
  articleCreateSchema,
  articleFiltersSchema,
} from "@/lib/validators/articles";
import { created, fail, okWithMeta } from "@/lib/api/envelope";
import { createArticle, listArticles } from "@/lib/db/repositories/articles";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = articleFiltersSchema.safeParse({
    search: searchParams.get("search") ?? undefined,
    categoryId: searchParams.get("categoryId") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    page: searchParams.get("page") ?? "1",
    pageSize: searchParams.get("pageSize") ?? "10",
    sort: searchParams.get("sort") ?? "createdAt.desc",
  });

  if (!parsed.success) {
    return fail(
      "VALIDATION_ERROR",
      "Invalid filters",
      422,
      parsed.error.flatten(),
    );
  }

  const data = await listArticles(parsed.data);
  return okWithMeta(data.items, {
    total: data.total,
    page: data.page,
    pageSize: data.pageSize,
  });
}

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = articleCreateSchema.safeParse(json);

  if (!parsed.success) {
    return fail(
      "VALIDATION_ERROR",
      "Invalid article payload",
      422,
      parsed.error.flatten(),
    );
  }

  const data = await createArticle(parsed.data);
  return created(data);
}
