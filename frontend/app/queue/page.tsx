"use client";

import { AlertTriangle, CalendarClock, CheckCircle2, ListChecks, RotateCcw, TimerReset, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthGate } from "../../components/auth-gate";
import { AppShell } from "../../components/app-shell";
import { CountdownBadge } from "../../components/countdown-badge";
import { DataRow, DataSearchField, DataTable, DataToolbar, FilterChip } from "../../components/data-view";
import { PublishingWorkspaceHeader } from "../../components/publishing-workspace";
import { StatusBadge } from "../../components/status-badge";
import { useToast } from "../../components/toast-provider";
import { Button } from "../../components/ui/button";
import { DetailGrid, EmptyState, NoticeBanner, StatusToken, WorkspacePage, WorkspacePanel } from "../../components/workspace-ui";
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
const queueHeaderGrid = "grid-cols-[minmax(0,1.4fr)_140px_170px_100px]";
const queueRowGrid = "lg:grid-cols-[minmax(0,1.4fr)_140px_170px_100px]";

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
  const { showToast } = useToast();
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
    const previousPosts = posts;
    setPosts((current) => current.map((item) => item.id === post.id ? { ...item, status: "scheduled", scheduled_at: new Date().toISOString(), failed_at: null, last_error: "" } : item));
    const response = await fetch(`${apiUrl}/posts/${post.id}/retry`, {
      method: "POST",
      headers: authHeaders()
    });
    if (!response.ok) {
      setPosts(previousPosts);
      setError("تلاش مجدد انتشار ناموفق بود");
      showToast({ title: "تلاش مجدد ناموفق بود", description: post.title, tone: "alert" });
      return;
    }
    setMessage("پست برای تلاش مجدد وارد صف انتشار شد");
    showToast({ title: "پست دوباره وارد صف شد", description: post.title, tone: "success" });
    await loadQueue();
  }

  async function cancelPost(post: Post) {
    setMessage("");
    setError("");
    const previousPosts = posts;
    setPosts((current) => current.filter((item) => item.id !== post.id));
    const response = await fetch(`${apiUrl}/posts/${post.id}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders()
      },
      body: JSON.stringify({ status: "cancelled" })
    });
    if (!response.ok) {
      setPosts(previousPosts);
      setError("لغو پست ناموفق بود");
      showToast({ title: "لغو پست ناموفق بود", description: post.title, tone: "alert" });
      return;
    }
    setMessage("پست از صف انتشار خارج شد");
    showToast({ title: "پست از صف خارج شد", description: post.title, tone: "success" });
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

  const selectedPost = selectedPostId ? posts.find((post) => post.id === selectedPostId) ?? filteredPosts[0] ?? null : filteredPosts[0] ?? posts[0] ?? null;
  const filterCount = (filter: QueueFilter) => filter === "all" ? posts.length : counts[filter];
  const queueSummary = [
    {
      label: "آماده",
      detail: "منتظر انتخاب زمان",
      status: "ready" as const,
      count: counts.ready,
      icon: CheckCircle2,
      tone: "text-app-primary"
    },
    {
      label: "زمان‌بندی‌شده",
      detail: "داخل برنامه انتشار",
      status: "scheduled" as const,
      count: counts.scheduled,
      icon: CalendarClock,
      tone: "text-amber-700"
    },
    {
      label: "در حال انتشار",
      detail: "در اختیار worker",
      status: "publishing" as const,
      count: counts.publishing,
      icon: TimerReset,
      tone: "text-sky-700"
    },
    {
      label: "ناموفق",
      detail: "نیازمند بازیابی",
      status: "failed" as const,
      count: counts.failed,
      icon: AlertTriangle,
      tone: counts.failed ? "text-rose-700" : "text-slate-500"
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

          <section className="grid overflow-hidden rounded-md border border-app-border bg-white sm:grid-cols-2 xl:grid-cols-4">
            {queueSummary.map((item) => {
              const Icon = item.icon;
              const active = statusFilter === item.status;
              return (
                <button
                  key={item.status}
                  type="button"
                  onClick={() => setStatusFilter(active ? "all" : item.status)}
                  className={`flex min-w-0 items-start gap-3 border-b border-app-border p-3 text-right transition hover:bg-slate-50 sm:border-l sm:last:border-l-0 xl:border-b-0 ${
                    active ? "bg-blue-50/60 ring-1 ring-inset ring-blue-200" : ""
                  }`}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-50 ${item.tone}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-baseline gap-2">
                      <span className={`text-lg font-black ${item.tone}`}>{item.count}</span>
                      <span className="truncate text-xs font-bold text-app-text">{item.label}</span>
                    </span>
                    <span className="mt-1 block truncate text-[11px] text-app-muted">{item.detail}</span>
                  </span>
                </button>
              );
            })}
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
            <WorkspacePanel
              title="عملیات صف"
              description="پست‌های صف را اسکن کنید و اقدام‌های اصلی را از بازبین کناری انجام دهید."
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
                      <Button type="button" variant={selectedPost?.id === post.id ? "primary" : "secondary"} size="sm" onClick={() => setSelectedPostId(post.id)}>بازبینی</Button>
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

              </div>
            </aside>
          </section>
        </WorkspacePage>
      </AppShell>
    </AuthGate>
  );
}
