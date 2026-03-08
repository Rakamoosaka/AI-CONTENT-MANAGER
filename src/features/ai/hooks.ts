"use client";

import { useMutation } from "@tanstack/react-query";
import { apiMutation } from "@/lib/api/client";
import type { Category } from "@/features/content/list/types";

type GeneratePayload = {
  action: "generateContent";
  input: { topic: string; tone: string; targetLength: number };
};

type CategorizePayload = {
  action: "categorize";
  input: { body: string; categories: Category[] };
};

type SeoPayload = {
  action: "seoSuggestions";
  input: { title: string; body: string; locale: string };
};

type TranslatePayload = {
  action: "translateContent";
  input: { title: string; body: string; targetLocale: string };
};

export function useAiAction<T>() {
  return useMutation({
    mutationFn: (payload: GeneratePayload | CategorizePayload | SeoPayload | TranslatePayload) =>
      apiMutation<T>("/api/agent", "POST", payload),
  });
}
