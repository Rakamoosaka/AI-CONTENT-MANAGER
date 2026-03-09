"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/components/providers/I18nProvider";
import { apiMutation } from "@/lib/api/client";
import {
  useArticles,
  useBulkCategorize,
  useCategories,
  useDeleteArticle,
} from "@/features/content/list/hooks";

type CategorizeResult = {
  categoryId: string | null;
  confidence: number;
  rationale: string;
};

type PaginationState = {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  rangeStart: number;
  rangeEnd: number;
};

export function useContentListPageController() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [isDeletePending, setIsDeletePending] = useState(false);
  const [isBulkAiCategorizing, setIsBulkAiCategorizing] = useState(false);
  const [previewArticleId, setPreviewArticleId] = useState<string | null>(null);

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

  const rows = data?.data ?? [];

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

  const pagination = useMemo<PaginationState>(() => {
    const totalItems = data?.meta.total ?? 0;
    const currentPage = data?.meta.page ?? page;
    const pageSize = data?.meta.pageSize ?? 10;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const rangeEnd =
      totalItems === 0 ? 0 : Math.min(currentPage * pageSize, totalItems);

    return {
      totalItems,
      currentPage,
      totalPages,
      rangeStart,
      rangeEnd,
    };
  }, [data?.meta.page, data?.meta.pageSize, data?.meta.total, page]);

  const allSelected = Boolean(rows.length) && selected.length === rows.length;

  function toggleAllRows(checked: boolean) {
    setSelected(checked ? rows.map((item) => item.id) : []);
  }

  function toggleRow(id: string, checked: boolean) {
    if (checked) {
      setSelected((prev) => (prev.includes(id) ? prev : [...prev, id]));
      return;
    }

    setSelected((prev) => prev.filter((value) => value !== id));
  }

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
          apiMutation<CategorizeResult>("/api/agent", "POST", {
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

  function openDeleteModalForOne(id: string) {
    setDeleteTargetIds([id]);
  }

  function openDeleteModalForSelected() {
    setDeleteTargetIds(selected);
  }

  return {
    search,
    status,
    categoryId,
    selected,
    rows,
    categories,
    statusOptions,
    categoryOptions,
    pagination,
    allSelected,
    deleteTargetIds,
    isDeletePending,
    isBulkAiCategorizing,
    isBulkCategorizePending: bulkMutation.isPending,
    previewArticleId,
    setSearch,
    setStatus,
    setCategoryId,
    setPage,
    setDeleteTargetIds,
    setPreviewArticleId,
    toggleAllRows,
    toggleRow,
    openDeleteModalForOne,
    openDeleteModalForSelected,
    handleBulkAiCategorization,
    handleDeleteTargets,
  };
}
