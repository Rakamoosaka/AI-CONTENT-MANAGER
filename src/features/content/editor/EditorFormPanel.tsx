"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
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

type ToolbarAction =
  | "bold"
  | "italic"
  | "h2"
  | "h3"
  | "bullet"
  | "numbered"
  | "quote"
  | "link"
  | "inlineCode"
  | "codeBlock";

const TOOLBAR_BUTTONS: Array<{
  action: ToolbarAction;
  label: string;
  labelKey?: string;
  titleKey: string;
  shortcut?: string;
}> = [
  {
    action: "bold",
    label: "B",
    titleKey: "editor.toolbar.bold",
    shortcut: "Ctrl/Cmd+B",
  },
  {
    action: "italic",
    label: "I",
    titleKey: "editor.toolbar.italic",
    shortcut: "Ctrl/Cmd+I",
  },
  { action: "h2", label: "H2", titleKey: "editor.toolbar.h2" },
  { action: "h3", label: "H3", titleKey: "editor.toolbar.h3" },
  {
    action: "bullet",
    label: "-",
    titleKey: "editor.toolbar.bullet",
    shortcut: "Ctrl/Cmd+Shift+8",
  },
  {
    action: "numbered",
    label: "1.",
    titleKey: "editor.toolbar.numbered",
    shortcut: "Ctrl/Cmd+Shift+7",
  },
  { action: "quote", label: '"', titleKey: "editor.toolbar.quote" },
  {
    action: "link",
    label: "Link",
    labelKey: "editor.toolbar.link",
    titleKey: "editor.toolbar.insertLink",
    shortcut: "Ctrl/Cmd+K",
  },
  {
    action: "inlineCode",
    label: "</>",
    titleKey: "editor.toolbar.inlineCode",
    shortcut: "Ctrl/Cmd+E",
  },
  { action: "codeBlock", label: "{ }", titleKey: "editor.toolbar.codeBlock" },
];

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
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const [editorMode, setEditorMode] = useState<"write" | "preview">("write");
  const bodyHistoryRef = useRef({
    past: [] as string[],
    present: form.body,
    future: [] as string[],
  });

  useEffect(() => {
    if (form.body === bodyHistoryRef.current.present) {
      return;
    }

    const history = bodyHistoryRef.current;
    history.past.push(history.present);

    if (history.past.length > 250) {
      history.past.shift();
    }

    history.present = form.body;
    history.future = [];
  }, [form.body]);

  function commitBodyChange(nextBody: string) {
    const history = bodyHistoryRef.current;

    if (nextBody === history.present) {
      return;
    }

    history.past.push(history.present);

    if (history.past.length > 250) {
      history.past.shift();
    }

    history.present = nextBody;
    history.future = [];

    updateForm((prev) => ({ ...prev, body: nextBody }));
  }

  function undoBodyChange() {
    const history = bodyHistoryRef.current;
    const previous = history.past.pop();

    if (previous === undefined) {
      return;
    }

    history.future.push(history.present);
    history.present = previous;
    updateForm((prev) => ({ ...prev, body: previous }));
  }

  function redoBodyChange() {
    const history = bodyHistoryRef.current;
    const next = history.future.pop();

    if (next === undefined) {
      return;
    }

    history.past.push(history.present);
    history.present = next;
    updateForm((prev) => ({ ...prev, body: next }));
  }

  function updateBody(
    text: string,
    selectionStart: number,
    selectionEnd: number,
  ) {
    commitBodyChange(text);

    requestAnimationFrame(() => {
      if (!bodyRef.current) {
        return;
      }

      bodyRef.current.focus();
      bodyRef.current.setSelectionRange(selectionStart, selectionEnd);
    });
  }

  function wrapSelection(
    value: string,
    start: number,
    end: number,
    prefix: string,
    suffix: string,
    placeholder: string,
    enableToggle = true,
  ) {
    const selected = value.slice(start, end);

    if (
      enableToggle &&
      selected &&
      selected.startsWith(prefix) &&
      selected.endsWith(suffix)
    ) {
      const unwrapped = selected.slice(
        prefix.length,
        selected.length - suffix.length,
      );
      const nextValue = value.slice(0, start) + unwrapped + value.slice(end);

      return {
        nextValue,
        selectionStart: start,
        selectionEnd: start + unwrapped.length,
      };
    }

    const content = selected || placeholder;
    const nextValue =
      value.slice(0, start) + prefix + content + suffix + value.slice(end);
    const contentStart = start + prefix.length;
    const contentEnd = contentStart + content.length;

    return {
      nextValue,
      selectionStart: contentStart,
      selectionEnd: contentEnd,
    };
  }

  function prefixLines(
    value: string,
    start: number,
    end: number,
    linePrefixFactory: (lineIndex: number) => string,
  ) {
    const blockStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    const blockEndIndex = value.indexOf("\n", end);
    const blockEnd = blockEndIndex === -1 ? value.length : blockEndIndex;
    const selectedBlock = value.slice(blockStart, blockEnd);
    const lines = selectedBlock.split("\n");
    const prefixedBlock = lines
      .map((line, lineIndex) => `${linePrefixFactory(lineIndex)}${line}`)
      .join("\n");
    const nextValue =
      value.slice(0, blockStart) + prefixedBlock + value.slice(blockEnd);

    return {
      nextValue,
      selectionStart: blockStart,
      selectionEnd: blockStart + prefixedBlock.length,
    };
  }

  function handleFormat(action: ToolbarAction) {
    if (!bodyRef.current) {
      return;
    }

    const start = bodyRef.current.selectionStart;
    const end = bodyRef.current.selectionEnd;
    const value = form.body;

    if (action === "link") {
      const selected = value.slice(start, end);
      const markdownLinkMatch = selected.match(/^\[([^\]]+)\]\(([^)]+)\)$/);

      if (markdownLinkMatch) {
        const plain = markdownLinkMatch[1];
        const nextValue = value.slice(0, start) + plain + value.slice(end);
        updateBody(nextValue, start, start + plain.length);
        return;
      }

      const content = selected || "link text";
      const url = /^https?:\/\/\S+$/i.test(content) ? content : "https://";
      const replacement = `[${content}](${url})`;
      const nextValue = value.slice(0, start) + replacement + value.slice(end);
      const urlStart = start + content.length + 3;
      const urlEnd = urlStart + url.length;

      if (url === "https://") {
        updateBody(nextValue, urlStart, urlEnd);
      } else {
        updateBody(nextValue, start + 1, start + 1 + content.length);
      }
      return;
    }

    const apply =
      action === "bold"
        ? wrapSelection(value, start, end, "**", "**", "bold text")
        : action === "italic"
          ? wrapSelection(value, start, end, "*", "*", "italic text")
          : action === "inlineCode"
            ? wrapSelection(value, start, end, "`", "`", "code")
            : action === "codeBlock"
              ? wrapSelection(value, start, end, "```\n", "\n```", "code")
              : action === "h2"
                ? prefixLines(value, start, end, () => "## ")
                : action === "h3"
                  ? prefixLines(value, start, end, () => "### ")
                  : action === "bullet"
                    ? prefixLines(value, start, end, () => "- ")
                    : action === "numbered"
                      ? prefixLines(
                          value,
                          start,
                          end,
                          (lineIndex) => `${lineIndex + 1}. `,
                        )
                      : prefixLines(value, start, end, () => "> ");

    updateBody(apply.nextValue, apply.selectionStart, apply.selectionEnd);
  }

  useEffect(() => {
    function handleModeShortcut(event: KeyboardEvent) {
      const hasModifier = event.metaKey || event.ctrlKey;

      if (!hasModifier || !event.shiftKey || event.key.toLowerCase() !== "m") {
        return;
      }

      event.preventDefault();
      setEditorMode((prev) => (prev === "write" ? "preview" : "write"));
    }

    window.addEventListener("keydown", handleModeShortcut);

    return () => {
      window.removeEventListener("keydown", handleModeShortcut);
    };
  }, []);

  function handleBodyKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!event.metaKey && !event.ctrlKey && event.key === "Enter") {
      if (
        !bodyRef.current ||
        bodyRef.current.selectionStart !== bodyRef.current.selectionEnd
      ) {
        return;
      }

      const cursor = bodyRef.current.selectionStart;
      const value = form.body;
      const lineStart = value.lastIndexOf("\n", Math.max(0, cursor - 1)) + 1;
      const nextBreak = value.indexOf("\n", cursor);
      const lineEnd = nextBreak === -1 ? value.length : nextBreak;

      if (cursor !== lineEnd) {
        return;
      }

      const line = value.slice(lineStart, lineEnd);
      const bulletMatch = line.match(/^(\s*-\s+)(.+)$/);
      const orderedMatch = line.match(/^(\s*)(\d+)\.\s+(.+)$/);

      if (bulletMatch) {
        event.preventDefault();
        const insertion = `\n${bulletMatch[1]}`;
        const nextValue =
          value.slice(0, cursor) + insertion + value.slice(cursor);
        const nextCursor = cursor + insertion.length;
        updateBody(nextValue, nextCursor, nextCursor);
        return;
      }

      if (orderedMatch) {
        event.preventDefault();
        const nextNumber = Number(orderedMatch[2]) + 1;
        const insertion = `\n${orderedMatch[1]}${nextNumber}. `;
        const nextValue =
          value.slice(0, cursor) + insertion + value.slice(cursor);
        const nextCursor = cursor + insertion.length;
        updateBody(nextValue, nextCursor, nextCursor);
      }

      return;
    }

    const hasModifier = event.metaKey || event.ctrlKey;

    if (!hasModifier) {
      return;
    }

    const key = event.key.toLowerCase();

    if (key === "z") {
      event.preventDefault();

      if (event.shiftKey) {
        redoBodyChange();
      } else {
        undoBodyChange();
      }

      return;
    }

    if (key === "y") {
      event.preventDefault();
      redoBodyChange();
      return;
    }

    if (key === "b") {
      event.preventDefault();
      handleFormat("bold");
      return;
    }

    if (key === "i") {
      event.preventDefault();
      handleFormat("italic");
      return;
    }

    if (key === "k") {
      event.preventDefault();
      handleFormat("link");
      return;
    }

    if (key === "e") {
      event.preventDefault();
      handleFormat("inlineCode");
      return;
    }

    if (key === "8" && event.shiftKey) {
      event.preventDefault();
      handleFormat("bullet");
      return;
    }

    if (key === "7" && event.shiftKey) {
      event.preventDefault();
      handleFormat("numbered");
    }
  }

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
            <div className="form-control min-h-80 min-w-0 space-y-3 overflow-auto leading-relaxed">
              <MarkdownPreview markdown={form.body} t={t} />
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

function MarkdownPreview({
  markdown,
  t,
}: {
  markdown: string;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const currentLine = lines[index] ?? "";
    const trimmedLine = currentLine.trim();

    if (!trimmedLine) {
      index += 1;
      continue;
    }

    if (trimmedLine.startsWith("```")) {
      const codeLines: string[] = [];
      index += 1;

      while (
        index < lines.length &&
        !(lines[index] ?? "").trim().startsWith("```")
      ) {
        codeLines.push(lines[index] ?? "");
        index += 1;
      }

      blocks.push(
        <pre
          key={`code-${index}-${codeLines.length}`}
          className="max-w-full overflow-x-auto rounded-lg border border-(--line) bg-(--bg-soft) p-3 text-xs"
        >
          <code className="whitespace-pre-wrap wrap-break-word">
            {codeLines.join("\n")}
          </code>
        </pre>,
      );

      index += 1;
      continue;
    }

    if (trimmedLine.startsWith("### ")) {
      blocks.push(
        <h3 key={`h3-${index}`} className="font-display text-xl font-semibold">
          {renderInlineMarkdown(trimmedLine.slice(4))}
        </h3>,
      );
      index += 1;
      continue;
    }

    if (trimmedLine.startsWith("## ")) {
      blocks.push(
        <h2 key={`h2-${index}`} className="font-display text-2xl font-semibold">
          {renderInlineMarkdown(trimmedLine.slice(3))}
        </h2>,
      );
      index += 1;
      continue;
    }

    if (/^\d+\.\s+/.test(trimmedLine)) {
      const listItems: ReactNode[] = [];
      let orderedCursor = index;

      while (orderedCursor < lines.length) {
        const line = (lines[orderedCursor] ?? "").trim();
        const match = line.match(/^\d+\.\s+(.+)$/);

        if (!match) {
          break;
        }

        listItems.push(
          <li key={`ol-item-${orderedCursor}`}>
            {renderInlineMarkdown(match[1])}
          </li>,
        );
        orderedCursor += 1;
      }

      blocks.push(
        <ol key={`ol-${index}`} className="list-inside list-decimal space-y-1">
          {listItems}
        </ol>,
      );
      index = orderedCursor;
      continue;
    }

    if (trimmedLine.startsWith("- ")) {
      const listItems: ReactNode[] = [];
      let bulletCursor = index;

      while (bulletCursor < lines.length) {
        const line = (lines[bulletCursor] ?? "").trim();

        if (!line.startsWith("- ")) {
          break;
        }

        listItems.push(
          <li key={`ul-item-${bulletCursor}`}>
            {renderInlineMarkdown(line.slice(2))}
          </li>,
        );
        bulletCursor += 1;
      }

      blocks.push(
        <ul key={`ul-${index}`} className="list-inside list-disc space-y-1">
          {listItems}
        </ul>,
      );
      index = bulletCursor;
      continue;
    }

    if (trimmedLine.startsWith("> ")) {
      blocks.push(
        <blockquote
          key={`quote-${index}`}
          className="border-l-2 border-(--line) pl-3 text-(--ink-soft)"
        >
          {renderInlineMarkdown(trimmedLine.slice(2))}
        </blockquote>,
      );
      index += 1;
      continue;
    }

    const paragraphLines: string[] = [currentLine];
    let paragraphCursor = index + 1;

    while (paragraphCursor < lines.length) {
      const nextLine = lines[paragraphCursor] ?? "";
      const nextTrimmedLine = nextLine.trim();

      if (
        !nextTrimmedLine ||
        nextTrimmedLine.startsWith("## ") ||
        nextTrimmedLine.startsWith("### ") ||
        nextTrimmedLine.startsWith("- ") ||
        nextTrimmedLine.startsWith("> ") ||
        nextTrimmedLine.startsWith("```") ||
        /^\d+\.\s+/.test(nextTrimmedLine)
      ) {
        break;
      }

      paragraphLines.push(nextLine);
      paragraphCursor += 1;
    }

    blocks.push(
      <p key={`p-${index}`} className="text-sm leading-relaxed">
        {renderInlineMarkdown(paragraphLines.join(" "))}
      </p>,
    );

    index = paragraphCursor;
  }

  if (!blocks.length) {
    return (
      <p className="text-sm text-(--ink-soft)">{t("editor.previewEmpty")}</p>
    );
  }

  return <Fragment>{blocks}</Fragment>;
}

function renderInlineMarkdown(value: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const tokenPattern =
    /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\((https?:\/\/[^\s)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null = tokenPattern.exec(value);

  while (match) {
    if (match.index > lastIndex) {
      nodes.push(value.slice(lastIndex, match.index));
    }

    const token = match[0];

    if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong key={`strong-${match.index}`}>{token.slice(2, -2)}</strong>,
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      nodes.push(<em key={`em-${match.index}`}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(
        <code
          key={`code-inline-${match.index}`}
          className="rounded bg-(--bg-soft) px-1 py-0.5 text-[0.85em]"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      const linkMatch = token.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);

      if (linkMatch) {
        nodes.push(
          <a
            key={`link-${match.index}`}
            className="underline decoration-(--teal) decoration-1 underline-offset-2"
            href={linkMatch[2]}
            rel="noreferrer"
            target="_blank"
          >
            {linkMatch[1]}
          </a>,
        );
      } else {
        nodes.push(token);
      }
    }

    lastIndex = match.index + token.length;
    match = tokenPattern.exec(value);
  }

  if (lastIndex < value.length) {
    nodes.push(value.slice(lastIndex));
  }

  return nodes;
}
