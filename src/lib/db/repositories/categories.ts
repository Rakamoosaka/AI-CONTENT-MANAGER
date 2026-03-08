import { asc, count, eq } from "drizzle-orm";
import slugify from "slugify";
import { v4 as uuid } from "uuid";
import { db } from "@/lib/db/client";
import { articles, categories } from "@/lib/db/schema";

function normalizeSlug(value: string) {
  return slugify(value, { lower: true, strict: true, trim: true });
}

export async function listCategories() {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      articleCount: count(articles.id),
    })
    .from(categories)
    .leftJoin(articles, eq(articles.categoryId, categories.id))
    .groupBy(categories.id, categories.name, categories.slug, categories.description)
    .orderBy(asc(categories.name));

  return rows.map((row) => ({
    ...row,
    articleCount: Number(row.articleCount ?? 0),
  }));
}

export async function createCategory(input: {
  name: string;
  slug?: string;
  description?: string | null;
}) {
  const slug = normalizeSlug(input.slug || input.name);
  const existing = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug));
  if (existing.length) throw new Error("SLUG_EXISTS");

  const row = {
    id: uuid(),
    name: input.name,
    slug,
    description: input.description ?? null,
  };

  await db.insert(categories).values(row);
  return row;
}

export async function updateCategory(
  id: string,
  input: { name?: string; slug?: string; description?: string | null },
) {
  const existing = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id));
  if (!existing.length) return null;

  const nextSlug =
    input.slug !== undefined || input.name
      ? normalizeSlug(input.slug || input.name || existing[0].name)
      : undefined;

  if (nextSlug && nextSlug !== existing[0].slug) {
    const slugExists = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, nextSlug));
    if (slugExists.length) throw new Error("SLUG_EXISTS");
  }

  await db
    .update(categories)
    .set({
      name: input.name ?? existing[0].name,
      slug: nextSlug ?? existing[0].slug,
      description: input.description ?? existing[0].description,
    })
    .where(eq(categories.id, id));

  return db.select().from(categories).where(eq(categories.id, id)).get();
}

export async function deleteCategory(id: string) {
  const usage = await db
    .select({ total: count() })
    .from(articles)
    .where(eq(articles.categoryId, id));

  if ((usage[0]?.total ?? 0) > 0) {
    throw new Error("CATEGORY_IN_USE");
  }

  await db.delete(categories).where(eq(categories.id, id));
}
