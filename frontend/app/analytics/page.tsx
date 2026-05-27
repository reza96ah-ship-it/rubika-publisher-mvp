"use client";

import { Activity, AlertTriangle, BarChart3, CalendarClock, CheckCircle2, FileImage, LineChart, MessageSquareText, Target } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "../../components/app-shell";
import { AuthGate } from "../../components/auth-gate";
import { StatusBadge } from "../../components/status-badge";
import { Button } from "../../components/ui/button";
import { DetailGrid, EmptyState, MetricStrip, MetricTile, NoticeBanner, StatusToken, WorkspaceHero, WorkspacePage, WorkspacePanel, WorkspaceToolbar } from "../../components/workspace-ui";
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
      return { key, success, failed, total: dayAttempts.length };
    });
  }, [scopedAttempts, timeRange]);

  const maxTrendTotal = Math.max(1, ...trend.map((item) => item.total));
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

  return (
    <AuthGate>
      <AppShell>
        <WorkspacePage>
          <WorkspaceHero
            eyebrow="Performance Analytics"
            title="تحلیل عملکرد"
            description="نمای تصمیم‌گیری برای کیفیت انتشار، نرخ موفقیت، ترکیب محتوا و پست‌هایی که نیاز به اقدام دارند."
            actions={(
              <>
                <Button href="/logs" size="sm">سلامت انتشار</Button>
                <Button href="/content" variant="secondary" size="sm">کتابخانه محتوا</Button>
              </>
            )}
            meta={(
              <>
                <StatusToken tone="primary">{scopedPosts.length} پست</StatusToken>
                <StatusToken tone={attemptSummary.failed ? "alert" : "success"}>{attemptSummary.failed ? `${attemptSummary.failed} تلاش ناموفق` : "بدون تلاش ناموفق"}</StatusToken>
                <StatusToken tone="success">{attemptSummary.successRate}% موفقیت</StatusToken>
              </>
            )}
            aside={(
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-app-primary">Decision Center</p>
                    <h2 className="mt-2 text-lg font-black text-app-text">{attemptSummary.successRate}% نرخ موفقیت</h2>
                    <p className="mt-1 text-xs leading-5 text-app-muted">بر اساس تلاش‌های کامل‌شده در بازه انتخاب‌شده.</p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-md border border-blue-200 bg-white text-app-primary">
                    <BarChart3 className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded border border-blue-100 bg-white p-3">
                    <p className="font-black text-app-text">{lastAttempt ? formatDateTime(lastAttempt.created_at) : "—"}</p>
                    <p className="mt-1 text-app-muted">آخرین تلاش</p>
                  </div>
                  <div className="rounded border border-blue-100 bg-white p-3">
                    <p className="font-black text-app-text">{attemptSummary.media}</p>
                    <p className="mt-1 text-app-muted">انتشار رسانه‌ای</p>
                  </div>
                </div>
              </div>
            )}
          />

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

          <MetricStrip>
            <MetricTile label="پست منتشرشده" value={publishedCount} hint="خروجی‌های موفق در بازه" tone="success" icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />} />
            <MetricTile label="نرخ موفقیت" value={`${attemptSummary.successRate}%`} hint={`${attemptSummary.success} موفق از ${attemptSummary.completed} تلاش کامل‌شده`} tone={attemptSummary.successRate >= 80 ? "success" : "warning"} icon={<Target className="h-4 w-4" aria-hidden="true" />} />
            <MetricTile label="نیازمند توجه" value={failedCount} hint="پست یا تلاش ناموفق" tone={failedCount ? "alert" : "neutral"} icon={<AlertTriangle className="h-4 w-4" aria-hidden="true" />} />
            <MetricTile label="در صف انتشار" value={(statusCounts.ready ?? 0) + (statusCounts.scheduled ?? 0) + (statusCounts.publishing ?? 0)} hint="آماده، زمان‌بندی‌شده یا در حال انتشار" tone="primary" icon={<CalendarClock className="h-4 w-4" aria-hidden="true" />} />
          </MetricStrip>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
            <div className="min-w-0 space-y-4">
              <WorkspacePanel
                title="روند تلاش‌های انتشار"
                description="موفقیت و شکست تلاش‌ها در بازه انتخاب‌شده."
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
                <div className="grid gap-2">
                  {trend.map((item) => (
                    <div key={item.key} className="grid gap-2 rounded-md border border-app-border bg-slate-50 p-3 md:grid-cols-[90px_minmax(0,1fr)_70px] md:items-center">
                      <p className="text-xs font-black text-app-muted">{dayLabel(item.key)}</p>
                      <div className="h-3 overflow-hidden rounded-full bg-white ring-1 ring-app-border">
                        <div className="flex h-full" style={{ width: `${Math.max(4, percent(item.total, maxTrendTotal))}%` }}>
                          <div className="h-full bg-emerald-500" style={{ width: `${percent(item.success, Math.max(1, item.total))}%` }} />
                          <div className="h-full bg-rose-500" style={{ width: `${percent(item.failed, Math.max(1, item.total))}%` }} />
                        </div>
                      </div>
                      <p className="text-xs font-bold text-app-muted">{item.total} تلاش</p>
                    </div>
                  ))}
                </div>
              </WorkspacePanel>

              <WorkspacePanel
                title="ترکیب چرخه محتوا"
                description="وضعیت پست‌ها در بازه انتخاب‌شده."
              >
                <div className="grid gap-3 md:grid-cols-2">
                  {Object.entries(statusLabels).map(([status, label]) => {
                    const count = statusCounts[status] ?? 0;
                    const ratio = percent(count, Math.max(1, scopedPosts.length));
                    return (
                      <div key={status} className="rounded-md border border-app-border bg-slate-50 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={status} />
                            <span className="text-sm font-black text-app-text">{label}</span>
                          </div>
                          <span className="text-sm font-black text-app-text">{count}</span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                          <div className="h-full rounded-full bg-app-primary" style={{ width: `${ratio}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </WorkspacePanel>

              <WorkspacePanel
                title="ترکیب نوع انتشار"
                description="مقایسه تلاش‌های متنی و رسانه‌ای."
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-md border border-app-border bg-slate-50 p-4">
                    <div className="flex items-center gap-2">
                      <MessageSquareText className="h-5 w-5 text-app-primary" aria-hidden="true" />
                      <p className="text-sm font-black text-app-text">متنی</p>
                    </div>
                    <p className="mt-3 text-3xl font-black text-app-text">{attemptSummary.text}</p>
                    <p className="mt-2 text-xs text-app-muted">{percent(attemptSummary.text, scopedAttempts.length)}% از تلاش‌ها</p>
                  </div>
                  <div className="rounded-md border border-app-border bg-slate-50 p-4">
                    <div className="flex items-center gap-2">
                      <FileImage className="h-5 w-5 text-app-primary" aria-hidden="true" />
                      <p className="text-sm font-black text-app-text">رسانه‌ای</p>
                    </div>
                    <p className="mt-3 text-3xl font-black text-app-text">{attemptSummary.media}</p>
                    <p className="mt-2 text-xs text-app-muted">{percent(attemptSummary.media, scopedAttempts.length)}% از تلاش‌ها</p>
                  </div>
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

              <WorkspacePanel title="پست‌های در جریان" description="آماده، زمان‌بندی‌شده یا در حال انتشار.">
                {queuedPosts.length === 0 ? (
                  <EmptyState
                    icon={<CalendarClock className="h-5 w-5" aria-hidden="true" />}
                    title="پست فعالی در صف نیست"
                    description="از composer برای آماده‌سازی یا زمان‌بندی پست بعدی استفاده کنید."
                    action={<Button href="/compose" variant="secondary">ساخت پست</Button>}
                  />
                ) : null}
                <div className="space-y-2">
                  {queuedPosts.map((post) => (
                    <article key={post.id} className="rounded-md border border-app-border bg-white p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={post.status} />
                        <span className="text-xs text-app-muted">{formatDateTime(post.scheduled_at)}</span>
                      </div>
                      <h3 className="mt-2 truncate text-sm font-black text-app-text">{post.title}</h3>
                    </article>
                  ))}
                </div>
              </WorkspacePanel>

              <WorkspacePanel title="پرریسک‌ترین پست‌ها" description="بر اساس تعداد تلاش انتشار.">
                {highAttemptPosts.length === 0 ? (
                  <EmptyState
                    icon={<Activity className="h-5 w-5" aria-hidden="true" />}
                    title="تلاشی برای رتبه‌بندی وجود ندارد"
                    description="پس از انتشار، پست‌های پرتلاش اینجا مشخص می‌شوند."
                  />
                ) : null}
                <div className="space-y-2">
                  {highAttemptPosts.map((post) => (
                    <article key={post.id} className="rounded-md border border-app-border bg-white p-3">
                      <div className="flex items-center justify-between gap-3">
                        <StatusBadge status={post.status} />
                        <StatusToken tone={post.attempt_count > 1 ? "warning" : "neutral"}>{post.attempt_count} تلاش</StatusToken>
                      </div>
                      <h3 className="mt-2 truncate text-sm font-black text-app-text">{post.title}</h3>
                    </article>
                  ))}
                </div>
              </WorkspacePanel>

              <WorkspacePanel title="جزئیات بازه" description="خلاصه قابل اتکا برای تصمیم‌گیری.">
                <DetailGrid
                  items={[
                    { label: "تلاش کامل‌شده", value: attemptSummary.completed, hint: "موفق + ناموفق" },
                    { label: "در حال اجرا", value: attemptSummary.started, hint: "تلاش شروع‌شده" },
                    { label: "کل محتوا", value: scopedPosts.length, hint: "پست‌های مرتبط با بازه" },
                    { label: "کل تلاش‌ها", value: scopedAttempts.length, hint: "آخرین تلاش‌های ثبت‌شده" }
                  ]}
                />
              </WorkspacePanel>
            </aside>
          </section>
        </WorkspacePage>
      </AppShell>
    </AuthGate>
  );
}
