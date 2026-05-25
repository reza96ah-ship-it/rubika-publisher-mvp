"use client";

import { AlertCircle, CheckCircle2, ChevronLeft, LogOut, Monitor, Plus, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  isRubikaConnected,
  isStoreConfigured,
  loadWorkspaceOverview,
  rubikaStatusLabel,
  WorkspaceOverview
} from "../lib/workspace";
import { getActiveNav, MobileNav, Sidebar } from "./sidebar";
import { StatusToken } from "./workspace-ui";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const activeNav = getActiveNav(pathname);
  const [overview, setOverview] = useState<WorkspaceOverview>({ store: null, rubika: null });
  const [overviewLoading, setOverviewLoading] = useState(true);

  useEffect(() => {
    loadWorkspaceOverview()
      .then(setOverview)
      .catch(() => setOverview({ store: null, rubika: null }))
      .finally(() => setOverviewLoading(false));
  }, []);

  const storeReady = !overviewLoading && isStoreConfigured(overview.store);
  const rubikaReady = !overviewLoading && isRubikaConnected(overview.rubika);
  const storeName = overviewLoading ? "در حال بررسی فضای کاری..." : overview.store?.name || "پروفایل فروشگاه کامل نشده";
  const setupHref = (() => {
    if (overviewLoading) return "/compose";
    if (!storeReady) return "/store";
    if (!rubikaReady) return "/rubika";
    return "/compose";
  })();
  const setupLabel = overviewLoading ? "در حال بررسی..." : storeReady && rubikaReady ? "ایجاد پست جدید" : "تکمیل آماده‌سازی";
  const rubikaTone = overviewLoading ? "neutral" : rubikaReady ? "success" : overview.rubika?.status === "failed" ? "alert" : "warning";
  const storeTone = overviewLoading ? "neutral" : storeReady ? "success" : "warning";
  const rubikaLabel = overviewLoading ? "در حال بررسی اتصال..." : rubikaStatusLabel(overview.rubika);
  const storeLabel = overviewLoading ? "در حال بررسی پروفایل" : storeReady ? "پروفایل آماده" : "پروفایل ناقص";
  const shellReady = storeReady && rubikaReady;
  const readinessPercent = overviewLoading ? 25 : Number(storeReady) * 50 + Number(rubikaReady) * 50;

  function logout() {
    window.localStorage.removeItem("rubika_publisher_access");
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-app-background text-app-text">
      <div className="flex min-h-screen">
        <Sidebar />
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-app-border bg-white/95 backdrop-blur-xl">
            <div className="px-4 py-3 lg:px-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-app-primary text-xs font-black text-white lg:hidden">
                    RP
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-black text-app-muted">
                      <span>{activeNav.group.title}</span>
                      <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="text-app-primary">{activeNav.item.label}</span>
                    </div>
                    <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-black text-app-text lg:text-base">{storeName}</p>
                      <StatusToken tone={shellReady ? "success" : "warning"} className="gap-1">
                        {shellReady ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />}
                        {shellReady ? "آماده انتشار" : "نیازمند آماده‌سازی"}
                      </StatusToken>
                    </div>
                  </div>
                </div>

                <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-center xl:max-w-4xl xl:flex-1 xl:justify-end">
                  <Link
                    href="/content"
                    className="hidden h-10 min-w-0 items-center gap-2 rounded-md border border-app-border bg-slate-50 px-3 text-sm text-app-muted transition hover:border-blue-200 hover:bg-blue-50 hover:text-app-primary xl:flex xl:w-[340px]"
                  >
                    <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">جست‌وجوی محتوا، کمپین و کپشن</span>
                    <span className="mr-auto rounded bg-white px-2 py-0.5 text-[10px] font-bold text-app-primary ring-1 ring-blue-100">
                      Content
                    </span>
                  </Link>

                  <div className="hidden w-40 shrink-0 xl:block">
                    <div className="mb-1 flex items-center justify-between text-[11px] font-black text-app-muted">
                      <span>آمادگی</span>
                      <span>{readinessPercent}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${shellReady ? "bg-emerald-500" : "bg-amber-500"}`}
                        style={{ width: `${readinessPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <StatusToken tone={rubikaTone}>{rubikaLabel}</StatusToken>
                    <StatusToken tone={storeTone}>{storeLabel}</StatusToken>
                    <StatusToken tone="neutral" className="gap-1">
                      <Monitor className="h-3.5 w-3.5" aria-hidden="true" />
                      محلی
                    </StatusToken>
                    <Link
                      href={setupHref}
                      className="inline-flex items-center gap-2 rounded-md border border-app-primary bg-app-primary px-3 py-2 text-xs font-bold text-white transition hover:border-app-primaryHover hover:bg-app-primaryHover"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      {setupLabel}
                    </Link>
                    <button
                      onClick={logout}
                      className="inline-flex items-center gap-2 rounded-md border border-app-border bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      خروج
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-3 lg:hidden">
                <MobileNav />
              </div>
            </div>
          </header>
          <div className="p-4 lg:p-6">{children}</div>
        </section>
      </div>
    </main>
  );
}
