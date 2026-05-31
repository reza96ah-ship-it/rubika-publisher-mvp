"use client";

import {
  AlertTriangle,
  BellRing,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  ListChecks,
  PlugZap,
  RefreshCw,
  Rocket,
  TimerReset
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthGate } from "../components/auth-gate";
import { AppShell } from "../components/app-shell";
import { CountdownBadge } from "../components/countdown-badge";
import { Skeleton } from "../components/loading-skeleton";
import { ReadinessJourney } from "../components/readiness-journey";
import { StatusBadge } from "../components/status-badge";
import { Button } from "../components/ui/button";
import { EmptyState, NoticeBanner, StatusToken, WorkspacePage, WorkspacePanel } from "../components/workspace-ui";
import {
  emptyOperationalNotifications,
  loadOperationalNotifications,
  loadReadNotificationIds,
  OperationalNotification,
  OperationalNotifications
} from "../lib/notifications";
import { apiUrl, authHeaders, formatDateTime, Post } from "../lib/posts";
import { isRubikaConnected, isStoreConfigured, loadWorkspaceOverview, RubikaSettings, StoreProfile } from "../lib/workspace";

function statusCount(posts: Post[], status: string) {
  return posts.filter((post) => post.status === status).length;
}

function dateTime(value?: string | null) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
}

function severityClasses(severity: string) {
  if (severity === "critical") return "border-rose-100 bg-rose-50 text-rose-700";
  if (severity === "warning") return "border-amber-100 bg-amber-50 text-amber-700";
  return "border-blue-100 bg-blue-50 text-app-primary";
}

function AlertIcon({ severity }: { severity: string }) {
  if (severity === "critical") return <CircleAlert className="h-4 w-4" aria-hidden="true" />;
  if (severity === "warning") return <AlertTriangle className="h-4 w-4" aria-hidden="true" />;
  return <CheckCircle2 className="h-4 w-4" aria-hidden="true" />;
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [store, setStore] = useState<StoreProfile | null>(null);
  const [rubika, setRubika] = useState<RubikaSettings | null>(null);
  const [notifications, setNotifications] = useState<OperationalNotifications>(emptyOperationalNotifications);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const [response, overview, notificationData] = await Promise.all([
        fetch(`${apiUrl}/posts`, { headers: authHeaders() }),
        loadWorkspaceOverview(),
        loadOperationalNotifications()
      ]);
      if (!response.ok) throw new Error("دریافت داشبورد ناموفق بود");
      setPosts(await response.json());
      setStore(overview.store);
      setRubika(overview.rubika);
      setNotifications(notificationData);
      setReadIds(loadReadNotificationIds());
      setLastUpdatedAt(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard().catch((err) => {
      setError(err instanceof Error ? err.message : "خطا در دریافت داشبورد");
      setLoading(false);
    });
  }, [loadDashboard]);

  const scheduledPosts = useMemo(() => {
    return posts
      .filter((post) => post.status === "scheduled" && post.scheduled_at)
      .sort((first, second) => dateTime(first.scheduled_at) - dateTime(second.scheduled_at));
  }, [posts]);

  const queueCounts = {
    ready: statusCount(posts, "ready"),
    scheduled: statusCount(posts, "scheduled"),
    publishing: statusCount(posts, "publishing"),
    failed: statusCount(posts, "failed")
  };
  const draftCount = statusCount(posts, "draft");
  const publishedCount = statusCount(posts, "published");
  const queueTotal = queueCounts.ready + queueCounts.scheduled + queueCounts.publishing + queueCounts.failed;
  const storeReady = isStoreConfigured(store);
  const rubikaReady = isRubikaConnected(rubika);
  const setupScore = Number(storeReady) * 50 + Number(rubikaReady) * 50;
  const priorityAlerts = notifications.notifications.filter((item) => item.action_required).slice(0, 4);
  const unreadAlerts = notifications.notifications.filter((item) => item.action_required && !readIds.has(item.id)).length;
  const nextPosts = scheduledPosts.slice(0, 3);
  const briefing = priorityAlerts.length
    ? `${priorityAlerts.length} مورد عملیاتی پیش از ادامه برنامه انتشار نیازمند بررسی است.`
    : queueTotal
      ? "فضای کاری پایدار است. صف و زمان‌بندی انتشار را مرور کنید."
      : "فضای کاری آماده است. برنامه انتشار را با یک محتوای جدید شروع کنید.";
  const healthTone = priorityAlerts.length ? "alert" : setupScore === 100 ? "success" : "warning";
  const pipeline = [
    { label: "آماده", count: queueCounts.ready, detail: "منتظر زمان", icon: CheckCircle2, tone: "text-app-primary", href: "/content?status=ready" },
    { label: "زمان‌بندی", count: queueCounts.scheduled, detail: "در برنامه", icon: CalendarClock, tone: "text-amber-700", href: "/calendar" },
    { label: "در انتشار", count: queueCounts.publishing, detail: "در اختیار worker", icon: TimerReset, tone: "text-sky-700", href: "/queue" },
    { label: "ناموفق", count: queueCounts.failed, detail: "نیازمند بازیابی", icon: AlertTriangle, tone: queueCounts.failed ? "text-rose-700" : "text-slate-500", href: "/queue" }
  ];

  return (
    <AuthGate>
      <AppShell>
        <WorkspacePage className="space-y-4">
          <section className="app-studio-panel overflow-hidden rounded-lg">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_330px]">
              <div className="px-4 py-4 lg:px-5">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusToken tone={healthTone} className="gap-1">
                    <Rocket className="h-3.5 w-3.5" aria-hidden="true" />
                    {priorityAlerts.length ? "نیازمند رسیدگی" : setupScore === 100 ? "عملیات پایدار" : "در حال آماده‌سازی"}
                  </StatusToken>
                  <StatusToken tone={rubikaReady ? "success" : "warning"} className="gap-1">
                    <PlugZap className="h-3.5 w-3.5" aria-hidden="true" />
                    روبیکا {rubikaReady ? "متصل" : "نیازمند بررسی"}
                  </StatusToken>
                  {lastUpdatedAt ? <StatusToken tone="neutral">به‌روزرسانی {lastUpdatedAt.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}</StatusToken> : null}
                </div>
                <h1 className="mt-3 text-2xl font-black text-app-text">مرکز فرمان انتشار</h1>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-app-muted">{briefing}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button href="/queue">باز کردن صف عملیات</Button>
                  <Button href="/calendar" variant="secondary">پلنر انتشار</Button>
                  <Button type="button" variant="ghost" disabled={refreshing} onClick={() => loadDashboard(true)}>
                    <RefreshCw className={`ml-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
                    به‌روزرسانی
                  </Button>
                </div>
              </div>

              <div className="app-studio-grid border-t border-app-border bg-teal-50/55 p-4 lg:border-r lg:border-t-0">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black text-app-muted">اولویت امروز</p>
                    <p className={`mt-2 text-3xl font-black ${priorityAlerts.length ? "text-rose-700" : "text-emerald-700"}`}>{priorityAlerts.length}</p>
                  </div>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-md border ${priorityAlerts.length ? "border-rose-100 bg-white text-rose-700" : "border-emerald-100 bg-white text-emerald-700"}`}>
                    {priorityAlerts.length ? <CircleAlert className="h-5 w-5" aria-hidden="true" /> : <CheckCircle2 className="h-5 w-5" aria-hidden="true" />}
                  </span>
                </div>
                <p className="mt-3 text-xs leading-6 text-app-muted">{priorityAlerts.length ? "خطاها و هشدارهای فعال را پیش از ادامه انتشار بررسی کنید." : "مورد فوری ثبت نشده است. روند انتشار تحت کنترل است."}</p>
                <Button href="/inbox" variant="secondary" size="sm" className="mt-3 w-full">
                  <BellRing className="ml-2 h-4 w-4" aria-hidden="true" />
                  صندوق عملیات {unreadAlerts ? `(${unreadAlerts})` : ""}
                </Button>
              </div>
            </div>
          </section>

          {error ? <NoticeBanner tone="alert">{error}</NoticeBanner> : null}
          {loading ? <Skeleton className="h-4 w-44" /> : null}

          <section className="app-studio-surface grid overflow-hidden rounded-lg sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "داخل صف", value: queueTotal, detail: "تمام وضعیت‌های عملیاتی", icon: ListChecks, tone: "text-app-primary" },
              { label: "زمان‌بندی‌شده", value: queueCounts.scheduled, detail: "انتشارهای آینده", icon: CalendarClock, tone: "text-amber-700" },
              { label: "منتشرشده", value: publishedCount, detail: "کل خروجی موفق", icon: CheckCircle2, tone: "text-emerald-700" },
              { label: "خطای فعال", value: queueCounts.failed, detail: "نیازمند بازیابی", icon: AlertTriangle, tone: queueCounts.failed ? "text-rose-700" : "text-slate-500" }
            ].map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="flex min-w-0 items-start gap-3 border-b border-app-border p-3 sm:border-l sm:last:border-l-0 xl:border-b-0">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-50 ${metric.tone}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black text-app-muted">{metric.label}</p>
                    <p className={`mt-0.5 text-lg font-black ${metric.tone}`}>{metric.value}</p>
                    <p className="truncate text-[11px] text-app-muted">{metric.detail}</p>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
            <div className="space-y-4">
              <WorkspacePanel
                title="نیازمند رسیدگی"
                description="مهم‌ترین موارد عملیاتی برای تصمیم سریع در شروع روز."
                action={<Button href="/inbox" variant="secondary" size="sm">مشاهده همه اعلان‌ها</Button>}
                bodyClassName="p-0"
              >
                {priorityAlerts.length ? (
                  <div className="divide-y divide-app-border">
                    {priorityAlerts.map((alert) => <PriorityAlert key={alert.id} alert={alert} />)}
                  </div>
                ) : (
                  <div className="p-4">
                    <EmptyState
                      icon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />}
                      title="مورد فوری برای رسیدگی وجود ندارد."
                      description="اتصال، worker و صف انتشار در وضعیت پایدار هستند."
                    />
                  </div>
                )}
              </WorkspacePanel>

              <WorkspacePanel
                title="برنامه انتشار پیش رو"
                description="سه انتشار بعدی را پیش از رسیدن زمان بررسی کنید."
                action={<Button href="/calendar" variant="secondary" size="sm">باز کردن پلنر</Button>}
                bodyClassName="p-0"
              >
                {nextPosts.length ? (
                  <div className="divide-y divide-app-border">
                    {nextPosts.map((post) => (
                      <article key={post.id} className="app-row grid gap-3 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_180px] lg:items-center">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={post.status} />
                            <CountdownBadge status={post.status} scheduledAt={post.scheduled_at} />
                          </div>
                          <h3 className="mt-2 truncate font-black text-app-text">{post.title}</h3>
                          <p className="mt-1 truncate text-xs text-app-muted">{formatDateTime(post.scheduled_at)}</p>
                        </div>
                        <Button href={`/compose?postId=${post.id}`} variant="secondary" size="sm">باز کردن پست</Button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="p-4">
                    <EmptyState
                      icon={<CalendarClock className="h-5 w-5" aria-hidden="true" />}
                      title="هنوز انتشار آینده‌ای زمان‌بندی نشده است."
                      description="از استودیوی تولید محتوا یک پست را وارد برنامه انتشار کنید."
                      action={<Button href="/compose">زمان‌بندی اولین پست</Button>}
                    />
                  </div>
                )}
              </WorkspacePanel>
            </div>

            <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
              <WorkspacePanel title="جریان صف" description="نمای فشرده از گلوگاه‌های فعال انتشار." bodyClassName="p-0">
                <div className="divide-y divide-app-border">
                  {pipeline.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.label} href={item.href} className="app-row flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-md bg-slate-50 ${item.tone}`}>
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-black text-app-text">{item.label}</span>
                          <span className="mt-1 block text-[11px] text-app-muted">{item.detail}</span>
                        </span>
                        <span className={`text-lg font-black ${item.tone}`}>{item.count}</span>
                      </Link>
                    );
                  })}
                </div>
              </WorkspacePanel>

              <WorkspacePanel title="میز کار سریع" description="دسترسی کوتاه به کارهای پرتکرار روزانه." bodyClassName="p-3">
                <div className="grid gap-2">
                  <Button href="/compose">ساخت محتوای جدید</Button>
                  <Button href="/content" variant="secondary">مرور محتوا و پیش‌نویس‌ها ({draftCount})</Button>
                  <Button href="/analytics" variant="secondary">تحلیل عملکرد</Button>
                  <Button href="/logs" variant="secondary">سلامت انتشار</Button>
                </div>
              </WorkspacePanel>
            </aside>
          </section>

          <ReadinessJourney store={store} rubika={rubika} posts={posts} loading={loading} />
        </WorkspacePage>
      </AppShell>
    </AuthGate>
  );
}

function PriorityAlert({ alert }: { alert: OperationalNotification }) {
  return (
    <article className="app-row grid gap-3 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_170px] lg:items-center">
      <div className="flex min-w-0 gap-3">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${severityClasses(alert.severity)}`}>
          <AlertIcon severity={alert.severity} />
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-black text-app-text">{alert.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-6 text-app-muted">{alert.description}</p>
          <p className="mt-1 text-[11px] text-slate-400">{formatDateTime(alert.created_at)}</p>
        </div>
      </div>
      <Button href={alert.action_href} variant="secondary" size="sm">{alert.action_label}</Button>
    </article>
  );
}
