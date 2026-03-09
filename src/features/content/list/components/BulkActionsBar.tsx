"use client";

type Props = {
  selectedCount: number;
  isCategorizing: boolean;
  canCategorize: boolean;
  onCategorize: () => Promise<void>;
  onDeleteSelected: () => void;
};

export function BulkActionsBar({
  selectedCount,
  isCategorizing,
  canCategorize,
  onCategorize,
  onDeleteSelected,
}: Props) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-(--line) bg-(--bg-surface) px-4 py-2 text-sm text-(--ink) shadow-xl">
      {selectedCount} selected
      <button
        className="ml-3 inline-flex items-center gap-2 rounded-full bg-(--amber) px-3 py-1 text-(--ink)"
        disabled={isCategorizing || !canCategorize}
        onClick={onCategorize}
      >
        {isCategorizing ? (
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
        onClick={onDeleteSelected}
      >
        Delete selected
      </button>
    </div>
  );
}
