"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  isRubikaConnected,
  isStoreConfigured,
  loadWorkspaceOverview,
  rubikaStatusLabel,
  WorkspaceOverview
} from "../lib/workspace";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
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
  const storeTone = overviewLoading
    ? "bg-slate-100 text-slate-600 ring-slate-200"
    : storeReady
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
      : "bg-amber-50 text-amber-700 ring-amber-100";

  function logout() {
    window.localStorage.removeItem("rubika_publisher_access");
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-app-background text-app-text">
      <div className="flex min-h-screen">
        <Sidebar />
        <section className="min-w-0 flex-1">
          <div className="sticky top-0 z-10 border-b border-app-border bg-app-surface/95 px-5 py-3 backdrop-blur lg:px-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs text-app-muted">فضای کاری فعال</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">{storeName}</p>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${rubikaTone}`}>
                    {rubikaLabel}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${storeTone}`}>
                    {storeLabel}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={setupHref}
                  className="rounded-xl bg-app-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-app-primaryHover"
                >
                  {setupLabel}
                </Link>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">محیط محلی</span>
                <button
                  onClick={logout}
                  className="rounded-xl border border-app-border bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  خروج
                </button>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-black text-app-primary ring-1 ring-blue-100">
                  RP
                </div>
              </div>
            </div>
          </div>
          <div className="p-5 lg:p-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
