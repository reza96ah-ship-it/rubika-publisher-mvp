"use client";

import {
  Activity,
  AlertTriangle,
  ArrowUpLeft,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Megaphone,
  MessageSquare,
  Network,
  PlugZap,
  RefreshCw,
  Rocket,
  Target,
  TimerReset,
  TrendingUp
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthGate } from "../components/auth-gate";
import { AppShell } from "../components/app-shell";
import { WorkspaceAvatar } from "../components/brand-mark";
import { Skeleton } from "../components/loading-skeleton";
import {
  NActionTile,
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
import {
  emptyOperationalNotifications,
  loadOperationalNotifications,
  loadReadNotificationIds,
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
      if (!response.ok) throw new Error("دریافت نمای امروز ناموفق بود");
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
      setError(err instanceof Error ? err.message : "خطا در دریافت نمای امروز");
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
    { label: "ریسک‌های باز", value: blockedWorkCount, detail: unreadAlerts ? `${unreadAlerts} اعلان تازه` : "خطا، آماده‌سازی یا هشدار", icon: AlertTriangle, tone: blockedWorkCount ? "alert" as const : "success" as const, href: "/inbox" },
    { label: "انتشار آینده", value: queueCounts.scheduled, detail: "در تقویم و صف", icon: CalendarClock, tone: "warning" as const, href: "/calendar" },
    { label: "کمپین فعال", value: activeCampaigns.length, detail: "در جریان امروز", icon: Megaphone, tone: "primary" as const, href: "/campaigns?status=active" },
    { label: "منتشر شده", value: publishedCount, detail: "خروجی موفق", icon: CheckCircle2, tone: "success" as const, href: "/content?status=published" }
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
        <NPage className="pb-6">
          <section className="nahrino-home-hero overflow-hidden rounded-2xl">
            <div className="grid gap-0 lg:grid-cols-[minmax(0,0.96fr)_minmax(360px,0.72fr)]">
              <div className="relative z-10 min-w-0 p-4 sm:p-5 lg:p-7">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-3">
                      <WorkspaceAvatar name={store?.name || "فضای کاری اجتماعی"} size="lg" color={brandColor} imageUrl={brandImageUrl} />
                      <div className="min-w-0">
                        <p className="app-section-kicker text-[10px] font-black">{productKicker}</p>
                        <h1 className="mt-1 text-3xl font-black leading-tight text-app-text sm:text-4xl">امروز نشرینو</h1>
                        <p className="mt-1 truncate text-xs font-bold text-app-muted">{store?.name || "فضای کاری اجتماعی"} · {store?.category || store?.brand_voice || "هویت برند نیازمند تکمیل"}</p>
                      </div>
                    </div>
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-app-muted">{briefing}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    <NStatusPill tone={healthTone} className="gap-1">
                      <Rocket className="h-3.5 w-3.5" aria-hidden="true" />
                      {priorityAlerts.length || queueCounts.failed ? "نیازمند رسیدگی" : workspaceReady ? "عملیات پایدار" : "تکمیل لازم"}
                    </NStatusPill>
                    {!rubikaReady ? (
                      <NStatusPill tone="warning" className="gap-1">
                        <PlugZap className="h-3.5 w-3.5" aria-hidden="true" />
                        کانال‌ها نیازمند بررسی
                      </NStatusPill>
                    ) : null}
                    {lastUpdatedAt ? <NStatusPill tone="neutral">به‌روزرسانی {lastUpdatedAt.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}</NStatusPill> : null}
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2 rounded-full border border-teal-200/80 bg-white/70 px-3 py-2 text-xs font-bold text-app-muted shadow-hairline sm:w-fit">
                  <span className="nahrino-live-signal h-2.5 w-2.5 rounded-full bg-[#0b7771]" />
                  جریان زنده عملیات محتوا
                  <span className="hidden text-slate-300 sm:inline">/</span>
                  <span className="hidden text-app-text sm:inline">ریسک، انتشار، کمپین و پیام‌ها</span>
                </div>

                <div className="mt-5 grid gap-2 sm:grid-cols-3">
                  <NActionTile label="اقدام بعدی" value={nextAction.label} detail={nextAction.detail} icon={Target} tone="primary" compact href={nextAction.href} />
                  <NActionTile label="صف فعال" value={queueTotal} detail="آماده، زمان‌بندی، انتشار و بازیابی" icon={TimerReset} tone={queueCounts.failed ? "alert" : "info"} compact href="/content" />
                  <NActionTile label="انتشار بعدی" value={nextPosts[0]?.scheduled_at ? formatDateTime(nextPosts[0].scheduled_at) : "بدون زمان‌بندی"} detail="باز کردن برنامه انتشار" icon={CalendarClock} tone="warning" compact href="/calendar" />
                </div>
              </div>

              <aside className="border-t border-app-border/70 p-3 sm:p-4 lg:border-r lg:border-t-0">
                <div className="nahrino-art-stage min-h-[280px] sm:min-h-[340px] lg:h-full lg:min-h-[400px]">
                  <img
                    src="/brand/nahrino-command-visual.png"
                    alt="نمای تصویری عملیات محتوا و برنامه‌ریزی نشرینو"
                    className="nahrino-command-art absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute right-4 top-4 rounded-full border border-white/70 bg-white/82 px-3 py-1.5 text-[10px] font-black text-[#102a2a] shadow-hairline backdrop-blur">
                    SocialOps فارسی
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/70 bg-white/86 p-3 shadow-[0_18px_34px_rgba(24,33,47,0.14)] backdrop-blur-md">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-app-primary">مسیر فوری</p>
                        <h2 className="mt-1 line-clamp-2 text-base font-black text-app-text">{nextAction.label}</h2>
                        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-app-muted">{nextAction.detail}</p>
                      </div>
                      <span className="nahrino-live-signal mt-1 h-3 w-3 shrink-0 rounded-full bg-[#0b7771]" />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <NButton href={nextAction.href} className="col-span-2 w-full">
                        ادامه اقدام
                        <ArrowUpLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                      </NButton>
                      <NButton href="/compose" variant="secondary" className="w-full">ساخت</NButton>
                      <NButton type="button" variant="quiet" className="w-full" disabled={refreshing} onClick={() => loadDashboard(true)}>
                        <RefreshCw className={`ml-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
                        تازه‌سازی
                      </NButton>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </section>

          {error ? <NNotice tone="alert">{error}</NNotice> : null}
          {loading ? <Skeleton className="h-4 w-44" /> : null}

          <section className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
            {commandMetrics.map((metric) => <NMetricTile key={metric.label} {...metric} />)}
          </section>

          <section className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
            <NSection
              title="نبض عملیات"
              description="وضعیت انتشار، روند هفته و کیفیت صف در یک نمای تصمیم‌ساز."
              action={<NStatusPill tone="info">نمای عملیاتی امروز</NStatusPill>}
            >
              <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)] 2xl:grid-cols-[200px_minmax(0,1fr)_280px] lg:items-stretch">
                <div className="hidden sm:block">
                  <NDonutChart items={pipelineDistribution} total={pipelineTotal} label="کل محتوا" />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <NActionTile label="نرخ تکمیل" value={`${completionRate}%`} detail="منتشرشده نسبت به محتوای غیرپیش‌نویس" icon={TrendingUp} tone={completionRate > 65 ? "info" : "warning"} compact />
                  <NActionTile label="نرخ خطا" value={`${failureRate}%`} detail="خطا نسبت به صف فعال" icon={AlertTriangle} tone={failureRate ? "alert" : "info"} compact />
                  <NActionTile label="میانگین تلاش" value={averageAttempts} detail="تعداد تلاش انتشار برای هر محتوا" icon={Activity} tone="info" compact />
                  <NActionTile label="آخرین خروجی" value={latestPublishedPost?.title || "بدون خروجی موفق"} detail={latestPublishedPost?.published_at ? formatDateTime(latestPublishedPost.published_at) : "بعد از اولین انتشار تکمیل می‌شود"} icon={CheckCircle2} tone="primary" compact />
                </div>
                <div className="nahrino-card hidden rounded-lg p-3 md:block lg:col-span-2 2xl:col-span-1">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black text-app-text">روند ۷ روزه</p>
                      <p className="mt-1 text-[11px] leading-5 text-app-muted">تولید، زمان‌بندی یا انتشار</p>
                    </div>
                    <NStatusPill tone={weeklyActivity.some(Boolean) ? "success" : "neutral"}>{weeklyActivity.reduce((sum, value) => sum + value, 0)}</NStatusPill>
                  </div>
                  <NTrendBars values={weeklyActivity} labels={weeklyLabels} />
                </div>
              </div>
            </NSection>

            <NSection
              title="صف اقدام"
              description="فقط مانع‌های مهم؛ جزئیات کامل داخل پیام‌ها و محتوا."
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
                    {!storeReady ? (
                      <NListItem icon={Target} title="هویت فضای کاری کامل نیست" detail="نام، دسته‌بندی و لحن برند را کامل کنید." href="/store" tone="warning" />
                    ) : null}
                    {!rubikaReady ? (
                      <NListItem icon={PlugZap} title="کانال اصلی آماده نیست" detail="اتصال کانال‌ها قبل از انتشار جدی بررسی شود." href="/channels" tone="warning" />
                    ) : null}
                  </>
                ) : (
                  <NEmptyState icon={CheckCircle2} title="مورد فوری وجود ندارد" detail="صف، اتصال و آماده‌سازی در وضعیت قابل قبول هستند." />
                )}
                <NListItem
                  icon={dashboardInsights[0].icon}
                  title={dashboardInsights[0].title}
                  detail={dashboardInsights[0].description}
                  tone={dashboardInsights[0].tone}
                  href={queueCounts.failed ? "/queue" : "/analytics"}
                />
              </div>
            </NSection>
          </section>

          <section className="hidden gap-3 md:grid lg:grid-cols-2 xl:grid-cols-3">
            <NSection
              title="کانال‌ها"
              description="سلامت کانال‌ها بدون رفتن به تنظیمات."
              action={<NButton href="/channels" variant="secondary" size="sm">مدیریت</NButton>}
            >
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

            <NSection
              title="کمپین‌ها"
              description="کمپین‌های فعال و جهت حرکت امروز."
              action={<NButton href="/campaigns" variant="secondary" size="sm">باز کردن</NButton>}
            >
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

            <NSection
              title="بینش سریع"
              description="یک تصمیم روشن برای ادامه روز."
              action={<NButton href="/analytics" variant="secondary" size="sm">گزارش‌ها</NButton>}
            >
              <div className="grid gap-2">
                {dashboardInsights.slice(1, 3).map((insight) => (
                  <NListItem
                    key={insight.title}
                    icon={insight.icon}
                    title={insight.title}
                    detail={insight.description}
                    tone={insight.tone}
                    href="/analytics"
                  />
                ))}
              </div>
            </NSection>
          </section>
        </NPage>
      </AppShell>
    </AuthGate>
  );
}
