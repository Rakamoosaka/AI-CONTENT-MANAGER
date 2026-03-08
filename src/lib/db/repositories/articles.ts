import { and, asc, count, desc, eq, like, or } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { db } from "@/lib/db/client";
import { articles, categories } from "@/lib/db/schema";
import { toExcerpt } from "@/lib/utils";

type ListInput = {
  search?: string;
  categoryId?: string;
  status?: "draft" | "published";
  page: number;
  pageSize: number;
  sort: "createdAt.desc" | "createdAt.asc";
};

export async function listArticles(input: ListInput) {
  const where = and(
    input.search
      ? or(
          like(articles.title, `%${input.search}%`),
          like(articles.body, `%${input.search}%`),
        )
      : undefined,
    input.categoryId ? eq(articles.categoryId, input.categoryId) : undefined,
    input.status ? eq(articles.status, input.status) : undefined,
  );

  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      body: articles.body,
      excerpt: articles.excerpt,
      status: articles.status,
      locale: articles.locale,
      seoTitle: articles.seoTitle,
      seoDescription: articles.seoDescription,
      seoKeywords: articles.seoKeywords,
      categoryId: articles.categoryId,
      categoryName: categories.name,
      createdAt: articles.createdAt,
      updatedAt: articles.updatedAt,
    })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(where)
    .limit(input.pageSize)
    .offset((input.page - 1) * input.pageSize)
    .orderBy(
      input.sort === "createdAt.asc"
        ? asc(articles.createdAt)
        : desc(articles.createdAt),
    );

  const totalRows = await db
    .select({ total: count() })
    .from(articles)
    .where(where);

  return {
    items: rows.map((row: (typeof rows)[number]) => ({
      ...row,
      seoKeywords: row.seoKeywords
        ? (JSON.parse(row.seoKeywords) as string[])
        : [],
    })),
    total: totalRows[0]?.total ?? 0,
    page: input.page,
    pageSize: input.pageSize,
  };
}

export async function getArticleById(id: string) {
  const row = await db
    .select()
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1)
    .then((res: Array<(typeof articles.$inferSelect)>) => res[0]);

  if (!row) return null;

  return {
    ...row,
    seoKeywords: row.seoKeywords
      ? (JSON.parse(row.seoKeywords) as string[])
      : [],
  };
}

export async function createArticle(input: {
  title: string;
  body: string;
  status: "draft" | "published";
  locale: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string[] | null;
  categoryId?: string | null;
}) {
  const now = Date.now();
  const id = uuid();

  const row = {
    id,
    title: input.title,
    body: input.body,
    excerpt: toExcerpt(input.body),
    status: input.status,
    locale: input.locale,
    seoTitle: input.seoTitle ?? null,
    seoDescription: input.seoDescription ?? null,
    seoKeywords: JSON.stringify(input.seoKeywords ?? []),
    categoryId: input.categoryId ?? null,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(articles).values(row);
  return getArticleById(id);
}

export async function updateArticle(
  id: string,
  input: Partial<{
    title: string;
    body: string;
    status: "draft" | "published";
    locale: string;
    seoTitle: string | null;
    seoDescription: string | null;
    seoKeywords: string[] | null;
    categoryId: string | null;
  }>,
) {
  const existing = await getArticleById(id);
  if (!existing) return null;

  const nextBody = input.body ?? existing.body;

  await db
    .update(articles)
    .set({
      title: input.title ?? existing.title,
      body: nextBody,
      excerpt: toExcerpt(nextBody),
      status: input.status ?? existing.status,
      locale: input.locale ?? existing.locale,
      seoTitle: input.seoTitle ?? existing.seoTitle,
      seoDescription: input.seoDescription ?? existing.seoDescription,
      seoKeywords:
        input.seoKeywords !== undefined
          ? JSON.stringify(input.seoKeywords ?? [])
          : JSON.stringify(existing.seoKeywords ?? []),
      categoryId: input.categoryId ?? existing.categoryId,
      updatedAt: Date.now(),
    })
    .where(eq(articles.id, id));

  return getArticleById(id);
}

export async function deleteArticle(id: string) {
  await db.delete(articles).where(eq(articles.id, id));
}

export function bulkCategorize(
  assignments: Array<{ articleId: string; categoryId: string | null }>,
) {
  return db.transaction((tx) => {
    for (const assignment of assignments) {
      tx.update(articles)
        .set({
          categoryId: assignment.categoryId,
          updatedAt: Date.now(),
        })
        .where(eq(articles.id, assignment.articleId))
        .run();
    }
  });
}

export async function getDashboardStats() {
  const [totals, published, drafts, latest, categoriesDistribution] =
    await Promise.all([
      db.select({ total: count() }).from(articles),
      db
        .select({ total: count() })
        .from(articles)
        .where(eq(articles.status, "published")),
      db
        .select({ total: count() })
        .from(articles)
        .where(eq(articles.status, "draft")),
      db
        .select({
          id: articles.id,
          title: articles.title,
          status: articles.status,
          locale: articles.locale,
          createdAt: articles.createdAt,
        })
        .from(articles)
        .orderBy(desc(articles.createdAt))
        .limit(8),
      db
        .select({
          categoryId: categories.id,
          categoryName: categories.name,
          total: count(articles.id),
        })
        .from(categories)
        .leftJoin(articles, eq(articles.categoryId, categories.id))
        .groupBy(categories.id),
    ]);

  return {
    totalArticles: totals[0]?.total ?? 0,
    published: published[0]?.total ?? 0,
    drafts: drafts[0]?.total ?? 0,
    latest,
    categoriesDistribution,
  };
}
