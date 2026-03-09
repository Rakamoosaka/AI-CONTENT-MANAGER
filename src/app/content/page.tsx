"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useArticles,
  useBulkCategorize,
  useCategories,
  useDeleteArticle,
} from "@/features/content/list/hooks";
import { apiMutation } from "@/lib/api/client";
import { formatDate } from "@/lib/utils";
import { SelectField } from "@/components/ui/SelectField";

function FieldLabel({ text, tip }: { text: string; tip: string }) {
  return (
    <div className="mb-1 flex items-center gap-2 text-xs font-medium text-(--ink-soft)">
      <span>{text}</span>
      <span className="group relative inline-flex">
        <button
          type="button"
          className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-(--line) text-[10px] leading-none"
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

export default function ContentPage() {
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
      { value: "", label: "All statuses" },
      { value: "draft", label: "Draft" },
      { value: "published", label: "Published" },
    ],
    [],
  );

  const categoryOptions = useMemo(
    () => [
      { value: "", label: "All categories" },
      ...(categories?.map((category) => ({
        value: category.id,
        label: category.name,
      })) ?? []),
    ],
    [categories],
  );

  const totalItems = data?.meta.total ?? 0;
  const currentPage = data?.meta.page ?? page;
  const pageSize = data?.meta.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd =
    totalItems === 0 ? 0 : Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="space-y-5">
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
              onChange={(event) => setSearch(event.target.value)}
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
              onChange={setStatus}
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
              onChange={setCategoryId}
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

      <section className="glass-card relative z-10 rounded-3xl p-5">
        <div className="overflow-x-auto rounded-2xl border border-(--line) bg-(--bg-surface)/85 p-2">
          <table className="min-w-232 text-sm md:min-w-full md:table-fixed [&_th]:px-3 [&_td]:px-3">
            <thead>
              <tr className="text-left text-(--ink-soft)">
                <th className="w-10 py-2 text-center align-middle">
                  <input
                    type="checkbox"
                    className="ui-checkbox"
                    checked={
                      Boolean(data?.data.length) &&
                      selected.length === data?.data.length
                    }
                    onChange={(event) =>
                      setSelected(
                        event.target.checked
                          ? (data?.data.map((item) => item.id) ?? [])
                          : [],
                      )
                    }
                  />
                </th>
                <th className="md:w-[40%]">Title</th>
                <th className="md:w-[20%]">Category</th>
                <th className="whitespace-nowrap md:w-[12%]">Status</th>
                <th className="whitespace-nowrap md:w-[16%]">Created</th>
                <th className="whitespace-nowrap md:w-[12%]">Locale</th>
                <th className="md:w-16" />
              </tr>
            </thead>
            <tbody>
              {data?.data.map((item) => (
                <tr key={item.id} className="border-t border-(--line)">
                  <td className="py-2 text-center align-middle">
                    <input
                      type="checkbox"
                      className="ui-checkbox"
                      checked={selected.includes(item.id)}
                      onChange={(event) => {
                        if (event.target.checked) {
                          setSelected((prev) => [...prev, item.id]);
                        } else {
                          setSelected((prev) =>
                            prev.filter((value) => value !== item.id),
                          );
                        }
                      }}
                    />
                  </td>
                  <td className="pr-2 align-middle wrap-break-word">
                    <Link
                      href={`/content/${item.id}`}
                      className="font-medium wrap-break-word hover:text-(--teal)"
                    >
                      {item.title}
                    </Link>
                  </td>
                  <td className="pr-2 align-middle wrap-break-word">
                    {item.categoryName ?? "-"}
                  </td>
                  <td className="whitespace-nowrap align-middle">
                    {item.status}
                  </td>
                  <td className="whitespace-nowrap align-middle">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="whitespace-nowrap align-middle">
                    {item.locale}
                  </td>
                  <td className="whitespace-nowrap align-middle">
                    <button
                      className="text-(--danger)"
                      onClick={() => setDeleteTargetIds([item.id])}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-(--ink-soft)">
            <p>Total: {totalItems}</p>
            <p>
              Page {currentPage} of {totalPages} | Showing {rangeStart}-
              {rangeEnd}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-lg border border-(--line) px-3 py-1"
              disabled={page <= 1}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Prev
            </button>
            <button
              className="rounded-lg border border-(--line) px-3 py-1"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {selected.length > 0 ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-(--line) bg-(--bg-surface) px-4 py-2 text-sm text-(--ink) shadow-xl">
          {selected.length} selected
          <button
            className="ml-3 inline-flex items-center gap-2 rounded-full bg-(--amber) px-3 py-1 text-(--ink)"
            disabled={
              isBulkAiCategorizing ||
              bulkMutation.isPending ||
              !categories?.length
            }
            onClick={async () => {
              if (!categories?.length) {
                toast.error("No categories available");
                return;
              }

              const rows =
                data?.data.filter((item) => selected.includes(item.id)) ?? [];
              if (!rows.length) {
                toast.error("No selected rows on this page");
                return;
              }

              try {
                setIsBulkAiCategorizing(true);

                const results = await Promise.allSettled(
                  rows.map((row) =>
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
                      articleId: rows[index].id,
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
                  toast.error("AI categorization failed for selected articles");
                  return;
                }

                await bulkMutation.mutateAsync(assignments);
                setSelected((prev) =>
                  prev.filter((id) => !rows.some((row) => row.id === id)),
                );

                const failedCount = results.length - assignments.length;
                if (failedCount > 0) {
                  toast.success(
                    `Updated ${assignments.length} articles. ${failedCount} failed.`,
                  );
                } else {
                  toast.success(
                    `Updated ${assignments.length} article categories`,
                  );
                }
              } catch {
                toast.error("Bulk AI categorization failed");
              } finally {
                setIsBulkAiCategorizing(false);
              }
            }}
          >
            {isBulkAiCategorizing || bulkMutation.isPending ? (
              <>
                <span className="loading-spinner" aria-hidden="true" />
                Categorizing...
              </>
            ) : (
              "Categorize selected with AI"
            )}
          </button>
          <button
            className="ml-2 rounded-full border border-(--line) bg-white px-3 py-1 text-(--danger)"
            onClick={() => setDeleteTargetIds(selected)}
          >
            Delete selected
          </button>
        </div>
      ) : null}

      {deleteTargetIds.length > 0 ? (
        <div className="modal-overlay fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="modal-panel glass-card w-full max-w-md rounded-3xl p-4">
            <h3 className="font-display text-lg font-semibold">
              Confirm deletion
            </h3>
            <p className="mt-2 text-sm text-(--ink-soft)">
              Delete {deleteTargetIds.length} article
              {deleteTargetIds.length > 1 ? "s" : ""}? This cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-lg border border-(--line) px-3 py-2"
                onClick={() => setDeleteTargetIds([])}
                disabled={isDeletePending}
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-(--danger) px-3 py-2 text-white"
                onClick={async () => {
                  try {
                    setIsDeletePending(true);
                    await Promise.all(
                      deleteTargetIds.map((id) =>
                        deleteMutation.mutateAsync(id),
                      ),
                    );
                    setSelected((prev) =>
                      prev.filter((id) => !deleteTargetIds.includes(id)),
                    );
                    setDeleteTargetIds([]);
                    toast.success("Article deletion completed");
                  } finally {
                    setIsDeletePending(false);
                  }
                }}
                disabled={isDeletePending}
              >
                {isDeletePending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
