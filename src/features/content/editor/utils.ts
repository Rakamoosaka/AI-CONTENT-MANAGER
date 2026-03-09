import type { Article } from "@/features/content/list/types";
import { EMPTY_FORM } from "./constants";
import type { FormState } from "./types";

export function mapArticleToForm(article?: Article): FormState {
  if (!article) {
    return EMPTY_FORM;
  }

  return {
    title: article.title,
    body: article.body,
    status: article.status,
    locale: article.locale,
    categoryId: article.categoryId ?? "",
    seoTitle: article.seoTitle ?? "",
    seoDescription: article.seoDescription ?? "",
    seoKeywords: (article.seoKeywords ?? []).join(", "),
  };
}

export function detectLocaleFromText(text: string): string {
  const sample = text.slice(0, 2500);

  const kazakhSpecificMatches = sample.match(/[әғқңөұүһі]/gi)?.length ?? 0;
  if (kazakhSpecificMatches >= 3) {
    return "kk";
  }

  const cyrillicMatches = sample.match(/[а-яё]/gi)?.length ?? 0;
  const latinMatches = sample.match(/[a-z]/gi)?.length ?? 0;

  if (cyrillicMatches > latinMatches) {
    return "ru";
  }

  return "en";
}

export function toArticlePayload(form: FormState) {
  return {
    title: form.title,
    body: form.body,
    status: form.status,
    locale: form.locale,
    categoryId: form.categoryId || null,
    seoTitle: form.seoTitle || null,
    seoDescription: form.seoDescription || null,
    seoKeywords: form.seoKeywords
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  };
}
