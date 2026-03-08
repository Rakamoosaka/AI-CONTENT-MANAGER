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
  confidence: z.number().min(0).max(1),
  rationale: z.string(),
});

export async function executeCategorize(
  input: z.infer<typeof categorizeInput>,
  agent: Agent,
) {
  const prompt = `
    Analyze the following article content and suggest the most appropriate category from the provided list.
    
    Article Content:
    ${input.body.slice(0, 2000)} ...
    
    Available Categories:
    ${input.categories.map((c) => `- ${c.name} (ID: ${c.id})`).join("\n")}
    
    Choose the best match and provide a confidence score (0 to 1) and a short rationale.
    If no category fits well, return categoryId as null.
  `;

  const result = await agent.generate(prompt, {
    output: categorizeOutput,
  });

  return result.object;
}
