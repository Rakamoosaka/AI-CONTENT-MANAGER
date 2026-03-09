"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiMutation } from "@/lib/api/client";
import {
  useCategories,
  useDeleteCategory,
  useUpsertCategory,
} from "@/features/content/list/hooks";
import type { Category } from "@/features/content/list/types";

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

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const { data: categories } = useCategories();
  const deleteMutation = useDeleteCategory();
  const createMutation = useUpsertCategory();
  const [editing, setEditing] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          className="rounded-xl bg-(--teal) px-3 py-2 font-semibold text-white"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          New category
        </button>
      </div>

      <section className="glass-card rounded-3xl p-5">
        <div className="overflow-x-auto rounded-2xl border border-(--line) bg-(--bg-surface)/85 p-2 md:overflow-visible">
          <table className="min-w-175 text-sm md:min-w-full md:table-fixed">
            <thead>
              <tr className="text-left text-(--ink-soft)">
                <th className="py-2 md:w-1/6">Name</th>
                <th className="md:w-1/6">Slug</th>
                <th className="md:w-16">In use</th>
                <th>Description</th>
                <th className="md:w-28" />
              </tr>
            </thead>
            <tbody>
              {categories?.map((item) => (
                <tr key={item.id} className="border-t border-(--line)">
                  <td className="py-2">{item.name}</td>
                  <td className="break-all pr-2">{item.slug}</td>
                  <td>{item.articleCount ?? 0}</td>
                  <td className="wrap-break-word pr-2">{item.description}</td>
                  <td>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setEditing(item);
                          setOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      {(item.articleCount ?? 0) > 0 ? (
                        <span className="group relative inline-flex">
                          <button
                            className="cursor-not-allowed text-(--danger) opacity-50"
                            disabled
                            aria-disabled="true"
                          >
                            Delete
                          </button>
                          <span className="pointer-events-none absolute -top-9 right-0 z-20 whitespace-nowrap rounded-md border border-(--line) bg-(--bg-surface) px-2 py-1 text-xs text-(--ink) opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                            Category is in use
                          </span>
                        </span>
                      ) : (
                        <button
                          className="text-(--danger)"
                          onClick={() => setDeletingCategory(item)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {open ? (
        <CategoryDialog
          initial={editing}
          onClose={() => setOpen(false)}
          onSave={async (payload) => {
            if (editing) {
              await apiMutation<Category>(
                `/api/categories/${editing.id}`,
                "PATCH",
                payload,
              );
              queryClient.invalidateQueries({ queryKey: ["categories"] });
              queryClient.invalidateQueries({ queryKey: ["articles"] });
            } else {
              await createMutation.mutateAsync(payload);
            }
            toast.success("Category saved");
            setOpen(false);
          }}
        />
      ) : null}

      {deletingCategory ? (
        <div className="modal-overlay fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="modal-panel glass-card w-full max-w-md rounded-3xl p-4">
            <h3 className="font-display text-lg font-semibold">
              Confirm deletion
            </h3>
            <p className="mt-2 text-sm text-(--ink-soft)">
              Delete category <strong>{deletingCategory.name}</strong>? This
              action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-lg border border-(--line) px-3 py-2"
                onClick={() => setDeletingCategory(null)}
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-(--danger) px-3 py-2 text-white"
                disabled={(deletingCategory.articleCount ?? 0) > 0}
                onClick={async () => {
                  try {
                    await deleteMutation.mutateAsync(deletingCategory.id);
                    toast.success("Category deleted");
                    setDeletingCategory(null);
                  } catch (error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Category cannot be deleted while in use",
                    );
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CategoryDialog({
  initial,
  onClose,
  onSave,
}: {
  initial: Category | null;
  onClose: () => void;
  onSave: (payload: Partial<Category>) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    const normalizedName = name.trim();
    const normalizedSlug = slug.trim();
    const normalizedDescription = description.trim();

    if (normalizedName.length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }

    if (normalizedSlug.length < 2) {
      toast.error("Slug is required and must be at least 2 characters");
      return;
    }

    try {
      setIsSaving(true);
      await onSave({
        name: normalizedName,
        slug: normalizedSlug,
        description:
          normalizedDescription.length > 0 ? normalizedDescription : null,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save category",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="modal-overlay fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="modal-panel glass-card w-full max-w-md rounded-3xl p-4">
        <h3 className="font-display text-lg font-semibold">
          {initial ? "Edit" : "Create"} category
        </h3>
        <div className="mt-3 grid gap-2">
          <div>
            <FieldLabel
              text="Name"
              tip="Human-readable category name shown across the UI."
            />
            <input
              className="form-control"
              placeholder="Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <FieldLabel
              text="Slug"
              tip="URL-safe unique id, usually lowercase with hyphens, e.g. 'product-marketing'."
            />
            <input
              className="form-control"
              placeholder="Slug"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
            />
          </div>
          <div>
            <FieldLabel
              text="Description"
              tip="Short summary used to clarify what belongs in this category."
            />
            <textarea
              className="form-control"
              placeholder="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="rounded-lg border border-(--line) px-3 py-2"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            className="rounded-lg bg-(--teal) px-3 py-2 text-white"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
