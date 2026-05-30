"use client";

import { AlertTriangle, CalendarDays, CheckCircle2, FileText, ListChecks, Rows3 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export type PublishingTab = "calendar" | "content" | "queue" | "draft" | "published" | "failed";

type PublishingWorkspaceHeaderProps = {
  activeTab: PublishingTab;
  title: string;
  description: string;
  counts?: Partial<Record<PublishingTab, number>>;
  meta?: ReactNode;
  action?: ReactNode;
  onTabChange?: (tab: PublishingTab) => void;
};

const tabs = [
  { key: "calendar" as const, label: "تقویم", href: "/calendar", icon: CalendarDays },
  { key: "content" as const, label: "لیست محتوا", href: "/content", icon: Rows3 },
  { key: "queue" as const, label: "صف انتشار", href: "/queue", icon: ListChecks },
  { key: "draft" as const, label: "پیش‌نویس", href: "/content?status=draft", icon: FileText },
  { key: "published" as const, label: "منتشرشده", href: "/content?status=published", icon: CheckCircle2 },
  { key: "failed" as const, label: "خطاها", href: "/content?status=failed", icon: AlertTriangle }
];

export function PublishingWorkspaceHeader({
  activeTab,
  title,
  description,
  counts = {},
  meta,
  action,
  onTabChange
}: PublishingWorkspaceHeaderProps) {
  return (
    <section className="overflow-hidden rounded-md border border-app-border bg-white">
      <div className="flex flex-col justify-between gap-3 px-4 py-3 lg:flex-row lg:items-center">
        <div className="min-w-0">
          <p className="text-[10px] font-black text-app-primary">فضای انتشار</p>
          <h1 className="mt-1 text-xl font-black text-app-text">{title}</h1>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-app-muted">{description}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {meta}
          {action}
        </div>
      </div>

      <nav className="overflow-x-auto border-t border-app-border bg-slate-50/70 px-2" aria-label="نماهای فضای انتشار">
        <div className="flex min-w-max items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            const count = counts[tab.key];
            return (
              <Link
                key={tab.key}
                href={tab.href}
                onClick={() => onTabChange?.(tab.key)}
                className={`flex items-center gap-1.5 border-b-2 px-3 py-3 text-xs font-bold transition ${
                  active
                    ? "border-app-primary bg-white text-app-primary"
                    : "border-transparent text-slate-500 hover:bg-white hover:text-app-text"
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{tab.label}</span>
                {typeof count === "number" ? (
                  <span className={`rounded px-1.5 py-0.5 text-[10px] ${active ? "bg-blue-50 text-app-primary" : "bg-white text-slate-500"}`}>
                    {count}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>
    </section>
  );
}
