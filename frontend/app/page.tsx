"use client";

import Link from "next/link";
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
  NMetricTile,
  NNotice,
  NPage,
  NRow,
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
import { productName } from "../lib/product";
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
  const brandColor = store?.brand_primary_color;
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
    { label: "پیش‌نویس", value: draftCount, color: "rgb(var(--n-chart-draft))" },
    { label: "آماده", value: queueCounts.ready, color: "rgb(var(--n-chart-ready))" },
    { label: "زمان‌بندی", value: queueCounts.scheduled, color: "rgb(var(--n-chart-scheduled))" },
    { label: "دستی", value: manualReadyCount, color: "rgb(var(--n-chart-manual))" },
    { label: "منتشر", value: publishedCount, color: "rgb(var(--n-chart-published))" },
    { label: "ناموفق", value: queueCounts.failed, color: "rgb(var(--n-chart-failed))" }
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
  const topMetrics = [
    {
      label: "انتشار بعدی",
      value: compactDateTime(nextPosts[0]?.scheduled_at),
      detail: nextPosts[0]?.title || "تقویم هنوز سبک است",
      icon: CalendarClock,
      tone: "warning" as const,
      href: "/calendar"
    },
    {
      label: "نیازمند رسیدگی",
      value: blockedWorkCount,
      detail: unreadAlerts ? `${unreadAlerts} اعلان تازه` : "خطا، هشدار یا بازبینی",
      icon: AlertTriangle,
      tone: blockedWorkCount ? "alert" as const : "success" as const,
      href: "/inbox"
    },
    {
      label: "صف فعال",
      value: queueTotal,
      detail: "آماده، زمان بندی و انتشار",
      icon: TimerReset,
      tone: queueCounts.failed ? "alert" as const : "info" as const,
      href: "/content"
    },
    {
      label: "کمپین فعال",
      value: activeCampaigns.length,
      detail: "کمپین های در جریان",
      icon: Megaphone,
      tone: "primary" as const,
      href: "/campaigns?status=active"
    }
  ];
  const timelineItems = nextPosts.length
    ? nextPosts.slice(0, 3).map((post) => ({
      id: `post-${post.id}`,
      title: post.title,
      detail: compactDateTime(post.scheduled_at),
      href: `/compose?postId=${post.id}`,
      tone: "warning" as const,
      icon: CalendarClock,
      meta: "زمان بندی"
    }))
    : activeCampaigns.slice(0, 3).map((campaign) => ({
      id: `campaign-${campaign.id}`,
      title: campaign.name,
      detail: campaign.goal || campaign.notes || "کمپین فعال بدون خلاصه",
      href: `/campaigns?campaignId=${campaign.id}`,
      tone: "primary" as const,
      icon: Megaphone,
      meta: "کمپین"
    }));
  const decisionItems = priorityAlerts.length
    ? priorityAlerts.slice(0, 3).map((alert) => ({
      id: alert.id,
      icon: alert.severity === "critical" ? CircleAlert : alert.severity === "warning" ? AlertTriangle : CheckCircle2,
      title: alert.title,
      detail: alert.description,
      href: alert.action_href,
      tone: alert.severity === "critical" ? "alert" as const : alert.severity === "warning" ? "warning" as const : "success" as const,
      meta: alert.action_label
    }))
    : dashboardInsights.map((insight) => ({
      id: insight.title,
      icon: insight.icon,
      title: insight.title,
      detail: insight.description,
      href: insight.href,
      tone: insight.tone,
      meta: insight.tone === "success" ? "پایدار" : insight.tone === "warning" ? "بررسی" : "اقدام"
    }));
  const statusLabels: Record<string, string> = {
    draft: "پیش‌نویس",
    ready: "آماده",
    scheduled: "زمان‌بندی",
    publishing: "در انتشار",
    published: "منتشر",
    manual_ready: "دستی",
    failed: "ناموفق"
  };
  const contentPreviewItems = [...posts]
    .sort((first, second) => dateTime(second.updated_at || second.created_at) - dateTime(first.updated_at || first.created_at))
    .slice(0, 3)
    .map((post) => ({
      id: post.id,
      title: post.title || "محتوای بدون عنوان",
      caption: post.caption || post.internal_note || "متن کوتاه این محتوا هنوز تکمیل نشده است.",
      href: `/compose?postId=${post.id}`,
      channel: post.platform?.trim() || "چندکاناله",
      status: statusLabels[post.status] || post.status || "نامشخص",
      time: compactDateTime(post.scheduled_at || post.published_at || post.updated_at || post.created_at),
      tone: post.status === "failed" ? "alert" as const : post.status === "published" ? "success" as const : post.status === "scheduled" ? "warning" as const : "primary" as const
    }));

  return (
    <AuthGate>
      <AppShell>
        <NPage className="pb-5">
          <section className="dashboard-command-surface overflow-hidden rounded-xl border border-app-border bg-app-surface p-3 shadow-soft sm:p-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-stretch">
              <div className="min-w-0">
                <div className="flex min-w-0 items-start gap-3">
                  <WorkspaceAvatar name={store?.name || productName} size="lg" color={brandColor} imageUrl={brandImageUrl} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="app-section-kicker text-[10px] font-black">داشبورد امروز</p>
                      <NStatusPill tone={healthTone}>
                        {healthTone === "success" ? "پایدار" : healthTone === "warning" ? "آماده سازی" : "رسیدگی"}
                      </NStatusPill>
                      {lastUpdatedAt ? <NStatusPill tone="neutral">{lastUpdatedAt.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}</NStatusPill> : null}
                    </div>
                    <h1 className="mt-2 text-2xl font-black leading-tight text-app-text sm:text-3xl">داشبورد</h1>
                    <p className="mt-1 truncate text-xs font-bold text-app-muted">{store?.name || "فضای کاری اجتماعی"} · {store?.category || store?.brand_voice || "مدیریت چندکاناله محتوا"}</p>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-app-muted">{briefing}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-app-primary/15 bg-app-soft/80 p-3">
                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="nahrino-live-signal mt-1 h-3 w-3 shrink-0 rounded-full bg-app-primary" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-app-primary">اقدام بعدی</p>
                        <h2 className="mt-1 line-clamp-1 text-base font-black text-app-text">{nextAction.label}</h2>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-app-muted">{nextAction.detail}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <NButton href={nextAction.href} trailingIcon={ArrowUpLeft}>ادامه</NButton>
                      <NButton type="button" variant="secondary" icon={RefreshCw} loading={refreshing} onClick={() => loadDashboard(true)}>
                        تازه سازی
                      </NButton>
                    </div>
                  </div>
                </div>

                <div className="dashboard-content-preview mt-3 grid gap-2 sm:grid-cols-3" aria-label="نمای زنده محتوا">
                  {contentPreviewItems.length ? contentPreviewItems.map((item, index) => (
                    <Link key={item.id} href={item.href} className="dashboard-preview-card app-interactive group rounded-lg p-2.5" style={{ animationDelay: `${index * 80}ms` }}>
                      <span className="flex items-center justify-between gap-2">
                        <span className="min-w-0 truncate text-[10px] font-black text-app-primary">{item.channel}</span>
                        <NStatusPill tone={item.tone}>{item.status}</NStatusPill>
                      </span>
                      <strong className="mt-2 block truncate text-sm font-black text-app-text">{item.title}</strong>
                      <span className="mt-1 block line-clamp-2 text-[11px] leading-5 text-app-muted">{item.caption}</span>
                      <span className="mt-2 flex items-center justify-between gap-2 text-[10px] font-black text-app-muted">
                        <span>{item.time}</span>
                        <ArrowUpLeft className="h-3.5 w-3.5 shrink-0 opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
                      </span>
                    </Link>
                  )) : (
                    <div className="dashboard-preview-card rounded-lg p-2.5 sm:col-span-3">
                      <p className="text-xs font-black text-app-text">هنوز محتوایی برای نمایش زنده وجود ندارد</p>
                      <p className="mt-1 text-[11px] leading-5 text-app-muted">اولین پیش‌نویس، این بخش را به مسیر کاری واقعی تبدیل می‌کند.</p>
                    </div>
                  )}
                </div>
              </div>

              <aside className="dashboard-frost-panel rounded-xl p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-app-text">نمای زنده کار</p>
                    <p className="mt-1 text-[11px] leading-5 text-app-muted">صف، ریسک و خروجی هفته</p>
                  </div>
                  <NStatusPill tone={rubikaReady ? "success" : "warning"}>{rubikaReady ? "کانال آماده" : "کانال ناقص"}</NStatusPill>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="dashboard-live-stat rounded-lg border border-app-border bg-app-surface/80 p-2 text-center shadow-hairline">
                    <p className="text-lg font-black text-app-text">{publishedCount}</p>
                    <p className="mt-1 truncate text-[10px] font-bold text-app-muted">منتشر</p>
                  </div>
                  <div className="dashboard-live-stat rounded-lg border border-app-border bg-app-surface/80 p-2 text-center shadow-hairline">
                    <p className="text-lg font-black text-app-text">{queueTotal}</p>
                    <p className="mt-1 truncate text-[10px] font-bold text-app-muted">در صف</p>
                  </div>
                  <div className="dashboard-live-stat rounded-lg border border-app-border bg-app-surface/80 p-2 text-center shadow-hairline">
                    <p className="text-lg font-black text-app-text">{blockedWorkCount}</p>
                    <p className="mt-1 truncate text-[10px] font-bold text-app-muted">ریسک</p>
                  </div>
                </div>

                <div className="mt-3">
                  <NTrendBars values={weeklyActivity} labels={weeklyLabels} />
                </div>
              </aside>
            </div>
          </section>

          {error ? <NNotice tone="alert">{error}</NNotice> : null}
          {loading ? <Skeleton className="h-4 w-44" /> : null}

          <section className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
            {topMetrics.map((metric) => (
              <NMetricTile key={metric.label} {...metric} />
            ))}
          </section>

          <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px]">
            <NSection
              title="تابلوی انتشار"
              description="ترکیب محتوا، سلامت صف و روند کوتاه مدت در یک سطح تصمیم گیری."
              action={<NButton href="/content" variant="secondary" size="sm">کتابخانه</NButton>}
              className="dashboard-section-quiet"
            >
              <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-stretch">
                <div className="hidden sm:block">
                  <NDonutChart items={pipelineDistribution} total={pipelineTotal} label="محتوا" />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <NMetricTile label="نرخ تکمیل" value={`${completionRate}%`} detail="منتشرشده نسبت به محتوای قابل اجرا" icon={TrendingUp} tone={completionRate > 65 ? "success" : "warning"} />
                  <NMetricTile label="نرخ خطا" value={`${failureRate}%`} detail="خطا نسبت به صف فعال" icon={AlertTriangle} tone={failureRate ? "alert" : "success"} />
                  <NMetricTile label="میانگین تلاش" value={averageAttempts} detail="تلاش انتشار برای هر محتوا" icon={Activity} tone="info" />
                  <NMetricTile label="آخرین خروجی" value={latestPublishedPost?.title || "بدون خروجی"} detail={latestPublishedPost?.published_at ? formatDateTime(latestPublishedPost.published_at) : "بعد از اولین انتشار تکمیل می‌شود"} icon={CheckCircle2} tone="primary" />
                </div>
              </div>
            </NSection>

            <NSection
              title="اولویت تصمیم"
              description="مواردی که قبل از ادامه انتشار ارزش رسیدگی دارند."
              action={<NButton href="/inbox" variant="secondary" size="sm">پیام ها</NButton>}
              className="dashboard-section-quiet"
            >
              <div className="grid gap-2">
                {!priorityAlerts.length && !workspaceReady ? (
                  <>
                    {!storeReady ? <NRow icon={Target} title="هویت فضای کاری کامل نیست" detail="نام، دسته‌بندی و لحن برند را کامل کنید." href="/store" tone="warning" /> : null}
                    {!rubikaReady ? <NRow icon={PlugZap} title="کانال اصلی آماده نیست" detail="اتصال کانال‌ها قبل از انتشار جدی بررسی شود." href="/channels" tone="warning" /> : null}
                  </>
                ) : null}
                {decisionItems.slice(0, 4).map((item) => (
                  <NRow key={item.id} icon={item.icon} title={item.title} detail={item.detail} tone={item.tone} href={item.href} meta={<NStatusPill tone={item.tone}>{item.meta}</NStatusPill>} />
                ))}
                {!decisionItems.length && workspaceReady ? <NEmptyState icon={CheckCircle2} title="مورد فوری وجود ندارد" detail="صف، اتصال و آماده سازی در وضعیت قابل قبول هستند." /> : null}
              </div>
            </NSection>
          </section>

          <section className="grid gap-3 lg:grid-cols-3">
            <NSection title="برنامه نزدیک" description="پست ها یا کمپین هایی که همین حالا مهم اند." action={<NButton href="/calendar" variant="secondary" size="sm">تقویم</NButton>} className="dashboard-section-compact">
              <div className="grid gap-2">
                {timelineItems.length ? timelineItems.map((item) => (
                  <NRow
                    key={item.id}
                    icon={item.icon}
                    title={item.title}
                    detail={item.detail}
                    tone={item.tone}
                    href={item.href}
                    meta={<NStatusPill tone={item.tone}>{item.meta}</NStatusPill>}
                  />
                )) : <NEmptyState icon={CalendarClock} title="برنامه نزدیک نیست" detail="از تقویم یا ساخت پست، برنامه را کامل کنید." />}
              </div>
            </NSection>

            <NSection title="سلامت کانال" description="آمادگی انتشار چندکاناله." action={<NButton href="/channels" variant="secondary" size="sm">مدیریت</NButton>} className="dashboard-section-compact">
              <div className="grid gap-2">
                {channelItems.map((channel) => (
                  <NRow
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

            <NSection title="بینش سریع" description="سیگنال های کوتاه برای ادامه کار." action={<NButton href="/analytics" variant="secondary" size="sm">گزارش ها</NButton>} className="dashboard-section-compact">
              <div className="grid gap-2">
                <NRow icon={BarChart3} title="کارایی انتشار" detail={`${completionRate}% تکمیل و ${failureRate}% خطا در داده فعلی`} tone={failureRate ? "warning" : "success"} href="/analytics" />
                <NRow icon={Clock3} title="برنامه نزدیک" detail={nextPosts[0]?.scheduled_at ? compactDateTime(nextPosts[0].scheduled_at) : "زمان‌بندی بعدی هنوز مشخص نیست"} tone="warning" href="/calendar" />
                <NRow icon={FileText} title="محتوای خام" detail={`${draftCount} پیش‌نویس و ${manualReadyCount} آماده دستی`} tone="info" href="/content" />
              </div>
            </NSection>
          </section>
        </NPage>
      </AppShell>
    </AuthGate>
  );
}
