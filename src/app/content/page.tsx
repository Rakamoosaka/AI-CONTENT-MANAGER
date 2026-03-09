"use client";

import { BulkActionsBar } from "@/features/content/list/components/BulkActionsBar";
import { ContentFilters } from "@/features/content/list/components/ContentFilters";
import { ContentTableFooter } from "@/features/content/list/components/ContentTableFooter";
import { ContentTable } from "@/features/content/list/components/ContentTable";
import { DeleteConfirmModal } from "@/features/content/list/components/DeleteConfirmModal";
import { ArticlePreviewModal } from "../../features/content/list/components/ArticlePreviewModal";
import { useContentListPageController } from "@/features/content/list/hooks/useContentListPageController";

export default function ContentPage() {
  const {
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
    isBulkCategorizePending,
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
  } = useContentListPageController();

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
          allSelected={allSelected}
          onToggleAll={toggleAllRows}
          onToggleRow={toggleRow}
          onDeleteRow={openDeleteModalForOne}
          onOpenPreview={setPreviewArticleId}
        />

        <ContentTableFooter
          totalItems={pagination.totalItems}
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          rangeStart={pagination.rangeStart}
          rangeEnd={pagination.rangeEnd}
          disablePrev={pagination.currentPage <= 1}
          disableNext={pagination.currentPage >= pagination.totalPages}
          onPrev={() => setPage((prev) => Math.max(1, prev - 1))}
          onNext={() =>
            setPage((prev) => Math.min(pagination.totalPages, prev + 1))
          }
        />
      </section>

      <BulkActionsBar
        selectedCount={selected.length}
        isCategorizing={isBulkAiCategorizing || isBulkCategorizePending}
        canCategorize={Boolean(categories?.length)}
        onCategorize={handleBulkAiCategorization}
        onDeleteSelected={openDeleteModalForSelected}
      />

      <DeleteConfirmModal
        count={deleteTargetIds.length}
        isPending={isDeletePending}
        onCancel={() => setDeleteTargetIds([])}
        onConfirm={handleDeleteTargets}
      />

      <ArticlePreviewModal
        articleId={previewArticleId}
        onClose={() => setPreviewArticleId(null)}
      />
    </div>
  );
}
