"use client";

import type { ReactNode } from "react";

type Props = {
  title: string;
  animationDelay: string;
  children: ReactNode;
};

export function AiStepCard({ title, animationDelay, children }: Props) {
  return (
    <section
      className="ai-step scan-divider lift-card stagger-in rounded-2xl border border-(--line) bg-(--bg-surface) p-3 pt-4 shadow-[0_10px_30px_-24px_rgba(65,67,27,0.85)]"
      style={{ animationDelay }}
    >
      <h4 className="font-display text-lg font-semibold">{title}</h4>
      {children}
    </section>
  );
}
