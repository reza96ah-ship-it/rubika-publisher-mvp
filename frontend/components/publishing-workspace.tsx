"use client";

import { CalendarDays, ListChecks, Rows3, Target } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export type PublishingTab = "calendar" | "campaigns" | "content" | "queue";

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
  { key: "campaigns" as const, label: "کمپین‌ها", href: "/campaigns", icon: Target },
  { key: "content" as const, label: "کتابخانه", href: "/content", icon: Rows3 },
  { key: "queue" as const, label: "صف انتشار", href: "/queue", icon: ListChecks }
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
  const visibleTabs = activeTab === "content" || activeTab === "queue"
    ? tabs.filter((tab) => tab.key === "content" || tab.key === "queue")
    : tabs.filter((tab) => tab.key === "calendar" || tab.key === "campaigns");

  return (
    <section className="app-studio-panel overflow-hidden rounded-lg">
      <div className="flex flex-col justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3 lg:flex-row lg:items-center">
        <div className="min-w-0">
          <p className="app-section-kicker text-[10px] font-black">فضای انتشار</p>
          <h1 className="mt-1 text-lg font-black text-app-text sm:text-xl">{title}</h1>
          <p className="mt-1 line-clamp-2 max-w-3xl text-xs leading-5 text-app-muted">{description}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {meta}
          {action}
        </div>
      </div>

      <nav className="overflow-x-auto border-t border-app-border bg-app-surfaceMuted px-1.5 sm:px-2" aria-label="نماهای فضای انتشار">
        <div className="flex min-w-max items-center gap-1">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            const count = counts[tab.key];
            return (
              <Link
                key={tab.key}
                href={tab.href}
                onClick={() => onTabChange?.(tab.key)}
                className={`flex items-center gap-1.5 border-b-2 px-2.5 py-2 text-[11px] font-bold transition sm:px-3 sm:py-2.5 sm:text-xs ${
                  active
                    ? "border-app-primary bg-white text-app-primary"
                    : "border-transparent text-slate-500 hover:bg-white/80 hover:text-app-text"
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
