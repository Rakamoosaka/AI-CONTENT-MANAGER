import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(120),
  description: z.string().max(500).optional().nullable(),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();
