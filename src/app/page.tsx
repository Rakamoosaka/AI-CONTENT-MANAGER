"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { ArticlePreviewModal } from "@/features/content/list/components/ArticlePreviewModal";
import { useDashboardStats } from "@/features/content/list/hooks";
import { formatDate } from "@/lib/utils";

export default function Home() {
  const { t } = useI18n();
  const { data, isLoading } = useDashboardStats();
  const [previewArticleId, setPreviewArticleId] = useState<string | null>(null);

  const chartPalette = [
    "linear-gradient(180deg, #c3d4a0 0%, #8fa160 100%)",
    "linear-gradient(180deg, #9ec4dc 0%, #6e8ea6 100%)",
    "linear-gradient(180deg, #d8c7a1 0%, #a78859 100%)",
    "linear-gradient(180deg, #b9ccbc 0%, #829881 100%)",
  ];

  const summary = [
    { label: t("dashboard.totalArticles"), value: data?.totalArticles ?? 0 },
    { label: t("status.published"), value: data?.published ?? 0 },
    { label: t("status.draft"), value: data?.drafts ?? 0 },
  ];

  const chartRows = useMemo(() => {
    const rows = data?.categoriesDistribution ?? [];
    const max = Math.max(...rows.map((item) => item.total), 1);
    return rows.map((item) => ({
      ...item,
      height: Math.max(12, Math.round((item.total / max) * 120)),
    }));
  }, [data?.categoriesDistribution]);

  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden">
      <section className="glass-card accent-panel rounded-[28px] p-5 md:p-7">
        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-(--ink-soft)">
              {t("dashboard.tag")}
            </p>
            <h1 className="font-display mt-2 max-w-xl text-3xl font-semibold leading-tight md:text-4xl">
              {t("dashboard.headline")}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-(--ink-soft)">
              {t("dashboard.description")}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/content/new"
                className="rounded-xl bg-(--teal) px-4 py-2 text-sm font-semibold text-white"
              >
                {t("shell.createArticle")}
              </Link>
              <Link
                href="/content"
                className="rounded-xl border border-(--line) bg-white/80 px-4 py-2 text-sm font-semibold"
              >
                {t("dashboard.openQueue")}
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {summary.map((item) => (
              <article key={item.label} className="glass-card rounded-2xl p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-(--ink-soft)">
                  {item.label}
                </p>
                <p className="font-display mt-2 text-3xl font-bold">
                  {isLoading ? "..." : item.value}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="min-w-0 grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <section className="glass-card min-w-0 rounded-3xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl font-semibold">
              {t("dashboard.categoryPulse")}
            </h2>
            <p className="text-xs uppercase tracking-[0.14em] text-(--ink-soft)">
              {t("dashboard.liveMix")}
            </p>
          </div>

          <div className="mt-5 w-full max-w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-(--line) bg-white/70 p-4">
            <div className="flex h-40 w-max min-w-full items-end gap-3">
              {chartRows.map((item, idx) => (
                <div
                  key={item.categoryId}
                  className="flex w-16 shrink-0 flex-col items-center gap-2"
                >
                  <div className="text-xs font-medium text-(--ink-soft)">
                    {item.total}
                  </div>
                  <div
                    className="w-full rounded-t-xl"
                    style={{
                      height: `${item.height}px`,
                      background: chartPalette[idx % chartPalette.length],
                    }}
                  />
                  <p className="w-full truncate text-center text-[11px] text-(--ink-soft)">
                    {item.categoryName}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="glass-card min-w-0 rounded-3xl p-5">
          <h2 className="font-display text-xl font-semibold">
            {t("dashboard.categoryDistribution")}
          </h2>
          <ul className="mt-4 space-y-2">
            {data?.categoriesDistribution.map((item) => (
              <li
                key={item.categoryId}
                className="flex items-start justify-between gap-2 rounded-xl border border-(--line) bg-white/75 px-3 py-2"
              >
                <span className="min-w-0 flex-1 break-all text-sm">
                  {item.categoryName}
                </span>
                <span className="shrink-0 rounded-full bg-(--bg-soft) px-2 py-1 text-xs font-semibold text-(--ink-soft)">
                  {item.total}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="glass-card rounded-3xl p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">
            {t("dashboard.latestArticles")}
          </h2>
          <p className="text-xs uppercase tracking-[0.14em] text-(--ink-soft)">
            {t("dashboard.recentActivity")}
          </p>
        </div>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-(--line) bg-white/80 p-2">
          <table className="min-w-176 text-sm md:min-w-full md:table-fixed [&_th]:px-3 [&_td]:px-3">
            <thead>
              <tr className="text-left text-(--ink-soft)">
                <th className="py-2 md:w-[46%]">{t("dashboard.col.title")}</th>
                <th className="whitespace-nowrap md:w-[18%]">
                  {t("dashboard.col.status")}
                </th>
                <th className="whitespace-nowrap md:w-[14%]">
                  {t("dashboard.col.locale")}
                </th>
                <th className="whitespace-nowrap md:w-[22%]">
                  {t("dashboard.col.created")}
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.latest.map((item) => (
                <tr key={item.id} className="border-t border-(--line)">
                  <td className="py-2 pr-2 align-middle">
                    <button
                      className="cursor-pointer text-left font-medium hover:text-(--teal)"
                      onClick={() => setPreviewArticleId(item.id)}
                    >
                      {item.title}
                    </button>
                  </td>
                  <td className="whitespace-nowrap align-middle">
                    {item.status === "published"
                      ? t("status.published")
                      : t("status.draft")}
                  </td>
                  <td className="whitespace-nowrap align-middle">
                    {item.locale}
                  </td>
                  <td className="whitespace-nowrap align-middle">
                    {formatDate(item.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ArticlePreviewModal
        articleId={previewArticleId}
        onClose={() => setPreviewArticleId(null)}
      />
    </div>
  );
}
