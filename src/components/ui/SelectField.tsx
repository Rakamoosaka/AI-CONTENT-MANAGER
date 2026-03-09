"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const [openDirection, setOpenDirection] = useState<"up" | "down">("down");
  const rootRef = useRef<HTMLDivElement | null>(null);

  const updateMenuDirection = useCallback(() => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const estimatedHeight = Math.min(256, options.length * 36 + 12);
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const shouldOpenUp = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;
    setOpenDirection(shouldOpenUp ? "up" : "down");
  }, [options.length]);

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

    function handlePositioning() {
      updateMenuDirection();
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEsc);
    window.addEventListener("resize", handlePositioning);
    window.addEventListener("scroll", handlePositioning, true);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEsc);
      window.removeEventListener("resize", handlePositioning);
      window.removeEventListener("scroll", handlePositioning, true);
    };
  }, [open, updateMenuDirection]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        className={cn(
          "w-full rounded-xl border border-(--line) bg-(--bg-surface) px-3 py-2 text-left text-(--ink)",
          "flex items-center justify-between gap-2",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--amber)/70",
          disabled ? "cursor-not-allowed opacity-60" : "",
        )}
        onClick={() => setOpen((prev) => !prev)}
        onMouseDown={() => {
          if (!open) {
            updateMenuDirection();
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{selectedLabel}</span>
        <span className={cn("text-(--ink-soft) transition-transform", open ? "rotate-180" : "")}>⌄</span>
      </button>

      {open ? (
        <div
          className={cn(
            "absolute z-50 w-full overflow-hidden rounded-xl border border-(--line) bg-(--bg-surface) shadow-lg",
            openDirection === "up" ? "bottom-full mb-1" : "top-full mt-1",
          )}
        >
          <ul role="listbox" className="max-h-64 overflow-auto py-1 text-sm">
            {options.map((option) => {
              const active = option.value === value;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    className={cn(
                      "block w-full px-3 py-2 text-left",
                      active ? "bg-(--teal) text-(--bg-base)" : "hover:bg-(--bg-soft)",
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
