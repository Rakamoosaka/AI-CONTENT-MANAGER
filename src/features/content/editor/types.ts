import type { Article } from "@/features/content/list/types";

export type ToneOption = "formal" | "informal" | "neutral";

export type FormState = {
  title: string;
  body: string;
  status: Article["status"];
  locale: string;
  categoryId: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
};

export type CategorySuggestionState = {
  categoryId: string | null;
  confidence: number;
  rationale: string;
};

export type TranslationPreviewState = {
  title: string;
  body: string;
  locale: string;
};

export type SeoSuggestionState = {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
};
