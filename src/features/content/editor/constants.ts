import type { Article } from "@/features/content/list/types";
import type { FormState, ToneOption } from "./types";

export const TONE_OPTIONS: Array<{ value: ToneOption; label: string }> = [
  { value: "formal", label: "Formal" },
  { value: "informal", label: "Informal" },
  { value: "neutral", label: "Neutral" },
];

export const TONE_HINTS: Record<ToneOption, string> = {
  formal:
    "Professional and structured. Good for reports and executive readers.",
  informal:
    "Conversational and friendly. Good for social and community audiences.",
  neutral: "Balanced and clear. Good default for general blog content.",
};

export const LENGTH_PRESETS = [
  { label: "Short", words: 450 },
  { label: "Standard", words: 900 },
  { label: "Long", words: 1400 },
] as const;

export const TARGET_LANGUAGE_OPTIONS = [
  { value: "ru", label: "Russian" },
  { value: "en", label: "English" },
  { value: "kk", label: "Kazakh" },
  { value: "zh", label: "Chinese" },
] as const;

export const EMPTY_FORM: FormState = {
  title: "",
  body: "",
  status: "draft",
  locale: "ru",
  categoryId: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
};

export const ARTICLE_STATUS_OPTIONS: Array<{
  value: Article["status"];
  label: string;
}> = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];
