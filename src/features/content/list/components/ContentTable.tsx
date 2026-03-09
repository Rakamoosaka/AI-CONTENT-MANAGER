"use client";

import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { Article } from "@/features/content/list/types";

type Props = {
  rows: Article[];
  selected: string[];
  allSelected: boolean;
  onToggleAll: (checked: boolean) => void;
  onToggleRow: (id: string, checked: boolean) => void;
  onDeleteRow: (id: string) => void;
};

export function ContentTable({
  rows,
  selected,
  allSelected,
  onToggleAll,
  onToggleRow,
  onDeleteRow,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-(--line) bg-(--bg-surface)/85 p-2">
      <table className="min-w-232 text-sm md:min-w-full md:table-fixed [&_th]:px-3 [&_td]:px-3">
        <thead>
          <tr className="text-left text-(--ink-soft)">
            <th className="w-10 py-2 text-center align-middle">
              <input
                type="checkbox"
                className="ui-checkbox"
                checked={allSelected}
                onChange={(event) => onToggleAll(event.target.checked)}
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
          {rows.map((item) => (
            <tr key={item.id} className="border-t border-(--line)">
              <td className="py-2 text-center align-middle">
                <input
                  type="checkbox"
                  className="ui-checkbox"
                  checked={selected.includes(item.id)}
                  onChange={(event) =>
                    onToggleRow(item.id, event.target.checked)
                  }
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
              <td className="whitespace-nowrap align-middle">{item.status}</td>
              <td className="whitespace-nowrap align-middle">
                {formatDate(item.createdAt)}
              </td>
              <td className="whitespace-nowrap align-middle">{item.locale}</td>
              <td className="whitespace-nowrap align-middle">
                <button
                  className="text-(--danger)"
                  onClick={() => onDeleteRow(item.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
