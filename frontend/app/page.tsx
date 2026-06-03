"use client";

import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  ListChecks,
  Palette,
  PlugZap,
  RefreshCw,
  Rocket,
  Sparkles,
  TimerReset
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthGate } from "../components/auth-gate";
import { AppShell } from "../components/app-shell";
import { WorkspaceAvatar } from "../components/brand-mark";
import { CountdownBadge } from "../components/countdown-badge";
import { LiveOperations, PublicationPulse, SignalRibbon } from "../components/dashboard-command-center";
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
import { useMediaPreviewUrl } from "../lib/media-preview";
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
  const brandColor = store?.brand_primary_color || "#0F766E";
  const brandImageUrl = useMediaPreviewUrl(store?.avatar_asset_id ?? store?.logo_asset_id);
  const logoUrl = useMediaPreviewUrl(store?.logo_asset_id);
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
    { label: "آماده", count: queueCounts.ready, detail: "منتظر زمان", icon: CheckCircle2, tone: "primary" as const, href: "/content?status=ready" },
    { label: "زمان‌بندی", count: queueCounts.scheduled, detail: "در برنامه", icon: CalendarClock, tone: "warning" as const, href: "/calendar" },
    { label: "در انتشار", count: queueCounts.publishing, detail: "در اختیار worker", icon: TimerReset, tone: "info" as const, href: "/queue" },
    { label: "ناموفق", count: queueCounts.failed, detail: "نیازمند بازیابی", icon: AlertTriangle, tone: "alert" as const, href: "/queue" }
  ];
  const signals = [
    { label: "داخل صف", value: queueTotal, detail: "تمام وضعیت‌های عملیاتی", icon: ListChecks, tone: "primary" as const },
    { label: "زمان‌بندی‌شده", value: queueCounts.scheduled, detail: "انتشارهای آینده", icon: CalendarClock, tone: "warning" as const },
    { label: "منتشرشده", value: publishedCount, detail: "کل خروجی موفق", icon: CheckCircle2, tone: "success" as const },
    { label: "خطای فعال", value: queueCounts.failed, detail: "نیازمند بازیابی", icon: AlertTriangle, tone: "alert" as const }
  ];

  return (
    <AuthGate>
      <AppShell>
        <WorkspacePage className="space-y-4">
          <section className="app-studio-panel overflow-hidden rounded-lg border-t-4" style={{ borderTopColor: brandColor }}>
            <div className="grid lg:grid-cols-[minmax(0,1fr)_410px]">
              <div className="px-4 py-5 lg:px-5">
                <div className="mb-4 flex min-w-0 items-center gap-3">
                  <WorkspaceAvatar name={store?.name || "فضای کاری اجتماعی"} size="lg" color={brandColor} imageUrl={brandImageUrl} />
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-app-muted">فضای کاری فعال</p>
                    <p className="mt-1 truncate text-base font-black text-app-text">{store?.name || "فضای کاری اجتماعی"}</p>
                    <p className="mt-0.5 truncate text-xs text-app-muted">{store?.category || store?.brand_voice || "هویت برند را از تنظیمات فروشگاه کامل کنید."}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusToken tone={healthTone} className="gap-1">
                    <Rocket className="h-3.5 w-3.5" aria-hidden="true" />
                    {priorityAlerts.length ? "نیازمند رسیدگی" : setupScore === 100 ? "عملیات پایدار" : "در حال آماده‌سازی"}
                  </StatusToken>
                  <StatusToken tone={rubikaReady ? "success" : "warning"} className="gap-1">
                    <PlugZap className="h-3.5 w-3.5" aria-hidden="true" />
                    کانال‌ها {rubikaReady ? "آماده" : "نیازمند بررسی"}
                  </StatusToken>
                  {lastUpdatedAt ? <StatusToken tone="neutral">به‌روزرسانی {lastUpdatedAt.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}</StatusToken> : null}
                </div>
                <p className="app-section-kicker mt-4 text-[10px] font-black">Multi-channel Social Operations</p>
                <h1 className="mt-2 text-2xl font-black text-app-text">مرکز فرمان شبکه‌های اجتماعی</h1>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-app-muted">{briefing}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {setupScore < 100 ? <Button href="/onboarding">شروع مسیر راه‌اندازی</Button> : <Button href="/queue">باز کردن صف عملیات</Button>}
                  {setupScore < 100 ? <Button href="/queue" variant="secondary">صف عملیات</Button> : null}
                  <Button href="/calendar" variant="secondary">پلنر انتشار</Button>
                  <Button type="button" variant="ghost" disabled={refreshing} onClick={() => loadDashboard(true)}>
                    <RefreshCw className={`ml-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
                    به‌روزرسانی
                  </Button>
                </div>
              </div>

              <PublicationPulse items={pipeline} alertCount={priorityAlerts.length} unreadAlerts={unreadAlerts} />
            </div>
          </section>

          {error ? <NoticeBanner tone="alert">{error}</NoticeBanner> : null}
          {loading ? <Skeleton className="h-4 w-44" /> : null}

          <SignalRibbon items={signals} />

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
                      <article key={post.id} className="dashboard-schedule-row app-row grid gap-3 py-4 pr-8 pl-4 lg:grid-cols-[minmax(0,1fr)_180px] lg:items-center">
                        <div className="min-w-0 border-r border-dashed border-teal-200 pr-4">
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
              <LiveOperations
                setupScore={setupScore}
                queueTotal={queueTotal}
                rubikaReady={rubikaReady}
                nextWindow={nextPosts[0]?.scheduled_at ? formatDateTime(nextPosts[0].scheduled_at) : "بدون زمان‌بندی"}
              />

              <WorkspacePanel title="هویت برند فعال" description="برند جاری که در composer و پیش‌نمایش انتشار استفاده می‌شود." bodyClassName="p-4">
                <div className="flex items-center gap-3">
                    <WorkspaceAvatar name={store?.name || "فضای کاری اجتماعی"} size="lg" color={brandColor} imageUrl={brandImageUrl} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-app-text">{store?.name || "پروفایل فروشگاه"}</p>
                    <p className="mt-1 truncate text-xs text-app-muted">{store?.brand_voice || "لحن برند هنوز تعریف نشده است."}</p>
                  </div>
                </div>
                {logoUrl ? (
                  <div className="mt-4 rounded-md border border-app-border bg-app-surfaceMuted p-3">
                    <p className="mb-2 flex items-center gap-1.5 text-[11px] font-black text-app-muted">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                      لوگوی workspace
                    </p>
                    <img src={logoUrl} alt="لوگوی برند" className="max-h-20 max-w-full rounded object-contain" />
                  </div>
                ) : null}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-md bg-app-surfaceMuted p-2">
                    <p className="flex items-center gap-1.5 text-[10px] font-black text-app-muted"><Palette className="h-3.5 w-3.5" aria-hidden="true" />رنگ اصلی</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="h-5 w-5 rounded shadow-hairline" style={{ backgroundColor: brandColor }} />
                      <span className="text-xs font-black text-app-text" dir="ltr">{brandColor}</span>
                    </div>
                  </div>
                  <div className="rounded-md bg-app-surfaceMuted p-2">
                    <p className="text-[10px] font-black text-app-muted">CTA پیش‌فرض</p>
                    <p className="mt-2 line-clamp-2 text-xs font-bold leading-5 text-app-text">{store?.default_cta || "ثبت نشده"}</p>
                  </div>
                </div>
                <Button href="/store" variant="secondary" size="sm" className="mt-4 w-full">ویرایش کیت برند</Button>
              </WorkspacePanel>

              <WorkspacePanel title="میز کار سریع" description="دسترسی کوتاه به کارهای پرتکرار روزانه." bodyClassName="p-3">
                <div className="grid gap-2">
                  <Button href="/onboarding" variant={setupScore < 100 ? "primary" : "secondary"}>مسیر راه‌اندازی</Button>
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
    <article className="dashboard-alert-rail app-row grid gap-3 py-4 pr-5 pl-4 lg:grid-cols-[minmax(0,1fr)_170px] lg:items-center">
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
