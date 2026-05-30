"use client";

import { AlertTriangle, CalendarClock, CheckCircle2, FileImage, LineChart, MessageSquareText, Target } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "../../components/app-shell";
import { AuthGate } from "../../components/auth-gate";
import { StatusBadge } from "../../components/status-badge";
import { Button } from "../../components/ui/button";
import { DetailGrid, EmptyState, NoticeBanner, StatusToken, WorkspacePage, WorkspacePanel, WorkspaceToolbar } from "../../components/workspace-ui";
import { apiUrl, authHeaders, formatDateTime, type Post } from "../../lib/posts";

type PublishAttempt = {
  id: number;
  post_id: number;
  post_title: string;
  action: string;
  status: string;
  request_payload: string;
  response_payload: string;
  error: string;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
};

type TimeRange = "7d" | "30d" | "all";
type ParsedPayload = Record<string, unknown> | null;

const rangeOptions: Array<{ label: string; value: TimeRange }> = [
  { label: "۷ روز", value: "7d" },
  { label: "۳۰ روز", value: "30d" },
  { label: "همه داده‌ها", value: "all" }
];

const statusLabels: Record<string, string> = {
  draft: "پیش‌نویس",
  ready: "آماده",
  scheduled: "زمان‌بندی",
  publishing: "در حال انتشار",
  published: "منتشر",
  failed: "ناموفق",
  cancelled: "لغوشده"
};

function parsePayload(value: string): ParsedPayload {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

function attemptMode(attempt: PublishAttempt) {
  const payload = parsePayload(attempt.request_payload);
  if (payload?.mode === "media" || payload?.media_asset_id) return "media";
  return "text";
}

function toTime(value?: string | null) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : null;
}

function rangeStart(range: TimeRange) {
  if (range === "all") return null;
  const days = range === "7d" ? 7 : 30;
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

function isInRange(value: string | null | undefined, range: TimeRange) {
  const start = rangeStart(range);
  if (start === null) return true;
  const time = toTime(value);
  return time !== null && time >= start;
}

function postActivityDate(post: Post) {
  return post.published_at || post.failed_at || post.scheduled_at || post.updated_at || post.created_at;
}

function percent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function dayKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "unknown";
  return date.toISOString().slice(0, 10);
}

function dayLabel(key: string) {
  if (key === "unknown") return "نامشخص";
  return new Intl.DateTimeFormat("fa-IR", { month: "short", day: "numeric" }).format(new Date(`${key}T00:00:00Z`));
}

export default function AnalyticsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [attempts, setAttempts] = useState<PublishAttempt[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");
    const headers = authHeaders();
    const [postsResponse, attemptsResponse] = await Promise.all([
      fetch(`${apiUrl}/posts`, { headers }),
      fetch(`${apiUrl}/publish-attempts`, { headers })
    ]);

    if (!postsResponse.ok) throw new Error("دریافت پست‌ها برای تحلیل ناموفق بود");
    if (!attemptsResponse.ok) throw new Error("دریافت لاگ انتشار برای تحلیل ناموفق بود");

    setPosts(await postsResponse.json());
    setAttempts(await attemptsResponse.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAnalytics().catch((err) => {
      setError(err instanceof Error ? err.message : "خطا در دریافت تحلیل عملکرد");
      setLoading(false);
    });
  }, [loadAnalytics]);

  const scopedPosts = useMemo(() => posts.filter((post) => isInRange(postActivityDate(post), timeRange)), [posts, timeRange]);
  const scopedAttempts = useMemo(() => attempts.filter((attempt) => isInRange(attempt.created_at, timeRange)), [attempts, timeRange]);

  const statusCounts = useMemo(() => {
    return scopedPosts.reduce<Record<string, number>>((acc, post) => {
      acc[post.status] = (acc[post.status] ?? 0) + 1;
      return acc;
    }, {});
  }, [scopedPosts]);

  const attemptSummary = useMemo(() => {
    const success = scopedAttempts.filter((attempt) => attempt.status === "success").length;
    const failed = scopedAttempts.filter((attempt) => attempt.status === "failed").length;
    const started = scopedAttempts.filter((attempt) => attempt.status === "started").length;
    const media = scopedAttempts.filter((attempt) => attemptMode(attempt) === "media").length;
    const text = scopedAttempts.length - media;
    const completed = success + failed;
    return {
      success,
      failed,
      started,
      media,
      text,
      completed,
      successRate: percent(success, completed)
    };
  }, [scopedAttempts]);

  const trend = useMemo(() => {
    const start = rangeStart(timeRange);
    const sourceAttempts = timeRange === "all" ? scopedAttempts.slice(0, 14) : scopedAttempts;
    const keys = new Set<string>();

    if (start !== null) {
      const days = timeRange === "7d" ? 7 : 30;
      for (let index = days - 1; index >= 0; index -= 1) {
        keys.add(dayKey(new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString()));
      }
    } else {
      sourceAttempts.forEach((attempt) => keys.add(dayKey(attempt.created_at)));
    }

    return Array.from(keys).sort().map((key) => {
      const dayAttempts = scopedAttempts.filter((attempt) => dayKey(attempt.created_at) === key);
      const success = dayAttempts.filter((attempt) => attempt.status === "success").length;
      const failed = dayAttempts.filter((attempt) => attempt.status === "failed").length;
      const started = dayAttempts.filter((attempt) => attempt.status === "started").length;
      return { key, success, failed, started, total: dayAttempts.length };
    });
  }, [scopedAttempts, timeRange]);

  const maxTrendTotal = Math.max(1, ...trend.map((item) => item.total));
  const trendTickInterval = timeRange === "7d" ? 1 : timeRange === "30d" ? 5 : Math.max(1, Math.ceil(trend.length / 7));
  const trendMinWidth = timeRange === "7d" ? "560px" : timeRange === "30d" ? "920px" : `${Math.max(560, trend.length * 56)}px`;
  function showTrendTick(index: number) {
    return index === 0 || index === trend.length - 1 || index % trendTickInterval === 0;
  }
  const failedPosts = scopedPosts.filter((post) => post.status === "failed" || post.last_error).slice(0, 5);
  const queuedPosts = scopedPosts.filter((post) => ["ready", "scheduled", "publishing"].includes(post.status)).slice(0, 5);
  const highAttemptPosts = useMemo(() => {
    return [...scopedPosts]
      .sort((first, second) => second.attempt_count - first.attempt_count)
      .filter((post) => post.attempt_count > 0)
      .slice(0, 5);
  }, [scopedPosts]);
  const lastAttempt = scopedAttempts[0] ?? null;
  const publishedCount = statusCounts.published ?? 0;
  const failedCount = (statusCounts.failed ?? 0) + attemptSummary.failed;
  const queuedCount = (statusCounts.ready ?? 0) + (statusCounts.scheduled ?? 0) + (statusCounts.publishing ?? 0);
  const dashboardMetrics = [
    { label: "منتشرشده", value: publishedCount, detail: "خروجی موفق در بازه", icon: CheckCircle2, tone: "text-emerald-700" },
    { label: "موفقیت ارسال", value: `${attemptSummary.successRate}%`, detail: `${attemptSummary.success} از ${attemptSummary.completed} تلاش کامل`, icon: Target, tone: attemptSummary.successRate >= 80 ? "text-emerald-700" : "text-amber-700" },
    { label: "نیازمند توجه", value: failedCount, detail: "پست یا تلاش ناموفق", icon: AlertTriangle, tone: failedCount ? "text-rose-700" : "text-slate-500" },
    { label: "در جریان", value: queuedCount, detail: "آماده، زمان‌بندی یا ارسال", icon: CalendarClock, tone: "text-app-primary" }
  ];

  return (
    <AuthGate>
      <AppShell>
        <WorkspacePage>
          <section className="rounded-md border border-app-border bg-white px-4 py-3">
            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
              <div>
                <p className="text-[10px] font-black text-app-primary">تحلیل عملیاتی</p>
                <h1 className="mt-1 text-xl font-black text-app-text">عملکرد انتشار</h1>
                <p className="mt-1 text-xs leading-5 text-app-muted">کیفیت ارسال، روند تلاش‌ها و موارد نیازمند اقدام را برای بازه انتخاب‌شده بررسی کنید.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusToken tone={attemptSummary.failed ? "alert" : "success"}>{attemptSummary.failed ? `${attemptSummary.failed} تلاش ناموفق` : "ارسال پایدار"}</StatusToken>
                <StatusToken tone="neutral">{scopedPosts.length} پست مرتبط</StatusToken>
                <Button href="/logs" variant="secondary" size="sm">سلامت انتشار</Button>
              </div>
            </div>
          </section>

          <WorkspaceToolbar
            meta={(
              <>
                <StatusToken tone="neutral">{scopedAttempts.length} تلاش در بازه</StatusToken>
                <StatusToken tone="neutral">{scopedPosts.length} پست مرتبط</StatusToken>
              </>
            )}
          >
            <div className="flex flex-wrap gap-2">
              {rangeOptions.map((option) => {
                const active = timeRange === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTimeRange(option.value)}
                    className={`rounded px-3 py-1.5 text-xs font-bold transition ${
                      active ? "bg-app-primary text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-app-primary"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </WorkspaceToolbar>

          {error ? <NoticeBanner tone="alert" title="نیاز به بررسی">{error}</NoticeBanner> : null}

          <section className="grid overflow-hidden rounded-md border border-app-border bg-white sm:grid-cols-2 xl:grid-cols-4">
            {dashboardMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="flex min-w-0 items-start gap-3 border-b border-app-border p-3 sm:border-l sm:last:border-l-0 xl:border-b-0">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-50 ${metric.tone}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <p className={`text-lg font-black ${metric.tone}`}>{metric.value}</p>
                      <p className="truncate text-xs font-bold text-app-text">{metric.label}</p>
                    </div>
                    <p className="mt-1 truncate text-[11px] text-app-muted">{metric.detail}</p>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
            <div className="min-w-0 space-y-4">
              <WorkspacePanel
                title="روند تلاش‌های انتشار"
                description="مقایسه تلاش‌های موفق، ناموفق و در حال اجرا در بازه انتخاب‌شده."
                action={<StatusToken tone="neutral">{trend.length} نقطه زمانی</StatusToken>}
              >
                {loading ? <p className="text-sm text-app-muted">در حال دریافت تحلیل...</p> : null}
                {!loading && trend.length === 0 ? (
                  <EmptyState
                    icon={<LineChart className="h-5 w-5" aria-hidden="true" />}
                    title="هنوز روندی برای نمایش وجود ندارد"
                    description="پس از ثبت تلاش‌های انتشار، نمودار عملیاتی اینجا کامل می‌شود."
                  />
                ) : null}
                <div className="mb-4 flex flex-wrap gap-3 text-[11px] font-bold text-app-muted">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> موفق</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-rose-500" /> ناموفق</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-sky-500" /> در حال اجرا</span>
                </div>
                <div className="overflow-x-auto pb-2">
                  <div
                    className="grid h-56 items-end gap-2 border-b border-app-border px-1 pt-3"
                    style={{ gridTemplateColumns: `repeat(${Math.max(1, trend.length)}, minmax(28px, 1fr))`, minWidth: trendMinWidth }}
                  >
                    {trend.map((item, index) => (
                      <div key={item.key} className="flex h-full min-w-0 flex-col justify-end text-center" title={`${dayLabel(item.key)}: ${item.total} تلاش`}>
                        <p className="mb-2 text-[10px] font-black text-app-muted">{item.total || ""}</p>
                        <div className="flex h-40 items-end justify-center">
                          <div
                            className="flex w-5 flex-col-reverse overflow-hidden rounded-t bg-slate-100"
                            style={{ height: item.total ? `${Math.max(8, percent(item.total, maxTrendTotal))}%` : "0%" }}
                            title={`${dayLabel(item.key)}: ${item.total} تلاش`}
                          >
                            <span className="bg-emerald-500" style={{ height: `${percent(item.success, Math.max(1, item.total))}%` }} />
                            <span className="bg-rose-500" style={{ height: `${percent(item.failed, Math.max(1, item.total))}%` }} />
                            <span className="bg-sky-500" style={{ height: `${percent(item.started, Math.max(1, item.total))}%` }} />
                          </div>
                        </div>
                        <p className={`mt-2 min-h-4 whitespace-nowrap text-[10px] font-bold ${showTrendTick(index) ? "text-app-muted" : "text-transparent"}`}>
                          {showTrendTick(index) ? dayLabel(item.key) : "—"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </WorkspacePanel>

              <WorkspacePanel
                title="ترکیب عملیات محتوا"
                description="وضعیت چرخه پست‌ها و نوع ارسال در یک نمای فشرده."
              >
                <div className="grid gap-3 border-b border-app-border pb-4 sm:grid-cols-2">
                  <div className="flex items-center justify-between gap-3 rounded-md bg-slate-50 p-3 ring-1 ring-app-border">
                    <span className="flex items-center gap-2">
                      <MessageSquareText className="h-4 w-4 text-app-primary" aria-hidden="true" />
                      <span className="text-sm font-black text-app-text">ارسال متنی</span>
                    </span>
                    <span className="text-sm font-black text-app-text">{attemptSummary.text} <span className="text-xs text-app-muted">({percent(attemptSummary.text, scopedAttempts.length)}%)</span></span>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-md bg-slate-50 p-3 ring-1 ring-app-border">
                    <span className="flex items-center gap-2">
                      <FileImage className="h-4 w-4 text-app-primary" aria-hidden="true" />
                      <span className="text-sm font-black text-app-text">ارسال رسانه‌ای</span>
                    </span>
                    <span className="text-sm font-black text-app-text">{attemptSummary.media} <span className="text-xs text-app-muted">({percent(attemptSummary.media, scopedAttempts.length)}%)</span></span>
                  </div>
                </div>
                <div className="mt-2 divide-y divide-app-border">
                  {Object.entries(statusLabels).map(([status, label]) => {
                    const count = statusCounts[status] ?? 0;
                    const ratio = percent(count, Math.max(1, scopedPosts.length));
                    return (
                      <div key={status} className="grid gap-2 py-3 md:grid-cols-[150px_minmax(0,1fr)_36px] md:items-center">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={status} />
                          <span className="text-xs font-black text-app-text">{label}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-app-primary" style={{ width: `${ratio}%` }} />
                        </div>
                        <span className="text-left text-xs font-black text-app-text">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </WorkspacePanel>
            </div>

            <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
              <WorkspacePanel
                title="اقدام‌های پیشنهادی"
                description="مواردی که بهتر است اول بررسی شوند."
                action={<StatusToken tone={failedPosts.length ? "alert" : "success"}>{failedPosts.length ? "رسیدگی" : "پایدار"}</StatusToken>}
              >
                {failedPosts.length === 0 ? (
                  <EmptyState
                    icon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />}
                    title="فعلاً مورد بحرانی وجود ندارد"
                    description="خطاهای انتشار یا پست‌های شکست‌خورده در این بازه دیده نمی‌شود."
                  />
                ) : null}
                <div className="space-y-2">
                  {failedPosts.map((post) => (
                    <article key={post.id} className="rounded-md border border-app-border bg-white p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={post.status} />
                        <span className="text-xs text-app-muted">تلاش: {post.attempt_count}</span>
                      </div>
                      <h3 className="mt-2 truncate text-sm font-black text-app-text">{post.title}</h3>
                      {post.last_error ? <p className="mt-1 line-clamp-2 text-xs leading-6 text-rose-600">{post.last_error}</p> : null}
                      <div className="mt-3 flex gap-2">
                        <Button href={`/compose?postId=${post.id}`} variant="secondary" size="sm">باز کردن</Button>
                        <Button href="/logs" variant="secondary" size="sm">لاگ‌ها</Button>
                      </div>
                    </article>
                  ))}
                </div>
              </WorkspacePanel>

              <WorkspacePanel title="خلاصه عملیاتی" description="سیگنال‌های قابل اتکا برای تصمیم بعدی.">
                <DetailGrid
                  items={[
                    { label: "تلاش کامل‌شده", value: attemptSummary.completed, hint: "موفق + ناموفق" },
                    { label: "در حال اجرا", value: attemptSummary.started, hint: "تلاش شروع‌شده" },
                    { label: "پست در جریان", value: queuedCount, hint: "آماده یا زمان‌بندی‌شده" },
                    { label: "کل تلاش‌ها", value: scopedAttempts.length, hint: "ثبت‌شده در بازه" }
                  ]}
                />
                <div className="mt-4 divide-y divide-app-border border-t border-app-border">
                  <div className="py-3">
                    <p className="text-[11px] font-black text-app-muted">آخرین تلاش ثبت‌شده</p>
                    <p className="mt-1 text-sm font-black text-app-text">{lastAttempt ? formatDateTime(lastAttempt.created_at) : "—"}</p>
                  </div>
                  <div className="py-3">
                    <p className="text-[11px] font-black text-app-muted">نزدیک‌ترین پست در جریان</p>
                    {queuedPosts[0] ? (
                      <>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <StatusBadge status={queuedPosts[0].status} />
                          <span className="text-xs text-app-muted">{formatDateTime(queuedPosts[0].scheduled_at)}</span>
                        </div>
                        <p className="mt-2 truncate text-sm font-black text-app-text">{queuedPosts[0].title}</p>
                      </>
                    ) : <p className="mt-1 text-sm text-app-muted">پست فعالی در صف نیست.</p>}
                  </div>
                  <div className="py-3">
                    <p className="text-[11px] font-black text-app-muted">بیشترین تلاش انتشار</p>
                    {highAttemptPosts[0] ? (
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-black text-app-text">{highAttemptPosts[0].title}</p>
                        <StatusToken tone={highAttemptPosts[0].attempt_count > 1 ? "warning" : "neutral"}>{highAttemptPosts[0].attempt_count} تلاش</StatusToken>
                      </div>
                    ) : <p className="mt-1 text-sm text-app-muted">داده‌ای برای رتبه‌بندی وجود ندارد.</p>}
                  </div>
                </div>
                <div className="mt-4 grid gap-2">
                  <Button href="/queue" variant="secondary">باز کردن صف انتشار</Button>
                  <Button href="/content" variant="secondary">کتابخانه محتوا</Button>
                </div>
              </WorkspacePanel>
            </aside>
          </section>
        </WorkspacePage>
      </AppShell>
    </AuthGate>
  );
}
