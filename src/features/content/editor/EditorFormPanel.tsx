"use client";

import { useI18n } from "@/components/providers/I18nProvider";
import type { Article } from "@/features/content/list/types";
import { SelectField } from "@/components/ui/SelectField";
import { ARTICLE_STATUS_OPTIONS } from "./constants";
import { MarkdownPreview } from "./MarkdownPreview";
import { TOOLBAR_BUTTONS } from "./editorToolbar";
import type { FormState } from "./types";
import { useMarkdownEditor } from "./useMarkdownEditor";

type Props = {
  form: FormState;
  activeAiTask: string | null;
  articleCategoryOptions: Array<{ value: string; label: string }>;
  localeOptions: Array<{ value: string; label: string }>;
  isSaving: boolean;
  updateForm: (updater: (prev: FormState) => FormState) => void;
  onSave: () => Promise<void>;
};

export function EditorFormPanel({
  form,
  activeAiTask,
  articleCategoryOptions,
  localeOptions,
  isSaving,
  updateForm,
  onSave,
}: Props) {
  const { t } = useI18n();
  const {
    bodyRef,
    editorMode,
    setEditorMode,
    commitBodyChange,
    handleFormat,
    handleBodyKeyDown,
  } = useMarkdownEditor({
    body: form.body,
    onBodyChange: (nextBody) =>
      updateForm((prev) => ({
        ...prev,
        body: nextBody,
      })),
  });

  return (
    <section
      className="glass-card editor-grid-pattern stagger-in rounded-3xl p-5"
      style={{ animationDelay: "140ms" }}
    >
      <h2 className="font-display text-3xl font-semibold tracking-tight">
        {t("editor.articleEditor")}
      </h2>
      <p className="mt-1 text-sm text-(--ink-soft)">{t("editor.subtitle")}</p>

      {activeAiTask ? (
        <div className="mt-4 rounded-xl border border-(--line) bg-(--bg-soft) px-3 py-2 text-sm text-(--ink)">
          <div className="flex items-center gap-2">
            <span className="loading-spinner" aria-hidden="true" />
            <span>{t("editor.aiWorking", { task: activeAiTask })}</span>
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-3">
        <input
          className="form-control font-display text-xl"
          placeholder={t("editor.titlePlaceholder")}
          value={form.title}
          onChange={(event) =>
            updateForm((prev) => ({ ...prev, title: event.target.value }))
          }
        />

        <div className="relative">
          <div className="mb-2 flex flex-wrap gap-2 rounded-xl border border-(--line) bg-(--bg-surface) p-2">
            {TOOLBAR_BUTTONS.map((button) => (
              <button
                key={button.action}
                type="button"
                title={
                  button.shortcut
                    ? `${t(button.titleKey)} (${button.shortcut})`
                    : t(button.titleKey)
                }
                aria-label={
                  button.shortcut
                    ? `${t(button.titleKey)} (${button.shortcut})`
                    : t(button.titleKey)
                }
                className="lift-card rounded-lg border border-(--line) bg-(--bg-base) px-2.5 py-1 text-xs font-semibold text-(--ink)"
                onClick={() => handleFormat(button.action)}
              >
                {button.labelKey ? t(button.labelKey) : button.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                title={t("editor.writeMode")}
                className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                  editorMode === "write"
                    ? "border-(--teal) bg-(--teal) text-(--bg-base)"
                    : "border-(--line) bg-(--bg-base) text-(--ink)"
                }`}
                onClick={() => setEditorMode("write")}
              >
                {t("editor.write")}
              </button>
              <button
                type="button"
                title={t("editor.previewMode")}
                className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                  editorMode === "preview"
                    ? "border-(--teal) bg-(--teal) text-(--bg-base)"
                    : "border-(--line) bg-(--bg-base) text-(--ink)"
                }`}
                onClick={() => setEditorMode("preview")}
              >
                {t("editor.preview")}
              </button>
            </div>
          </div>

          {editorMode === "write" ? (
            <textarea
              ref={bodyRef}
              className="form-control min-h-80 leading-relaxed"
              placeholder={t("editor.bodyPlaceholder")}
              value={form.body}
              onChange={(event) => commitBodyChange(event.target.value)}
              onKeyDown={handleBodyKeyDown}
            />
          ) : (
            <div className="form-control min-h-80 min-w-0 space-y-3 overflow-auto overflow-x-hidden leading-relaxed">
              <MarkdownPreview markdown={form.body} />
            </div>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <SelectField
            value={form.categoryId}
            onChange={(nextValue) =>
              updateForm((prev) => ({ ...prev, categoryId: nextValue }))
            }
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
            options={ARTICLE_STATUS_OPTIONS.map((option) => ({
              value: option.value,
              label: t(option.label),
            }))}
          />

          <SelectField
            value={form.locale}
            onChange={(nextValue) =>
              updateForm((prev) => ({ ...prev, locale: nextValue }))
            }
            options={localeOptions}
          />
        </div>

        <details className="rounded-xl border border-(--line) bg-(--bg-surface) p-3">
          <summary className="cursor-pointer font-medium">
            {t("editor.seo")}
          </summary>
          <div className="mt-3 grid gap-2">
            <input
              className="form-control"
              placeholder={t("editor.seoTitle")}
              value={form.seoTitle}
              onChange={(event) =>
                updateForm((prev) => ({
                  ...prev,
                  seoTitle: event.target.value,
                }))
              }
            />
            <textarea
              className="form-control"
              placeholder={t("editor.seoDescription")}
              value={form.seoDescription}
              onChange={(event) =>
                updateForm((prev) => ({
                  ...prev,
                  seoDescription: event.target.value,
                }))
              }
            />
            <input
              className="form-control"
              placeholder={t("editor.seoKeywords")}
              value={form.seoKeywords}
              onChange={(event) =>
                updateForm((prev) => ({
                  ...prev,
                  seoKeywords: event.target.value,
                }))
              }
            />
          </div>
        </details>

        <button
          className="lift-card rounded-xl bg-(--teal) px-4 py-2 font-semibold text-(--bg-base)"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? t("editor.saving") : t("editor.saveArticle")}
        </button>
      </div>
    </section>
  );
}
