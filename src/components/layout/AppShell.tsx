"use client";

import { Suspense } from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Menu,
  PlusCircle,
  X,
} from "lucide-react";
import { SelectField } from "@/components/ui/SelectField";
import { useI18n } from "@/components/providers/I18nProvider";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useState } from "react";

const nav: Array<{
  href: Route;
  labelKey:
    | "shell.nav.dashboard"
    | "shell.nav.content"
    | "shell.nav.categories";
  icon: React.ComponentType<{ size?: number }>;
}> = [
  { href: "/", labelKey: "shell.nav.dashboard", icon: LayoutDashboard },
  { href: "/content", labelKey: "shell.nav.content", icon: FileText },
  { href: "/categories", labelKey: "shell.nav.categories", icon: FolderTree },
];

type Props = { children: React.ReactNode };

function ShellNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav className="mt-6 space-y-2">
      {nav.map((item) => {
        const Icon = item.icon;
        const active =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
              active
                ? "bg-(--teal) text-(--bg-base) shadow-sm"
                : "border border-transparent hover:border-(--line) hover:bg-(--bg-soft)",
            )}
          >
            <Icon size={16} />
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}

function ShellPath() {
  const pathname = usePathname();
  return <p className="text-sm text-(--ink-soft)">{pathname}</p>;
}

export function AppShell({ children }: Props) {
  const pathname = usePathname();
  const { t, locale, setLocale, localeOptions } = useI18n();
  const [mobileNavOpenedOnPath, setMobileNavOpenedOnPath] = useState<
    string | null
  >(null);
  const isMobileNavOpen = mobileNavOpenedOnPath === pathname;

  return (
    <div className="min-h-screen bg-(--bg-base) text-(--ink)">
      <div className="mx-auto grid max-w-350 grid-cols-1 gap-4 p-4 md:items-start md:grid-cols-[252px_1fr]">
        <aside
          className="glass-card editor-grid-pattern stagger-in hidden rounded-3xl p-4 md:sticky md:top-4 md:block"
          style={{ animationDelay: "20ms" }}
        >
          <h1 className="font-display text-3xl font-semibold leading-tight">
            {t("app.title")}
          </h1>
          <p className="mt-1 text-sm tracking-wide text-(--ink-soft)">
            {t("app.subtitle")}
          </p>
          <div className="mt-4">
            <SelectField
              value={locale}
              onChange={(value) => setLocale(value as Locale)}
              options={localeOptions}
              placeholder={t("language.label")}
            />
          </div>
          <Suspense fallback={<nav className="mt-6 space-y-2" />}>
            <ShellNav />
          </Suspense>
          <Link
            href="/content/new"
            className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-transparent bg-(--amber) px-3 py-2 text-sm font-semibold text-(--teal) hover:border-(--teal)"
          >
            <PlusCircle size={16} />
            {t("shell.createArticle")}
          </Link>
        </aside>

        <div className="min-w-0">
          <header
            className="glass-card stagger-in mb-4 rounded-3xl p-4"
            style={{ animationDelay: "90ms" }}
          >
            <div className="flex items-center justify-between gap-3">
              <Suspense
                fallback={<p className="text-sm text-(--ink-soft)">...</p>}
              >
                <ShellPath />
              </Suspense>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-(--line) bg-(--bg-surface) md:hidden"
                aria-label={t("shell.openMenu")}
                aria-expanded={isMobileNavOpen}
                onClick={() => setMobileNavOpenedOnPath(pathname)}
              >
                <Menu size={18} />
              </button>
            </div>
          </header>
          <main className="min-w-0" style={{ animationDelay: "160ms" }}>
            <Suspense
              fallback={
                <div className="card p-4 text-sm text-(--ink-soft)">
                  {t("common.loading")}
                </div>
              }
            >
              <div key={pathname} className="route-transition">
                {children}
              </div>
            </Suspense>
          </main>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden transition-opacity duration-250",
          isMobileNavOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isMobileNavOpen}
      >
        <button
          type="button"
          className={cn(
            "absolute inset-0 bg-black/35 transition-opacity duration-250",
            isMobileNavOpen ? "opacity-100" : "opacity-0",
          )}
          aria-label={t("shell.closeMenuOverlay")}
          onClick={() => setMobileNavOpenedOnPath(null)}
        />
        <aside
          className={cn(
            "absolute left-0 top-0 h-full w-[min(84vw,320px)] border-r border-(--line) bg-(--bg-surface) p-5 shadow-2xl transition-all duration-250 ease-out",
            isMobileNavOpen
              ? "translate-x-0 opacity-100"
              : "-translate-x-full opacity-100",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold leading-tight">
                {t("app.title")}
              </h2>
              <p className="mt-1 text-sm tracking-wide text-(--ink-soft)">
                {t("app.subtitle")}
              </p>
            </div>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-(--line) bg-(--bg-surface)"
              aria-label={t("shell.closeMenu")}
              onClick={() => setMobileNavOpenedOnPath(null)}
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-4">
            <SelectField
              value={locale}
              onChange={(value) => setLocale(value as Locale)}
              options={localeOptions}
              placeholder={t("language.label")}
            />
          </div>

          <Suspense fallback={<nav className="mt-6 space-y-2" />}>
            <ShellNav onNavigate={() => setMobileNavOpenedOnPath(null)} />
          </Suspense>

          <Link
            href="/content/new"
            onClick={() => setMobileNavOpenedOnPath(null)}
            className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-transparent bg-(--amber) px-3 py-2 text-sm font-semibold text-(--teal) hover:border-(--teal)"
          >
            <PlusCircle size={16} />
            {t("shell.createArticle")}
          </Link>
        </aside>
      </div>
    </div>
  );
}
