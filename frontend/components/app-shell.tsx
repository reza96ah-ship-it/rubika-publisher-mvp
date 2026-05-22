"use client";

import { useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();

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
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-app-muted">فروشگاه فعال</p>
                <p className="text-sm font-semibold">فروشگاه نمونه</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">Local MVP</span>
                <button
                  onClick={logout}
                  className="rounded-xl border border-app-border bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  خروج
                </button>
                <div className="h-9 w-9 rounded-full bg-violet-100 ring-1 ring-violet-200" />
              </div>
            </div>
          </div>
          <div className="p-5 lg:p-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
