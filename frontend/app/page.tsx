"use client";

import {
  Activity,
  AlertTriangle,
  ArrowUpLeft,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileText,
  Megaphone,
  MessageSquare,
  Network,
  PlugZap,
  RefreshCw,
  ShieldCheck,
  Target,
  TimerReset,
  TrendingUp
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/app-shell";
import { AuthGate } from "../components/auth-gate";
import { WorkspaceAvatar } from "../components/brand-mark";
import { Skeleton } from "../components/loading-skeleton";
import {
  NButton,
  NDonutChart,
  NEmptyState,
  NListItem,
  NMetricTile,
  NNotice,
  NPage,
  NSection,
  NStatusPill,
  NTrendBars
} from "../components/nahrino-ui";
import { Campaign, loadCampaigns } from "../lib/campaigns";
import { useMediaPreviewUrl } from "../lib/media-preview";
import {
  emptyOperationalNotifications,
  loadOperationalNotifications,
  loadReadNotificationIds,
  OperationalNotifications
} from "../lib/notifications";
import { apiUrl, authHeaders, formatDateTime, Post } from "../lib/posts";
import { productKicker, productName } from "../lib/product";
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

function compactDateTime(value?: string | null) {
  if (!value) return "بدون زمان";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "بدون زمان";
  return new Intl.DateTimeFormat("fa-IR", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short"
  }).format(date);
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
  const manualReadyCount = statusCount(posts, "manual_ready");
  const queueTotal = queueCounts.ready + queueCounts.scheduled + queueCounts.publishing + queueCounts.failed;
  const storeReady = isStoreConfigured(store);
  const rubikaReady = isRubikaConnected(rubika);
  const workspaceReady = storeReady && rubikaReady;
  const brandColor = store?.brand_primary_color || "#0B7771";
  const brandImageUrl = useMediaPreviewUrl(store?.avatar_asset_id ?? store?.logo_asset_id);
  const priorityAlerts = notifications.notifications.filter((item) => item.action_required).slice(0, 4);
  const unreadAlerts = notifications.notifications.filter((item) => item.action_required && !readIds.has(item.id)).length;
  const nextPosts = scheduledPosts.slice(0, 3);
  const activeCampaigns = campaigns.filter((campaign) => campaign.status === "active").slice(0, 4);
  const pendingApprovalCount = posts.filter((post) => ["pending", "changes_requested", "rejected"].includes(post.approval_status || "")).length;
  const blockedWorkCount = priorityAlerts.length + queueCounts.failed + pendingApprovalCount + Number(!storeReady) + Number(!rubikaReady);
  const completionRate = percent(publishedCount, Math.max(posts.length - draftCount, 0));
  const failureRate = percent(queueCounts.failed, Math.max(queueTotal, 0));
  const averageAttempts = posts.length ? (posts.reduce((sum, post) => sum + (post.attempt_count || 0), 0) / posts.length).toFixed(1) : "0";
  const latestPublishedPost = posts
    .filter((post) => post.status === "published" && post.published_at)
    .sort((first, second) => dateTime(second.published_at) - dateTime(first.published_at))[0];

  const nextAction = priorityAlerts[0]
    ? { label: priorityAlerts[0].action_label, href: priorityAlerts[0].action_href, detail: priorityAlerts[0].title }
    : queueCounts.failed
      ? { label: "بازیابی صف انتشار", href: "/queue", detail: `${queueCounts.failed} انتشار ناموفق منتظر بررسی است` }
      : pendingApprovalCount
        ? { label: "بازبینی محتوا", href: "/content?approval=pending", detail: `${pendingApprovalCount} محتوا پشت گیت تایید مانده است` }
        : !workspaceReady
          ? { label: "تکمیل راه‌اندازی", href: "/onboarding", detail: "آماده‌سازی فقط تا زمان تکمیل مسیر نمایش داده می‌شود" }
          : nextPosts[0]
            ? { label: "بررسی انتشار بعدی", href: `/compose?postId=${nextPosts[0].id}`, detail: nextPosts[0].title }
            : draftCount
              ? { label: "تکمیل پیش‌نویس‌ها", href: "/content?status=draft", detail: `${draftCount} پیش‌نویس آماده تکمیل است` }
              : { label: "ساخت پست تازه", href: "/compose", detail: "برنامه نزدیک هنوز محتوای کافی ندارد" };

  const briefing = priorityAlerts.length
    ? `${priorityAlerts.length} هشدار عملیاتی قبل از ادامه برنامه انتشار نیازمند رسیدگی است.`
    : queueCounts.failed
      ? "صف انتشار خطای فعال دارد؛ اول بازیابی، بعد تولید محتوای جدید."
      : nextPosts.length
        ? "برنامه نزدیک روشن است. وضعیت کانال، کمپین و صف را از همین نما کنترل کنید."
        : activeCampaigns.length
          ? "کمپین‌ها فعال‌اند اما تقویم نزدیک سبک است. محتوا را وارد برنامه کنید."
          : "فضای کاری آماده تصمیم است. یک محتوا یا کمپین تازه می‌تواند برنامه امروز را فعال کند.";

  const healthTone = priorityAlerts.length || queueCounts.failed || pendingApprovalCount ? "alert" : workspaceReady ? "success" : "warning";
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
    { label: "اینستاگرام", value: channelCounts.instagram || channelCounts.Instagram || 0, healthy: false, detail: "انتشار محدود به حساب حرفه‌ای" },
    { label: "عمومی", value: channelCounts["عمومی"] || channelCounts.general || 0, healthy: true, detail: "بدون کانال مشخص" }
  ];
  const dashboardInsights = [
    queueCounts.failed
      ? { icon: AlertTriangle, title: "بازیابی قبل از تولید", description: `${queueCounts.failed} آیتم ناموفق در صف وجود دارد.`, tone: "alert" as const, href: "/queue" }
      : { icon: ShieldCheck, title: "صف پایدار", description: "خطای فعال در صف دیده نمی‌شود.", tone: "success" as const, href: "/queue" },
    pendingApprovalCount
      ? { icon: MessageSquare, title: "بازبینی مسدودکننده", description: `${pendingApprovalCount} محتوا منتظر تایید یا اصلاح است.`, tone: "warning" as const, href: "/content?approval=pending" }
      : { icon: MessageSquare, title: "بازبینی آرام", description: "مورد بازبینی مسدودکننده دیده نمی‌شود.", tone: "primary" as const, href: "/content" },
    !rubikaReady
      ? { icon: Network, title: "ریسک کانال", description: "کانال اصلی هنوز آماده انتشار نیست.", tone: "warning" as const, href: "/channels" }
      : { icon: Network, title: "کانال اصلی آماده", description: "اتصال اصلی برای انتشار آماده است.", tone: "success" as const, href: "/channels" }
  ];

  return (
    <AuthGate>
      <AppShell>
        <NPage className="pb-6">
          <section className="nahrino-product-hero overflow-hidden rounded-2xl">
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.72fr)]">
              <div className="relative z-10 min-w-0 p-4 sm:p-5 lg:p-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-3">
                      <WorkspaceAvatar name={store?.name || productName} size="lg" color={brandColor} imageUrl={brandImageUrl} />
                      <div className="min-w-0">
                        <p className="app-section-kicker text-[10px] font-black">{productKicker}</p>
                        <h1 className="mt-1 text-2xl font-black leading-tight text-app-text sm:text-4xl">داشبورد</h1>
                        <p className="mt-1 truncate text-xs font-bold text-app-muted">{store?.name || "فضای کاری اجتماعی"} · {store?.category || store?.brand_voice || "مدیریت چندکاناله محتوا"}</p>
                      </div>
                    </div>
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-app-muted">{briefing}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    <NStatusPill tone={healthTone}>
                      {healthTone === "success" ? "عملیات پایدار" : healthTone === "warning" ? "آماده‌سازی لازم" : "نیازمند رسیدگی"}
                    </NStatusPill>
                    <NStatusPill tone={rubikaReady ? "success" : "warning"}>{rubikaReady ? "کانال اصلی آماده" : "کانال نیازمند بررسی"}</NStatusPill>
                    {lastUpdatedAt ? <NStatusPill tone="neutral">به‌روزرسانی {lastUpdatedAt.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}</NStatusPill> : null}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                  <div className="nahrino-card-muted rounded-xl p-3">
                    <div className="flex items-start gap-3">
                      <span className="nahrino-live-signal mt-1 h-3 w-3 shrink-0 rounded-full bg-app-primary" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-app-primary">اقدام پیشنهادی سیستم</p>
                        <h2 className="mt-1 line-clamp-1 text-base font-black text-app-text">{nextAction.label}</h2>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-app-muted">{nextAction.detail}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <NButton href={nextAction.href}>
                      ادامه اقدام
                      <ArrowUpLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                    </NButton>
                    <NButton type="button" variant="secondary" disabled={refreshing} onClick={() => loadDashboard(true)}>
                      <RefreshCw className={`ml-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
                      تازه‌سازی
                    </NButton>
                  </div>
                </div>
              </div>

              <aside className="hidden p-3 lg:block">
                <div className="nahrino-product-visual h-full min-h-[292px]">
                  <img
                    src="/brand/nahrino-command-visual.png"
                    alt="نمای تصویری عملیات چندکاناله نشرینو"
                    className="nahrino-command-art absolute inset-0 h-full w-full object-cover opacity-90"
                  />
                  <div className="nahrino-visual-chip absolute right-4 top-4 rounded-lg px-3 py-2">
                    <p className="text-[10px] font-black text-app-muted">مرکز عملیات</p>
                    <p className="mt-1 text-sm font-black text-app-text">چندکاناله فارسی</p>
                  </div>
                  <div className="nahrino-visual-chip absolute bottom-4 left-4 right-4 rounded-xl p-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-black text-app-text">{queueCounts.scheduled}</p>
                        <p className="text-[10px] font-bold text-app-muted">زمان‌بندی</p>
                      </div>
                      <div>
                        <p className="text-lg font-black text-app-text">{activeCampaigns.length}</p>
                        <p className="text-[10px] font-bold text-app-muted">کمپین</p>
                      </div>
                      <div>
                        <p className="text-lg font-black text-app-text">{blockedWorkCount}</p>
                        <p className="text-[10px] font-bold text-app-muted">ریسک</p>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </section>

          {error ? <NNotice tone="alert">{error}</NNotice> : null}
          {loading ? <Skeleton className="h-4 w-44" /> : null}

          <section className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
            <NMetricTile label="انتشار بعدی" value={compactDateTime(nextPosts[0]?.scheduled_at)} detail={nextPosts[0]?.title || "برای برنامه، تقویم را کامل کنید"} icon={CalendarClock} tone="warning" href="/calendar" />
            <NMetricTile label="ریسک امروز" value={blockedWorkCount} detail={unreadAlerts ? `${unreadAlerts} اعلان تازه` : "هشدار، خطا یا بازبینی"} icon={AlertTriangle} tone={blockedWorkCount ? "alert" : "success"} href="/inbox" />
            <NMetricTile label="صف فعال" value={queueTotal} detail="آماده، زمان‌بندی و انتشار" icon={TimerReset} tone={queueCounts.failed ? "alert" : "info"} href="/content" />
            <NMetricTile label="کمپین فعال" value={activeCampaigns.length} detail="کمپین‌های در جریان" icon={Megaphone} tone="primary" href="/campaigns?status=active" />
          </section>

          <section className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
            <NSection
              title="نمای عملیات امروز"
              description="روند، ترکیب صف و کیفیت اجرای محتوا در یک بخش فشرده."
              action={<NStatusPill tone="info">نمای تصمیم‌ساز</NStatusPill>}
            >
              <div className="grid gap-4 lg:grid-cols-[170px_minmax(0,1fr)] 2xl:grid-cols-[180px_minmax(0,1fr)_260px] lg:items-stretch">
                <div className="hidden sm:block">
                  <NDonutChart items={pipelineDistribution} total={pipelineTotal} label="محتوا" />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <NMetricTile label="نرخ تکمیل" value={`${completionRate}%`} detail="منتشرشده نسبت به محتوای قابل اجرا" icon={TrendingUp} tone={completionRate > 65 ? "success" : "warning"} />
                  <NMetricTile label="نرخ خطا" value={`${failureRate}%`} detail="خطا نسبت به صف فعال" icon={AlertTriangle} tone={failureRate ? "alert" : "success"} />
                  <NMetricTile label="میانگین تلاش" value={averageAttempts} detail="تلاش انتشار برای هر محتوا" icon={Activity} tone="info" />
                  <NMetricTile label="آخرین خروجی" value={latestPublishedPost?.title || "بدون خروجی"} detail={latestPublishedPost?.published_at ? formatDateTime(latestPublishedPost.published_at) : "بعد از اولین انتشار تکمیل می‌شود"} icon={CheckCircle2} tone="primary" />
                </div>
                <div className="hidden rounded-lg border border-app-border bg-app-surfaceMuted p-3 md:block lg:col-span-2 2xl:col-span-1">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black text-app-text">روند ۷ روزه</p>
                      <p className="mt-1 text-[11px] leading-5 text-app-muted">ساخت، زمان‌بندی یا انتشار</p>
                    </div>
                    <NStatusPill tone={weeklyActivity.some(Boolean) ? "success" : "neutral"}>{weeklyActivity.reduce((sum, value) => sum + value, 0)}</NStatusPill>
                  </div>
                  <NTrendBars values={weeklyActivity} labels={weeklyLabels} />
                </div>
              </div>
            </NSection>

            <NSection
              title="اولویت‌های عملیاتی"
              description="فقط مواردی که تصمیم امروز را تغییر می‌دهند."
              action={<NButton href="/inbox" variant="secondary" size="sm">پیام‌ها</NButton>}
            >
              <div className="grid gap-2">
                {priorityAlerts.length ? (
                  priorityAlerts.slice(0, 3).map((alert) => (
                    <NListItem
                      key={alert.id}
                      icon={alert.severity === "critical" ? CircleAlert : alert.severity === "warning" ? AlertTriangle : CheckCircle2}
                      title={alert.title}
                      detail={alert.description}
                      href={alert.action_href}
                      tone={alert.severity === "critical" ? "alert" : alert.severity === "warning" ? "warning" : "success"}
                      meta={<NStatusPill tone={alert.severity === "critical" ? "alert" : "warning"}>{alert.action_label}</NStatusPill>}
                    />
                  ))
                ) : !workspaceReady ? (
                  <>
                    {!storeReady ? <NListItem icon={Target} title="هویت فضای کاری کامل نیست" detail="نام، دسته‌بندی و لحن برند را کامل کنید." href="/store" tone="warning" /> : null}
                    {!rubikaReady ? <NListItem icon={PlugZap} title="کانال اصلی آماده نیست" detail="اتصال کانال‌ها قبل از انتشار جدی بررسی شود." href="/channels" tone="warning" /> : null}
                  </>
                ) : (
                  <NEmptyState icon={CheckCircle2} title="مورد فوری وجود ندارد" detail="صف، اتصال و آماده‌سازی در وضعیت قابل قبول هستند." />
                )}

                {dashboardInsights.map((insight) => (
                  <NListItem key={insight.title} icon={insight.icon} title={insight.title} detail={insight.description} tone={insight.tone} href={insight.href} />
                ))}
              </div>
            </NSection>
          </section>

          <section className="hidden gap-3 md:grid md:grid-cols-3">
            <NSection title="کانال‌ها" description="سلامت کانال‌ها بدون رفتن به تنظیمات." action={<NButton href="/channels" variant="secondary" size="sm">مدیریت</NButton>}>
              <div className="grid gap-2">
                {channelItems.map((channel) => (
                  <NListItem
                    key={channel.label}
                    icon={Network}
                    title={channel.label}
                    detail={channel.detail}
                    tone={channel.healthy ? "success" : "warning"}
                    href="/channels"
                    meta={<NStatusPill tone={channel.healthy ? "success" : "warning"}>{channel.value}</NStatusPill>}
                  />
                ))}
              </div>
            </NSection>

            <NSection title="کمپین‌ها" description="کمپین‌های فعال و جهت حرکت امروز." action={<NButton href="/campaigns" variant="secondary" size="sm">باز کردن</NButton>}>
              <div className="grid gap-2">
                {activeCampaigns.length ? activeCampaigns.slice(0, 3).map((campaign) => (
                  <NListItem
                    key={campaign.id}
                    icon={Megaphone}
                    title={campaign.name}
                    detail={campaign.goal || campaign.notes || "کمپین فعال بدون خلاصه"}
                    tone="primary"
                    href={`/campaigns?campaignId=${campaign.id}`}
                    meta={<NStatusPill tone="primary">فعال</NStatusPill>}
                  />
                )) : (
                  <NEmptyState icon={Megaphone} title="کمپین فعالی نیست" detail="برای برنامه‌ریزی منظم، یک کمپین تازه بسازید." />
                )}
              </div>
            </NSection>

            <NSection title="بینش سریع" description="سیگنال‌های کوتاه برای ادامه کار." action={<NButton href="/analytics" variant="secondary" size="sm">گزارش‌ها</NButton>}>
              <div className="grid gap-2">
                <NListItem icon={BarChart3} title="کارایی انتشار" detail={`${completionRate}% تکمیل و ${failureRate}% خطا در داده فعلی`} tone={failureRate ? "warning" : "success"} href="/analytics" />
                <NListItem icon={Clock3} title="برنامه نزدیک" detail={nextPosts[0]?.scheduled_at ? compactDateTime(nextPosts[0].scheduled_at) : "زمان‌بندی بعدی هنوز مشخص نیست"} tone="warning" href="/calendar" />
                <NListItem icon={FileText} title="محتوای خام" detail={`${draftCount} پیش‌نویس و ${manualReadyCount} آماده دستی`} tone="info" href="/content" />
              </div>
            </NSection>
          </section>
        </NPage>
      </AppShell>
    </AuthGate>
  );
}
