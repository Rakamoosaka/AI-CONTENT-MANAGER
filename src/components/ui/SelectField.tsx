"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export function SelectField({
  value,
  onChange,
  options,
  placeholder,
  className,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedLabel = useMemo(() => {
    const found = options.find((option) => option.value === value);
    if (found) return found.label;
    return placeholder ?? "Select";
  }, [options, placeholder, value]);

  useEffect(() => {
    if (!open) return;

    function handleOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        className={cn(
          "w-full rounded-xl border border-(--line) bg-(--bg-surface) px-3 py-2 text-left",
          "flex items-center justify-between gap-2",
          "focus-visible:outline-none",
          disabled ? "cursor-not-allowed opacity-60" : "",
        )}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{selectedLabel}</span>
        <span className={cn("text-(--ink-soft) transition-transform", open ? "rotate-180" : "")}>v</span>
      </button>

      {open ? (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-(--line) bg-(--bg-surface) shadow-lg">
          <ul role="listbox" className="max-h-64 overflow-auto py-1 text-sm">
            {options.map((option) => {
              const active = option.value === value;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    className={cn(
                      "block w-full px-3 py-2 text-left",
                      active ? "bg-(--teal) text-white" : "hover:bg-(--bg-soft)",
                    )}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    role="option"
                    aria-selected={active}
                  >
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
