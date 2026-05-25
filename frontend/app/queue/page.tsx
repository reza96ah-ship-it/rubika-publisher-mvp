"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthGate } from "../../components/auth-gate";
import { AppShell } from "../../components/app-shell";
import { CountdownBadge } from "../../components/countdown-badge";
import { PageHeader } from "../../components/page-header";
import { StatusBadge } from "../../components/status-badge";
import { Button } from "../../components/ui/button";
import { SectionCard } from "../../components/ui/card";
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

export default function QueuePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [statusFilter, setStatusFilter] = useState<QueueFilter>("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadQueue = useCallback(async () => {
    setLoading(true);
    const response = await fetch(`${apiUrl}/posts`, { headers: authHeaders() });
    if (!response.ok) throw new Error("دریافت صف انتشار ناموفق بود");
    const allPosts = (await response.json()) as Post[];
    setPosts(sortQueuePosts(allPosts.filter((post) => queueStatuses.has(post.status))));
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
    if (statusFilter === "all") return posts;
    return posts.filter((post) => post.status === statusFilter);
  }, [posts, statusFilter]);

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

  return (
    <AuthGate>
      <AppShell>
        <PageHeader
          eyebrow="صف عملیاتی انتشار"
          title="صف انتشار"
          description="پست‌های آماده، زمان‌بندی‌شده، در حال انتشار یا ناموفق را از همین نما کنترل و بازیابی کنید."
          actionLabel="ایجاد پست جدید"
          actionHref="/compose"
        />

        {error ? <div className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        {message ? <div className="mb-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}

        <section className="mb-5 grid gap-4 lg:grid-cols-4">
          <SectionCard title="آماده" description="منتظر انتخاب زمان.">
            <p className="text-2xl font-black text-app-text">{counts.ready}</p>
            <p className="mt-2 text-sm text-app-muted">پست آماده زمان‌بندی</p>
          </SectionCard>
          <SectionCard title="زمان‌بندی‌شده" description="در انتظار worker.">
            <p className="text-2xl font-black text-app-text">{counts.scheduled}</p>
            <p className="mt-2 text-sm text-app-muted">پست داخل برنامه انتشار</p>
          </SectionCard>
          <SectionCard title="در حال انتشار" description="رزرو شده برای ارسال.">
            <p className="text-2xl font-black text-app-text">{counts.publishing}</p>
            <p className="mt-2 text-sm text-app-muted">پست در مسیر ارسال</p>
          </SectionCard>
          <SectionCard title="ناموفق" description="نیازمند بازیابی.">
            <p className={`text-2xl font-black ${counts.failed > 0 ? "text-rose-700" : "text-app-text"}`}>{counts.failed}</p>
            <p className="mt-2 text-sm text-app-muted">پست دارای خطا</p>
          </SectionCard>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <SectionCard
            title="پست‌های داخل صف"
            description="نمای عملیاتی برای بررسی زمان‌بندی، خطاها، لغو و تلاش مجدد انتشار."
            action={(
              <div className="flex flex-wrap gap-2">
                {queueFilters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setStatusFilter(filter.value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      statusFilter === filter.value ? "bg-app-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            )}
          >
            {loading ? <p className="text-sm text-app-muted">در حال دریافت...</p> : null}
            {!loading && filteredPosts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-app-border bg-slate-50 p-8 text-center">
                <p className="font-bold text-app-text">برای این فیلتر پستی در صف نیست.</p>
                <p className="mt-2 text-sm text-app-muted">از composer یک پست آماده یا زمان‌بندی‌شده بسازید.</p>
                <Button href="/compose" className="mt-4">ایجاد پست جدید</Button>
              </div>
            ) : null}

            <div className="grid gap-3">
              {filteredPosts.map((post) => (
                <article key={post.id} className="rounded-2xl border border-app-border bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={post.status} />
                        <CountdownBadge status={post.status} scheduledAt={post.scheduled_at} />
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          زمان‌بندی: {formatDateTime(post.scheduled_at)}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          تلاش: {post.attempt_count}
                        </span>
                      </div>
                      <h2 className="mt-3 truncate font-bold text-app-text">{post.title}</h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-7 text-app-muted">{post.caption || "بدون کپشن"}</p>
                      {post.last_error ? <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-xs leading-6 text-rose-700">{post.last_error}</p> : null}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button href={`/compose?postId=${post.id}`} variant="secondary" size="sm">باز کردن</Button>
                      {post.status === "failed" ? (
                        <Button type="button" size="sm" onClick={() => retryPost(post)}>تلاش مجدد</Button>
                      ) : null}
                      {["ready", "scheduled"].includes(post.status) ? (
                        <Button type="button" variant="ghost" size="sm" onClick={() => cancelPost(post)}>لغو</Button>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </SectionCard>

          <div className="space-y-5">
            <SectionCard title="انتشار بعدی" description="نزدیک‌ترین پست زمان‌بندی‌شده در صف.">
              {nextScheduled ? (
                <div className="rounded-xl border border-app-border bg-white p-4">
                  <StatusBadge status={nextScheduled.status} />
                  <h2 className="mt-3 font-black text-app-text">{nextScheduled.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-app-muted">{formatDateTime(nextScheduled.scheduled_at)}</p>
                  <CountdownBadge status={nextScheduled.status} scheduledAt={nextScheduled.scheduled_at} className="mt-3" />
                  <Button href={`/compose?postId=${nextScheduled.id}`} variant="secondary" className="mt-4 w-full">باز کردن پست</Button>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-app-border bg-slate-50 p-5 text-center">
                  <p className="font-bold text-app-text">پست زمان‌بندی‌شده‌ای در صف نیست.</p>
                  <Button href="/compose" className="mt-4">زمان‌بندی پست</Button>
                </div>
              )}
            </SectionCard>

            <SectionCard title="خطاهای فعال" description="آخرین پست‌های ناموفق برای بازیابی سریع.">
              {failedPosts.length === 0 ? <p className="text-sm text-app-muted">فعلاً خطای فعال وجود ندارد.</p> : null}
              <div className="space-y-3">
                {failedPosts.map((post) => (
                  <article key={post.id} className="rounded-xl border border-app-border bg-white p-4">
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
            </SectionCard>
          </div>
        </section>
      </AppShell>
    </AuthGate>
  );
}
