export type ToolbarAction =
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

export const TOOLBAR_BUTTONS: Array<{
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
