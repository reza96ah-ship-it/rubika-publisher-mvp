"use client";

import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  Pencil,
  RotateCcw,
  XCircle
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "../../components/app-shell";
import { AuthGate } from "../../components/auth-gate";
import { CountdownBadge } from "../../components/countdown-badge";
import { DataRow, DataSearchField, DataTable, DataToolbar, FilterChip } from "../../components/data-view";
import { PageHeader } from "../../components/page-header";
import { StatusBadge } from "../../components/status-badge";
import { Button } from "../../components/ui/button";
import { SectionCard, SurfaceCard } from "../../components/ui/card";
import { apiUrl, authHeaders, formatDateTime, Post, postFinalText, workflowTabs } from "../../lib/posts";

type Metric = {
  label: string;
  value: number | string;
  hint: string;
  icon: typeof FileText;
  tone: string;
};

const searchableFields: Array<keyof Pick<Post, "title" | "caption" | "hashtags" | "campaign" | "internal_note">> = [
  "title",
  "caption",
  "hashtags",
  "campaign",
  "internal_note"
];
const contentHeaderGrid = "grid-cols-[minmax(0,1.4fr)_140px_150px_220px]";
const contentRowGrid = "lg:grid-cols-[minmax(0,1.4fr)_140px_150px_220px]";

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeStatus, setActiveStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const response = await fetch(`${apiUrl}/posts`, { headers: authHeaders() });
    if (!response.ok) throw new Error("دریافت پست‌ها ناموفق بود");
    const data: Post[] = await response.json();
    setPosts(data);
    setSelectedPostId((current) => current ?? data[0]?.id ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPosts().catch((err) => {
      setError(err instanceof Error ? err.message : "خطا در دریافت فضای محتوا");
      setLoading(false);
    });
  }, [loadPosts]);

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return posts
      .filter((post) => activeStatus === "all" || post.status === activeStatus)
      .filter((post) => !query || visiblePostText(post).includes(query))
      .sort((a, b) => {
        if (a.status === "failed" && b.status !== "failed") return -1;
        if (a.status !== "failed" && b.status === "failed") return 1;
        return compareBySchedule(a, b);
      });
  }, [activeStatus, posts, search]);

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
        tone: "bg-blue-50 text-blue-700 ring-blue-100"
      },
      {
        label: "نیازمند رسیدگی",
        value: failed,
        hint: failed ? "پست ناموفق یا خطادار را بازبینی کنید" : "خطای فعال ندارید",
        icon: AlertCircle,
        tone: failed ? "bg-rose-50 text-rose-700 ring-rose-100" : "bg-emerald-50 text-emerald-700 ring-emerald-100"
      },
      {
        label: "آماده و زمان‌بندی‌شده",
        value: ready + scheduled,
        hint: nextScheduled ? `نزدیک‌ترین انتشار: ${formatDateTime(nextScheduled.scheduled_at)}` : "هنوز انتشار آینده ثبت نشده",
        icon: CalendarClock,
        tone: "bg-amber-50 text-amber-700 ring-amber-100"
      },
      {
        label: "منتشرشده",
        value: published,
        hint: "خروجی‌های موفق در لاگ انتشار قابل پیگیری‌اند",
        icon: CheckCircle2,
        tone: "bg-emerald-50 text-emerald-700 ring-emerald-100"
      }
    ];
  }, [filteredPosts.length, posts]);

  async function changeStatus(post: Post, status: string) {
    setMessage("");
    setError("");
    const response = await fetch(`${apiUrl}/posts/${post.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ status })
    });
    if (!response.ok) {
      setError("تغییر وضعیت پست ناموفق بود");
      return;
    }
    setMessage("وضعیت پست به‌روزرسانی شد");
    await loadPosts();
  }

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
    await loadPosts();
  }

  function clearFilters() {
    setActiveStatus("all");
    setSearch("");
  }

  function selectPost(post: Post) {
    setSelectedPostId(post.id);
  }

  return (
    <AuthGate>
      <AppShell>
        <PageHeader
          eyebrow="فضای عملیاتی محتوا"
          title="فضای محتوا"
          description="نمای حرفه‌ای برای کنترل چرخه عمر پست‌ها؛ از پیش‌نویس و آماده‌سازی تا زمان‌بندی، خطاها و خروجی منتشرشده."
          actionLabel="ایجاد پست جدید"
          actionHref="/compose"
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <SurfaceCard key={metric.label} className="min-h-32">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-app-muted">{metric.label}</p>
                    <p className="mt-3 text-3xl font-black text-app-text">{metric.value}</p>
                  </div>
                  <div className={`rounded-xl p-3 ring-1 ${metric.tone}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                </div>
                <p className="mt-4 text-xs leading-6 text-app-muted">{metric.hint}</p>
              </SurfaceCard>
            );
          })}
        </div>

        {message ? <div className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
        {error ? <div className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <SectionCard
            title="مرکز کنترل محتوا"
            description="ردیف‌ها برای اسکن سریع، انتخاب پست و اجرای عملیات طراحی شده‌اند."
            action={
              <Button type="button" variant="secondary" onClick={clearFilters}>
                پاک کردن فیلتر
              </Button>
            }
          >
            <DataToolbar
              meta={(
                <>
                  <span>{filteredPosts.length} نتیجه</span>
                  <span>{posts.length} کل پست</span>
                </>
              )}
            >
              <DataSearchField
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="جست‌وجوی عنوان، کپشن، هشتگ، کمپین یا یادداشت"
              />
            </DataToolbar>

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
                <div className="p-8 text-center">
                  <p className="font-bold text-app-text">هیچ پستی با این فیلتر پیدا نشد.</p>
                  <p className="mt-2 text-sm text-app-muted">جست‌وجو یا وضعیت انتخاب‌شده را تغییر دهید.</p>
                  <Button href="/compose" className="mt-4">ایجاد پست جدید</Button>
                </div>
              ) : null}
            >
              {filteredPosts.map((post) => {
                const selected = selectedPost?.id === post.id;
                return (
                    <DataRow key={post.id} gridClassName={contentRowGrid} selected={selected}>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {post.campaign ? <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{post.campaign}</span> : null}
                          {post.hashtags ? <span className="truncate rounded-md bg-blue-50 px-2.5 py-1 text-xs text-blue-700">{post.hashtags}</span> : null}
                        </div>
                        <h2 className="mt-3 truncate text-base font-bold text-app-text">{post.title}</h2>
                        <p className="mt-2 line-clamp-2 text-sm leading-7 text-app-muted">{post.caption || "بدون کپشن"}</p>
                        {post.last_error ? <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs leading-6 text-rose-700">{post.last_error}</p> : null}
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
                          جزئیات
                        </Button>
                        <Button href={`/compose?postId=${post.id}`} variant="secondary" size="sm">
                          <Pencil className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
                          ویرایش
                        </Button>
                        {(post.status === "draft" || post.status === "failed" || post.status === "cancelled") ? (
                          <Button type="button" variant="secondary" size="sm" onClick={() => changeStatus(post, "ready")}>
                            آماده
                          </Button>
                        ) : null}
                        {post.status === "failed" ? (
                          <Button type="button" size="sm" onClick={() => retryPost(post)}>
                            <RotateCcw className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
                            تلاش مجدد
                          </Button>
                        ) : null}
                        {post.status !== "cancelled" && post.status !== "published" ? (
                          <Button type="button" variant="ghost" size="sm" onClick={() => changeStatus(post, "cancelled")}>
                            لغو
                          </Button>
                        ) : null}
                      </div>
                    </DataRow>
                );
              })}
            </DataTable>
          </SectionCard>

          <aside className="space-y-5">
            <SectionCard title="بازبین پست" description="پست انتخاب‌شده را بدون خروج از فضای محتوا بررسی کنید.">
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

                  <div className="rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700 ring-1 ring-app-border">
                    {postFinalText(selectedPost) || "متن نهایی برای این پست هنوز کامل نشده است."}
                  </div>

                  <div className="grid gap-3 text-xs text-app-muted">
                    <div className="rounded-xl bg-white p-3 ring-1 ring-app-border">
                      <p className="font-bold text-app-text">زمان‌بندی</p>
                      <p className="mt-1">{formatDateTime(selectedPost.scheduled_at)}</p>
                    </div>
                    <div className="rounded-xl bg-white p-3 ring-1 ring-app-border">
                      <p className="font-bold text-app-text">کمپین</p>
                      <p className="mt-1">{selectedPost.campaign || "بدون کمپین"}</p>
                    </div>
                    <div className="rounded-xl bg-white p-3 ring-1 ring-app-border">
                      <p className="font-bold text-app-text">یادداشت داخلی</p>
                      <p className="mt-1 leading-6">{selectedPost.internal_note || "یادداشتی ثبت نشده است."}</p>
                    </div>
                  </div>

                  {selectedPost.last_error ? (
                    <div className="rounded-xl bg-rose-50 p-3 text-xs leading-6 text-rose-700 ring-1 ring-rose-100">
                      <p className="font-bold">آخرین خطا</p>
                      <p className="mt-1">{selectedPost.last_error}</p>
                    </div>
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
                <div className="rounded-xl border border-dashed border-app-border bg-slate-50 p-5 text-center text-sm text-app-muted">
                  برای مشاهده جزئیات، یک پست را از لیست انتخاب کنید.
                </div>
              )}
            </SectionCard>

            <SectionCard title="نمای عملیاتی" description="مسیرهای سریع برای ادامه کار.">
              <div className="grid gap-2">
                <Button href="/queue" variant="secondary">صف انتشار</Button>
                <Button href="/calendar" variant="secondary">تقویم انتشار</Button>
                <Button href="/logs" variant="secondary">لاگ انتشار</Button>
              </div>
            </SectionCard>
          </aside>
        </div>
      </AppShell>
    </AuthGate>
  );
}
