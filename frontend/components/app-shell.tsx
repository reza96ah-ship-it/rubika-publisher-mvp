"use client";

import { AlertCircle, ChevronDown, ChevronLeft, LogOut, PlugZap, Search, Settings2, UserRound } from "lucide-react";
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
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  useEffect(() => {
    loadWorkspaceOverview()
      .then(setOverview)
      .catch(() => setOverview({ store: null, rubika: null }))
      .finally(() => setOverviewLoading(false));
  }, []);

  useEffect(() => {
    setAccountMenuOpen(false);
  }, [pathname]);

  const storeReady = !overviewLoading && isStoreConfigured(overview.store);
  const rubikaReady = !overviewLoading && isRubikaConnected(overview.rubika);
  const shellReady = storeReady && rubikaReady;
  const setupHref = !storeReady ? "/store" : !rubikaReady ? "/rubika" : "/compose";
  const showSetupAction = !overviewLoading && !shellReady;

  function logout() {
    window.localStorage.removeItem("rubika_publisher_access");
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-app-background text-app-text">
      <div className="flex min-h-screen">
        <Sidebar storeName={overview.store?.name || "پروفایل فروشگاه"} ready={shellReady} />
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-app-border bg-white/95 backdrop-blur-xl">
            <div className="flex min-h-14 items-center justify-between gap-3 px-4 py-2 lg:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <Link href="/" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-app-primary text-[10px] font-black text-white lg:hidden">
                  RP
                </Link>
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-app-muted">
                    <span>{activeNav.group.title}</span>
                    <ChevronLeft className="h-3 w-3" aria-hidden="true" />
                    <span className="truncate text-app-primary">{activeNav.item.label}</span>
                  </div>
                  <p className="mt-0.5 truncate text-sm font-black text-app-text">{activeNav.item.label}</p>
                </div>
              </div>

              <div className="flex min-w-0 items-center gap-2">
                <Link
                  href="/content"
                  className="hidden h-9 min-w-0 items-center gap-2 rounded-md border border-app-border bg-slate-50 px-3 text-xs text-app-muted transition hover:border-blue-200 hover:bg-blue-50 hover:text-app-primary md:flex md:w-56 xl:w-72"
                >
                  <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">جست‌وجوی محتوا و کمپین</span>
                </Link>

                <Link
                  href="/rubika"
                  className={`hidden h-9 items-center gap-2 rounded-md border px-2.5 text-xs font-bold transition sm:flex ${
                    rubikaReady
                      ? "border-emerald-100 bg-emerald-50 text-emerald-700 hover:border-emerald-200"
                      : "border-amber-100 bg-amber-50 text-amber-700 hover:border-amber-200"
                  }`}
                >
                  <PlugZap className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden xl:inline">روبیکا</span>
                  <span>{rubikaReady ? "متصل" : "نیازمند بررسی"}</span>
                </Link>

                {showSetupAction ? (
                  <Link
                    href={setupHref}
                    className="hidden h-9 items-center gap-2 rounded-md border border-amber-200 bg-white px-2.5 text-xs font-bold text-amber-800 transition hover:bg-amber-50 lg:flex"
                  >
                    <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    تکمیل آماده‌سازی
                  </Link>
                ) : null}

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAccountMenuOpen((current) => !current)}
                    className="flex h-9 items-center gap-2 rounded-md border border-app-border bg-white px-2 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-app-primary"
                    aria-label="منوی حساب کاربری"
                    aria-expanded={accountMenuOpen}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-slate-500">
                      <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="hidden xl:inline">مدیر فضای کاری</span>
                    <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>

                  {accountMenuOpen ? (
                    <div className="absolute left-0 top-11 w-64 overflow-hidden rounded-md border border-app-border bg-white shadow-lg shadow-slate-200/70">
                      <div className="border-b border-app-border px-3 py-3">
                        <p className="text-xs font-black text-app-text">مدیر فضای کاری</p>
                        <p className="mt-1 truncate text-[11px] text-app-muted">{overview.store?.name || "Rubika Publisher"}</p>
                      </div>
                      <div className="p-1.5">
                        <Link href="/store" className="flex items-center gap-2 rounded px-2.5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-app-text">
                          <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
                          تنظیمات فضای کاری
                        </Link>
                        <Link href="/rubika" className="flex items-center gap-2 rounded px-2.5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-app-text">
                          <PlugZap className="h-3.5 w-3.5" aria-hidden="true" />
                          اتصال روبیکا
                        </Link>
                        <button
                          type="button"
                          onClick={logout}
                          className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-right text-xs font-bold text-rose-700 transition hover:bg-rose-50"
                        >
                          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                          خروج از حساب
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </header>
          <div className="p-4 pb-24 lg:p-5">{children}</div>
          <MobileNav />
        </section>
      </div>
    </main>
  );
}
