type FieldLabelProps = {
  text: string;
  tip: string;
  className?: string;
  buttonClassName?: string;
};

export function FieldLabel({
  text,
  tip,
  className = "mb-1 flex items-center gap-2 text-xs font-medium text-(--ink-soft)",
  buttonClassName = "inline-flex h-4 w-4 items-center justify-center rounded-full border border-(--line) text-[10px] leading-none",
}: FieldLabelProps) {
  return (
    <div className={className}>
      <span>{text}</span>
      <span className="group relative inline-flex">
        <button
          type="button"
          className={buttonClassName}
          aria-label={`${text} help`}
        >
          ?
        </button>
        <span className="pointer-events-none absolute left-6 top-1/2 z-20 hidden w-64 max-w-[calc(100vw-2rem)] -translate-y-1/2 rounded-lg border border-(--line) bg-(--bg-surface) p-2 text-xs font-normal text-(--ink) shadow-lg group-hover:block group-focus-within:block">
          {tip}
        </span>
      </span>
    </div>
  );
}
