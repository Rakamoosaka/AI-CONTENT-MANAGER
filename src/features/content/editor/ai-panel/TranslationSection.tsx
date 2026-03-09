"use client";

import { toast } from "sonner";
import { useI18n } from "@/components/providers/I18nProvider";
import { SelectField } from "@/components/ui/SelectField";
import { TARGET_LANGUAGE_OPTIONS } from "../constants";
import type { FormState, TranslationPreviewState } from "../types";
import { AiStepCard } from "./AiStepCard";

type Props = {
  form: FormState;
  targetLocale: string;
  translatePending: boolean;
  translationPreview: TranslationPreviewState | null;
  onTargetLocaleChange: (value: string) => void;
  onTranslate: () => Promise<void>;
  onCreateTranslatedArticle: () => Promise<void>;
  onReplaceWithTranslation: () => void;
  onCancelTranslation: () => void;
};

export function TranslationSection({
  form,
  targetLocale,
  translatePending,
  translationPreview,
  onTargetLocaleChange,
  onTranslate,
  onCreateTranslatedArticle,
  onReplaceWithTranslation,
  onCancelTranslation,
}: Props) {
  const { t } = useI18n();

  return (
    <AiStepCard title={t("editor.translation")} animationDelay="530ms">
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
    </AiStepCard>
  );
}
