import { z } from "zod";

const statusSchema = z.enum(["draft", "published"]);

export const articleCreateSchema = z.object({
  title: z.string().min(2).max(180),
  body: z.string().min(10),
  status: statusSchema.default("draft"),
  locale: z.string().min(2).max(10).default("ru"),
  seoTitle: z.string().max(180).optional().nullable(),
  seoDescription: z.string().max(320).optional().nullable(),
  seoKeywords: z.array(z.string()).max(12).optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
});

export const articleUpdateSchema = articleCreateSchema.partial();

export const articleFiltersSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  status: statusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  sort: z.enum(["createdAt.desc", "createdAt.asc"]).default("createdAt.desc"),
});

export const bulkCategorizeSchema = z.object({
  assignments: z
    .array(
      z.object({
        articleId: z.string().uuid(),
        categoryId: z.string().uuid().nullable(),
      }),
    )
    .min(1),
});
