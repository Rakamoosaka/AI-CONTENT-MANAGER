import { z } from "zod";
import type { Agent } from "@mastra/core/agent";

export const seoSuggestionsInput = z.object({
  title: z.string().min(2),
  body: z.string().min(30),
  locale: z.string().default("en"),
});

export const seoSuggestionsOutput = z.object({
  seoTitle: z.string(),
  seoDescription: z.string(),
  seoKeywords: z.array(z.string()).min(3).max(10),
});

export async function executeSeoSuggestions(
  input: z.infer<typeof seoSuggestionsInput>,
  agent: Agent,
) {
  const prompt = `
    Analyze the following article content and suggest SEO improvements.
    
    Article Title: ${input.title}
    Article Content: ${input.body.slice(0, 1000)} ...
    
    Provide a optimized SEO Title (max 60 chars), a Meta Description (max 160 chars), and 5-8 relevant SEO Keywords.
    Language: ${input.locale}
  `;

  const result = await agent.generate(prompt, {
    output: seoSuggestionsOutput,
  });

  return result.object;
}
