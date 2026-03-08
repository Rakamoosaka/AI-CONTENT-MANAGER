import { z } from "zod";
import { Agent } from "@mastra/core/agent";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import {
  categorizeInput,
  categorizeOutput,
  executeCategorize,
} from "@/mastra/tools/categorize";
import {
  executeGenerateContent,
  generateContentInput,
  generateContentOutput,
} from "@/mastra/tools/generate-content";
import {
  executeSeoSuggestions,
  seoSuggestionsInput,
  seoSuggestionsOutput,
} from "@/mastra/tools/seo-suggestions";
import {
  executeTranslateContent,
  translateContentInput,
  translateContentOutput,
} from "@/mastra/tools/translate-content";

const openrouter = createOpenAICompatible({
  baseURL: process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  name: "openrouter",
});

export const contentAgent = new Agent({
  name: "Content Manager Agent",
  id: "content-agent",
  model: openrouter(process.env.OPENROUTER_MODEL ?? "qwen/qwen3.5-flash-02-23"),
  instructions: `
    You are an expert AI content manager specializing in writing, categorizing, and optimizing articles.
    Your tone should be professional and informative.
    Always prioritize clarity and SEO principles.
  `,
});

export const agentActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("generateContent"), input: generateContentInput }),
  z.object({ action: z.literal("categorize"), input: categorizeInput }),
  z.object({ action: z.literal("seoSuggestions"), input: seoSuggestionsInput }),
  z.object({ action: z.literal("translateContent"), input: translateContentInput }),
]);

const outputSchemas = {
  generateContent: generateContentOutput,
  categorize: categorizeOutput,
  seoSuggestions: seoSuggestionsOutput,
  translateContent: translateContentOutput,
} as const;

export async function runContentAgentAction(
  payload: z.infer<typeof agentActionSchema>,
): Promise<unknown> {
  switch (payload.action) {
    case "generateContent":
      return outputSchemas.generateContent.parse(
        await executeGenerateContent(payload.input, contentAgent),
      );
    case "categorize":
      return outputSchemas.categorize.parse(
        await executeCategorize(payload.input, contentAgent),
      );
    case "seoSuggestions":
      return outputSchemas.seoSuggestions.parse(
        await executeSeoSuggestions(payload.input, contentAgent),
      );
    case "translateContent":
      return outputSchemas.translateContent.parse(
        await executeTranslateContent(payload.input, contentAgent),
      );
  }
}
