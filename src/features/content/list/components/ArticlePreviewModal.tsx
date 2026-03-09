"use client";

import { Fragment, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/I18nProvider";
import { useArticle } from "@/features/content/list/hooks";
import { formatDate } from "@/lib/utils";

type Props = {
  articleId: string | null;
  onClose: () => void;
};

export function ArticlePreviewModal({ articleId, onClose }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const { data: article, isLoading } = useArticle(articleId ?? undefined);

  if (!articleId) {
    return null;
  }

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 grid place-items-center bg-black/35 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t("content.previewModalTitle")}
    >
      <div
        className="modal-panel glass-card flex h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl p-3 sm:h-[90vh] sm:rounded-3xl sm:p-4 md:p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 -mx-3 -mt-3 border-b border-(--line) bg-(--bg-surface)/95 px-3 py-3 backdrop-blur sm:-mx-4 sm:-mt-4 sm:px-4 md:-mx-5 md:-mt-5 md:px-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-lg font-semibold md:text-xl">
              {article?.title || t("content.previewModalTitle")}
            </h3>
            <span className="rounded-full bg-(--bg-soft) px-2 py-1 text-xs text-(--ink-soft)">
              {article
                ? article.status === "published"
                  ? t("status.published")
                  : t("status.draft")
                : "..."}
            </span>
          </div>

          {article ? (
            <p className="mt-2 text-xs text-(--ink-soft)">
              {article.locale.toUpperCase()} | {formatDate(article.createdAt)}
            </p>
          ) : null}
        </div>

        <div className="mt-4 min-h-44 flex-1 overflow-y-auto overflow-x-hidden rounded-2xl border border-(--line) bg-(--bg-surface)/90 p-3 sm:rounded-3xl sm:p-4">
          {isLoading ? (
            <p className="text-sm text-(--ink-soft)">{t("common.loading")}</p>
          ) : article ? (
            <article className="space-y-3 wrap-break-word">
              <MarkdownPreview markdown={article.body} t={t} />
            </article>
          ) : (
            <p className="text-sm text-(--ink-soft)">
              {t("content.previewNotFound")}
            </p>
          )}
        </div>

        <div className="sticky bottom-0 z-10 -mx-3 -mb-3 mt-4 border-t border-(--line) bg-(--bg-surface)/95 px-3 py-3 backdrop-blur sm:-mx-4 sm:-mb-4 sm:px-4 md:-mx-5 md:-mb-5 md:px-5">
          <div className="flex justify-end gap-2">
            <button
              className="rounded-lg border border-(--line) px-3 py-2"
              onClick={onClose}
            >
              {t("common.close")}
            </button>
            <button
              className="rounded-lg bg-(--teal) px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!article}
              onClick={() => {
                if (!article) {
                  return;
                }

                router.push(`/content/${article.id}`);
                onClose();
              }}
            >
              {t("common.edit")}
            </button>
          </div>
        </div>
      </div>
    </div>
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
        <h3
          key={`h3-${index}`}
          className="font-display text-lg font-semibold sm:text-xl"
        >
          {renderInlineMarkdown(trimmedLine.slice(4))}
        </h3>,
      );
      index += 1;
      continue;
    }

    if (trimmedLine.startsWith("## ")) {
      blocks.push(
        <h2
          key={`h2-${index}`}
          className="font-display text-xl font-semibold sm:text-2xl"
        >
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
          <li key={`ol-item-${orderedCursor}`} className="wrap-break-word">
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
          <li key={`ul-item-${bulletCursor}`} className="wrap-break-word">
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
          className="wrap-break-word border-l-2 border-(--line) pl-3 text-(--ink-soft)"
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
      <p key={`p-${index}`} className="wrap-break-word text-sm leading-relaxed">
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
          className="rounded bg-(--bg-soft) px-1 py-0.5 text-[0.85em] break-all"
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
            className="wrap-break-word break-all underline decoration-(--teal) decoration-1 underline-offset-2"
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
