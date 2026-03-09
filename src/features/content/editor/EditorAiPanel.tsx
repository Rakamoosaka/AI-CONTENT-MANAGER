"use client";

import { useI18n } from "@/components/providers/I18nProvider";
import type { Category } from "@/features/content/list/types";
import { CategorySection } from "./ai-panel/CategorySection";
import { GenerateSection } from "./ai-panel/GenerateSection";
import { SeoSection } from "./ai-panel/SeoSection";
import { TranslationSection } from "./ai-panel/TranslationSection";
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
        <GenerateSection
          tone={tone}
          topic={topic}
          targetLengthInput={targetLengthInput}
          generatePending={generatePending}
          onTopicChange={onTopicChange}
          onToneChange={onToneChange}
          onLengthInputChange={onLengthInputChange}
          onLengthInputBlur={onLengthInputBlur}
          onGenerate={onGenerate}
        />

        <CategorySection
          categories={categories}
          categorizePending={categorizePending}
          categorySuggestion={categorySuggestion}
          suggestedCategory={suggestedCategory}
          onSuggestCategory={onSuggestCategory}
          onApplyCategorySuggestion={onApplyCategorySuggestion}
          onDismissCategorySuggestion={onDismissCategorySuggestion}
        />

        <SeoSection
          seoPending={seoPending}
          seoSuggestion={seoSuggestion}
          onSuggestSeo={onSuggestSeo}
          onApplySeo={onApplySeo}
          onDismissSeo={onDismissSeo}
        />

        <TranslationSection
          form={form}
          targetLocale={targetLocale}
          translatePending={translatePending}
          translationPreview={translationPreview}
          onTargetLocaleChange={onTargetLocaleChange}
          onTranslate={onTranslate}
          onCreateTranslatedArticle={onCreateTranslatedArticle}
          onReplaceWithTranslation={onReplaceWithTranslation}
          onCancelTranslation={onCancelTranslation}
        />
      </div>
    </aside>
  );
}
