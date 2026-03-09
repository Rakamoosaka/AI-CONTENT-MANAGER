"use client";

import { useI18n } from "@/components/providers/I18nProvider";
import type { Category } from "@/features/content/list/types";
import type { CategorySuggestionState } from "../types";
import { AiStepCard } from "./AiStepCard";

type Props = {
  categories?: Category[];
  categorizePending: boolean;
  categorySuggestion: CategorySuggestionState | null;
  suggestedCategory: Category | null;
  onSuggestCategory: () => Promise<void>;
  onApplyCategorySuggestion: () => void;
  onDismissCategorySuggestion: () => void;
};

export function CategorySection({
  categories,
  categorizePending,
  categorySuggestion,
  suggestedCategory,
  onSuggestCategory,
  onApplyCategorySuggestion,
  onDismissCategorySuggestion,
}: Props) {
  const { t } = useI18n();

  return (
    <AiStepCard title={t("editor.categorySuggestion")} animationDelay="390ms">
      <button
        title={t("editor.suggestCategory")}
        className="mt-2 rounded-lg border border-(--line) px-3 py-2 transition-colors hover:border-(--amber) hover:bg-(--bg-soft)"
        disabled={categorizePending || !categories?.length}
        onClick={onSuggestCategory}
      >
        {categorizePending ? (
          <span className="inline-flex items-center gap-2">
            <span className="loading-spinner" aria-hidden="true" />
            {t("editor.suggesting")}
          </span>
        ) : (
          t("editor.suggestCategory")
        )}
      </button>

      {categorySuggestion ? (
        <div className="mt-3 rounded-lg border border-(--line) bg-(--bg-soft) p-3 text-sm">
          <p>
            {t("editor.suggestedCategory")}{" "}
            <strong>
              {suggestedCategory?.name ?? t("editor.noMatchingCategory")}
            </strong>
          </p>
          <p className="mt-1 text-xs text-(--ink-soft)">
            {t("editor.confidence", {
              value: Math.round(categorySuggestion.confidence * 100),
            })}
          </p>
          <p className="mt-1 text-xs text-(--ink-soft)">
            {categorySuggestion.rationale}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="rounded-lg bg-(--teal) px-3 py-1 text-(--bg-base) disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!suggestedCategory}
              onClick={onApplyCategorySuggestion}
            >
              {t("editor.applySuggestion")}
            </button>
            <button
              className="rounded-lg border border-(--line) px-3 py-1"
              onClick={onDismissCategorySuggestion}
            >
              {t("editor.keepCurrent")}
            </button>
          </div>
        </div>
      ) : null}
    </AiStepCard>
  );
}
