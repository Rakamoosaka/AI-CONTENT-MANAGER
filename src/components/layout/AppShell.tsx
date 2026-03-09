"use client";

import { Suspense } from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, FolderTree, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const nav: Array<{ href: Route; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/content", label: "Content", icon: FileText },
  { href: "/categories", label: "Categories", icon: FolderTree },
];

type Props = { children: React.ReactNode };

function ShellNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 space-y-2">
      {nav.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
              active
                ? "bg-(--teal) text-(--bg-base) shadow-sm"
                : "border border-transparent hover:border-(--line) hover:bg-(--bg-soft)",
            )}
          >
            <Icon size={16} />
            {item.label}
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
  return (
    <div className="min-h-screen bg-(--bg-base) text-(--ink)">
      <div className="mx-auto grid max-w-350 grid-cols-1 gap-4 p-4 md:items-start md:grid-cols-[252px_1fr]">
        <aside className="glass-card editor-grid-pattern stagger-in rounded-3xl p-4 md:sticky md:top-4" style={{ animationDelay: "20ms" }}>
          <h1 className="font-display text-3xl font-semibold leading-tight">AI Content Manager</h1>
          <p className="mt-1 text-sm tracking-wide text-(--ink-soft)">Editorial cockpit</p>
          <Suspense fallback={<nav className="mt-6 space-y-2" />}>
            <ShellNav />
          </Suspense>
          <Link
            href="/content/new"
            className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-transparent bg-(--amber) px-3 py-2 text-sm font-semibold text-(--teal) hover:border-(--teal)"
          >
            <PlusCircle size={16} />
            Create Article
          </Link>
        </aside>

        <div>
          <header className="glass-card stagger-in mb-4 rounded-3xl p-4" style={{ animationDelay: "90ms" }}>
            <Suspense fallback={<p className="text-sm text-(--ink-soft)">...</p>}>
              <ShellPath />
            </Suspense>
          </header>
          <main className="stagger-in" style={{ animationDelay: "160ms" }}>
            <Suspense fallback={<div className="card p-4 text-sm text-(--ink-soft)">Loading...</div>}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
