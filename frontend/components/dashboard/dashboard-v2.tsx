"use client";

import {
  Activity,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpLeft,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileText,
  ListChecks,
  Megaphone,
  PlugZap,
  RefreshCw,
  ShieldCheck,
  Target,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { WorkspaceAvatar } from "../brand-mark";
import { Skeleton } from "../loading-skeleton";
import {
  NButton,
  NEmptyState,
  NMetricTile,
  NNotice,
  NPage,
  NPageHeader,
  NRow,
  NSection,
  NStatusPill
} from "../nashrino-ui";
import {
  deriveDashboardModel,
  loadDashboardSnapshot,
  type DashboardActionTone,
  type DashboardSnapshot,
  type DashboardSource
} from "../../lib/dashboard";
import { useMediaPreviewUrl } from "../../lib/media-preview";
import {
  loadReadNotificationIds,
  notificationsUpdatedEvent
} from "../../lib/notifications";
import { productName } from "../../lib/product";

const sourceLabels: Record<DashboardSource, string> = {
  posts: "محتوا و صف",
  attempts: "تلاش‌های انتشار",
  channels: "مرکز کانال‌ها",
  campaigns: "کمپین‌ها",
  store: "فضای کاری",
  rubika: "تنظیمات روبیکا",
  notifications: "هشدارهای عملیاتی"
};

function formatDateTime(value?: string | null) {
  if (!value) return "ثبت نشده";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "زمان نامعتبر";
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function formatTime(value?: Date | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(value);
}

function actionIcon(tone: DashboardActionTone) {
  if (tone === "alert") return CircleAlert;
  if (tone === "warning") return AlertTriangle;
  if (tone === "success") return CheckCircle2;
  return ListChecks;
}

function deltaMeta(delta: number) {
  if (delta > 0) {
    return {
      tone: "success" as const,
      icon: TrendingUp,
      label: `${delta}+ نسبت به هفته قبل`
    };
  }
  if (delta < 0) {
    return {
      tone: "warning" as const,
      icon: TrendingDown,
      label: `${Math.abs(delta)}- نسبت به هفته قبل`
    };
  }
  return {
    tone: "neutral" as const,
    icon: Activity,
    label: "بدون تغییر نسبت به هفته قبل"
  };
}

function LoadingDashboard() {
  return (
    <NPage className="pb-6">
      <section className="app-studio-panel rounded-2xl p-4 sm:p-5">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-3 h-8 w-56" />
        <Skeleton className="mt-3 h-4 w-full max-w-2xl" />
      </section>
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-28 rounded-2xl" />)}
      </section>
      <Skeleton className="h-64 rounded-2xl" />
      <section className="grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </section>
    </NPage>
  );
}

export default function DashboardV2() {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fatalError, setFatalError] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setFatalError("");

    try {
      const nextSnapshot = await loadDashboardSnapshot();
      setSnapshot(nextSnapshot);
      setReadNotificationIds(loadReadNotificationIds());
      setLastUpdatedAt(new Date());
    } catch (error) {
      setFatalError(error instanceof Error ? error.message : "دریافت داشبورد ناموفق بود");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const syncReadState = () => setReadNotificationIds(loadReadNotificationIds());
    window.addEventListener(notificationsUpdatedEvent, syncReadState);
    return () => window.removeEventListener(notificationsUpdatedEvent, syncReadState);
  }, []);

  const model = useMemo(
    () => snapshot ? deriveDashboardModel(snapshot, readNotificationIds) : null,
    [readNotificationIds, snapshot]
  );
  const store = snapshot?.workspace.store ?? null;
  const brandImageUrl = useMediaPreviewUrl(store?.avatar_asset_id ?? store?.logo_asset_id);

  if (loading && !snapshot) return <LoadingDashboard />;

  if (!snapshot || !model) {
    return (
      <NPage className="pb-6">
        <NPageHeader
          eyebrow="مرکز عملیات امروز"
          title="داشبورد"
          description="نمای عملیاتی انتشار، کانال‌ها و موارد نیازمند اقدام."
        />
        <NNotice title="داشبورد بارگذاری نشد" tone="alert">
          {fatalError || "اتصال به داده‌های عملیاتی برقرار نشد."}
        </NNotice>
        <div>
          <NButton type="button" icon={RefreshCw} onClick={() => void load()}>
            تلاش دوباره
          </NButton>
        </div>
      </NPage>
    );
  }

  const throughputDelta = deltaMeta(model.throughput.delta);
  const ThroughputIcon = throughputDelta.icon;
  const degradedLabels = model.degradedSources.map((source) => sourceLabels[source]);

  return (
    <NPage className="pb-6">
      <NPageHeader
        eyebrow="مرکز عملیات امروز"
        title="داشبورد"
        description={model.briefing}
        meta={(
          <div className="flex flex-wrap items-center gap-2">
            <NStatusPill tone={model.tone}>
              {model.tone === "success" ? "عملیات پایدار" : model.tone === "alert" ? "اقدام فوری" : "نیازمند توجه"}
            </NStatusPill>
            {lastUpdatedAt ? <NStatusPill tone="neutral">به‌روز شده {formatTime(lastUpdatedAt)}</NStatusPill> : null}
            {model.degradedSources.length ? <NStatusPill tone="warning">داده ناقص</NStatusPill> : null}
          </div>
        )}
        action={(
          <div className="flex flex-wrap gap-2">
            <NButton
              type="button"
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              loading={refreshing}
              onClick={() => void load(true)}
            >
              تازه‌سازی
            </NButton>
            <NButton href={model.primaryAction.href} size="sm" trailingIcon={ArrowUpLeft}>
              {model.primaryAction.label}
            </NButton>
          </div>
        )}
      />

      <section className="app-studio-panel rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <WorkspaceAvatar
              name={store?.name || productName}
              size="lg"
              color={store?.brand_primary_color}
              imageUrl={brandImageUrl}
            />
            <div className="min-w-0">
              <p className="text-[11px] font-black text-app-primary">اقدام پیشنهادی</p>
              <h2 className="mt-1 text-xl font-black text-app-text">{model.primaryAction.title}</h2>
              <p className="mt-1 max-w-3xl text-sm leading-7 text-app-muted">{model.primaryAction.detail}</p>
            </div>
          </div>
          <NButton href={model.primaryAction.href} trailingIcon={ArrowUpLeft}>
            {model.primaryAction.label}
          </NButton>
        </div>
      </section>

      {fatalError ? <NNotice title="تازه‌سازی کامل نشد" tone="alert">{fatalError}</NNotice> : null}
      {degradedLabels.length ? (
        <NNotice title="بخشی از داده‌ها به‌روز نشد" tone="warning">
          داده‌های {degradedLabels.join("، ")} فعلاً در دسترس نیست. سایر بخش‌های داشبورد با آخرین داده قابل دریافت نمایش داده شده‌اند.
        </NNotice>
      ) : null}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="شاخص‌های اصلی داشبورد">
        <NMetricTile
          label="زمان‌بندی امروز"
          value={model.scheduledToday}
          detail={model.nextScheduledPost ? `بعدی: ${formatDateTime(model.nextScheduledPost.scheduled_at)}` : "انتشار آینده‌ای ثبت نشده"}
          icon={CalendarClock}
          tone={model.scheduledToday ? "warning" : "neutral"}
          href="/calendar"
        />
        <NMetricTile
          label="موفقیت انتشار ـ ۷ روز"
          value={model.attempts.successRate === null ? "—" : `${model.attempts.successRate}%`}
          detail={model.attempts.total7d ? `${model.attempts.successful7d} موفق از ${model.attempts.successful7d + model.attempts.failed7d} نتیجه قطعی` : "هنوز تلاش ثبت‌شده‌ای وجود ندارد"}
          icon={ShieldCheck}
          tone={model.attempts.failed7d ? "warning" : model.attempts.successRate === null ? "neutral" : "success"}
          href="/analytics?view=publishing"
        />
        <NMetricTile
          label="موارد نیازمند اقدام"
          value={model.actionBacklog}
          detail={`${model.failedPosts} خطای انتشار · ${model.approvals.total} بازبینی`}
          icon={ListChecks}
          tone={model.actionBacklog ? "alert" : "success"}
          href={model.actionBacklog ? model.primaryAction.href : "/inbox"}
        />
        <NMetricTile
          label="کانال آماده"
          value={`${model.channelSummary.ready}/${model.channelSummary.total}`}
          detail={model.channelSummary.actionRequired ? `${model.channelSummary.actionRequired} کانال نیازمند اقدام` : "همه کانال‌های ثبت‌شده آماده‌اند"}
          icon={PlugZap}
          tone={model.channelSummary.actionRequired ? "warning" : model.channelSummary.total ? "success" : "neutral"}
          href="/channels"
        />
      </section>

      {model.isOperationallyEmpty ? (
        <NSection
          title="هنوز داده عملیاتی ندارید"
          description="با ساخت نخستین محتوا و اتصال کانال، نبض انتشار و شاخص‌های واقعی در این صفحه فعال می‌شوند."
          action={<NButton href="/compose">ساخت نخستین پست</NButton>}
        >
          <NEmptyState
            title="داشبورد آماده دریافت داده است"
            detail="محتوا، کانال، کمپین یا تلاش انتشاری هنوز ثبت نشده است."
            icon={FileText}
          />
        </NSection>
      ) : null}

      <NSection
        title="نبض انتشار"
        description="انتشار بعدی، صف جاری و آخرین نتایج واقعی worker در یک نمای عملیاتی."
        action={<NButton href="/queue" variant="secondary" size="sm">صف انتشار</NButton>}
      >
        <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <article className="rounded-2xl border border-app-border bg-app-surfaceMuted p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-black text-app-primary">انتشار بعدی</p>
                <h3 className="mt-1 truncate text-lg font-black text-app-text">
                  {model.nextScheduledPost?.title || "انتشار زمان‌بندی‌شده‌ای وجود ندارد"}
                </h3>
                <p className="mt-1 text-sm leading-6 text-app-muted">
                  {model.nextScheduledPost ? formatDateTime(model.nextScheduledPost.scheduled_at) : "یک پست را در Composer آماده و زمان‌بندی کنید."}
                </p>
              </div>
              <NStatusPill tone={model.nextScheduledPost ? "warning" : "neutral"}>
                {model.nextScheduledPost ? "زمان‌بندی‌شده" : "بدون برنامه نزدیک"}
              </NStatusPill>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "آماده", value: model.queue.ready, tone: "primary" as const },
                { label: "زمان‌بندی", value: model.queue.scheduled, tone: "warning" as const },
                { label: "در انتشار", value: model.queue.publishing, tone: "info" as const },
                { label: "ناموفق", value: model.queue.failed, tone: model.queue.failed ? "alert" as const : "success" as const }
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-app-border bg-app-surface p-3">
                  <p className="text-[10px] font-black text-app-muted">{item.label}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-xl font-black text-app-text">{item.value}</span>
                    <NStatusPill tone={item.tone}>{item.value ? "فعال" : "خالی"}</NStatusPill>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-app-border bg-app-surfaceMuted p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black text-app-primary">خروجی ۷ روز اخیر</p>
                <h3 className="mt-1 text-lg font-black text-app-text">نتیجه تلاش‌های انتشار</h3>
              </div>
              <Activity className="h-5 w-5 text-app-primary" aria-hidden="true" />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-app-border bg-app-surface p-3">
                <dt className="text-[10px] font-black text-app-muted">موفق</dt>
                <dd className="mt-1 text-xl font-black text-app-success">{model.attempts.successful7d}</dd>
              </div>
              <div className="rounded-xl border border-app-border bg-app-surface p-3">
                <dt className="text-[10px] font-black text-app-muted">ناموفق</dt>
                <dd className="mt-1 text-xl font-black text-app-danger">{model.attempts.failed7d}</dd>
              </div>
              <div className="rounded-xl border border-app-border bg-app-surface p-3">
                <dt className="text-[10px] font-black text-app-muted">در حال اجرا</dt>
                <dd className="mt-1 text-xl font-black text-app-text">{model.attempts.active}</dd>
              </div>
              <div className="rounded-xl border border-app-border bg-app-surface p-3">
                <dt className="text-[10px] font-black text-app-muted">کل تلاش‌ها</dt>
                <dd className="mt-1 text-xl font-black text-app-text">{model.attempts.total7d}</dd>
              </div>
            </dl>
          </article>
        </div>
      </NSection>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <NSection
          title="صف اقدام"
          description="مواردی که مستقیماً انتشار، تایید یا آمادگی کانال را مسدود کرده‌اند."
          action={<NButton href="/inbox" variant="secondary" size="sm">مرکز پیام‌ها</NButton>}
        >
          {model.actions.length ? (
            <div className="grid gap-2">
              {model.actions.map((action) => {
                const Icon = actionIcon(action.tone);
                return (
                  <NRow
                    key={action.id}
                    title={action.title}
                    detail={[action.detail, action.recoveryHint].filter(Boolean).join(" · ")}
                    icon={Icon}
                    tone={action.tone}
                    href={action.href}
                    meta={<NStatusPill tone={action.tone}>{action.label}</NStatusPill>}
                  />
                );
              })}
            </div>
          ) : (
            <NEmptyState title="صف اقدام خالی است" detail="خطا، بازبینی مسدود یا هشدار خوانده‌نشده‌ای وجود ندارد." icon={CheckCircle2} />
          )}
        </NSection>

        <NSection
          title="آمادگی کانال‌ها"
          description="وضعیت واقعی اتصال، حالت انتشار و آخرین تست هر کانال."
          action={<NButton href="/channels" variant="secondary" size="sm">مرکز کانال‌ها</NButton>}
        >
          {model.channels.length ? (
            <div className="grid gap-2">
              {model.channels.map((channel) => (
                <NRow
                  key={channel.id}
                  title={`${channel.label} · ${channel.displayName}`}
                  detail={`${channel.mode} · آخرین تست ${formatDateTime(channel.lastTestAt)}${channel.lastError ? ` · ${channel.lastError}` : ""}`}
                  icon={PlugZap}
                  tone={channel.tone}
                  href={channel.href}
                  meta={<NStatusPill tone={channel.tone}>{channel.statusLabel}</NStatusPill>}
                />
              ))}
            </div>
          ) : (
            <NEmptyState title="کانالی ثبت نشده است" detail="برای فعال شدن انتشار، روبیکا یا اینستاگرام را متصل کنید." icon={PlugZap} />
          )}
        </NSection>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <NSection
          title="کمپین‌های فعال"
          description="خلاصه نزدیک‌ترین کمپین‌های در جریان، بدون تکرار گزارش کامل کمپین."
          action={<NButton href="/campaigns" variant="secondary" size="sm">همه کمپین‌ها</NButton>}
        >
          {model.campaigns.length ? (
            <div className="grid gap-2">
              {model.campaigns.map((campaign) => (
                <NRow
                  key={campaign.id}
                  title={campaign.name}
                  detail={`${campaign.goal || "بدون هدف ثبت‌شده"}${campaign.owner ? ` · مالک ${campaign.owner}` : ""}${campaign.endsAt ? ` · پایان ${formatDateTime(campaign.endsAt)}` : ""}`}
                  icon={Megaphone}
                  tone="primary"
                  href={campaign.href}
                  meta={<NStatusPill tone="neutral">{campaign.postCount} محتوا</NStatusPill>}
                />
              ))}
            </div>
          ) : (
            <NEmptyState title="کمپین فعالی وجود ندارد" detail="برای گروه‌بندی محتوا و هدف‌گذاری، یک کمپین فعال بسازید." icon={Target} />
          )}
        </NSection>

        <NSection
          title="توان عملیاتی ۷ روز اخیر"
          description="مقایسه واقعی انتشار تکمیل‌شده با هفت روز پیش، بدون نمودار تزئینی."
          action={<NButton href="/analytics" variant="secondary" size="sm">گزارش کامل</NButton>}
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-app-border bg-app-surfaceMuted p-4">
              <p className="text-xs font-black text-app-muted">منتشرشده این هفته</p>
              <p className="mt-2 text-3xl font-black text-app-text">{model.throughput.published7d}</p>
            </div>
            <div className="rounded-2xl border border-app-border bg-app-surfaceMuted p-4">
              <p className="text-xs font-black text-app-muted">هفته قبل</p>
              <p className="mt-2 text-3xl font-black text-app-text">{model.throughput.publishedPrevious7d}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-app-border bg-app-surface p-3">
            <ThroughputIcon className="h-5 w-5 shrink-0 text-app-primary" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-black text-app-text">{throughputDelta.label}</p>
              <p className="mt-1 text-xs leading-5 text-app-muted">
                {model.attempts.total7d} تلاش انتشار ثبت شده و {model.attempts.failed7d} مورد ناموفق بوده است.
              </p>
            </div>
          </div>
        </NSection>
      </section>

      <NSection
        title="هشدارهای عملیاتی"
        description="هشدارهای خوانده‌نشده‌ای که به اقدام مستقیم نیاز دارند."
        action={<NButton href="/inbox" variant="secondary" size="sm">همه هشدارها</NButton>}
      >
        {model.alerts.length ? (
          <div className="grid gap-2 lg:grid-cols-2">
            {model.alerts.map((alert) => (
              <NRow
                key={alert.id}
                title={alert.title}
                detail={[alert.description, alert.recovery_hint].filter(Boolean).join(" · ")}
                icon={alert.severity === "critical" ? CircleAlert : AlertTriangle}
                tone={alert.severity === "critical" ? "alert" : alert.severity === "warning" ? "warning" : "info"}
                href={alert.action_href || "/inbox"}
                meta={<NStatusPill tone={alert.severity === "critical" ? "alert" : "warning"}>{alert.action_label || "رسیدگی"}</NStatusPill>}
              />
            ))}
          </div>
        ) : (
          <NEmptyState title="هشدار تازه‌ای وجود ندارد" detail="مرکز عملیات در حال حاضر پیام خوانده‌نشده نیازمند اقدام ندارد." icon={CheckCircle2} />
        )}
      </NSection>

      <footer className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-app-border bg-app-surfaceMuted px-3 py-2 text-xs text-app-muted">
        <span className="flex items-center gap-1.5"><Clock3 className="h-4 w-4" aria-hidden="true" /> داده‌ها با تازه‌سازی دستی یا بازگشت به صفحه به‌روز می‌شوند.</span>
        <span className="flex items-center gap-1.5"><ArrowDownLeft className="h-4 w-4" aria-hidden="true" /> جزئیات کامل در Planner، Reports، Content و Channels باقی می‌ماند.</span>
      </footer>
    </NPage>
  );
}
