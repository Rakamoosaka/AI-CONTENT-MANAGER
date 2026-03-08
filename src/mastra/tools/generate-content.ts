import { z } from "zod";
import type { Agent } from "@mastra/core/agent";

export const generateContentInput = z.object({
  topic: z.string().min(2),
  tone: z.string().min(2).default("neutral"),
  targetLength: z.number().int().min(120).max(5000).default(900),
});

export const generateContentOutput = z.object({
  title: z.string(),
  body: z.string(),
});

export async function executeGenerateContent(
  input: z.infer<typeof generateContentInput>,
  agent: Agent,
) {
  const prompt = `
    Generate a blog article about "${input.topic}".
    Tone: ${input.tone}
    Approximate length: ${input.targetLength} words.
    The response must be in JSON format matching this schema:
    {
      "title": "Article Title",
      "body": "Article content in markdown format"
    }
  `;

  const result = await agent.generate(prompt, {
    output: generateContentOutput,
  });

  return result.object;
}
