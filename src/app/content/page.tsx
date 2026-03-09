"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/components/providers/I18nProvider";
import {
  useArticles,
  useBulkCategorize,
  useCategories,
  useDeleteArticle,
} from "@/features/content/list/hooks";
import { apiMutation } from "@/lib/api/client";
import { BulkActionsBar } from "@/features/content/list/components/BulkActionsBar";
import { ContentFilters } from "@/features/content/list/components/ContentFilters";
import { ContentTable } from "@/features/content/list/components/ContentTable";
import { DeleteConfirmModal } from "@/features/content/list/components/DeleteConfirmModal";

export default function ContentPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [isDeletePending, setIsDeletePending] = useState(false);
  const [isBulkAiCategorizing, setIsBulkAiCategorizing] = useState(false);

  const { data: categories } = useCategories();
  const { data } = useArticles({
    search,
    status,
    categoryId,
    page,
    pageSize: 10,
  });
  const deleteMutation = useDeleteArticle();
  const bulkMutation = useBulkCategorize();

  const statusOptions = useMemo(
    () => [
      { value: "", label: t("content.allStatuses") },
      { value: "draft", label: t("status.draft") },
      { value: "published", label: t("status.published") },
    ],
    [t],
  );

  const categoryOptions = useMemo(
    () => [
      { value: "", label: t("content.allCategories") },
      ...(categories?.map((category) => ({
        value: category.id,
        label: category.name,
      })) ?? []),
    ],
    [categories, t],
  );

  const totalItems = data?.meta.total ?? 0;
  const currentPage = data?.meta.page ?? page;
  const pageSize = data?.meta.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd =
    totalItems === 0 ? 0 : Math.min(currentPage * pageSize, totalItems);

  const rows = data?.data ?? [];

  async function handleBulkAiCategorization() {
    if (!categories?.length) {
      toast.error(t("content.noCategories"));
      return;
    }

    const selectedRows = rows.filter((item) => selected.includes(item.id));
    if (!selectedRows.length) {
      toast.error(t("content.noSelectedRows"));
      return;
    }

    try {
      setIsBulkAiCategorizing(true);

      const results = await Promise.allSettled(
        selectedRows.map((row) =>
          apiMutation<{
            categoryId: string | null;
            confidence: number;
            rationale: string;
          }>("/api/agent", "POST", {
            action: "categorize",
            input: {
              body: row.body,
              categories,
            },
          }),
        ),
      );

      const assignments = results
        .map((result, index) => {
          if (result.status !== "fulfilled") {
            return null;
          }

          return {
            articleId: selectedRows[index].id,
            categoryId: result.value.categoryId,
          };
        })
        .filter(
          (
            item,
          ): item is {
            articleId: string;
            categoryId: string | null;
          } => Boolean(item),
        );

      if (!assignments.length) {
        toast.error(t("content.aiCategorizeFailedSelected"));
        return;
      }

      await bulkMutation.mutateAsync(assignments);
      setSelected((prev) =>
        prev.filter((id) => !selectedRows.some((row) => row.id === id)),
      );

      const failedCount = results.length - assignments.length;
      if (failedCount > 0) {
        toast.success(
          t("content.updatedWithFailures", {
            updated: assignments.length,
            failed: failedCount,
          }),
        );
      } else {
        toast.success(
          t("content.updatedCategories", { count: assignments.length }),
        );
      }
    } catch {
      toast.error(t("content.bulkAiFailed"));
    } finally {
      setIsBulkAiCategorizing(false);
    }
  }

  async function handleDeleteTargets() {
    try {
      setIsDeletePending(true);
      await Promise.all(
        deleteTargetIds.map((id) => deleteMutation.mutateAsync(id)),
      );
      setSelected((prev) => prev.filter((id) => !deleteTargetIds.includes(id)));
      setDeleteTargetIds([]);
      toast.success(t("content.deleteCompleted"));
    } finally {
      setIsDeletePending(false);
    }
  }

  return (
    <div className="space-y-5">
      <ContentFilters
        search={search}
        status={status}
        categoryId={categoryId}
        statusOptions={statusOptions}
        categoryOptions={categoryOptions}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onCategoryChange={setCategoryId}
      />

      <section className="glass-card relative z-10 rounded-3xl p-5">
        <ContentTable
          rows={rows}
          selected={selected}
          allSelected={Boolean(rows.length) && selected.length === rows.length}
          onToggleAll={(checked) =>
            setSelected(checked ? rows.map((item) => item.id) : [])
          }
          onToggleRow={(id, checked) => {
            if (checked) {
              setSelected((prev) => [...prev, id]);
              return;
            }

            setSelected((prev) => prev.filter((value) => value !== id));
          }}
          onDeleteRow={(id) => setDeleteTargetIds([id])}
        />

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
              disabled={page <= 1}
              onClick={() => setPage((prev) => prev - 1)}
            >
              {t("common.prev")}
            </button>
            <button
              className="rounded-lg border border-(--line) px-3 py-1"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              {t("common.next")}
            </button>
          </div>
        </div>
      </section>

      <BulkActionsBar
        selectedCount={selected.length}
        isCategorizing={isBulkAiCategorizing || bulkMutation.isPending}
        canCategorize={Boolean(categories?.length)}
        onCategorize={handleBulkAiCategorization}
        onDeleteSelected={() => setDeleteTargetIds(selected)}
      />

      <DeleteConfirmModal
        count={deleteTargetIds.length}
        isPending={isDeletePending}
        onCancel={() => setDeleteTargetIds([])}
        onConfirm={handleDeleteTargets}
      />
    </div>
  );
}
