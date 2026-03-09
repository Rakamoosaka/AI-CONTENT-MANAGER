"use client";

import { useI18n } from "@/components/providers/I18nProvider";
import type { SeoSuggestionState } from "../types";
import { AiStepCard } from "./AiStepCard";

type Props = {
  seoPending: boolean;
  seoSuggestion: SeoSuggestionState | null;
  onSuggestSeo: () => Promise<void>;
  onApplySeo: () => void;
  onDismissSeo: () => void;
};

export function SeoSection({
  seoPending,
  seoSuggestion,
  onSuggestSeo,
  onApplySeo,
  onDismissSeo,
}: Props) {
  const { t } = useI18n();

  return (
    <AiStepCard title={t("editor.seo")} animationDelay="460ms">
      <button
        title={t("editor.seoFromText")}
        className="mt-2 rounded-lg border border-(--line) px-3 py-2 transition-colors hover:border-(--amber) hover:bg-(--bg-soft)"
        disabled={seoPending}
        onClick={onSuggestSeo}
      >
        {seoPending ? (
          <span className="inline-flex items-center gap-2">
            <span className="loading-spinner" aria-hidden="true" />
            {t("editor.suggesting")}
          </span>
        ) : (
          t("editor.seoFromText")
        )}
      </button>

      {seoSuggestion ? (
        <div className="mt-3 rounded-lg border border-(--line) bg-(--bg-soft) p-3 text-sm">
          <p className="font-medium">{t("editor.proposedSeo")}</p>
          <p className="mt-2 text-xs text-(--ink-soft)">
            {t("editor.seoTitleLabel", { value: seoSuggestion.seoTitle })}
          </p>
          <p className="mt-1 text-xs text-(--ink-soft)">
            {t("editor.seoDescriptionLabel", {
              value: seoSuggestion.seoDescription,
            })}
          </p>
          <p className="mt-1 text-xs text-(--ink-soft)">
            {t("editor.seoKeywordsLabel", {
              value: seoSuggestion.seoKeywords.join(", "),
            })}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="rounded-lg bg-(--teal) px-3 py-1 text-(--bg-base)"
              onClick={onApplySeo}
            >
              {t("editor.applySeo")}
            </button>
            <button
              className="rounded-lg border border-(--line) px-3 py-1"
              onClick={onDismissSeo}
            >
              {t("editor.keepCurrentSeo")}
            </button>
          </div>
        </div>
      ) : null}
    </AiStepCard>
  );
}
