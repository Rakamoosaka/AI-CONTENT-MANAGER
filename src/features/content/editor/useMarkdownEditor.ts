"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import type { ToolbarAction } from "./editorToolbar";

type Params = {
  body: string;
  onBodyChange: (nextBody: string) => void;
};

export function useMarkdownEditor({ body, onBodyChange }: Params) {
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const [editorMode, setEditorMode] = useState<"write" | "preview">("write");
  const bodyHistoryRef = useRef({
    past: [] as string[],
    present: body,
    future: [] as string[],
  });

  useEffect(() => {
    if (body === bodyHistoryRef.current.present) {
      return;
    }

    const history = bodyHistoryRef.current;
    history.past.push(history.present);

    if (history.past.length > 250) {
      history.past.shift();
    }

    history.present = body;
    history.future = [];
  }, [body]);

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

    onBodyChange(nextBody);
  }

  function undoBodyChange() {
    const history = bodyHistoryRef.current;
    const previous = history.past.pop();

    if (previous === undefined) {
      return;
    }

    history.future.push(history.present);
    history.present = previous;
    onBodyChange(previous);
  }

  function redoBodyChange() {
    const history = bodyHistoryRef.current;
    const next = history.future.pop();

    if (next === undefined) {
      return;
    }

    history.past.push(history.present);
    history.present = next;
    onBodyChange(next);
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
    const value = body;

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

  function handleBodyKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (!event.metaKey && !event.ctrlKey && event.key === "Enter") {
      if (
        !bodyRef.current ||
        bodyRef.current.selectionStart !== bodyRef.current.selectionEnd
      ) {
        return;
      }

      const cursor = bodyRef.current.selectionStart;
      const value = body;
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

  return {
    bodyRef,
    editorMode,
    setEditorMode,
    commitBodyChange,
    handleFormat,
    handleBodyKeyDown,
  };
}
