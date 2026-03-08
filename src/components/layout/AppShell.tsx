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
                ? "bg-(--teal) text-white shadow-sm"
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
      <div className="mx-auto grid max-w-350 grid-cols-1 gap-4 p-4 md:grid-cols-[240px_1fr]">
        <aside className="glass-card rounded-3xl p-4">
          <h1 className="font-display text-2xl font-bold">AI Content Manager</h1>
          <p className="mt-1 text-sm text-(--ink-soft)">Editorial cockpit</p>
          <Suspense fallback={<nav className="mt-6 space-y-2" />}>
            <ShellNav />
          </Suspense>
          <Link
            href="/content/new"
            className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-(--amber) px-3 py-2 text-sm font-semibold text-(--ink)"
          >
            <PlusCircle size={16} />
            Create Article
          </Link>
        </aside>

        <div>
          <header className="glass-card mb-4 rounded-3xl p-4">
            <Suspense fallback={<p className="text-sm text-(--ink-soft)">...</p>}>
              <ShellPath />
            </Suspense>
          </header>
          <main>
            <Suspense fallback={<div className="card p-4 text-sm text-(--ink-soft)">Loading...</div>}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
