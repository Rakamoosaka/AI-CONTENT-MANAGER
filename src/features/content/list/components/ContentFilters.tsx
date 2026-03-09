"use client";

import Link from "next/link";
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
  return (
    <section className="glass-card relative z-20 rounded-3xl p-5">
      <div className="grid gap-2 md:grid-cols-4">
        <div>
          <FieldLabel
            text="Search"
            tip="Find articles by matching words in titles and content."
          />
          <input
            className="form-control"
            placeholder="Search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Search articles"
          />
        </div>
        <div>
          <FieldLabel
            text="Status"
            tip="Filter by draft or published articles."
          />
          <SelectField
            value={status}
            onChange={onStatusChange}
            options={statusOptions}
          />
        </div>
        <div>
          <FieldLabel
            text="Category"
            tip="Show articles assigned to one category."
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
            New article
          </Link>
        </div>
      </div>
    </section>
  );
}
