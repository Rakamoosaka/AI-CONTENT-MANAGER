"use client";

import { Fragment, type ReactNode } from "react";
import { useI18n } from "@/components/providers/I18nProvider";

export function MarkdownPreview({ markdown }: { markdown: string }) {
  const { t } = useI18n();
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
