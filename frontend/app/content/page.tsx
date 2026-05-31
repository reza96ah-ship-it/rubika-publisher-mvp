"use client";

import {
  AlertCircle,
  ArrowDownUp,
  CalendarClock,
  CheckCircle2,
  CheckSquare2,
  Clock3,
  FileText,
  Pencil,
  RefreshCw,
  RotateCcw,
  XCircle
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "../../components/app-shell";
import { AuthGate } from "../../components/auth-gate";
import { CountdownBadge } from "../../components/countdown-badge";
import { DataRow, DataSearchField, DataTable, DataToolbar, FilterChip } from "../../components/data-view";
import { PublishingTab, PublishingWorkspaceHeader } from "../../components/publishing-workspace";
import { StatusBadge } from "../../components/status-badge";
import { useToast } from "../../components/toast-provider";
import { Button } from "../../components/ui/button";
import { DetailGrid, EmptyState, NoticeBanner, StatusToken, WorkspacePage, WorkspacePanel } from "../../components/workspace-ui";
import { notifyNotificationsUpdated } from "../../lib/notifications";
import { apiUrl, authHeaders, formatDateTime, Post, postFinalText, readApiError, workflowTabs } from "../../lib/posts";

type Metric = {
  label: string;
  value: number | string;
  hint: string;
  icon: typeof FileText;
  tone: "neutral" | "primary" | "success" | "warning" | "alert" | "info";
};

type SortMode = "priority" | "updated" | "schedule" | "title";

const searchableFields: Array<keyof Pick<Post, "title" | "caption" | "hashtags" | "campaign" | "internal_note">> = [
  "title",
  "caption",
  "hashtags",
  "campaign",
  "internal_note"
];
const contentHeaderGrid = "grid-cols-[minmax(0,1.4fr)_140px_170px_100px]";
const contentRowGrid = "lg:grid-cols-[minmax(0,1.4fr)_140px_170px_100px]";

function statusCount(posts: Post[], status: string) {
  if (status === "all") return posts.length;
  return posts.filter((post) => post.status === status).length;
}

function compareBySchedule(a: Post, b: Post) {
  const first = a.scheduled_at ? new Date(a.scheduled_at).getTime() : Number.MAX_SAFE_INTEGER;
  const second = b.scheduled_at ? new Date(b.scheduled_at).getTime() : Number.MAX_SAFE_INTEGER;
  return first - second;
}

function visiblePostText(post: Post) {
  return searchableFields.map((field) => post[field] ?? "").join(" ").toLowerCase();
}

export default function ContentWorkspacePage() {
  const { showToast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeStatus, setActiveStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [sortMode, setSortMode] = useState<SortMode>("priority");
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadPosts = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const response = await fetch(`${apiUrl}/posts`, { headers: authHeaders() });
      if (!response.ok) throw new Error("دریافت پست‌ها ناموفق بود");
      const data: Post[] = await response.json();
      setPosts(data);
      setSelectedPostId((current) => current ?? data[0]?.id ?? null);
      setSelectedIds((current) => new Set([...current].filter((id) => data.some((post) => post.id === id))));
      setLastUpdatedAt(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPosts().catch((err) => {
      setError(err instanceof Error ? err.message : "خطا در دریافت فضای محتوا");
      setLoading(false);
    });
  }, [loadPosts]);

  useEffect(() => {
    const requestedStatus = new URLSearchParams(window.location.search).get("status");
    if (requestedStatus && workflowTabs.some((tab) => tab.value === requestedStatus)) {
      setActiveStatus(requestedStatus);
    }
  }, []);

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return posts
      .filter((post) => activeStatus === "all" || post.status === activeStatus)
      .filter((post) => campaignFilter === "all" || post.campaign === campaignFilter)
      .filter((post) => !query || visiblePostText(post).includes(query))
      .sort((a, b) => {
        if (sortMode === "updated") return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        if (sortMode === "schedule") return compareBySchedule(a, b);
        if (sortMode === "title") return a.title.localeCompare(b.title, "fa");
        if (a.status === "failed" && b.status !== "failed") return -1;
        if (a.status !== "failed" && b.status === "failed") return 1;
        return compareBySchedule(a, b);
      });
  }, [activeStatus, campaignFilter, posts, search, sortMode]);

  const campaigns = useMemo(() => {
    return [...new Set(posts.map((post) => post.campaign.trim()).filter(Boolean))].sort((first, second) => first.localeCompare(second, "fa"));
  }, [posts]);

  const selectedPost = useMemo(() => {
    if (selectedPostId) {
      return posts.find((post) => post.id === selectedPostId) ?? filteredPosts[0] ?? null;
    }
    return filteredPosts[0] ?? posts[0] ?? null;
  }, [filteredPosts, posts, selectedPostId]);

  const metrics = useMemo<Metric[]>(() => {
    const failed = statusCount(posts, "failed");
    const scheduled = statusCount(posts, "scheduled");
    const ready = statusCount(posts, "ready");
    const published = statusCount(posts, "published");
    const nextScheduled = posts
      .filter((post) => post.status === "scheduled" && post.scheduled_at)
      .sort(compareBySchedule)[0];

    return [
      {
        label: "کل محتوا",
        value: posts.length,
        hint: `${filteredPosts.length} پست در نمای فعلی`,
        icon: FileText,
        tone: "primary"
      },
      {
        label: "نیازمند رسیدگی",
        value: failed,
        hint: failed ? "پست ناموفق یا خطادار را بازبینی کنید" : "خطای فعال ندارید",
        icon: AlertCircle,
        tone: failed ? "alert" : "success"
      },
      {
        label: "آماده و زمان‌بندی‌شده",
        value: ready + scheduled,
        hint: nextScheduled ? `نزدیک‌ترین انتشار: ${formatDateTime(nextScheduled.scheduled_at)}` : "هنوز انتشار آینده ثبت نشده",
        icon: CalendarClock,
        tone: "warning"
      },
      {
        label: "منتشرشده",
        value: published,
        hint: "خروجی‌های موفق در لاگ انتشار قابل پیگیری‌اند",
        icon: CheckCircle2,
        tone: "success"
      }
    ];
  }, [filteredPosts.length, posts]);

  const failedCount = statusCount(posts, "failed");
  const draftCount = statusCount(posts, "draft");
  const readyCount = statusCount(posts, "ready");
  const scheduledCount = statusCount(posts, "scheduled");
  const publishingCount = statusCount(posts, "publishing");
  const publishedCount = statusCount(posts, "published");
  const activePublishingTab: PublishingTab = activeStatus === "draft" || activeStatus === "published" || activeStatus === "failed"
    ? activeStatus
    : "content";
  const selectedVisibleIds = filteredPosts.map((post) => post.id);
  const allVisibleSelected = selectedVisibleIds.length > 0 && selectedVisibleIds.every((id) => selectedIds.has(id));

  function applyPublishingTab(tab: PublishingTab) {
    if (tab === "draft" || tab === "published" || tab === "failed") {
      setActiveStatus(tab);
    } else if (tab === "content") {
      setActiveStatus("all");
    }
  }

  function toggleSelected(postId: number) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allVisibleSelected) selectedVisibleIds.forEach((id) => next.delete(id));
      else selectedVisibleIds.forEach((id) => next.add(id));
      return next;
    });
  }

  async function bulkChangeStatus(status: "ready" | "cancelled") {
    if (!selectedIds.size) return;
    setMessage("");
    setError("");
    setBulkUpdating(true);
    const response = await fetch(`${apiUrl}/posts/bulk-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ post_ids: [...selectedIds], status })
    });
    if (!response.ok) {
      const detail = await readApiError(response, "به‌روزرسانی گروهی محتوا ناموفق بود");
      setError(detail);
      setBulkUpdating(false);
      showToast({ title: "عملیات گروهی ناموفق بود", description: detail, tone: "alert" });
      return;
    }
    const result = (await response.json()) as { updated_count: number; skipped_post_ids: number[] };
    const skippedText = result.skipped_post_ids.length ? `، ${result.skipped_post_ids.length} مورد بدون تغییر باقی ماند` : "";
    setMessage(`${result.updated_count} پست به‌روزرسانی شد${skippedText}`);
    showToast({ title: "عملیات گروهی انجام شد", description: `${result.updated_count} پست به‌روزرسانی شد`, tone: "success" });
    setSelectedIds(new Set());
    setBulkUpdating(false);
    notifyNotificationsUpdated();
    await loadPosts(true);
  }

  async function changeStatus(post: Post, status: string) {
    setMessage("");
    setError("");
    const previousPosts = posts;
    setPosts((current) => current.map((item) => item.id === post.id ? { ...item, status, scheduled_at: status === "cancelled" ? null : item.scheduled_at } : item));
    const response = await fetch(`${apiUrl}/posts/${post.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ status })
    });
    if (!response.ok) {
      setPosts(previousPosts);
      const detail = await readApiError(response, "تغییر وضعیت پست ناموفق بود");
      setError(detail);
      showToast({ title: "تغییر وضعیت ناموفق بود", description: detail, tone: "alert" });
      return;
    }
    setMessage("وضعیت پست به‌روزرسانی شد");
    showToast({ title: "وضعیت پست به‌روزرسانی شد", description: post.title, tone: "success" });
    notifyNotificationsUpdated();
    await loadPosts(true);
  }

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
      const detail = await readApiError(response, "تلاش مجدد انتشار ناموفق بود");
      setError(detail);
      showToast({ title: "تلاش مجدد ناموفق بود", description: detail, tone: "alert" });
      return;
    }
    setMessage("پست برای تلاش مجدد وارد صف انتشار شد");
    showToast({ title: "پست دوباره وارد صف شد", description: post.title, tone: "success" });
    notifyNotificationsUpdated();
    await loadPosts(true);
  }

  function clearFilters() {
    setActiveStatus("all");
    setSearch("");
    setCampaignFilter("all");
    setSortMode("priority");
  }

  function selectPost(post: Post) {
    setSelectedPostId(post.id);
  }

  return (
    <AuthGate>
      <AppShell>
        <WorkspacePage>
          <PublishingWorkspaceHeader
            activeTab={activePublishingTab}
            title="لیست محتوا"
            description="پست‌ها را جست‌وجو، فیلتر و بدون خروج از فضای انتشار بررسی کنید."
            counts={{
              content: posts.length,
              queue: readyCount + scheduledCount + publishingCount,
              draft: draftCount,
              published: publishedCount,
              failed: failedCount
            }}
            onTabChange={applyPublishingTab}
            meta={(
              <>
                <StatusToken tone={failedCount ? "alert" : "success"}>{failedCount ? `${failedCount} نیازمند رسیدگی` : "بدون خطای فعال"}</StatusToken>
                <StatusToken tone="warning">{scheduledCount} زمان‌بندی‌شده</StatusToken>
                {lastUpdatedAt ? <StatusToken tone="neutral">به‌روزرسانی {lastUpdatedAt.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}</StatusToken> : null}
              </>
            )}
            action={(
              <Button type="button" variant="secondary" size="sm" disabled={refreshing} onClick={() => loadPosts(true)}>
                <RefreshCw className={`ml-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
                به‌روزرسانی
              </Button>
            )}
          />

          <section className="grid overflow-hidden rounded-md border border-app-border bg-white sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              const toneClass = metric.tone === "alert"
                ? "text-rose-700"
                : metric.tone === "success"
                  ? "text-emerald-700"
                  : metric.tone === "warning"
                    ? "text-amber-700"
                    : "text-app-primary";
              return (
                <div key={metric.label} className="flex min-w-0 items-start gap-3 border-b border-app-border p-3 last:border-b-0 sm:border-l sm:last:border-l-0 xl:border-b-0">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-50 ${toneClass}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <p className={`text-lg font-black ${toneClass}`}>{metric.value}</p>
                      <p className="truncate text-xs font-bold text-app-text">{metric.label}</p>
                    </div>
                    <p className="mt-1 truncate text-[11px] text-app-muted">{metric.hint}</p>
                  </div>
                </div>
              );
            })}
          </section>

          {message ? <NoticeBanner tone="success" title="انجام شد">{message}</NoticeBanner> : null}
          {error ? <NoticeBanner tone="alert" title="نیاز به بررسی">{error}</NoticeBanner> : null}

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
            <WorkspacePanel
              title="کتابخانه محتوا"
              description="پست‌ها را اسکن کنید و برای بازبینی یا اقدام عملیاتی به پنل کناری بفرستید."
              action={
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={toggleAllVisible}>
                    <CheckSquare2 className="ml-2 h-4 w-4" aria-hidden="true" />
                    {allVisibleSelected ? "لغو انتخاب نما" : "انتخاب همه نما"}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>پاک کردن فیلتر</Button>
                </div>
              }
            >
              <DataToolbar
                meta={(
                  <>
                    <StatusToken tone="neutral">{filteredPosts.length} نتیجه</StatusToken>
                    <StatusToken tone="neutral">{posts.length} کل پست</StatusToken>
                  </>
                )}
              >
                <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_170px_170px]">
                  <DataSearchField
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="جست‌وجوی عنوان، کپشن، هشتگ، کمپین یا یادداشت"
                  />
                  <label className="flex items-center gap-2 rounded-md border border-app-border bg-white px-3 py-2 text-xs font-bold text-app-muted">
                    <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <select value={campaignFilter} onChange={(event) => setCampaignFilter(event.target.value)} className="min-w-0 flex-1 bg-transparent text-xs font-bold text-app-text outline-none">
                      <option value="all">همه کمپین‌ها</option>
                      {campaigns.map((campaign) => <option key={campaign} value={campaign}>{campaign}</option>)}
                    </select>
                  </label>
                  <label className="flex items-center gap-2 rounded-md border border-app-border bg-white px-3 py-2 text-xs font-bold text-app-muted">
                    <ArrowDownUp className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)} className="min-w-0 flex-1 bg-transparent text-xs font-bold text-app-text outline-none">
                      <option value="priority">اولویت عملیاتی</option>
                      <option value="updated">آخرین تغییر</option>
                      <option value="schedule">زمان انتشار</option>
                      <option value="title">عنوان</option>
                    </select>
                  </label>
                </div>
              </DataToolbar>

              {selectedIds.size ? (
                <div className="mt-4 flex flex-col justify-between gap-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-sm font-black text-app-text">{selectedIds.size} پست انتخاب شده است</p>
                    <p className="mt-1 text-xs leading-5 text-app-muted">عملیات گروهی فقط روی وضعیت‌های مجاز اجرا می‌شود و موارد ناسازگار بدون تغییر باقی می‌مانند.</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button type="button" size="sm" disabled={bulkUpdating} onClick={() => bulkChangeStatus("ready")}>
                      <CheckCircle2 className="ml-2 h-4 w-4" aria-hidden="true" />
                      آماده‌سازی گروهی
                    </Button>
                    <Button type="button" variant="danger" size="sm" disabled={bulkUpdating} onClick={() => bulkChangeStatus("cancelled")}>
                      <XCircle className="ml-2 h-4 w-4" aria-hidden="true" />
                      لغو گروهی
                    </Button>
                    <Button type="button" variant="ghost" size="sm" disabled={bulkUpdating} onClick={() => setSelectedIds(new Set())}>پاک کردن انتخاب</Button>
                  </div>
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                {workflowTabs.map((tab) => {
                  const active = activeStatus === tab.value;
                  return (
                    <FilterChip
                      key={tab.value}
                      active={active}
                      count={statusCount(posts, tab.value)}
                      onClick={() => setActiveStatus(tab.value)}
                    >
                      {tab.label}
                    </FilterChip>
                  );
                })}
              </div>

              <DataTable
                columns={["محتوا", "مرحله", "زمان", "عملیات"]}
                gridClassName={contentHeaderGrid}
                loading={loading}
                empty={filteredPosts.length === 0 ? (
                  <div className="p-4">
                    <EmptyState
                      icon={<FileText className="h-5 w-5" aria-hidden="true" />}
                      title="هیچ پستی با این فیلتر پیدا نشد"
                      description="جست‌وجو یا وضعیت انتخاب‌شده را تغییر دهید."
                      action={<Button href="/compose">ایجاد پست جدید</Button>}
                    />
                  </div>
                ) : null}
              >
                {filteredPosts.map((post) => {
                  const selected = selectedPost?.id === post.id;
                  return (
                    <DataRow key={post.id} gridClassName={contentRowGrid} selected={selected}>
                      <div className="min-w-0">
                        <label className="mb-3 inline-flex items-center gap-2 text-xs font-bold text-app-muted">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(post.id)}
                            onChange={() => toggleSelected(post.id)}
                            className="h-4 w-4 rounded border-app-border accent-blue-600"
                          />
                          انتخاب برای عملیات گروهی
                        </label>
                        <div className="flex flex-wrap items-center gap-2">
                          {post.campaign ? <StatusToken tone="neutral">{post.campaign}</StatusToken> : null}
                          {post.hashtags ? <StatusToken tone="primary" className="max-w-full truncate">{post.hashtags}</StatusToken> : null}
                        </div>
                        <h2 className="mt-3 truncate text-base font-black text-app-text">{post.title}</h2>
                        <p className="mt-2 line-clamp-2 text-sm leading-7 text-app-muted">{post.caption || "بدون کپشن"}</p>
                        {post.last_error ? <p className="mt-3 rounded bg-rose-50 px-3 py-2 text-xs leading-6 text-rose-700">{post.last_error}</p> : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 lg:block lg:space-y-2">
                        <StatusBadge status={post.status} />
                        <CountdownBadge status={post.status} scheduledAt={post.scheduled_at} />
                      </div>

                      <div className="space-y-2 text-xs leading-6 text-app-muted">
                        <p className="flex items-center gap-2">
                          <Clock3 className="h-4 w-4" aria-hidden="true" />
                          {formatDateTime(post.scheduled_at)}
                        </p>
                        <p>تلاش انتشار: {post.attempt_count}</p>
                        <p>به‌روزرسانی: {formatDateTime(post.updated_at)}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        <Button type="button" variant={selected ? "primary" : "secondary"} size="sm" onClick={() => selectPost(post)}>
                          بازبینی
                        </Button>
                      </div>
                    </DataRow>
                  );
                })}
              </DataTable>
            </WorkspacePanel>

            <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
              <WorkspacePanel
                title="بازبین پست"
                description="پست انتخاب‌شده را بدون خروج از فضای محتوا بررسی کنید."
                action={selectedPost ? <StatusBadge status={selectedPost.status} /> : null}
              >
                {selectedPost ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={selectedPost.status} />
                        <CountdownBadge status={selectedPost.status} scheduledAt={selectedPost.scheduled_at} />
                      </div>
                      <h3 className="mt-3 text-lg font-black text-app-text">{selectedPost.title}</h3>
                      <p className="mt-2 text-xs leading-6 text-app-muted">شناسه پست #{selectedPost.id}</p>
                    </div>

                    <div className="max-h-72 overflow-auto whitespace-pre-wrap rounded-md border border-app-border bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                      {postFinalText(selectedPost) || "متن نهایی برای این پست هنوز کامل نشده است."}
                    </div>

                    <DetailGrid
                      items={[
                        { label: "زمان‌بندی", value: formatDateTime(selectedPost.scheduled_at), hint: "زمان برنامه‌ریزی انتشار" },
                        { label: "کمپین", value: selectedPost.campaign || "بدون کمپین", hint: "برچسب عملیاتی محتوا" },
                        { label: "تلاش انتشار", value: selectedPost.attempt_count, hint: "تعداد تلاش‌های ثبت‌شده" },
                        { label: "به‌روزرسانی", value: formatDateTime(selectedPost.updated_at), hint: "آخرین تغییر پست" }
                      ]}
                    />

                    {selectedPost.internal_note ? (
                      <div className="rounded-md border border-app-border bg-slate-50 p-3 text-xs leading-6 text-app-muted">
                        <p className="font-black text-app-text">یادداشت داخلی</p>
                        <p className="mt-1">{selectedPost.internal_note}</p>
                      </div>
                    ) : null}

                    {selectedPost.last_error ? (
                      <NoticeBanner tone="alert" title="آخرین خطا">
                        {selectedPost.last_error}
                      </NoticeBanner>
                    ) : null}

                    <div className="grid gap-2">
                      <Button href={`/compose?postId=${selectedPost.id}`} variant="secondary">
                        <Pencil className="ml-2 h-4 w-4" aria-hidden="true" />
                        ویرایش در کمپوزر
                      </Button>
                      {(selectedPost.status === "draft" || selectedPost.status === "failed" || selectedPost.status === "cancelled") ? (
                        <Button type="button" variant="secondary" onClick={() => changeStatus(selectedPost, "ready")}>
                          <CheckCircle2 className="ml-2 h-4 w-4" aria-hidden="true" />
                          علامت‌گذاری به عنوان آماده
                        </Button>
                      ) : null}
                      {selectedPost.status === "failed" ? (
                        <Button type="button" onClick={() => retryPost(selectedPost)}>
                          <RotateCcw className="ml-2 h-4 w-4" aria-hidden="true" />
                          تلاش مجدد انتشار
                        </Button>
                      ) : null}
                      {selectedPost.status !== "cancelled" && selectedPost.status !== "published" ? (
                        <Button type="button" variant="ghost" onClick={() => changeStatus(selectedPost, "cancelled")}>
                          <XCircle className="ml-2 h-4 w-4" aria-hidden="true" />
                          لغو پست
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={<FileText className="h-5 w-5" aria-hidden="true" />}
                    title="پستی انتخاب نشده"
                    description="برای مشاهده جزئیات، یک پست را از لیست انتخاب کنید."
                  />
                )}
              </WorkspacePanel>

            </aside>
          </div>
        </WorkspacePage>
      </AppShell>
    </AuthGate>
  );
}
