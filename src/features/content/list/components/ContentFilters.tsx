"use client";

import Link from "next/link";
import { useI18n } from "@/components/providers/I18nProvider";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { SelectField } from "@/components/ui/SelectField";

type Props = {
  search: string;
  status: string;
  categoryId: string;
  statusOptions: Array<{ value: string; label: string }>;
  categoryOptions: Array<{ value: string; label: string }>;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
};

export function ContentFilters({
  search,
  status,
  categoryId,
  statusOptions,
  categoryOptions,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
}: Props) {
  const { t } = useI18n();

  return (
    <section className="glass-card relative z-20 rounded-3xl p-5">
      <div className="grid gap-2 md:grid-cols-4">
        <div>
          <FieldLabel
            text={t("content.filter.search")}
            tip={t("content.filter.searchTip")}
          />
          <input
            className="form-control"
            placeholder={t("content.filter.search")}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label={t("content.filter.searchAria")}
          />
        </div>
        <div>
          <FieldLabel
            text={t("content.filter.status")}
            tip={t("content.filter.statusTip")}
          />
          <SelectField
            value={status}
            onChange={onStatusChange}
            options={statusOptions}
          />
        </div>
        <div>
          <FieldLabel
            text={t("content.filter.category")}
            tip={t("content.filter.categoryTip")}
          />
          <SelectField
            value={categoryId}
            onChange={onCategoryChange}
            options={categoryOptions}
          />
        </div>
        <div className="flex items-end">
          <Link
            href="/content/new"
            className="inline-flex h-11.5 w-full items-center justify-center rounded-xl bg-(--teal) px-3 text-center font-semibold text-white"
          >
            {t("content.newArticle")}
          </Link>
        </div>
      </div>
    </section>
  );
}
