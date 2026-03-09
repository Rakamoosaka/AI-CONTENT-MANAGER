"use client";

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
  if (count === 0) {
    return null;
  }

  return (
    <div className="modal-overlay fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="modal-panel glass-card w-full max-w-md rounded-3xl p-4">
        <h3 className="font-display text-lg font-semibold">Confirm deletion</h3>
        <p className="mt-2 text-sm text-(--ink-soft)">
          Delete {count} article{count > 1 ? "s" : ""}? This cannot be undone.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="rounded-lg border border-(--line) px-3 py-2"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            className="rounded-lg bg-(--danger) px-3 py-2 text-white"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
