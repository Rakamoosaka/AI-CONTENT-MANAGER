"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useI18n } from "@/components/providers/I18nProvider";
import { useAiAction } from "@/features/ai/hooks";
import {
  useArticle,
  useCategories,
  useUpsertArticle,
} from "@/features/content/list/hooks";
import type { Article } from "@/features/content/list/types";
import { apiMutation } from "@/lib/api/client";
import { TARGET_LANGUAGE_OPTIONS } from "./constants";
import { EditorAiPanel } from "./EditorAiPanel";
import { EditorFormPanel } from "./EditorFormPanel";
import type {
  CategorySuggestionState,
  FormState,
  SeoSuggestionState,
  ToneOption,
  TranslationPreviewState,
} from "./types";
import {
  detectLocaleFromText,
  mapArticleToForm,
  toArticlePayload,
} from "./utils";

type Props = { articleId?: string };

export function EditorScreen({ articleId }: Props) {
  const { t } = useI18n();
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
  const translateMutation = useAiAction<{
    title: string;
    body: string;
    locale: string;
  }>();

  const [draftForm, setDraftForm] = useState<FormState | null>(null);
  const form = useMemo(
    () => draftForm ?? mapArticleToForm(article),
    [draftForm, article],
  );

  function updateForm(updater: (prev: FormState) => FormState) {
    setDraftForm((prev) => updater(prev ?? mapArticleToForm(article)));
  }

  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<ToneOption>("neutral");
  const [targetLengthInput, setTargetLengthInput] = useState("900");
  const [targetLocale, setTargetLocale] = useState("en");
  const [categorySuggestion, setCategorySuggestion] =
    useState<CategorySuggestionState | null>(null);
  const [translationPreview, setTranslationPreview] =
    useState<TranslationPreviewState | null>(null);
  const [seoSuggestion, setSeoSuggestion] = useState<SeoSuggestionState | null>(
    null,
  );

  const targetLength = useMemo(() => {
    const parsed = Number(targetLengthInput);

    if (!Number.isFinite(parsed)) {
      return 900;
    }

    return Math.min(1500, Math.max(120, Math.round(parsed)));
  }, [targetLengthInput]);

  const suggestedCategory =
    categories?.find((item) => item.id === categorySuggestion?.categoryId) ??
    null;

  const articleCategoryOptions = useMemo(
    () => [
      { value: "", label: t("editor.noCategory") },
      ...(categories?.map((category) => ({
        value: category.id,
        label: category.name,
      })) ?? []),
    ],
    [categories, t],
  );

  const localeOptions = useMemo(() => {
    const base = TARGET_LANGUAGE_OPTIONS.map((option) => ({
      value: option.value,
      label: t(option.label),
    }));

    if (form.locale && !base.some((option) => option.value === form.locale)) {
      return [
        { value: form.locale, label: form.locale.toUpperCase() },
        ...base,
      ];
    }

    return base;
  }, [form.locale, t]);

  const activeAiTask =
    (generateMutation.isPending && t("aiTask.generating")) ||
    (categorizeMutation.isPending && t("aiTask.categorizing")) ||
    (seoMutation.isPending && t("aiTask.seo")) ||
    (translateMutation.isPending && t("aiTask.translating")) ||
    null;

  async function handleSaveArticle() {
    try {
      const saved = await saveMutation.mutateAsync(toArticlePayload(form));
      setDraftForm(null);
      toast.success(t("editor.saved"));
      if (!articleId) {
        router.push(`/content/${saved.id}`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("editor.saveFailed"),
      );
    }
  }

  async function handleGenerate() {
    try {
      const data = await generateMutation.mutateAsync({
        action: "generateContent",
        input: { topic, tone, targetLength },
      });

      const detectedLocale = detectLocaleFromText(
        `${data.title}\n${data.body}`,
      );

      updateForm((prev) => ({
        ...prev,
        title: data.title,
        body: data.body,
        locale: detectedLocale,
      }));
    } catch {
      toast.error(t("editor.generationFailed"));
    }
  }

  async function handleSuggestCategory() {
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
        toast.info(t("editor.noCategoryMatch"));
      }
    } catch {
      toast.error(t("editor.categorySuggestionFailed"));
    }
  }

  async function handleSuggestSeo() {
    try {
      const data = await seoMutation.mutateAsync({
        action: "seoSuggestions",
        input: {
          title: form.title,
          body: form.body,
          locale: form.locale,
        },
      });
      setSeoSuggestion(data);
      toast.success(t("editor.seoReady"));
    } catch {
      toast.error(t("editor.seoFailed"));
    }
  }

  async function handleTranslate() {
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
      toast.success(t("editor.translationReady"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("editor.translationFailed"),
      );
    }
  }

  async function handleCreateTranslatedArticle() {
    if (!translationPreview) {
      return;
    }

    try {
      const created = await apiMutation<Article>("/api/articles", "POST", {
        ...toArticlePayload(form),
        title: translationPreview.title,
        body: translationPreview.body,
        locale: translationPreview.locale,
      });

      setTranslationPreview(null);
      toast.success(t("editor.translatedCreated"));
      router.push(`/content/${created.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("editor.createTranslatedFailed"),
      );
    }
  }

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[3fr_2fr]">
      <EditorFormPanel
        form={form}
        activeAiTask={activeAiTask}
        articleCategoryOptions={articleCategoryOptions}
        localeOptions={localeOptions}
        isSaving={saveMutation.isPending}
        updateForm={updateForm}
        onSave={handleSaveArticle}
      />

      <EditorAiPanel
        categories={categories}
        form={form}
        tone={tone}
        topic={topic}
        targetLengthInput={targetLengthInput}
        targetLocale={targetLocale}
        generatePending={generateMutation.isPending}
        categorizePending={categorizeMutation.isPending}
        seoPending={seoMutation.isPending}
        translatePending={translateMutation.isPending}
        categorySuggestion={categorySuggestion}
        suggestedCategory={suggestedCategory}
        seoSuggestion={seoSuggestion}
        translationPreview={translationPreview}
        onTopicChange={setTopic}
        onToneChange={setTone}
        onLengthInputChange={setTargetLengthInput}
        onLengthInputBlur={() => {
          const parsed = Number(targetLengthInput);
          if (!Number.isFinite(parsed)) {
            setTargetLengthInput("120");
            return;
          }

          setTargetLengthInput(
            String(Math.min(1500, Math.max(120, Math.round(parsed)))),
          );
        }}
        onTargetLocaleChange={setTargetLocale}
        onGenerate={handleGenerate}
        onSuggestCategory={handleSuggestCategory}
        onApplyCategorySuggestion={() => {
          if (!suggestedCategory) {
            return;
          }

          updateForm((prev) => ({
            ...prev,
            categoryId: suggestedCategory.id,
          }));
          setCategorySuggestion(null);
          toast.success(t("editor.suggestedCategoryApplied"));
        }}
        onDismissCategorySuggestion={() => {
          setCategorySuggestion(null);
          toast.info(t("editor.categorySuggestionDismissed"));
        }}
        onSuggestSeo={handleSuggestSeo}
        onApplySeo={() => {
          if (!seoSuggestion) {
            return;
          }

          updateForm((prev) => ({
            ...prev,
            seoTitle: seoSuggestion.seoTitle,
            seoDescription: seoSuggestion.seoDescription,
            seoKeywords: seoSuggestion.seoKeywords.join(", "),
          }));
          setSeoSuggestion(null);
          toast.success(t("editor.seoSuggestionApplied"));
        }}
        onDismissSeo={() => {
          setSeoSuggestion(null);
          toast.info(t("editor.seoSuggestionDismissed"));
        }}
        onTranslate={handleTranslate}
        onCreateTranslatedArticle={handleCreateTranslatedArticle}
        onReplaceWithTranslation={() => {
          if (!translationPreview) {
            return;
          }

          updateForm((prev) => ({
            ...prev,
            title: translationPreview.title,
            body: translationPreview.body,
            locale: translationPreview.locale,
          }));
          setTranslationPreview(null);
          toast.success(t("editor.currentReplaced"));
        }}
        onCancelTranslation={() => setTranslationPreview(null)}
      />
    </div>
  );
}
