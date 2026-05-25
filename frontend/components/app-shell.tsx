"use client";

import { AlertCircle, CheckCircle2, LogOut, Monitor, Plus, Search } from "lucide-react";
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
import { navGroups, Sidebar } from "./sidebar";

function activeNavLabel(pathname: string) {
  const item = navGroups
    .flatMap((group) => group.items)
    .find((entry) => entry.href === "/" ? pathname === "/" : pathname === entry.href || pathname.startsWith(`${entry.href}/`));
  return item?.label ?? "فضای کاری";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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
  const rubikaTone = overviewLoading
    ? "bg-slate-100 text-slate-600 ring-slate-200"
    : rubikaReady
    ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
    : overview.rubika?.status === "failed"
      ? "bg-rose-50 text-rose-700 ring-rose-100"
      : "bg-amber-50 text-amber-700 ring-amber-100";
  const rubikaLabel = overviewLoading ? "در حال بررسی اتصال..." : rubikaStatusLabel(overview.rubika);
  const storeLabel = overviewLoading ? "در حال بررسی پروفایل" : storeReady ? "پروفایل آماده" : "پروفایل ناقص";
  const shellReady = storeReady && rubikaReady;

  function logout() {
    window.localStorage.removeItem("rubika_publisher_access");
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-app-background text-app-text">
      <div className="flex min-h-screen">
        <Sidebar />
        <section className="min-w-0 flex-1">
          <div className="sticky top-0 z-20 border-b border-app-border bg-white/95 px-4 py-2.5 backdrop-blur lg:px-6">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-bold text-app-muted">{activeNavLabel(pathname)}</p>
                  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold ring-1 ${shellReady ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-amber-50 text-amber-700 ring-amber-100"}`}>
                    {shellReady ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />}
                    {shellReady ? "آماده انتشار" : "نیازمند آماده‌سازی"}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-black">{storeName}</p>
                  <span className={`rounded-md px-2 py-1 text-[11px] font-bold ring-1 ${rubikaTone}`}>
                    {rubikaLabel}
                  </span>
                  <span className={`rounded-md px-2 py-1 text-[11px] font-bold ring-1 ${storeReady ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-amber-50 text-amber-700 ring-amber-100"}`}>
                    {storeLabel}
                  </span>
                </div>
              </div>

              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 lg:max-w-2xl lg:justify-end">
                <Link
                  href="/content"
                  className="hidden min-w-0 items-center gap-2 rounded-lg border border-app-border bg-slate-50 px-3 py-2 text-sm text-app-muted transition hover:border-slate-300 hover:bg-white lg:flex lg:w-56 xl:w-72"
                >
                  <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">جست‌وجو و مدیریت محتوا</span>
                  <span className="mr-auto rounded bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500 ring-1 ring-app-border">
                    Content
                  </span>
                </Link>
                <Link
                  href={setupHref}
                  className="inline-flex items-center gap-2 rounded-lg border border-app-primary bg-app-primary px-3 py-2 text-xs font-bold text-white transition hover:border-app-primaryHover hover:bg-app-primaryHover"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  {setupLabel}
                </Link>
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600">
                  <Monitor className="h-3.5 w-3.5" aria-hidden="true" />
                  محلی
                </span>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-lg border border-app-border bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  خروج
                </button>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-xs font-black text-app-primary ring-1 ring-blue-100">
                  RP
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 lg:p-6">{children}</div>
        </section>
      </div>
    </main>
  );
}
