"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarClock, CheckCircle2, ClipboardList, FileText, Rocket } from "lucide-react";
import { AuthGate } from "../components/auth-gate";
import { AppShell } from "../components/app-shell";
import { CountdownBadge } from "../components/countdown-badge";
import { Skeleton } from "../components/loading-skeleton";
import { ReadinessJourney } from "../components/readiness-journey";
import { StatusBadge } from "../components/status-badge";
import { Button } from "../components/ui/button";
import { StatusToken, WorkspacePage } from "../components/workspace-ui";
import { apiUrl, authHeaders, formatDateTime, Post } from "../lib/posts";
import { isRubikaConnected, isStoreConfigured, loadWorkspaceOverview, RubikaSettings, StoreProfile } from "../lib/workspace";

function statusCount(posts: Post[], status: string) {
  return posts.filter((post) => post.status === status).length;
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [store, setStore] = useState<StoreProfile | null>(null);
  const [rubika, setRubika] = useState<RubikaSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const [response, overview] = await Promise.all([
        fetch(`${apiUrl}/posts`, { headers: authHeaders() }),
        loadWorkspaceOverview()
      ]);
      if (!response.ok) throw new Error("دریافت داشبورد ناموفق بود");
      setPosts(await response.json());
      setStore(overview.store);
      setRubika(overview.rubika);
      setLoading(false);
    }

    loadDashboard().catch((err) => {
      setError(err instanceof Error ? err.message : "خطا در دریافت داشبورد");
      setLoading(false);
    });
  }, []);

  const scheduledPosts = useMemo(() => {
    return posts
      .filter((post) => post.status === "scheduled" && post.scheduled_at)
      .sort((first, second) => String(first.scheduled_at).localeCompare(String(second.scheduled_at)));
  }, [posts]);

  const nextPost = scheduledPosts[0];
  const attentionPosts = posts.filter((post) => ["draft", "ready", "failed"].includes(post.status)).slice(0, 4);
  const draftCount = statusCount(posts, "draft");
  const readyCount = statusCount(posts, "ready");
  const scheduledCount = statusCount(posts, "scheduled");
  const failedCount = statusCount(posts, "failed");
  const storeReady = isStoreConfigured(store);
  const rubikaReady = isRubikaConnected(rubika);
  const setupScore = Number(storeReady) * 50 + Number(rubikaReady) * 50;
  const attentionCount = posts.filter((post) => ["draft", "ready", "failed"].includes(post.status)).length;
  const healthTone = failedCount ? "alert" : setupScore === 100 ? "success" : "warning";

  return (
    <AuthGate>
      <AppShell>
        <WorkspacePage className="space-y-4">
          <section>
            <div className="rounded-md border border-app-border bg-white">
              <div className="flex flex-col justify-between gap-4 border-b border-app-border px-4 py-4 lg:flex-row lg:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusToken tone={healthTone} className="gap-1">
                      <Rocket className="h-3.5 w-3.5" aria-hidden="true" />
                      {failedCount ? "نیازمند رسیدگی" : setupScore === 100 ? "آماده عملیات" : "در حال آماده‌سازی"}
                    </StatusToken>
                    <StatusToken tone={rubikaReady ? "success" : "warning"}>روبیکا {rubikaReady ? "متصل" : "ناقص"}</StatusToken>
                    <StatusToken tone={storeReady ? "success" : "warning"}>پروفایل {storeReady ? "آماده" : "ناقص"}</StatusToken>
                  </div>
                  <h1 className="mt-3 text-2xl font-black text-app-text">مرکز عملیات انتشار</h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-app-muted">
                    صف، آماده‌سازی، خطاها و پست بعدی در یک نمای کاری برای شروع روز.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button href="/calendar" variant="secondary">
                    <CalendarClock className="ml-2 h-4 w-4" aria-hidden="true" />
                    تقویم
                  </Button>
                </div>
              </div>

              <div className="grid gap-0 divide-y divide-app-border lg:grid-cols-4 lg:divide-x lg:divide-x-reverse lg:divide-y-0">
                <div className="px-4 py-3">
                  <p className="text-[11px] font-black text-app-muted">کل محتوا</p>
                  <p className="mt-1 text-lg font-black text-app-text">{posts.length}</p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-[11px] font-black text-app-muted">داخل صف</p>
                  <p className="mt-1 text-lg font-black text-app-text">{readyCount + scheduledCount}</p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-[11px] font-black text-app-muted">نیازمند توجه</p>
                  <p className={`mt-1 text-lg font-black ${attentionCount ? "text-amber-700" : "text-app-text"}`}>{attentionCount}</p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-[11px] font-black text-app-muted">خطا</p>
                  <p className={`mt-1 text-lg font-black ${failedCount ? "text-rose-700" : "text-app-text"}`}>{failedCount}</p>
                </div>
              </div>
            </div>

          </section>

          {error ? <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}
          {loading ? <Skeleton className="h-4 w-44" /> : null}

          <ReadinessJourney store={store} rubika={rubika} posts={posts} loading={loading} />

          <section className="grid overflow-hidden rounded-md border border-app-border bg-white sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "پیش‌نویس", value: draftCount, detail: "برای تکمیل و آماده‌سازی", icon: FileText, tone: "text-slate-600" },
              { label: "آماده", value: readyCount, detail: "منتظر زمان انتشار", icon: CheckCircle2, tone: "text-app-primary" },
              { label: "زمان‌بندی‌شده", value: scheduledCount, detail: "داخل برنامه انتشار", icon: CalendarClock, tone: "text-amber-700" },
              { label: "ناموفق", value: failedCount, detail: "نیازمند بازیابی", icon: AlertTriangle, tone: failedCount ? "text-rose-700" : "text-slate-500" }
            ].map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="flex min-w-0 items-start gap-3 border-b border-app-border p-3 sm:border-l sm:last:border-l-0 xl:border-b-0">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-50 ${metric.tone}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black text-app-muted">{metric.label}</p>
                    <p className="mt-0.5 text-lg font-black text-app-text">{metric.value}</p>
                    <p className="truncate text-[11px] text-app-muted">{metric.detail}</p>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-md border border-app-border bg-white">
              <div className="flex items-center justify-between border-b border-app-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-app-primary" aria-hidden="true" />
                  <h2 className="text-sm font-black text-app-text">انتشار بعدی</h2>
                </div>
                <Button href="/queue" variant="secondary" size="sm">صف انتشار</Button>
              </div>
              {nextPost ? (
                <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={nextPost.status} />
                      <CountdownBadge status={nextPost.status} scheduledAt={nextPost.scheduled_at} />
                    </div>
                    <h3 className="mt-4 truncate text-xl font-black text-app-text">{nextPost.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-7 text-app-muted">{nextPost.caption || "بدون کپشن"}</p>
                    <p className="mt-3 text-sm font-semibold text-app-muted">زمان انتشار: {formatDateTime(nextPost.scheduled_at)}</p>
                  </div>
                  <div className="rounded-md border border-app-border bg-slate-50 p-3">
                    <p className="text-xs font-black text-app-muted">اقدام</p>
                    <Button href={`/compose?postId=${nextPost.id}`} variant="secondary" className="mt-3 w-full">باز کردن پست</Button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="font-black text-app-text">هنوز پست زمان‌بندی‌شده‌ای وجود ندارد.</p>
                  <p className="mt-2 text-sm text-app-muted">از استودیوی تولید یک زمان انتشار انتخاب کنید.</p>
                  <Button href="/compose" className="mt-4">زمان‌بندی اولین پست</Button>
                </div>
              )}
            </div>

            <div className="rounded-md border border-app-border bg-white">
              <div className="flex items-center gap-2 border-b border-app-border px-4 py-3">
                <ClipboardList className="h-4 w-4 text-app-primary" aria-hidden="true" />
                <h2 className="text-sm font-black text-app-text">مسیرهای سریع</h2>
              </div>
              <div className="grid gap-2 p-3">
                <Button href="/content" variant="secondary">فضای محتوا</Button>
                <Button href="/queue" variant="secondary">صف انتشار</Button>
                <Button href="/calendar" variant="secondary">تقویم جلالی</Button>
                <Button href="/rubika" variant="secondary">اتصال روبیکا</Button>
              </div>
            </div>
          </section>

          <section className="rounded-md border border-app-border bg-white">
            <div className="flex items-center justify-between border-b border-app-border px-4 py-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-app-primary" aria-hidden="true" />
                <h2 className="text-sm font-black text-app-text">اقدام‌های بعدی</h2>
              </div>
              <StatusToken tone={attentionPosts.length ? "warning" : "success"}>{attentionPosts.length} مورد</StatusToken>
            </div>
            {attentionPosts.length === 0 ? <p className="p-5 text-sm text-app-muted">مورد فوری برای اقدام وجود ندارد.</p> : null}
            <div className="divide-y divide-app-border">
              {attentionPosts.map((post) => (
                <article key={post.id} className="grid gap-3 px-4 py-3 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={post.status} />
                      <CountdownBadge status={post.status} scheduledAt={post.scheduled_at} />
                    </div>
                    <h3 className="mt-2 truncate font-black text-app-text">{post.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-app-muted">{post.caption || "بدون کپشن"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <Button href={`/compose?postId=${post.id}`} variant="secondary" size="sm">باز کردن</Button>
                    <Button href="/content" variant="ghost" size="sm">فضای محتوا</Button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </WorkspacePage>
      </AppShell>
    </AuthGate>
  );
}
