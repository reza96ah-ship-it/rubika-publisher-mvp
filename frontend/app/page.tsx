"use client";

import {
  Activity,
  AlertTriangle,
  ArrowUpLeft,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Layers3,
  Megaphone,
  MessageSquare,
  Network,
  Palette,
  PlugZap,
  RefreshCw,
  Rocket,
  Sparkles,
  Target,
  TimerReset,
  TrendingUp,
  type LucideIcon
} from "lucide-react";
import { type CSSProperties, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { AuthGate } from "../components/auth-gate";
import { AppShell } from "../components/app-shell";
import { WorkspaceAvatar } from "../components/brand-mark";
import { CountdownBadge } from "../components/countdown-badge";
import { LiveOperations } from "../components/dashboard-command-center";
import { Skeleton } from "../components/loading-skeleton";
import { StatusBadge } from "../components/status-badge";
import { Button } from "../components/ui/button";
import { EmptyState, NoticeBanner, StatusToken, WorkspacePage, WorkspacePanel } from "../components/workspace-ui";
import { Campaign, loadCampaigns } from "../lib/campaigns";
import {
  emptyOperationalNotifications,
  loadOperationalNotifications,
  loadReadNotificationIds,
  OperationalNotification,
  OperationalNotifications
} from "../lib/notifications";
import { apiUrl, authHeaders, formatDateTime, Post } from "../lib/posts";
import { useMediaPreviewUrl } from "../lib/media-preview";
import { productKicker } from "../lib/product";
import { isRubikaConnected, isStoreConfigured, loadWorkspaceOverview, RubikaSettings, StoreProfile } from "../lib/workspace";

function statusCount(posts: Post[], status: string) {
  return posts.filter((post) => post.status === status).length;
}

function dateTime(value?: string | null) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dateFromPost(post: Post) {
  const value = post.published_at || post.scheduled_at || post.created_at;
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function percent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
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

const commandMetricToneClasses = {
  primary: "border-blue-100 bg-blue-50/60 text-app-primary",
  warning: "border-amber-100 bg-amber-50/70 text-amber-700",
  success: "border-emerald-100 bg-emerald-50/70 text-emerald-700",
  alert: "border-rose-100 bg-rose-50/70 text-rose-700"
};

const dashboardFocusToneClasses = {
  primary: "border-blue-100 bg-blue-50/60 text-app-primary",
  warning: "border-amber-100 bg-amber-50/65 text-amber-700",
  info: "border-sky-100 bg-sky-50/65 text-sky-700",
  alert: "border-rose-100 bg-rose-50/65 text-rose-700"
};

function DashboardFocusItem({
  label,
  value,
  detail,
  icon: Icon,
  tone,
  compact = false
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  tone: keyof typeof dashboardFocusToneClasses;
  compact?: boolean;
}) {
  return (
    <article className={`${compact ? "min-h-[92px] p-3" : "min-h-[136px] p-4"} rounded-lg border border-app-border bg-white shadow-hairline`}>
      <div className="flex h-full flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold text-app-muted">{label}</p>
            <p className={`mt-2 font-black leading-6 text-app-text ${compact ? "line-clamp-1 text-sm" : "line-clamp-2 text-base"}`}>{value}</p>
          </div>
          <span className={`flex ${compact ? "h-8 w-8" : "h-9 w-9"} shrink-0 items-center justify-center rounded-md border ${dashboardFocusToneClasses[tone]}`}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        <p className="line-clamp-2 text-xs leading-5 text-app-muted">{detail}</p>
      </div>
    </article>
  );
}

function CommandMetric({
  label,
  value,
  detail,
  icon: Icon,
  tone
}: {
  label: string;
  value: number;
  detail: string;
  icon: LucideIcon;
  tone: keyof typeof commandMetricToneClasses;
}) {
  return (
    <article className="app-row min-h-[76px] rounded-lg border border-app-border bg-white p-2.5 shadow-hairline sm:min-h-[88px] sm:p-3">
      <div className="flex h-full items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0">
          <p className="line-clamp-1 text-[10px] font-bold text-app-muted sm:text-xs">{label}</p>
          <p className="mt-1 text-lg font-black text-app-text sm:text-xl">{value}</p>
          <p className="mt-1 hidden truncate text-[11px] font-bold text-app-muted sm:block">{detail}</p>
        </div>
        <span className={`hidden h-8 w-8 shrink-0 items-center justify-center rounded-md border sm:flex ${commandMetricToneClasses[tone]}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}

function DashboardCard({
  title,
  description,
  action,
  children
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-app-border bg-white p-4 shadow-hairline">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-sm font-black text-app-text">{title}</h2>
          {description ? <p className="mt-1 text-xs leading-5 text-app-muted">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function MiniTrendChart({ values, labels }: { values: number[]; labels?: string[] }) {
  const max = Math.max(...values, 1);

  return (
    <div className="flex h-28 items-end gap-1.5 rounded-lg bg-slate-50/80 px-3 py-3">
      {values.map((value, index) => (
        <div key={index} className="flex min-w-0 flex-1 flex-col items-center gap-1">
          <span
            className="w-full rounded-t-md bg-app-primary/80 shadow-[0_6px_14px_rgba(37,99,235,0.12)] transition-all"
            style={{ height: `${Math.max(10, (value / max) * 88)}px` }}
            aria-label={`${value} مورد`}
          />
          <span className="text-[9px] font-bold text-slate-400">{labels?.[index] || index + 1}</span>
        </div>
      ))}
    </div>
  );
}

function InsightRow({
  icon: Icon,
  title,
  description,
  tone = "primary"
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: keyof typeof commandMetricToneClasses;
}) {
  return (
    <article className="flex gap-3 rounded-lg border border-app-border bg-white px-3 py-3 shadow-hairline">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${commandMetricToneClasses[tone]}`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h3 className="text-xs font-black text-app-text">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-app-muted">{description}</p>
      </div>
    </article>
  );
}

function DonutStatusChart({
  items,
  total
}: {
  items: Array<{ label: string; value: number; color: string }>;
  total: number;
}) {
  let cursor = 0;
  const background = total
    ? items
      .filter((item) => item.value > 0)
      .map((item) => {
        const start = cursor;
        const size = (item.value / total) * 360;
        cursor += size;
        return `${item.color} ${start}deg ${cursor}deg`;
      })
      .join(", ")
    : "#E2E8F0 0deg 360deg";

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative h-40 w-40 rounded-full shadow-hairline" style={{ background: `conic-gradient(${background})` } as CSSProperties}>
        <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-white shadow-inner">
          <span className="text-2xl font-black text-app-text">{total}</span>
          <span className="mt-1 text-[10px] font-bold text-app-muted">کل محتوا</span>
        </div>
      </div>
      <div className="grid w-full grid-cols-2 gap-2 text-xs">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-2.5 py-2">
            <span className="flex min-w-0 items-center gap-2 font-bold text-app-muted">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
            <span className="font-black text-app-text">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
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
      const postData: Post[] = await response.json();
      const campaignData = await loadCampaigns("all").catch(() => []);
      setPosts(postData);
      setCampaigns(campaignData);
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
  const workspaceReady = storeReady && rubikaReady;
  const brandColor = store?.brand_primary_color || "#0F766E";
  const brandImageUrl = useMediaPreviewUrl(store?.avatar_asset_id ?? store?.logo_asset_id);
  const logoUrl = useMediaPreviewUrl(store?.logo_asset_id);
  const priorityAlerts = notifications.notifications.filter((item) => item.action_required).slice(0, 4);
  const unreadAlerts = notifications.notifications.filter((item) => item.action_required && !readIds.has(item.id)).length;
  const nextPosts = scheduledPosts.slice(0, 3);
  const activeCampaigns = campaigns.filter((campaign) => campaign.status === "active").slice(0, 4);
  const blockedWorkCount = priorityAlerts.length + queueCounts.failed + Number(!storeReady) + Number(!rubikaReady);
  const nextAction = priorityAlerts[0]
    ? { label: priorityAlerts[0].action_label, href: priorityAlerts[0].action_href, detail: priorityAlerts[0].title }
    : queueCounts.failed
      ? { label: "بازیابی خطاهای انتشار", href: "/queue", detail: `${queueCounts.failed} انتشار ناموفق منتظر رسیدگی است` }
      : !workspaceReady
        ? { label: "تکمیل کانال‌ها و هویت", href: "/onboarding", detail: "آماده‌سازی فقط تا زمان تکمیل مسیر نمایش داده می‌شود" }
        : nextPosts[0]
          ? { label: "بررسی انتشار بعدی", href: `/compose?postId=${nextPosts[0].id}`, detail: nextPosts[0].title }
          : draftCount
            ? { label: "تکمیل پیش‌نویس‌ها", href: "/content?status=draft", detail: `${draftCount} پیش‌نویس آماده تکمیل است` }
            : { label: "شروع محتوای جدید", href: "/compose", detail: "برنامه امروز هنوز محتوای آماده ندارد" };
  const briefing = priorityAlerts.length
    ? `${priorityAlerts.length} مورد عملیاتی پیش از ادامه برنامه انتشار نیازمند بررسی است.`
    : queueCounts.failed
      ? "چند انتشار ناموفق مانده است. بازیابی صف باید قبل از تولید محتوای جدید انجام شود."
      : nextPosts.length
        ? "برنامه امروز روشن است. انتشار بعدی و ریسک‌های کانال را از همین صفحه کنترل کنید."
        : activeCampaigns.length
          ? "کمپین‌ها فعال‌اند، اما برنامه انتشار نزدیک هنوز سبک است. محتوا را وارد تقویم کنید."
          : "فضای کاری آماده است. یک کمپین یا محتوای جدید برای شروع برنامه روزانه بسازید.";
  const healthTone = priorityAlerts.length || queueCounts.failed ? "alert" : workspaceReady ? "success" : "warning";
  const commandMetrics = [
    { label: "ریسک‌های باز", value: blockedWorkCount, detail: unreadAlerts ? `${unreadAlerts} اعلان تازه` : "خطا، آماده‌سازی یا هشدار", icon: AlertTriangle, tone: blockedWorkCount ? "alert" as const : "success" as const },
    { label: "انتشار آینده", value: queueCounts.scheduled, detail: "در تقویم و صف", icon: CalendarClock, tone: "warning" as const },
    { label: "کمپین فعال", value: activeCampaigns.length, detail: "در جریان امروز", icon: Megaphone, tone: "primary" as const },
    { label: "منتشر شده", value: publishedCount, detail: "خروجی موفق", icon: CheckCircle2, tone: "success" as const }
  ];
  const totalPosts = posts.length;
  const pendingApprovalCount = posts.filter((post) => ["pending", "changes_requested", "rejected"].includes(post.approval_status || "")).length;
  const manualReadyCount = statusCount(posts, "manual_ready");
  const completionRate = percent(publishedCount, Math.max(totalPosts - draftCount, 0));
  const failureRate = percent(queueCounts.failed, Math.max(queueTotal, 0));
  const averageAttempts = totalPosts ? (posts.reduce((sum, post) => sum + (post.attempt_count || 0), 0) / totalPosts).toFixed(1) : "0";
  const latestPublishedPost = posts
    .filter((post) => post.status === "published" && post.published_at)
    .sort((first, second) => dateTime(second.published_at) - dateTime(first.published_at))[0];
  const weekKeys = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return dayKey(date);
  });
  const weeklyActivity = weekKeys.map((key) => posts.filter((post) => {
    const date = dateFromPost(post);
    return date ? dayKey(date) === key : false;
  }).length);
  const weeklyLabels = weekKeys.map((key) => new Date(`${key}T00:00:00`).toLocaleDateString("fa-IR", { weekday: "short" }));
  const pipelineDistribution = [
    { label: "پیش‌نویس", value: draftCount, color: "#94A3B8" },
    { label: "آماده", value: queueCounts.ready, color: "#2563EB" },
    { label: "زمان‌بندی", value: queueCounts.scheduled, color: "#D97706" },
    { label: "دستی", value: manualReadyCount, color: "#7C3AED" },
    { label: "منتشر", value: publishedCount, color: "#059669" },
    { label: "ناموفق", value: queueCounts.failed, color: "#E11D48" }
  ];
  const pipelineTotal = pipelineDistribution.reduce((sum, item) => sum + item.value, 0);
  const channelCounts = posts.reduce<Record<string, number>>((acc, post) => {
    const key = post.platform?.trim() || "عمومی";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const channelItems = [
    { label: "روبیکا", value: channelCounts.rubika || channelCounts.Rubika || 0, healthy: rubikaReady, detail: rubikaReady ? "اتصال آماده" : "نیازمند تست اتصال" },
    { label: "اینستاگرام", value: channelCounts.instagram || channelCounts.Instagram || 0, healthy: false, detail: "حالت دستی/قابلیت محدود" },
    { label: "عمومی", value: channelCounts["عمومی"] || channelCounts.general || 0, healthy: true, detail: "بدون کانال مشخص" }
  ];
  const campaignPostTotal = activeCampaigns.reduce((sum, campaign) => sum + campaign.post_count, 0);
  const dashboardInsights = [
    queueCounts.failed
      ? { icon: AlertTriangle, title: "بازیابی قبل از تولید جدید", description: `${queueCounts.failed} آیتم ناموفق در صف وجود دارد. تا زمان بازیابی، سلامت انتشار پایین می‌ماند.`, tone: "alert" as const }
      : { icon: CheckCircle2, title: "انتشار پایدار", description: "خطای فعال در صف دیده نمی‌شود. تمرکز بعدی می‌تواند برنامه‌ریزی محتوا باشد.", tone: "success" as const },
    pendingApprovalCount
      ? { icon: MessageSquare, title: "بازبینی مسدودکننده", description: `${pendingApprovalCount} محتوا در وضعیت بازبینی یا اصلاح است و می‌تواند زمان‌بندی را عقب بیندازد.`, tone: "warning" as const }
      : { icon: MessageSquare, title: "بازبینی آرام", description: "مورد بازبینی مسدودکننده در داده فعلی دیده نمی‌شود.", tone: "primary" as const },
    !rubikaReady
      ? { icon: Network, title: "ریسک کانال", description: "کانال اصلی هنوز آماده نیست. کارت سلامت کانال باید قبل از انتشار جدی تکمیل شود.", tone: "warning" as const }
      : { icon: Network, title: "کانال اصلی آماده", description: "اتصال اصلی آماده است؛ قدم بعدی تکمیل مدل قابلیت برای همه کانال‌هاست.", tone: "success" as const }
  ];

  return (
    <AuthGate>
      <AppShell>
        <WorkspacePage className="space-y-5">
          <section className="overflow-hidden rounded-lg border border-app-border bg-white/95 shadow-soft backdrop-blur">
            <div className="border-b border-app-border px-4 py-3 sm:px-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <WorkspaceAvatar name={store?.name || "فضای کاری اجتماعی"} size="lg" color={brandColor} imageUrl={brandImageUrl} />
                    <div className="min-w-0">
                      <p className="app-section-kicker text-[10px] font-black">{productKicker}</p>
                      <h1 className="mt-1 text-2xl font-black leading-tight text-app-text sm:text-3xl">داشبورد نشرینو</h1>
                      <p className="mt-1 truncate text-xs font-bold text-app-muted">{store?.name || "فضای کاری اجتماعی"} · {store?.category || store?.brand_voice || "هویت برند نیازمند تکمیل"}</p>
                    </div>
                  </div>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-app-muted">{briefing}</p>
                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <StatusToken tone={healthTone} className="gap-1">
                    <Rocket className="h-3.5 w-3.5" aria-hidden="true" />
                    {priorityAlerts.length || queueCounts.failed ? "نیازمند رسیدگی" : workspaceReady ? "عملیات پایدار" : "تکمیل لازم"}
                  </StatusToken>
                  {!rubikaReady ? (
                    <StatusToken tone="warning" className="gap-1">
                      <PlugZap className="h-3.5 w-3.5" aria-hidden="true" />
                      کانال‌ها نیازمند بررسی
                    </StatusToken>
                  ) : null}
                  {lastUpdatedAt ? <StatusToken tone="neutral">به‌روزرسانی {lastUpdatedAt.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}</StatusToken> : null}
                </div>
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="grid grid-cols-3 gap-2 p-3 sm:gap-3 sm:p-4">
                <DashboardFocusItem label="اقدام بعدی" value={nextAction.label} detail={nextAction.detail} icon={Target} tone="primary" compact />
                <DashboardFocusItem label="صف فعال" value={queueTotal} detail="آماده، زمان‌بندی، انتشار و بازیابی" icon={TimerReset} tone={queueCounts.failed ? "alert" : "info"} compact />
                <DashboardFocusItem label="انتشار بعدی" value={nextPosts[0]?.scheduled_at ? formatDateTime(nextPosts[0].scheduled_at) : "بدون زمان‌بندی"} detail="نزدیک‌ترین پنجره برنامه" icon={CalendarClock} tone="warning" compact />
              </div>

              <div className="border-t border-app-border bg-slate-50/70 p-3 sm:p-4 lg:border-r lg:border-t-0">
                <div className="grid grid-cols-2 gap-2">
                  <Button href={nextAction.href} className="col-span-2 w-full">
                    {nextAction.label}
                    <ArrowUpLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button href="/calendar" variant="secondary" className="w-full">تقویم انتشار</Button>
                  <Button type="button" variant="ghost" className="w-full" disabled={refreshing} onClick={() => loadDashboard(true)}>
                    <RefreshCw className={`ml-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
                    به‌روزرسانی
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {error ? <NoticeBanner tone="alert">{error}</NoticeBanner> : null}
          {loading ? <Skeleton className="h-4 w-44" /> : null}

          <section className="grid grid-cols-4 gap-2 sm:gap-3">
            {commandMetrics.map((metric) => <CommandMetric key={metric.label} {...metric} />)}
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
            <DashboardCard
              title="نمای هوشمند امروز"
              description="خلاصه‌ای فشرده از سلامت تولید، زمان‌بندی و خروجی که روی یک لپ‌تاپ بدون اسکرول سنگین قابل خواندن است."
              action={<StatusToken tone="info">داشبورد عملیاتی</StatusToken>}
            >
              <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
                <DonutStatusChart items={pipelineDistribution} total={pipelineTotal} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <DashboardFocusItem label="نرخ تکمیل" value={`${completionRate}%`} detail="منتشرشده نسبت به محتوای غیرپیش‌نویس" icon={TrendingUp} tone={completionRate > 65 ? "info" : "warning"} compact />
                  <DashboardFocusItem label="نرخ خطا" value={`${failureRate}%`} detail="خطا نسبت به صف فعال" icon={AlertTriangle} tone={failureRate ? "alert" : "info"} compact />
                  <DashboardFocusItem label="میانگین تلاش" value={averageAttempts} detail="تعداد تلاش انتشار برای هر محتوا" icon={Activity} tone="info" compact />
                  <DashboardFocusItem label="آخرین خروجی" value={latestPublishedPost?.title || "بدون خروجی موفق"} detail={latestPublishedPost?.published_at ? formatDateTime(latestPublishedPost.published_at) : "بعد از اولین انتشار تکمیل می‌شود"} icon={CheckCircle2} tone="primary" compact />
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-app-border bg-white p-3 shadow-hairline">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black text-app-text">روند ۷ روزه</p>
                    <p className="mt-1 text-[11px] leading-5 text-app-muted">حجم تولید، زمان‌بندی یا انتشار ثبت‌شده</p>
                  </div>
                  <StatusToken tone={weeklyActivity.some(Boolean) ? "success" : "neutral"}>{weeklyActivity.reduce((sum, value) => sum + value, 0)} رویداد</StatusToken>
                </div>
                <MiniTrendChart values={weeklyActivity} labels={weeklyLabels} />
              </div>
            </DashboardCard>

            <DashboardCard
              title="سلامت و اقدام"
              description="فقط مواردی که امروز تصمیم‌گیری را جلو می‌برند."
              action={<Button href="/analytics" variant="secondary" size="sm">تحلیل کامل</Button>}
            >
              <div className="grid gap-3">
                {channelItems.map((channel) => (
                  <div key={channel.label} className="flex items-center justify-between gap-3 rounded-md border border-app-border bg-slate-50/70 px-3 py-2.5">
                    <span className="min-w-0">
                      <span className="block text-xs font-black text-app-text">{channel.label}</span>
                      <span className="mt-0.5 block truncate text-[11px] text-app-muted">{channel.detail}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${channel.healthy ? "bg-emerald-500" : "bg-amber-500"}`} />
                      <span className="text-sm font-black text-app-text">{channel.value}</span>
                    </span>
                  </div>
                ))}

                <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
                  <DashboardFocusItem label="کمپین فعال" value={campaignPostTotal} detail={`${activeCampaigns.length} کمپین در جریان`} icon={Megaphone} tone="primary" compact />
                  <DashboardFocusItem label="بازبینی" value={pendingApprovalCount} detail="مسدودکننده‌های احتمالی انتشار" icon={MessageSquare} tone={pendingApprovalCount ? "warning" : "info"} compact />
                  <DashboardFocusItem label="انتشار دستی" value={manualReadyCount} detail="وظایف آماده برای کانال‌های محدود" icon={Layers3} tone={manualReadyCount ? "warning" : "info"} compact />
                </div>

                <div className="grid gap-2">
                  {dashboardInsights.slice(0, 2).map((insight) => <InsightRow key={insight.title} {...insight} />)}
                </div>
              </div>
            </DashboardCard>
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
                ) : !workspaceReady ? (
                  <div className="divide-y divide-app-border">
                    {!storeReady ? (
                      <SetupNudge
                        title="هویت فضای کاری کامل نیست"
                        description="نام، دسته‌بندی و لحن برند باید قبل از گزارش و تولید حرفه‌ای کامل شود."
                        href="/store"
                        action="تکمیل هویت"
                      />
                    ) : null}
                    {!rubikaReady ? (
                      <SetupNudge
                        title="کانال اصلی نیازمند بررسی است"
                        description="تا زمانی که کانال تست نشده باشد، انتشار خودکار و بازیابی صف قابل اعتماد نیست."
                        href="/channels"
                        action="بررسی کانال‌ها"
                      />
                    ) : null}
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
                action={<Button href="/calendar" variant="secondary" size="sm">باز کردن تقویم</Button>}
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

              <WorkspacePanel
                title="کمپین‌های فعال"
                description="کمپین‌هایی که باید امروز محتوا، زمان‌بندی یا گزارش آن‌ها پیگیری شود."
                action={<Button href="/campaigns" variant="secondary" size="sm">مدیریت کمپین‌ها</Button>}
                bodyClassName="p-0"
              >
                {activeCampaigns.length ? (
                  <div className="divide-y divide-app-border">
                    {activeCampaigns.map((campaign) => (
                      <article key={campaign.id} className="app-row grid gap-3 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_150px] lg:items-center">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="h-3 w-3 rounded-full shadow-hairline" style={{ backgroundColor: campaign.color || "#0F766E" }} aria-hidden="true" />
                            <StatusToken tone="primary">فعال</StatusToken>
                            <StatusToken tone={campaign.post_count ? "success" : "warning"}>{campaign.post_count} محتوا</StatusToken>
                          </div>
                          <h3 className="mt-2 truncate font-black text-app-text">{campaign.name}</h3>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-app-muted">{campaign.goal || campaign.notes || "هدف کمپین هنوز ثبت نشده است."}</p>
                          <p className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold text-slate-400">
                            {campaign.owner ? <span>مالک: {campaign.owner}</span> : null}
                            {campaign.ends_at ? <span>پایان: {formatDateTime(campaign.ends_at)}</span> : null}
                          </p>
                        </div>
                        <Button href={`/campaigns?campaignId=${campaign.id}`} variant="secondary" size="sm">باز کردن</Button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="p-4">
                    <EmptyState
                      icon={<Target className="h-5 w-5" aria-hidden="true" />}
                      title="کمپین فعالی برای هدایت برنامه وجود ندارد."
                      description="برای حرفه‌ای شدن مسیر، محتوا باید زیر کمپین، هدف و KPI مشخص حرکت کند."
                      action={<Button href="/campaigns">ساخت کمپین</Button>}
                    />
                  </div>
                )}
              </WorkspacePanel>
            </div>

            <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
              <LiveOperations
                queueTotal={queueTotal}
                channelReady={rubikaReady}
                workspaceReady={workspaceReady}
                activeCampaigns={activeCampaigns.length}
                failedCount={queueCounts.failed}
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

              <WorkspacePanel title="میانبرهای عملیاتی" description="دسترسی کوتاه، بدون تکرار اقدام اصلی صفحه." bodyClassName="p-3">
                <div className="grid gap-2">
                  <Button href="/compose" variant="secondary">استودیوی تولید محتوا</Button>
                  <Button href="/content" variant="secondary">مرور محتوا و پیش‌نویس‌ها ({draftCount})</Button>
                  <Button href="/analytics" variant="secondary">تحلیل عملکرد</Button>
                  <Button href="/logs" variant="secondary">سلامت انتشار</Button>
                </div>
              </WorkspacePanel>
            </aside>
          </section>
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

function SetupNudge({
  title,
  description,
  href,
  action
}: {
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <article className="app-row grid gap-3 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_170px] lg:items-center">
      <div className="flex min-w-0 gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-amber-100 bg-amber-50 text-amber-700">
          <PlugZap className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-black text-app-text">{title}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-6 text-app-muted">{description}</p>
        </div>
      </div>
      <Button href={href} variant="secondary" size="sm">{action}</Button>
    </article>
  );
}
