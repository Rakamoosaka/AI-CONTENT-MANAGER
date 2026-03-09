"use client";

import type { Article } from "@/features/content/list/types";
import { SelectField } from "@/components/ui/SelectField";
import { ARTICLE_STATUS_OPTIONS } from "./constants";
import type { FormState } from "./types";

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
  return (
    <section
      className="glass-card editor-grid-pattern stagger-in rounded-3xl p-5"
      style={{ animationDelay: "140ms" }}
    >
      <h2 className="font-display text-3xl font-semibold tracking-tight">
        Article editor
      </h2>
      <p className="mt-1 text-sm text-(--ink-soft)">
        Compose, enrich, and ship with AI support in one workspace.
      </p>

      {activeAiTask ? (
        <div className="mt-4 rounded-xl border border-(--line) bg-(--bg-soft) px-3 py-2 text-sm text-(--ink)">
          <div className="flex items-center gap-2">
            <span className="loading-spinner" aria-hidden="true" />
            <span>AI is working: {activeAiTask}...</span>
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-3">
        <input
          className="form-control font-display text-xl"
          placeholder="Title"
          value={form.title}
          onChange={(event) =>
            updateForm((prev) => ({ ...prev, title: event.target.value }))
          }
        />

        <div className="relative">
          <textarea
            className="form-control min-h-80 leading-relaxed"
            placeholder="Body"
            value={form.body}
            onChange={(event) =>
              updateForm((prev) => ({ ...prev, body: event.target.value }))
            }
          />
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
            options={ARTICLE_STATUS_OPTIONS}
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
          <summary className="cursor-pointer font-medium">SEO</summary>
          <div className="mt-3 grid gap-2">
            <input
              className="form-control"
              placeholder="SEO title"
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
              placeholder="SEO description"
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
              placeholder="keyword1, keyword2"
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
          {isSaving ? "Saving..." : "Save article"}
        </button>
      </div>
    </section>
  );
}
