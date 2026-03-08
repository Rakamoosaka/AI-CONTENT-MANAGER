import { z } from "zod";
import type { Agent } from "@mastra/core/agent";

export const categorizeInput = z.object({
  body: z.string().min(20),
  categories: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
    }),
  ),
});

export const categorizeOutput = z.object({
  categoryId: z.string().nullable(),
  confidence: z.coerce.number().min(0).max(1).catch(0.35),
  rationale: z.string(),
});

export async function executeCategorize(
  input: z.infer<typeof categorizeInput>,
  agent: Agent,
) {
  if (!input.categories.length) {
    return {
      categoryId: null,
      confidence: 0,
      rationale: "No categories are available to suggest.",
    };
  }

  const categoriesList = input.categories
    .map((c) => `- ${c.name} (ID: ${c.id}, slug: ${c.slug})`)
    .join("\n");

  const prompt = `
    Analyze the following article content and suggest the most appropriate category from the provided list.
    
    Article Content:
    ${input.body.slice(0, 2000)} ...
    
    Available Categories:
    ${categoriesList}
    
    Rules:
    - categoryId must be one of the listed IDs exactly, or null.
    - confidence must be a number between 0 and 1.
    - rationale must be short and specific.
    If no category fits well, return categoryId as null.
  `;

  try {
    const result = await agent.generate(prompt, {
      output: categorizeOutput,
    });

    const parsed = categorizeOutput.parse(result.object);
    const byId = new Set(input.categories.map((item) => item.id));

    if (parsed.categoryId && byId.has(parsed.categoryId)) {
      return parsed;
    }

    const lookupKey = parsed.categoryId?.toLowerCase();
    const matchedByNameOrSlug = lookupKey
      ? input.categories.find(
          (item) =>
            item.name.toLowerCase() === lookupKey || item.slug.toLowerCase() === lookupKey,
        )
      : undefined;

    return {
      ...parsed,
      categoryId: matchedByNameOrSlug?.id ?? null,
    };
  } catch {
    return {
      categoryId: null,
      confidence: 0,
      rationale: "AI could not confidently map this article to a category.",
    };
  }
}
