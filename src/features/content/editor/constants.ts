import type { Article } from "@/features/content/list/types";
import type { FormState, ToneOption } from "./types";

export const TONE_OPTIONS: Array<{ value: ToneOption; label: string }> = [
  { value: "formal", label: "tone.formal" },
  { value: "informal", label: "tone.informal" },
  { value: "neutral", label: "tone.neutral" },
];

export const TONE_HINTS: Record<ToneOption, string> = {
  formal: "toneHint.formal",
  informal: "toneHint.informal",
  neutral: "toneHint.neutral",
};

export const LENGTH_PRESETS = [
  { label: "length.short", words: 450 },
  { label: "length.standard", words: 900 },
  { label: "length.long", words: 1400 },
] as const;

export const TARGET_LANGUAGE_OPTIONS = [
  { value: "ru", label: "locale.ru" },
  { value: "en", label: "locale.en" },
  { value: "kk", label: "locale.kk" },
] as const;

export const EMPTY_FORM: FormState = {
  title: "",
  body: "",
  status: "draft",
  locale: "en",
  categoryId: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
};

export const ARTICLE_STATUS_OPTIONS: Array<{
  value: Article["status"];
  label: string;
}> = [
  { value: "draft", label: "status.draft" },
  { value: "published", label: "status.published" },
];
