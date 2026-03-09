"use client";

import { toast } from "sonner";
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
  return (
    <aside
      className="glass-card accent-panel stagger-in sticky top-4 h-fit rounded-3xl p-5"
      style={{ animationDelay: "260ms" }}
    >
      <h3 className="font-display text-2xl font-semibold">AI panel</h3>
      <p className="mt-1 text-sm text-(--ink-soft)">
        Generate, optimize, and localize without leaving this screen.
      </p>

      <div className="ai-timeline mt-4 space-y-4">
        <section
          className="ai-step scan-divider lift-card stagger-in rounded-2xl border border-(--line) bg-(--bg-surface) p-3 pt-4 shadow-[0_10px_30px_-24px_rgba(65,67,27,0.85)]"
          style={{ animationDelay: "320ms" }}
        >
          <h4 className="font-display text-lg font-semibold">Generate</h4>
          <div className="mt-2 grid gap-2">
            <FieldLabel
              text="Topic"
              tip="Describe the subject plus audience/context. Example: 'Global warming in America for high school students'."
              className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-(--ink-soft)"
              buttonClassName="inline-flex h-4 w-4 items-center justify-center rounded-full border border-(--line) bg-(--bg-surface) text-[10px] leading-none"
            />
            <input
              className="form-control"
              placeholder="e.g. Global warming in America"
              value={topic}
              onChange={(event) => onTopicChange(event.target.value)}
            />
            <p className="text-xs text-(--ink-soft)">
              Be specific: audience + angle + context gives better drafts.
            </p>

            <FieldLabel
              text="Tone"
              tip="Controls writing style and voice. Use formal for reports, informal for social/blog voice, neutral for general publishing."
              className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-(--ink-soft)"
              buttonClassName="inline-flex h-4 w-4 items-center justify-center rounded-full border border-(--line) bg-(--bg-surface) text-[10px] leading-none"
            />
            <SelectField
              value={tone}
              onChange={(nextValue) => onToneChange(nextValue as ToneOption)}
              options={TONE_OPTIONS}
            />
            <p className="text-xs text-(--ink-soft)">{TONE_HINTS[tone]}</p>

            <FieldLabel
              text="Target length (words)"
              tip="Approximate article size in words. 450 is a quick brief, 900 a standard post, and 1400 a deeper long-form draft."
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
              Controls article depth. Example: 450 = quick brief, 900 = full
              post, 1400 = deep dive.
            </p>
            <div className="flex flex-wrap gap-2">
              {LENGTH_PRESETS.map((preset) => (
                <button
                  key={preset.words}
                  type="button"
                  className="rounded-full border border-(--line) bg-(--bg-surface) px-2 py-1 text-xs text-(--ink) hover:bg-(--bg-soft)"
                  onClick={() => onLengthInputChange(String(preset.words))}
                >
                  {preset.label} ({preset.words})
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
                  Generating...
                </span>
              ) : (
                "Generate"
              )}
            </button>
          </div>
        </section>

        <section
          className="ai-step scan-divider lift-card stagger-in rounded-2xl border border-(--line) bg-(--bg-surface) p-3 pt-4 shadow-[0_10px_30px_-24px_rgba(65,67,27,0.85)]"
          style={{ animationDelay: "390ms" }}
        >
          <h4 className="font-display text-lg font-semibold">
            Category suggestion
          </h4>
          <button
            title="Analyze text and suggest the best matching category"
            className="mt-2 rounded-lg border border-(--line) px-3 py-2 transition-colors hover:border-(--amber) hover:bg-(--bg-soft)"
            disabled={categorizePending || !categories?.length}
            onClick={onSuggestCategory}
          >
            {categorizePending ? (
              <span className="inline-flex items-center gap-2">
                <span className="loading-spinner" aria-hidden="true" />
                Suggesting...
              </span>
            ) : (
              "Suggest category"
            )}
          </button>

          {categorySuggestion ? (
            <div className="mt-3 rounded-lg border border-(--line) bg-(--bg-soft) p-3 text-sm">
              <p>
                Suggested category:{" "}
                <strong>
                  {suggestedCategory?.name ?? "No matching category"}
                </strong>
              </p>
              <p className="mt-1 text-xs text-(--ink-soft)">
                Confidence: {Math.round(categorySuggestion.confidence * 100)}%
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
                  Apply suggestion
                </button>
                <button
                  className="rounded-lg border border-(--line) px-3 py-1"
                  onClick={onDismissCategorySuggestion}
                >
                  Keep current
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <section
          className="ai-step scan-divider lift-card stagger-in rounded-2xl border border-(--line) bg-(--bg-surface) p-3 pt-4 shadow-[0_10px_30px_-24px_rgba(65,67,27,0.85)]"
          style={{ animationDelay: "460ms" }}
        >
          <h4 className="font-display text-lg font-semibold">SEO</h4>
          <button
            title="Generate SEO title, meta description, and keywords from current article"
            className="mt-2 rounded-lg border border-(--line) px-3 py-2 transition-colors hover:border-(--amber) hover:bg-(--bg-soft)"
            disabled={seoPending}
            onClick={onSuggestSeo}
          >
            {seoPending ? (
              <span className="inline-flex items-center gap-2">
                <span className="loading-spinner" aria-hidden="true" />
                Suggesting...
              </span>
            ) : (
              "Suggest from text"
            )}
          </button>

          {seoSuggestion ? (
            <div className="mt-3 rounded-lg border border-(--line) bg-(--bg-soft) p-3 text-sm">
              <p className="font-medium">Proposed SEO metadata</p>
              <p className="mt-2 text-xs text-(--ink-soft)">
                Title: {seoSuggestion.seoTitle}
              </p>
              <p className="mt-1 text-xs text-(--ink-soft)">
                Description: {seoSuggestion.seoDescription}
              </p>
              <p className="mt-1 text-xs text-(--ink-soft)">
                Keywords: {seoSuggestion.seoKeywords.join(", ")}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="rounded-lg bg-(--teal) px-3 py-1 text-(--bg-base)"
                  onClick={onApplySeo}
                >
                  Apply SEO
                </button>
                <button
                  className="rounded-lg border border-(--line) px-3 py-1"
                  onClick={onDismissSeo}
                >
                  Keep current SEO
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <section
          className="ai-step scan-divider lift-card stagger-in rounded-2xl border border-(--line) bg-(--bg-surface) p-3 pt-4 shadow-[0_10px_30px_-24px_rgba(65,67,27,0.85)]"
          style={{ animationDelay: "530ms" }}
        >
          <h4 className="font-display text-lg font-semibold">Translation</h4>
          <div className="mt-2 grid gap-2">
            <SelectField
              value={targetLocale}
              onChange={onTargetLocaleChange}
              options={TARGET_LANGUAGE_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
            />
            <button
              title="Translate current article into selected language"
              className="rounded-lg border border-(--line) px-3 py-2 transition-colors hover:border-(--amber) hover:bg-(--bg-soft)"
              disabled={translatePending}
              onClick={async () => {
                if (!form.title.trim() || !form.body.trim()) {
                  toast.error("Title and body are required before translation");
                  return;
                }

                await onTranslate();
              }}
            >
              {translatePending ? (
                <span className="inline-flex items-center gap-2">
                  <span className="loading-spinner" aria-hidden="true" />
                  Translating...
                </span>
              ) : (
                "Translate"
              )}
            </button>

            {translationPreview ? (
              <div className="rounded-lg border border-(--line) bg-(--bg-soft) p-3">
                <p className="text-sm font-medium">
                  Translation ready ({translationPreview.locale})
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-(--ink-soft)">
                  {translationPreview.title}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="rounded-lg bg-(--teal) px-3 py-1 text-(--bg-base)"
                    onClick={onCreateTranslatedArticle}
                  >
                    Create new article
                  </button>
                  <button
                    className="rounded-lg border border-(--line) bg-(--bg-surface) px-3 py-1"
                    onClick={onReplaceWithTranslation}
                  >
                    Replace current
                  </button>
                  <button
                    className="rounded-lg border border-(--line) px-3 py-1"
                    onClick={onCancelTranslation}
                  >
                    Cancel
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
