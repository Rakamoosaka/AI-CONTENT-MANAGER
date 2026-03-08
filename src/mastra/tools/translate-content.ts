import { z } from "zod";
import type { Agent } from "@mastra/core/agent";

export const translateContentInput = z.object({
  title: z.string().min(2),
  body: z.string().min(20),
  targetLocale: z.string().min(2),
});

export const translateContentOutput = z.object({
  title: z.string(),
  body: z.string(),
  locale: z.string(),
});

export async function executeTranslateContent(
  input: z.infer<typeof translateContentInput>,
  agent: Agent,
) {
  const prompt = `
    Translate the following article to ${input.targetLocale}.
    Ensure the translation is natural and high quality.
    
    Article Title: ${input.title}
    Article Content: ${input.body}
    
    Return the translated title, body, and the target locale.
  `;

  const result = await agent.generate(prompt, {
    output: translateContentOutput,
  });

  return result.object;
}
