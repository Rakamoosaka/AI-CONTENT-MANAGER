"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAiAction } from "@/features/ai/hooks";
import { useArticle, useCategories, useUpsertArticle } from "@/features/content/list/hooks";
import type { Article } from "@/features/content/list/types";
import { apiMutation } from "@/lib/api/client";
import { SelectField } from "@/components/ui/SelectField";

type Props = { articleId?: string };

type ToneOption = "formal" | "informal" | "neutral";

const TONE_OPTIONS: Array<{ value: ToneOption; label: string }> = [
  { value: "formal", label: "Formal" },
  { value: "informal", label: "Informal" },
  { value: "neutral", label: "Neutral" },
];

const TONE_HINTS: Record<ToneOption, string> = {
  formal: "Professional and structured. Good for reports and executive readers.",
  informal: "Conversational and friendly. Good for social and community audiences.",
  neutral: "Balanced and clear. Good default for general blog content.",
};

const LENGTH_PRESETS = [
  { label: "Short", words: 450 },
  { label: "Standard", words: 900 },
  { label: "Long", words: 1400 },
] as const;

function FieldLabel({ text, tip }: { text: string; tip: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-medium text-(--ink-soft)">
      <span>{text}</span>
      <span className="group relative inline-flex">
        <button
          type="button"
          className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-(--line) text-[10px] leading-none"
          aria-label={`${text} help`}
        >
          ?
        </button>
        <span className="pointer-events-none absolute left-6 top-1/2 z-20 w-64 -translate-y-1/2 rounded-lg border border-(--line) bg-(--bg-surface) p-2 text-xs font-normal text-(--ink) opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          {tip}
        </span>
      </span>
    </div>
  );
}

const TARGET_LANGUAGE_OPTIONS = [
  { value: "ru", label: "Russian" },
  { value: "en", label: "English" },
  { value: "kk", label: "Kazakh" },
  { value: "zh", label: "Chinese" },
] as const;

type FormState = {
  title: string;
  body: string;
  status: Article["status"];
  locale: string;
  categoryId: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
};

type CategorySuggestionState = {
  categoryId: string | null;
  confidence: number;
  rationale: string;
};

type TranslationPreviewState = {
  title: string;
  body: string;
  locale: string;
};

type SeoSuggestionState = {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
};

const EMPTY_FORM: FormState = {
  title: "",
  body: "",
  status: "draft",
  locale: "ru",
  categoryId: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
};

function mapArticleToForm(article?: Article): FormState {
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

function detectLocaleFromText(text: string): string {
  const sample = text.slice(0, 2500);

  const zhMatches = sample.match(/[\u4e00-\u9fff]/g)?.length ?? 0;
  if (zhMatches >= 8) {
    return "zh";
  }

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

export function EditorScreen({ articleId }: Props) {
  const router = useRouter();
  const { data: categories } = useCategories();
  const { data: article } = useArticle(articleId);
  const saveMutation = useUpsertArticle(articleId);
  const generateMutation = useAiAction<{ title: string; body: string }>();
  const categorizeMutation = useAiAction<{
    categoryId: string | null;
    confidence: number;
    rationale: string;
  }>();
  const seoMutation = useAiAction<{
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string[];
  }>();
  const translateMutation = useAiAction<{ title: string; body: string; locale: string }>();

  const [draftForm, setDraftForm] = useState<FormState | null>(null);
  const form = useMemo(() => draftForm ?? mapArticleToForm(article), [draftForm, article]);

  function updateForm(updater: (prev: FormState) => FormState) {
    setDraftForm((prev) => updater(prev ?? mapArticleToForm(article)));
  }

  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<ToneOption>("neutral");
  const [targetLengthInput, setTargetLengthInput] = useState("900");
  const [targetLocale, setTargetLocale] = useState("en");
  const [categorySuggestion, setCategorySuggestion] = useState<CategorySuggestionState | null>(null);
  const [translationPreview, setTranslationPreview] = useState<TranslationPreviewState | null>(null);
  const [seoSuggestion, setSeoSuggestion] = useState<SeoSuggestionState | null>(null);

  const targetLength = useMemo(() => {
    const parsed = Number(targetLengthInput);

    if (!Number.isFinite(parsed)) {
      return 900;
    }

    return Math.min(1500, Math.max(120, Math.round(parsed)));
  }, [targetLengthInput]);

  const suggestedCategory =
    categories?.find((item) => item.id === categorySuggestion?.categoryId) ?? null;

  const articleCategoryOptions = useMemo(
    () => [
      { value: "", label: "No category" },
      ...(categories?.map((category) => ({ value: category.id, label: category.name })) ?? []),
    ],
    [categories],
  );

  const localeOptions = useMemo(() => {
    const base = TARGET_LANGUAGE_OPTIONS.map((option) => ({
      value: option.value,
      label: option.label,
    }));

    if (form.locale && !base.some((option) => option.value === form.locale)) {
      return [{ value: form.locale, label: form.locale.toUpperCase() }, ...base];
    }

    return base;
  }, [form.locale]);

  const activeAiTask =
    (generateMutation.isPending && "Generating article draft") ||
    (categorizeMutation.isPending && "Analyzing category match") ||
    (seoMutation.isPending && "Preparing SEO suggestions") ||
    (translateMutation.isPending && "Translating article") ||
    null;

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[3fr_2fr]">
      <section className="glass-card rounded-3xl p-5">
        <h2 className="font-display text-xl font-semibold">Article editor</h2>

        {activeAiTask ? (
          <div className="mt-4 rounded-xl border border-(--line) bg-(--bg-soft) px-3 py-2 text-sm text-(--ink)">
            <div className="flex items-center gap-2">
              <span className="loading-spinner" aria-hidden="true" />
              <span>AI is working: {activeAiTask}...</span>
            </div>
          </div>
        ) : null}

        <div className="mt-4 grid gap-3">
          <input
            className="form-control"
            placeholder="Title"
            value={form.title}
            onChange={(event) => updateForm((prev) => ({ ...prev, title: event.target.value }))}
          />

          <div className="relative">
            <textarea
              className="form-control min-h-80"
              placeholder="Body"
              value={form.body}
              onChange={(event) => updateForm((prev) => ({ ...prev, body: event.target.value }))}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <SelectField
              value={form.categoryId}
              onChange={(nextValue) => updateForm((prev) => ({ ...prev, categoryId: nextValue }))}
              options={articleCategoryOptions}
            />

            <SelectField
              value={form.status}
              onChange={(nextValue) =>
                updateForm((prev) => ({
                  ...prev,
                  status: nextValue as Article["status"],
                }))
              }
              options={[
                { value: "draft", label: "Draft" },
                { value: "published", label: "Published" },
              ]}
            />

            <SelectField
              value={form.locale}
              onChange={(nextValue) => updateForm((prev) => ({ ...prev, locale: nextValue }))}
              options={localeOptions}
            />
          </div>

          <details className="rounded-xl border border-(--line) bg-(--bg-surface) p-3">
            <summary className="cursor-pointer font-medium">SEO</summary>
            <div className="mt-3 grid gap-2">
              <input
                className="form-control"
                placeholder="SEO title"
                value={form.seoTitle}
                onChange={(event) =>
                  updateForm((prev) => ({ ...prev, seoTitle: event.target.value }))
                }
              />
              <textarea
                className="form-control"
                placeholder="SEO description"
                value={form.seoDescription}
                onChange={(event) =>
                  updateForm((prev) => ({ ...prev, seoDescription: event.target.value }))
                }
              />
              <input
                className="form-control"
                placeholder="keyword1, keyword2"
                value={form.seoKeywords}
                onChange={(event) =>
                  updateForm((prev) => ({ ...prev, seoKeywords: event.target.value }))
                }
              />
            </div>
          </details>

          <button
            className="rounded-xl bg-(--teal) px-4 py-2 font-semibold text-white"
            onClick={async () => {
              try {
                const saved = await saveMutation.mutateAsync({
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
                });
                setDraftForm(null); // Clear draft after successful save
                toast.success("Article saved");
                if (!articleId) {
                  router.push(`/content/${saved.id}`);
                }
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Save failed");
              }
            }}
          >
            Save article
          </button>
        </div>
      </section>

      <aside className="glass-card sticky top-4 h-fit rounded-3xl p-5">
        <h3 className="font-display text-lg font-semibold">AI panel</h3>

        <div className="mt-4 space-y-4">
          <section className="rounded-2xl border border-(--line) bg-(--bg-surface) p-3">
            <h4 className="font-medium">Generate</h4>
            <div className="mt-2 grid gap-2">
              <FieldLabel
                text="Topic"
                tip="Describe the subject plus audience/context. Example: 'Global warming in America for high school students'."
              />
              <input
                className="form-control"
                placeholder="e.g. Global warming in America"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
              />
              <p className="text-xs text-(--ink-soft)">
                Be specific: audience + angle + context gives better drafts.
              </p>

              <FieldLabel
                text="Tone"
                tip="Controls writing style and voice. Use formal for reports, informal for social/blog voice, neutral for general publishing."
              />
              <SelectField
                value={tone}
                onChange={(nextValue) => setTone(nextValue as ToneOption)}
                options={TONE_OPTIONS}
              />
              <p className="text-xs text-(--ink-soft)">{TONE_HINTS[tone]}</p>

              <FieldLabel
                text="Target length (words)"
                tip="Approximate article size in words. 450 is a quick brief, 900 a standard post, and 1400 a deeper long-form draft."
              />
              <input
                type="number"
                className="form-control"
                min={120}
                max={1500}
                value={targetLengthInput}
                onChange={(event) => setTargetLengthInput(event.target.value)}
                onBlur={() => {
                  const parsed = Number(targetLengthInput);
                  if (!Number.isFinite(parsed)) {
                    setTargetLengthInput("120");
                    return;
                  }

                  setTargetLengthInput(String(Math.min(1500, Math.max(120, Math.round(parsed)))));
                }}
              />
              <p className="text-xs text-(--ink-soft)">
                Controls article depth. Example: 450 = quick brief, 900 = full post, 1400 = deep dive.
              </p>
              <div className="flex flex-wrap gap-2">
                {LENGTH_PRESETS.map((preset) => (
                  <button
                    key={preset.words}
                    type="button"
                    className="rounded-full border border-(--line) px-2 py-1 text-xs"
                    onClick={() => setTargetLengthInput(String(preset.words))}
                  >
                    {preset.label} ({preset.words})
                  </button>
                ))}
              </div>

              <button
                className="rounded-lg bg-(--amber) px-3 py-2 font-semibold"
                disabled={generateMutation.isPending}
                onClick={async () => {
                  try {
                    const data = await generateMutation.mutateAsync({
                      action: "generateContent",
                      input: { topic, tone, targetLength },
                    });

                    const detectedLocale = detectLocaleFromText(`${data.title}\n${data.body}`);

                    updateForm((prev) => ({
                      ...prev,
                      title: data.title,
                      body: data.body,
                      locale: detectedLocale,
                    }));
                  } catch {
                    toast.error("Generation failed");
                  }
                }}
              >
                {generateMutation.isPending ? (
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

          <section className="rounded-2xl border border-(--line) bg-(--bg-surface) p-3">
            <h4 className="font-medium">Category suggestion</h4>
            <button
              title="Analyze text and suggest the best matching category"
              className="mt-2 rounded-lg border border-(--line) px-3 py-2 transition-colors hover:border-(--amber) hover:bg-(--bg-soft)"
              disabled={categorizeMutation.isPending || !categories?.length}
              onClick={async () => {
                try {
                  const data = await categorizeMutation.mutateAsync({
                    action: "categorize",
                    input: {
                      body: form.body,
                      categories: categories ?? [],
                    },
                  });
                  setCategorySuggestion(data);

                  if (!data.categoryId) {
                    toast.info("No confident category match found");
                  }
                } catch {
                  toast.error("Category suggestion failed");
                }
              }}
            >
              {categorizeMutation.isPending ? (
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
                  <strong>{suggestedCategory?.name ?? "No matching category"}</strong>
                </p>
                <p className="mt-1 text-xs text-(--ink-soft)">
                  Confidence: {Math.round(categorySuggestion.confidence * 100)}%
                </p>
                <p className="mt-1 text-xs text-(--ink-soft)">{categorySuggestion.rationale}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="rounded-lg bg-(--teal) px-3 py-1 text-white disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!suggestedCategory}
                    onClick={() => {
                      if (!suggestedCategory) {
                        return;
                      }

                      updateForm((prev) => ({ ...prev, categoryId: suggestedCategory.id }));
                      setCategorySuggestion(null);
                      toast.success("Suggested category applied");
                    }}
                  >
                    Apply suggestion
                  </button>
                  <button
                    className="rounded-lg border border-(--line) px-3 py-1"
                    onClick={() => {
                      setCategorySuggestion(null);
                      toast.info("Category suggestion dismissed");
                    }}
                  >
                    Keep current
                  </button>
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-(--line) bg-(--bg-surface) p-3">
            <h4 className="font-medium">SEO</h4>
            <button
              title="Generate SEO title, meta description, and keywords from current article"
              className="mt-2 rounded-lg border border-(--line) px-3 py-2 transition-colors hover:border-(--amber) hover:bg-(--bg-soft)"
              disabled={seoMutation.isPending}
              onClick={async () => {
                try {
                  const data = await seoMutation.mutateAsync({
                    action: "seoSuggestions",
                    input: { title: form.title, body: form.body, locale: form.locale },
                  });
                  setSeoSuggestion(data);
                  toast.success("SEO suggestion ready. Review and apply if you want.");
                } catch {
                  toast.error("SEO suggestions failed");
                }
              }}
            >
              {seoMutation.isPending ? (
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
                <p className="mt-2 text-xs text-(--ink-soft)">Title: {seoSuggestion.seoTitle}</p>
                <p className="mt-1 text-xs text-(--ink-soft)">
                  Description: {seoSuggestion.seoDescription}
                </p>
                <p className="mt-1 text-xs text-(--ink-soft)">
                  Keywords: {seoSuggestion.seoKeywords.join(", ")}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="rounded-lg bg-(--teal) px-3 py-1 text-white"
                    onClick={() => {
                      updateForm((prev) => ({
                        ...prev,
                        seoTitle: seoSuggestion.seoTitle,
                        seoDescription: seoSuggestion.seoDescription,
                        seoKeywords: seoSuggestion.seoKeywords.join(", "),
                      }));
                      setSeoSuggestion(null);
                      toast.success("SEO suggestion applied");
                    }}
                  >
                    Apply SEO
                  </button>
                  <button
                    className="rounded-lg border border-(--line) px-3 py-1"
                    onClick={() => {
                      setSeoSuggestion(null);
                      toast.info("SEO suggestion dismissed");
                    }}
                  >
                    Keep current SEO
                  </button>
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-(--line) bg-(--bg-surface) p-3">
            <h4 className="font-medium">Translation</h4>
            <div className="mt-2 grid gap-2">
              <SelectField
                value={targetLocale}
                onChange={setTargetLocale}
                options={TARGET_LANGUAGE_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
              />
              <button
                title="Translate current article into selected language"
                className="rounded-lg border border-(--line) px-3 py-2 transition-colors hover:border-(--amber) hover:bg-(--bg-soft)"
                disabled={translateMutation.isPending}
                onClick={async () => {
                  if (!form.title.trim() || !form.body.trim()) {
                    toast.error("Title and body are required before translation");
                    return;
                  }

                  try {
                    const data = await translateMutation.mutateAsync({
                      action: "translateContent",
                      input: {
                        title: form.title,
                        body: form.body,
                        targetLocale,
                      },
                    });

                    setTranslationPreview(data);
                    toast.success("Translation ready. Choose how to apply it.");
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Translation failed");
                  }
                }}
              >
                {translateMutation.isPending ? (
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
                  <p className="text-sm font-medium">Translation ready ({translationPreview.locale})</p>
                  <p className="mt-1 line-clamp-2 text-xs text-(--ink-soft)">
                    {translationPreview.title}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      className="rounded-lg bg-(--teal) px-3 py-1 text-white"
                      onClick={async () => {
                        try {
                          const created = await apiMutation<Article>("/api/articles", "POST", {
                            title: translationPreview.title,
                            body: translationPreview.body,
                            status: form.status,
                            locale: translationPreview.locale,
                            categoryId: form.categoryId || null,
                            seoTitle: form.seoTitle || null,
                            seoDescription: form.seoDescription || null,
                            seoKeywords: form.seoKeywords
                              .split(",")
                              .map((item) => item.trim())
                              .filter(Boolean),
                          });

                          setTranslationPreview(null);
                          toast.success("Translated article created");
                          router.push(`/content/${created.id}`);
                        } catch (error) {
                          toast.error(
                            error instanceof Error
                              ? error.message
                              : "Failed to create translated article",
                          );
                        }
                      }}
                    >
                      Create new article
                    </button>
                    <button
                      className="rounded-lg border border-(--line) bg-white px-3 py-1"
                      onClick={() => {
                        updateForm((prev) => ({
                          ...prev,
                          title: translationPreview.title,
                          body: translationPreview.body,
                          locale: translationPreview.locale,
                        }));
                        setTranslationPreview(null);
                        toast.success("Current article replaced with translation");
                      }}
                    >
                      Replace current
                    </button>
                    <button
                      className="rounded-lg border border-(--line) px-3 py-1"
                      onClick={() => setTranslationPreview(null)}
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
    </div>
  );
}
