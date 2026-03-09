"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useI18n } from "@/components/providers/I18nProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const { t } = useI18n();
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
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          {t("categories.newCategory")}
        </Button>
      </div>

      <section className="glass-card rounded-3xl p-5">
        <div className="overflow-x-auto rounded-2xl border border-(--line) bg-(--bg-surface)/85 p-2">
          <table className="min-w-195 w-full table-auto text-sm [&_th]:px-2 [&_td]:px-2">
            <thead>
              <tr className="text-left text-(--ink-soft)">
                <th className="py-2 align-top">{t("categories.col.name")}</th>
                <th className="align-top">{t("categories.col.slug")}</th>
                <th className="whitespace-nowrap md:w-28">
                  {t("categories.col.inUse")}
                </th>
                <th className="pl-3 align-top">
                  {t("categories.col.description")}
                </th>
                <th className="w-48 min-w-48" />
              </tr>
            </thead>
            <tbody>
              {categories?.map((item) => (
                <tr key={item.id} className="border-t border-(--line)">
                  <td className="py-2 align-top wrap-anywhere">{item.name}</td>
                  <td className="pr-2 align-top wrap-anywhere">{item.slug}</td>
                  <td className="whitespace-nowrap align-top">
                    {item.articleCount ?? 0}
                  </td>
                  <td className="pl-3 pr-2 align-top wrap-anywhere">
                    {item.description}
                  </td>
                  <td className="min-w-48 align-top">
                    <div className="flex flex-wrap justify-end gap-x-3 gap-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 whitespace-nowrap"
                        onClick={() => {
                          setEditing(item);
                          setOpen(true);
                        }}
                      >
                        {t("common.edit")}
                      </Button>
                      {(item.articleCount ?? 0) > 0 ? (
                        <span className="group relative inline-flex">
                          <button
                            className="cursor-not-allowed whitespace-nowrap text-(--danger) opacity-50"
                            disabled
                            aria-disabled="true"
                          >
                            {t("common.delete")}
                          </button>
                          <span className="pointer-events-none absolute -top-9 right-0 z-20 whitespace-nowrap rounded-md border border-(--line) bg-(--bg-surface) px-2 py-1 text-xs text-(--ink) opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                            {t("categories.inUseHint")}
                          </span>
                        </span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0 whitespace-nowrap text-(--danger)"
                          onClick={() => setDeletingCategory(item)}
                        >
                          {t("common.delete")}
                        </Button>
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
            toast.success(t("categories.saved"));
            setOpen(false);
          }}
        />
      ) : null}

      {deletingCategory ? (
        <Dialog open onOpenChange={() => setDeletingCategory(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("categories.confirmDeletion")}</DialogTitle>
              <DialogDescription>
                {t("categories.deletePrompt", { name: deletingCategory.name })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setDeletingCategory(null)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                variant="destructive"
                disabled={(deletingCategory.articleCount ?? 0) > 0}
                onClick={async () => {
                  try {
                    await deleteMutation.mutateAsync(deletingCategory.id);
                    toast.success(t("categories.deleted"));
                    setDeletingCategory(null);
                  } catch (error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : t("categories.cannotDeleteInUse"),
                    );
                  }
                }}
              >
                {t("common.delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
  const { t } = useI18n();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    const normalizedName = name.trim();
    const normalizedSlug = slug.trim();
    const normalizedDescription = description.trim();

    if (normalizedName.length < 2) {
      toast.error(t("categories.nameTooShort"));
      return;
    }

    if (normalizedSlug.length < 2) {
      toast.error(t("categories.slugTooShort"));
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
        error instanceof Error ? error.message : t("categories.saveFailed"),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initial
              ? t("categories.dialog.edit")
              : t("categories.dialog.create")}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          <div>
            <FieldLabel
              text={t("categories.field.name")}
              tip={t("categories.field.nameTip")}
            />
            <Input
              placeholder={t("categories.field.name")}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <FieldLabel
              text={t("categories.field.slug")}
              tip={t("categories.field.slugTip")}
            />
            <Input
              placeholder={t("categories.field.slug")}
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
            />
          </div>
          <div>
            <FieldLabel
              text={t("categories.field.description")}
              tip={t("categories.field.descriptionTip")}
            />
            <Textarea
              placeholder={t("categories.field.description")}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? t("categories.saving") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
