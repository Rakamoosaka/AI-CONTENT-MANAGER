"use client";

import { EditorAiPanel } from "./EditorAiPanel";
import { EditorFormPanel } from "./EditorFormPanel";
import { useEditorScreenController } from "./useEditorScreenController";

type Props = { articleId?: string };

export function EditorScreen({ articleId }: Props) {
  const {
    form,
    categories,
    articleCategoryOptions,
    localeOptions,
    activeAiTask,
    isSaving,
    topic,
    tone,
    targetLengthInput,
    targetLocale,
    categorySuggestion,
    suggestedCategory,
    seoSuggestion,
    translationPreview,
    generatePending,
    categorizePending,
    seoPending,
    translatePending,
    setTopic,
    setTone,
    setTargetLengthInput,
    setTargetLocale,
    updateForm,
    handleLengthInputBlur,
    handleSaveArticle,
    handleGenerate,
    handleSuggestCategory,
    handleSuggestSeo,
    handleTranslate,
    handleCreateTranslatedArticle,
    applyCategorySuggestion,
    dismissCategorySuggestion,
    applySeoSuggestion,
    dismissSeoSuggestion,
    replaceWithTranslation,
    cancelTranslation,
  } = useEditorScreenController({ articleId });

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[3fr_2fr]">
      <EditorFormPanel
        form={form}
        activeAiTask={activeAiTask}
        articleCategoryOptions={articleCategoryOptions}
        localeOptions={localeOptions}
        isSaving={isSaving}
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
        generatePending={generatePending}
        categorizePending={categorizePending}
        seoPending={seoPending}
        translatePending={translatePending}
        categorySuggestion={categorySuggestion}
        suggestedCategory={suggestedCategory}
        seoSuggestion={seoSuggestion}
        translationPreview={translationPreview}
        onTopicChange={setTopic}
        onToneChange={setTone}
        onLengthInputChange={setTargetLengthInput}
        onLengthInputBlur={handleLengthInputBlur}
        onTargetLocaleChange={setTargetLocale}
        onGenerate={handleGenerate}
        onSuggestCategory={handleSuggestCategory}
        onApplyCategorySuggestion={applyCategorySuggestion}
        onDismissCategorySuggestion={dismissCategorySuggestion}
        onSuggestSeo={handleSuggestSeo}
        onApplySeo={applySeoSuggestion}
        onDismissSeo={dismissSeoSuggestion}
        onTranslate={handleTranslate}
        onCreateTranslatedArticle={handleCreateTranslatedArticle}
        onReplaceWithTranslation={replaceWithTranslation}
        onCancelTranslation={cancelTranslation}
      />
    </div>
  );
}
