"use client";

import { toast } from "sonner";
import { useI18n } from "@/components/providers/I18nProvider";
import type { Category } from "@/features/content/list/types";
import { SelectField } from "@/components/ui/SelectField";
import { FieldLabel } from "@/components/ui/FieldLabel";
import {
  LENGTH_PRESETS,
  TARGET_LANGUAGE_OPTIONS,
  TONE_HINTS,
  TONE_OPTIONS,
} from "./constants";
import type {
  CategorySuggestionState,
  FormState,
  SeoSuggestionState,
  ToneOption,
  TranslationPreviewState,
} from "./types";

type Props = {
  categories?: Category[];
  form: FormState;
  tone: ToneOption;
  topic: string;
  targetLengthInput: string;
  targetLocale: string;
  generatePending: boolean;
  categorizePending: boolean;
  seoPending: boolean;
  translatePending: boolean;
  categorySuggestion: CategorySuggestionState | null;
  suggestedCategory: Category | null;
  seoSuggestion: SeoSuggestionState | null;
  translationPreview: TranslationPreviewState | null;
  onTopicChange: (value: string) => void;
  onToneChange: (value: ToneOption) => void;
  onLengthInputChange: (value: string) => void;
  onLengthInputBlur: () => void;
  onTargetLocaleChange: (value: string) => void;
  onGenerate: () => Promise<void>;
  onSuggestCategory: () => Promise<void>;
  onApplyCategorySuggestion: () => void;
  onDismissCategorySuggestion: () => void;
  onSuggestSeo: () => Promise<void>;
  onApplySeo: () => void;
  onDismissSeo: () => void;
  onTranslate: () => Promise<void>;
  onCreateTranslatedArticle: () => Promise<void>;
  onReplaceWithTranslation: () => void;
  onCancelTranslation: () => void;
};

export function EditorAiPanel({
  categories,
  form,
  tone,
  topic,
  targetLengthInput,
  targetLocale,
  generatePending,
  categorizePending,
  seoPending,
  translatePending,
  categorySuggestion,
  suggestedCategory,
  seoSuggestion,
  translationPreview,
  onTopicChange,
  onToneChange,
  onLengthInputChange,
  onLengthInputBlur,
  onTargetLocaleChange,
  onGenerate,
  onSuggestCategory,
  onApplyCategorySuggestion,
  onDismissCategorySuggestion,
  onSuggestSeo,
  onApplySeo,
  onDismissSeo,
  onTranslate,
  onCreateTranslatedArticle,
  onReplaceWithTranslation,
  onCancelTranslation,
}: Props) {
  const { t } = useI18n();

  return (
    <aside
      className="glass-card accent-panel stagger-in sticky top-4 h-fit rounded-3xl p-5"
      style={{ animationDelay: "260ms" }}
    >
      <h3 className="font-display text-2xl font-semibold">
        {t("editor.aiPanel")}
      </h3>
      <p className="mt-1 text-sm text-(--ink-soft)">
        {t("editor.aiPanelSubtitle")}
      </p>

      <div className="ai-timeline mt-4 space-y-4">
        <section
          className="ai-step scan-divider lift-card stagger-in rounded-2xl border border-(--line) bg-(--bg-surface) p-3 pt-4 shadow-[0_10px_30px_-24px_rgba(65,67,27,0.85)]"
          style={{ animationDelay: "320ms" }}
        >
          <h4 className="font-display text-lg font-semibold">
            {t("editor.generateSection")}
          </h4>
          <div className="mt-2 grid gap-2">
            <FieldLabel
              text={t("editor.topic")}
              tip={t("editor.topicTip")}
              className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-(--ink-soft)"
              buttonClassName="inline-flex h-4 w-4 items-center justify-center rounded-full border border-(--line) bg-(--bg-surface) text-[10px] leading-none"
            />
            <input
              className="form-control"
              placeholder={t("editor.topicPlaceholder")}
              value={topic}
              onChange={(event) => onTopicChange(event.target.value)}
            />
            <p className="text-xs text-(--ink-soft)">{t("editor.topicHelp")}</p>

            <FieldLabel
              text={t("editor.tone")}
              tip={t("editor.toneTip")}
              className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-(--ink-soft)"
              buttonClassName="inline-flex h-4 w-4 items-center justify-center rounded-full border border-(--line) bg-(--bg-surface) text-[10px] leading-none"
            />
            <SelectField
              value={tone}
              onChange={(nextValue) => onToneChange(nextValue as ToneOption)}
              options={TONE_OPTIONS.map((option) => ({
                value: option.value,
                label: t(option.label),
              }))}
            />
            <p className="text-xs text-(--ink-soft)">{t(TONE_HINTS[tone])}</p>

            <FieldLabel
              text={t("editor.length")}
              tip={t("editor.lengthTip")}
              className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-(--ink-soft)"
              buttonClassName="inline-flex h-4 w-4 items-center justify-center rounded-full border border-(--line) bg-(--bg-surface) text-[10px] leading-none"
            />
            <input
              type="number"
              className="form-control"
              min={120}
              max={1500}
              value={targetLengthInput}
              onChange={(event) => onLengthInputChange(event.target.value)}
              onBlur={onLengthInputBlur}
            />
            <p className="text-xs text-(--ink-soft)">
              {t("editor.lengthHelp")}
            </p>
            <div className="flex flex-wrap gap-2">
              {LENGTH_PRESETS.map((preset) => (
                <button
                  key={preset.words}
                  type="button"
                  className="rounded-full border border-(--line) bg-(--bg-surface) px-2 py-1 text-xs text-(--ink) hover:bg-(--bg-soft)"
                  onClick={() => onLengthInputChange(String(preset.words))}
                >
                  {t(preset.label)} ({preset.words})
                </button>
              ))}
            </div>

            <button
              className="lift-card rounded-lg bg-(--amber) px-3 py-2 font-semibold text-(--teal)"
              disabled={generatePending}
              onClick={onGenerate}
            >
              {generatePending ? (
                <span className="inline-flex items-center gap-2">
                  <span className="loading-spinner" aria-hidden="true" />
                  {t("editor.generating")}
                </span>
              ) : (
                t("editor.generate")
              )}
            </button>
          </div>
        </section>

        <section
          className="ai-step scan-divider lift-card stagger-in rounded-2xl border border-(--line) bg-(--bg-surface) p-3 pt-4 shadow-[0_10px_30px_-24px_rgba(65,67,27,0.85)]"
          style={{ animationDelay: "390ms" }}
        >
          <h4 className="font-display text-lg font-semibold">
            {t("editor.categorySuggestion")}
          </h4>
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
        </section>

        <section
          className="ai-step scan-divider lift-card stagger-in rounded-2xl border border-(--line) bg-(--bg-surface) p-3 pt-4 shadow-[0_10px_30px_-24px_rgba(65,67,27,0.85)]"
          style={{ animationDelay: "460ms" }}
        >
          <h4 className="font-display text-lg font-semibold">
            {t("editor.seo")}
          </h4>
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
        </section>

        <section
          className="ai-step scan-divider lift-card stagger-in rounded-2xl border border-(--line) bg-(--bg-surface) p-3 pt-4 shadow-[0_10px_30px_-24px_rgba(65,67,27,0.85)]"
          style={{ animationDelay: "530ms" }}
        >
          <h4 className="font-display text-lg font-semibold">
            {t("editor.translation")}
          </h4>
          <div className="mt-2 grid gap-2">
            <SelectField
              value={targetLocale}
              onChange={onTargetLocaleChange}
              options={TARGET_LANGUAGE_OPTIONS.map((option) => ({
                value: option.value,
                label: t(option.label),
              }))}
            />
            <button
              title={t("editor.translate")}
              className="rounded-lg border border-(--line) px-3 py-2 transition-colors hover:border-(--amber) hover:bg-(--bg-soft)"
              disabled={translatePending}
              onClick={async () => {
                if (!form.title.trim() || !form.body.trim()) {
                  toast.error(t("editor.translationRequires"));
                  return;
                }

                await onTranslate();
              }}
            >
              {translatePending ? (
                <span className="inline-flex items-center gap-2">
                  <span className="loading-spinner" aria-hidden="true" />
                  {t("editor.translating")}
                </span>
              ) : (
                t("editor.translate")
              )}
            </button>

            {translationPreview ? (
              <div className="rounded-lg border border-(--line) bg-(--bg-soft) p-3">
                <p className="text-sm font-medium">
                  {t("editor.translationReadyLabel", {
                    locale: translationPreview.locale,
                  })}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-(--ink-soft)">
                  {translationPreview.title}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="rounded-lg bg-(--teal) px-3 py-1 text-(--bg-base)"
                    onClick={onCreateTranslatedArticle}
                  >
                    {t("editor.createNewArticle")}
                  </button>
                  <button
                    className="rounded-lg border border-(--line) bg-(--bg-surface) px-3 py-1"
                    onClick={onReplaceWithTranslation}
                  >
                    {t("editor.replaceCurrent")}
                  </button>
                  <button
                    className="rounded-lg border border-(--line) px-3 py-1"
                    onClick={onCancelTranslation}
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </aside>
  );
}
