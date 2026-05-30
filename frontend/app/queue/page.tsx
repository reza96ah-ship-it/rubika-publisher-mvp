"use client";

import { AlertTriangle, CalendarClock, CheckCircle2, ListChecks, RotateCcw, TimerReset, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthGate } from "../../components/auth-gate";
import { AppShell } from "../../components/app-shell";
import { CountdownBadge } from "../../components/countdown-badge";
import { DataRow, DataSearchField, DataTable, DataToolbar, FilterChip } from "../../components/data-view";
import { PublishingWorkspaceHeader } from "../../components/publishing-workspace";
import { StatusBadge } from "../../components/status-badge";
import { Button } from "../../components/ui/button";
import { DetailGrid, EmptyState, MetricStrip, MetricTile, NoticeBanner, StatusToken, WorkspacePage, WorkspacePanel } from "../../components/workspace-ui";
import { apiUrl, authHeaders, formatDateTime, type Post } from "../../lib/posts";

type QueueFilter = "all" | "ready" | "scheduled" | "publishing" | "failed";

const queueFilters: Array<{ label: string; value: QueueFilter }> = [
  { label: "همه صف", value: "all" },
  { label: "آماده", value: "ready" },
  { label: "زمان‌بندی‌شده", value: "scheduled" },
  { label: "در حال انتشار", value: "publishing" },
  { label: "ناموفق", value: "failed" }
];

const queueStatuses = new Set(["ready", "scheduled", "publishing", "failed"]);
const queuePriority: Record<string, number> = {
  failed: 0,
  publishing: 1,
  scheduled: 2,
  ready: 3
};
const queueHeaderGrid = "grid-cols-[minmax(0,1.4fr)_140px_160px_220px]";
const queueRowGrid = "lg:grid-cols-[minmax(0,1.4fr)_140px_160px_220px]";

function scheduleTime(post: Post) {
  const date = post.scheduled_at ? new Date(post.scheduled_at) : null;
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : Number.MAX_SAFE_INTEGER;
}

function sortQueuePosts(posts: Post[]) {
  return [...posts].sort((first, second) => {
    const priorityDiff = (queuePriority[first.status] ?? 9) - (queuePriority[second.status] ?? 9);
    if (priorityDiff !== 0) return priorityDiff;
    return scheduleTime(first) - scheduleTime(second);
  });
}

function visibleQueueText(post: Post) {
  return [post.title, post.caption, post.hashtags, post.campaign, post.internal_note, post.last_error].filter(Boolean).join(" ").toLowerCase();
}

export default function QueuePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [statusFilter, setStatusFilter] = useState<QueueFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadQueue = useCallback(async () => {
    setLoading(true);
    const response = await fetch(`${apiUrl}/posts`, { headers: authHeaders() });
    if (!response.ok) throw new Error("دریافت صف انتشار ناموفق بود");
    const allPosts = (await response.json()) as Post[];
    const queuePosts = sortQueuePosts(allPosts.filter((post) => queueStatuses.has(post.status)));
    setPosts(queuePosts);
    setSelectedPostId((current) => current ?? queuePosts[0]?.id ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadQueue().catch((err) => {
      setError(err instanceof Error ? err.message : "خطا در دریافت صف انتشار");
      setLoading(false);
    });
  }, [loadQueue]);

  async function retryPost(post: Post) {
    setMessage("");
    setError("");
    const response = await fetch(`${apiUrl}/posts/${post.id}/retry`, {
      method: "POST",
      headers: authHeaders()
    });
    if (!response.ok) {
      setError("تلاش مجدد انتشار ناموفق بود");
      return;
    }
    setMessage("پست برای تلاش مجدد وارد صف انتشار شد");
    await loadQueue();
  }

  async function cancelPost(post: Post) {
    setMessage("");
    setError("");
    const response = await fetch(`${apiUrl}/posts/${post.id}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders()
      },
      body: JSON.stringify({ status: "cancelled" })
    });
    if (!response.ok) {
      setError("لغو پست ناموفق بود");
      return;
    }
    setMessage("پست از صف انتشار خارج شد");
    await loadQueue();
  }

  const filteredPosts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return posts
      .filter((post) => statusFilter === "all" || post.status === statusFilter)
      .filter((post) => !query || visibleQueueText(post).includes(query));
  }, [posts, searchTerm, statusFilter]);

  const counts = useMemo(() => {
    return {
      ready: posts.filter((post) => post.status === "ready").length,
      scheduled: posts.filter((post) => post.status === "scheduled").length,
      publishing: posts.filter((post) => post.status === "publishing").length,
      failed: posts.filter((post) => post.status === "failed").length
    };
  }, [posts]);

  const nextScheduled = useMemo(() => {
    const now = Date.now();
    return posts.find((post) => post.status === "scheduled" && scheduleTime(post) >= now);
  }, [posts]);

  const failedPosts = posts.filter((post) => post.status === "failed").slice(0, 4);
  const selectedPost = selectedPostId ? posts.find((post) => post.id === selectedPostId) ?? filteredPosts[0] ?? null : filteredPosts[0] ?? posts[0] ?? null;
  const filterCount = (filter: QueueFilter) => filter === "all" ? posts.length : counts[filter];
  const laneGroups = [
    {
      title: "بازیابی خطا",
      description: "اولویت اول برای رفع مانع انتشار",
      status: "failed",
      count: counts.failed,
      tone: "alert" as const,
      posts: posts.filter((post) => post.status === "failed").slice(0, 2)
    },
    {
      title: "در حال ارسال",
      description: "پست‌هایی که worker درگیر آن‌هاست",
      status: "publishing",
      count: counts.publishing,
      tone: "info" as const,
      posts: posts.filter((post) => post.status === "publishing").slice(0, 2)
    },
    {
      title: "برنامه انتشار",
      description: "دارای زمان و آماده ورود به worker",
      status: "scheduled",
      count: counts.scheduled,
      tone: "warning" as const,
      posts: posts.filter((post) => post.status === "scheduled").slice(0, 2)
    },
    {
      title: "آماده زمان‌بندی",
      description: "نیازمند انتخاب زمان انتشار",
      status: "ready",
      count: counts.ready,
      tone: "primary" as const,
      posts: posts.filter((post) => post.status === "ready").slice(0, 2)
    }
  ];

  return (
    <AuthGate>
      <AppShell>
        <WorkspacePage className="space-y-4">
          <PublishingWorkspaceHeader
            activeTab="queue"
            title="صف انتشار"
            description="گلوگاه‌های انتشار، زمان‌بندی و بازیابی خطا را در یک نمای عملیاتی کنترل کنید."
            counts={{
              queue: posts.length,
              failed: counts.failed
            }}
            meta={(
              <>
                <StatusToken tone="primary">{posts.length} پست در صف</StatusToken>
                <StatusToken tone={counts.failed ? "alert" : "success"}>{counts.failed ? `${counts.failed} خطای فعال` : "بدون خطای فعال"}</StatusToken>
              </>
            )}
          />

          {error ? <NoticeBanner tone="alert">{error}</NoticeBanner> : null}
          {message ? <NoticeBanner tone="success">{message}</NoticeBanner> : null}

          <MetricStrip>
            <MetricTile label="آماده" value={counts.ready} hint="منتظر انتخاب زمان انتشار" tone="primary" icon={<CheckCircle2 className="h-4 w-4" />} />
            <MetricTile label="زمان‌بندی‌شده" value={counts.scheduled} hint="داخل برنامه انتشار" tone="warning" icon={<CalendarClock className="h-4 w-4" />} />
            <MetricTile label="در حال انتشار" value={counts.publishing} hint="رزرو شده برای ارسال" tone="info" icon={<TimerReset className="h-4 w-4" />} />
            <MetricTile label="ناموفق" value={counts.failed} hint="نیازمند تلاش مجدد یا اصلاح" tone={counts.failed ? "alert" : "neutral"} icon={<AlertTriangle className="h-4 w-4" />} />
          </MetricStrip>

          <WorkspacePanel
            title="تابلوی وضعیت صف"
            description="نمای کانبان فشرده برای فهم سریع گلوگاه‌ها قبل از ورود به جدول عملیات."
            action={<StatusToken tone={counts.failed ? "alert" : "success"}>{counts.failed ? "رسیدگی لازم" : "صف پایدار"}</StatusToken>}
          >
            <div className="grid gap-3 lg:grid-cols-4">
              {laneGroups.map((lane) => (
                <div key={lane.status} className="rounded-md border border-app-border bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-app-text">{lane.title}</p>
                      <p className="mt-1 text-xs leading-5 text-app-muted">{lane.description}</p>
                    </div>
                    <StatusToken tone={lane.tone}>{lane.count}</StatusToken>
                  </div>
                  <div className="mt-3 space-y-2">
                    {lane.posts.length === 0 ? (
                      <p className="rounded border border-dashed border-app-border bg-white px-3 py-2 text-xs text-app-muted">موردی در این مسیر نیست.</p>
                    ) : null}
                    {lane.posts.map((post) => (
                      <button
                        key={post.id}
                        type="button"
                        onClick={() => {
                          setSelectedPostId(post.id);
                          setStatusFilter(lane.status as QueueFilter);
                        }}
                        className="w-full rounded border border-app-border bg-white px-3 py-2 text-right transition hover:border-blue-200 hover:bg-blue-50"
                      >
                        <p className="truncate text-xs font-black text-app-text">{post.title}</p>
                        <p className="mt-1 truncate text-[11px] text-app-muted">{formatDateTime(post.scheduled_at)}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </WorkspacePanel>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
            <WorkspacePanel
              title="پست‌های داخل صف"
              description="اسکن سریع وضعیت، زمان انتشار، خطا و عملیات‌های ضروری."
              bodyClassName="p-4"
              action={<Button href="/logs" variant="secondary" size="sm">سلامت انتشار</Button>}
            >
              <DataToolbar
                meta={(
                  <>
                    <StatusToken tone="neutral">{filteredPosts.length} نتیجه</StatusToken>
                    <StatusToken tone="neutral">{posts.length} کل صف</StatusToken>
                  </>
                )}
              >
                <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
                  <DataSearchField
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="جست‌وجوی عنوان، کپشن، کمپین، یادداشت یا خطا"
                  />
                  <div className="flex flex-wrap gap-2">
                    {queueFilters.map((filter) => (
                      <FilterChip
                        key={filter.value}
                        active={statusFilter === filter.value}
                        count={filterCount(filter.value)}
                        onClick={() => setStatusFilter(filter.value)}
                      >
                        {filter.label}
                      </FilterChip>
                    ))}
                  </div>
                </div>
              </DataToolbar>

              <DataTable
                columns={["محتوا", "وضعیت", "زمان", "عملیات"]}
                gridClassName={queueHeaderGrid}
                loading={loading}
                empty={filteredPosts.length === 0 ? (
                  <div className="p-4">
                    <EmptyState
                      icon={<ListChecks className="h-5 w-5" aria-hidden="true" />}
                      title="برای این فیلتر پستی در صف نیست."
                      description="از استودیو تولید یک پست آماده یا زمان‌بندی‌شده بسازید."
                      action={<Button href="/compose">ایجاد پست جدید</Button>}
                    />
                  </div>
                ) : null}
              >
                {filteredPosts.map((post) => (
                  <DataRow key={post.id} gridClassName={queueRowGrid} selected={selectedPost?.id === post.id}>
                    <div className="min-w-0">
                      <h2 className="truncate font-black text-app-text">{post.title}</h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-app-muted">{post.caption || "بدون کپشن"}</p>
                      {post.last_error ? <p className="mt-2 rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-xs leading-6 text-rose-700">{post.last_error}</p> : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 lg:block lg:space-y-2">
                      <StatusBadge status={post.status} />
                      <CountdownBadge status={post.status} scheduledAt={post.scheduled_at} />
                    </div>
                    <div className="space-y-2 text-xs leading-6 text-app-muted">
                      <p>زمان‌بندی: {formatDateTime(post.scheduled_at)}</p>
                      <p>تلاش انتشار: {post.attempt_count}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
                      <Button type="button" variant={selectedPost?.id === post.id ? "primary" : "secondary"} size="sm" onClick={() => setSelectedPostId(post.id)}>جزئیات</Button>
                      <Button href={`/compose?postId=${post.id}`} variant="secondary" size="sm">باز کردن</Button>
                      {post.status === "failed" ? (
                        <Button type="button" size="sm" onClick={() => retryPost(post)}>
                          <RotateCcw className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
                          تلاش مجدد
                        </Button>
                      ) : null}
                      {["ready", "scheduled"].includes(post.status) ? (
                        <Button type="button" variant="ghost" size="sm" onClick={() => cancelPost(post)}>لغو</Button>
                      ) : null}
                    </div>
                  </DataRow>
                ))}
              </DataTable>
            </WorkspacePanel>

            <aside className="space-y-4">
              <div className="sticky top-24 space-y-4">
                <WorkspacePanel title="بازبین صف" description="جزئیات و اقدام‌های پست انتخاب‌شده." bodyClassName="p-4">
                  {selectedPost ? (
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={selectedPost.status} />
                        <CountdownBadge status={selectedPost.status} scheduledAt={selectedPost.scheduled_at} />
                      </div>
                      <h2 className="mt-3 font-black text-app-text">{selectedPost.title}</h2>
                      <p className="mt-2 max-h-44 overflow-auto whitespace-pre-wrap rounded-md border border-app-border bg-slate-50 p-3 text-sm leading-7 text-app-muted">
                        {selectedPost.caption || "بدون کپشن"}
                      </p>
                      <div className="mt-4">
                        <DetailGrid
                          items={[
                            { label: "زمان‌بندی", value: formatDateTime(selectedPost.scheduled_at) },
                            { label: "تلاش انتشار", value: selectedPost.attempt_count },
                            { label: "آخرین تغییر", value: formatDateTime(selectedPost.updated_at) },
                            { label: "شناسه پست", value: `#${selectedPost.id}` }
                          ]}
                        />
                      </div>
                      {selectedPost.last_error ? (
                        <div className="mt-4">
                          <NoticeBanner tone="alert" title="آخرین خطا">
                            {selectedPost.last_error}
                          </NoticeBanner>
                        </div>
                      ) : null}
                      <div className="mt-4 grid gap-2">
                        <Button href={`/compose?postId=${selectedPost.id}`} variant="secondary">باز کردن پست</Button>
                        {selectedPost.status === "failed" ? (
                          <Button type="button" onClick={() => retryPost(selectedPost)}>
                            <RotateCcw className="ml-2 h-4 w-4" aria-hidden="true" />
                            تلاش مجدد انتشار
                          </Button>
                        ) : null}
                        {["ready", "scheduled"].includes(selectedPost.status) ? (
                          <Button type="button" variant="ghost" onClick={() => cancelPost(selectedPost)}>
                            لغو از صف
                          </Button>
                        ) : null}
                        <Button href="/logs" variant="secondary">مشاهده لاگ انتشار</Button>
                      </div>
                    </div>
                  ) : (
                    <EmptyState
                      icon={<XCircle className="h-5 w-5" aria-hidden="true" />}
                      title="پستی برای نمایش انتخاب نشده است."
                      action={<Button href="/compose">زمان‌بندی پست</Button>}
                    />
                  )}
                </WorkspacePanel>

                {nextScheduled ? (
                  <WorkspacePanel title="انتشار بعدی" description="نزدیک‌ترین پست زمان‌بندی‌شده در صف." bodyClassName="p-4">
                    <p className="font-black text-app-text">{nextScheduled.title}</p>
                    <p className="mt-2 text-sm leading-7 text-app-muted">{formatDateTime(nextScheduled.scheduled_at)}</p>
                    <CountdownBadge status={nextScheduled.status} scheduledAt={nextScheduled.scheduled_at} className="mt-3" />
                  </WorkspacePanel>
                ) : null}

                <WorkspacePanel title="خطاهای فعال" description="پست‌های ناموفق برای بازیابی سریع." bodyClassName="p-4">
                  {failedPosts.length === 0 ? (
                    <EmptyState
                      icon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />}
                      title="فعلاً خطای فعال وجود ندارد."
                      description="صف انتشار در وضعیت پایدار است."
                    />
                  ) : null}
                  <div className="space-y-3">
                    {failedPosts.map((post) => (
                      <article key={post.id} className="rounded-md border border-app-border bg-white p-3">
                        <div className="flex items-center justify-between gap-3">
                          <StatusBadge status={post.status} />
                          <span className="text-xs text-app-muted">تلاش: {post.attempt_count}</span>
                        </div>
                        <h3 className="mt-3 truncate font-bold text-app-text">{post.title}</h3>
                        {post.last_error ? <p className="mt-2 line-clamp-2 text-xs leading-6 text-rose-600">{post.last_error}</p> : null}
                        <div className="mt-3 flex gap-2">
                          <Button href={`/compose?postId=${post.id}`} variant="secondary" size="sm">باز کردن</Button>
                          <Button type="button" size="sm" onClick={() => retryPost(post)}>تلاش مجدد</Button>
                        </div>
                      </article>
                    ))}
                  </div>
                </WorkspacePanel>
              </div>
            </aside>
          </section>
        </WorkspacePage>
      </AppShell>
    </AuthGate>
  );
}
