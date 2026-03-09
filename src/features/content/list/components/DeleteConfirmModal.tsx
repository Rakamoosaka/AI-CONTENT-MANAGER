"use client";

import { useI18n } from "@/components/providers/I18nProvider";

type Props = {
  count: number;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

export function DeleteConfirmModal({
  count,
  isPending,
  onCancel,
  onConfirm,
}: Props) {
  const { t } = useI18n();

  if (count === 0) {
    return null;
  }

  return (
    <div className="modal-overlay fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="modal-panel glass-card w-full max-w-md rounded-3xl p-4">
        <h3 className="font-display text-lg font-semibold">
          {t("content.confirmDeletion")}
        </h3>
        <p className="mt-2 text-sm text-(--ink-soft)">
          {t("content.deleteArticlesPrompt", {
            count,
            suffix: count > 1 ? "s" : "",
          })}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="rounded-lg border border-(--line) px-3 py-2"
            onClick={onCancel}
            disabled={isPending}
          >
            {t("common.cancel")}
          </button>
          <button
            className="rounded-lg bg-(--danger) px-3 py-2 text-white"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? t("content.deleting") : t("common.delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
