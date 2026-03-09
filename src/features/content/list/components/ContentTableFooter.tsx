"use client";

import { useI18n } from "@/components/providers/I18nProvider";

type Props = {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  rangeStart: number;
  rangeEnd: number;
  onPrev: () => void;
  onNext: () => void;
  disablePrev: boolean;
  disableNext: boolean;
};

export function ContentTableFooter({
  totalItems,
  currentPage,
  totalPages,
  rangeStart,
  rangeEnd,
  onPrev,
  onNext,
  disablePrev,
  disableNext,
}: Props) {
  const { t } = useI18n();

  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="text-sm text-(--ink-soft)">
        <p>{t("content.total", { count: totalItems })}</p>
        <p>
          {t("content.pageInfo", {
            page: currentPage,
            totalPages,
            start: rangeStart,
            end: rangeEnd,
          })}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          className="rounded-lg border border-(--line) px-3 py-1"
          disabled={disablePrev}
          onClick={onPrev}
        >
          {t("common.prev")}
        </button>
        <button
          className="rounded-lg border border-(--line) px-3 py-1"
          disabled={disableNext}
          onClick={onNext}
        >
          {t("common.next")}
        </button>
      </div>
    </div>
  );
}
