"use client";

import { AlertCircle, ChevronLeft, LogOut, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  isRubikaConnected,
  isStoreConfigured,
  loadWorkspaceOverview,
  WorkspaceOverview
} from "../lib/workspace";
import { getActiveNav, MobileNav, Sidebar } from "./sidebar";

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
  const shellReady = storeReady && rubikaReady;
  const readinessPercent = overviewLoading ? 25 : Number(storeReady) * 50 + Number(rubikaReady) * 50;
  const setupHref = !storeReady ? "/store" : !rubikaReady ? "/rubika" : "/compose";
  const showSetupAction = !overviewLoading && !shellReady;

  function logout() {
    window.localStorage.removeItem("rubika_publisher_access");
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-app-background text-app-text">
      <div className="flex min-h-screen">
        <Sidebar storeName={overview.store?.name || "پروفایل فروشگاه"} readinessPercent={readinessPercent} ready={shellReady} />
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-app-border bg-white/95 backdrop-blur-xl">
            <div className="px-4 py-2.5 lg:px-6">
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
                    <div className="mt-1 flex min-w-0 items-center gap-2">
                      <p className="truncate text-base font-black text-app-text">{activeNav.item.label}</p>
                    </div>
                  </div>
                </div>

                <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-center xl:max-w-3xl xl:flex-1 xl:justify-end">
                  <Link
                    href="/content"
                    className="hidden h-10 min-w-0 items-center gap-2 rounded-md border border-app-border bg-slate-50 px-3 text-sm text-app-muted transition hover:border-blue-200 hover:bg-blue-50 hover:text-app-primary lg:flex lg:w-64 2xl:w-[360px]"
                  >
                    <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">جست‌وجوی محتوا، کمپین و کپشن</span>
                    <span className="mr-auto rounded bg-white px-2 py-0.5 text-[10px] font-bold text-app-primary ring-1 ring-blue-100">
                      Content
                    </span>
                  </Link>

                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    {showSetupAction ? (
                      <Link
                        href={setupHref}
                        className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 transition hover:border-amber-300 hover:bg-amber-100"
                      >
                        <AlertCircle className="h-4 w-4" aria-hidden="true" />
                        تکمیل آماده‌سازی
                      </Link>
                    ) : null}
                    <button
                      onClick={logout}
                      className="inline-flex h-9 items-center gap-2 rounded-md border border-app-border bg-white px-3 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-app-primary"
                      aria-label="خروج"
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
