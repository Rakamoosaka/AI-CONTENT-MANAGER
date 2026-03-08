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
  const [targetLength, setTargetLength] = useState(900);
  const [targetLocale, setTargetLocale] = useState("en");
  const [suggestedCategoryId, setSuggestedCategoryId] = useState<string | null>(null);

  const suggestion = categories?.find((item) => item.id === suggestedCategoryId);

  const articleCategoryOptions = useMemo(
    () => [
      { value: "", label: "No category" },
      ...(categories?.map((category) => ({ value: category.id, label: category.name })) ?? []),
    ],
    [categories],
  );

  return (
    <div className="grid gap-5 xl:grid-cols-[3fr_2fr]">
      <section className="glass-card rounded-3xl p-5">
        <h2 className="font-display text-xl font-semibold">Article editor</h2>
        {suggestion ? (
          <div className="mt-4 rounded-xl border border-(--line) bg-(--bg-soft) p-3 text-sm">
            AI suggests: <strong>{suggestion.name}</strong>
            <div className="mt-2 flex gap-2">
              <button
                className="rounded-lg bg-(--teal) px-3 py-1 text-white"
                onClick={() => updateForm((prev) => ({ ...prev, categoryId: suggestion.id }))}
              >
                Accept
              </button>
              <button
                className="rounded-lg border border-(--line) px-3 py-1"
                onClick={() => setSuggestedCategoryId(null)}
              >
                Dismiss
              </button>
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
            {generateMutation.isPending ? (
              <div className="ai-pulse absolute inset-0 z-10 rounded-xl bg-amber-200/40" />
            ) : null}
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

            <input
              className="form-control"
              value={form.locale}
              onChange={(event) =>
                updateForm((prev) => ({ ...prev, locale: event.target.value }))
              }
              placeholder="Locale"
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
                value={targetLength}
                onChange={(event) =>
                  setTargetLength(Math.max(120, Number(event.target.value) || 120))
                }
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
                    onClick={() => setTargetLength(preset.words)}
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
                    updateForm((prev) => ({ ...prev, title: data.title, body: data.body }));
                  } catch {
                    toast.error("Generation failed");
                  }
                }}
              >
                Generate
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-(--line) bg-(--bg-surface) p-3">
            <h4 className="font-medium">Category suggestion</h4>
            <button
              className="mt-2 rounded-lg border border-(--line) px-3 py-2"
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
                  setSuggestedCategoryId(data.categoryId);
                } catch {
                  toast.error("Category suggestion failed");
                }
              }}
            >
              Suggest category
            </button>
          </section>

          <section className="rounded-2xl border border-(--line) bg-(--bg-surface) p-3">
            <h4 className="font-medium">SEO</h4>
            <button
              className="mt-2 rounded-lg border border-(--line) px-3 py-2"
              disabled={seoMutation.isPending}
              onClick={async () => {
                try {
                  const data = await seoMutation.mutateAsync({
                    action: "seoSuggestions",
                    input: { title: form.title, body: form.body, locale: form.locale },
                  });
                  updateForm((prev) => ({
                    ...prev,
                    seoTitle: data.seoTitle,
                    seoDescription: data.seoDescription,
                    seoKeywords: data.seoKeywords.join(", "),
                  }));
                } catch {
                  toast.error("SEO suggestions failed");
                }
              }}
            >
              Suggest from text
            </button>
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
                className="rounded-lg border border-(--line) px-3 py-2"
                disabled={translateMutation.isPending}
                onClick={async () => {
                  try {
                    const data = await translateMutation.mutateAsync({
                      action: "translateContent",
                      input: {
                        title: form.title,
                        body: form.body,
                        targetLocale,
                      },
                    });

                    const createCopy = window.confirm(
                      "Create translated copy as a new article? Press Cancel to replace current text.",
                    );

                    if (createCopy) {
                      await apiMutation<Article>("/api/articles", "POST", {
                        title: data.title,
                        body: data.body,
                        status: form.status,
                        locale: data.locale,
                        categoryId: form.categoryId || null,
                        seoTitle: form.seoTitle || null,
                        seoDescription: form.seoDescription || null,
                        seoKeywords: form.seoKeywords
                          .split(",")
                          .map((item) => item.trim())
                          .filter(Boolean),
                      });
                      toast.success("Translated copy created");
                    } else {
                      updateForm((prev) => ({
                        ...prev,
                        title: data.title,
                        body: data.body,
                        locale: data.locale,
                      }));
                    }
                  } catch {
                    toast.error("Translation failed");
                  }
                }}
              >
                Translate
              </button>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
