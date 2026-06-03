"use client";

import {
  AlertTriangle,
  ArrowUpLeft,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Megaphone,
  Palette,
  PlugZap,
  RefreshCw,
  Rocket,
  Sparkles,
  Target,
  TimerReset
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthGate } from "../components/auth-gate";
import { AppShell } from "../components/app-shell";
import { WorkspaceAvatar } from "../components/brand-mark";
import { CountdownBadge } from "../components/countdown-badge";
import { LiveOperations, PublicationPulse, SignalRibbon } from "../components/dashboard-command-center";
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
          ? "کمپین‌ها فعال‌اند، اما برنامه انتشار نزدیک هنوز سبک است. محتوا را وارد پلنر کنید."
          : "فضای کاری آماده است. یک کمپین یا محتوای جدید برای شروع برنامه روزانه بسازید.";
  const healthTone = priorityAlerts.length || queueCounts.failed ? "alert" : workspaceReady ? "success" : "warning";
  const pipeline = [
    { label: "آماده", count: queueCounts.ready, detail: "منتظر زمان", icon: CheckCircle2, tone: "primary" as const, href: "/content?status=ready" },
    { label: "زمان‌بندی", count: queueCounts.scheduled, detail: "در برنامه", icon: CalendarClock, tone: "warning" as const, href: "/calendar" },
    { label: "در انتشار", count: queueCounts.publishing, detail: "در اختیار worker", icon: TimerReset, tone: "info" as const, href: "/queue" },
    { label: "ناموفق", count: queueCounts.failed, detail: "نیازمند بازیابی", icon: AlertTriangle, tone: "alert" as const, href: "/queue" }
  ];
  const signals = [
    { label: "کارهای مسدود", value: blockedWorkCount, detail: "ریسک، خطا یا آماده‌سازی", icon: AlertTriangle, tone: blockedWorkCount ? "alert" as const : "success" as const },
    { label: "انتشارهای آینده", value: queueCounts.scheduled, detail: "در تقویم و صف", icon: CalendarClock, tone: "warning" as const },
    { label: "کمپین فعال", value: activeCampaigns.length, detail: "نیازمند محتوا و پیگیری", icon: Megaphone, tone: "primary" as const },
    { label: "خروجی موفق", value: publishedCount, detail: "کل پست‌های منتشرشده", icon: CheckCircle2, tone: "success" as const }
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
                <p className="app-section-kicker mt-4 text-[10px] font-black">Multi-channel Social Operations</p>
                <h1 className="mt-2 text-2xl font-black text-app-text">مرکز فرمان شبکه‌های اجتماعی</h1>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-app-muted">{briefing}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button href={nextAction.href}>
                    {nextAction.label}
                    <ArrowUpLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                  </Button>
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

              <WorkspacePanel title="اقدام پیشنهادی" description="یک کار مهم که بیشترین اثر را روی جریان امروز دارد." bodyClassName="p-4">
                <div className="rounded-md border border-blue-100 bg-blue-50/70 p-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-app-primary shadow-hairline">
                      <Target className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-app-text">{nextAction.label}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-app-muted">{nextAction.detail}</p>
                    </div>
                  </div>
                  <Button href={nextAction.href} className="mt-3 w-full" size="sm">
                    انجام این کار
                    <ArrowUpLeft className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </WorkspacePanel>

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
