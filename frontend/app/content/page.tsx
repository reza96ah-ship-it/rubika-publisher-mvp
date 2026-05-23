"use client";

import { useCallback, useEffect, useState } from "react";
import { AuthGate } from "../../components/auth-gate";
import { AppShell } from "../../components/app-shell";
import { CountdownBadge } from "../../components/countdown-badge";
import { PageHeader } from "../../components/page-header";
import { StatusBadge } from "../../components/status-badge";
import { Button } from "../../components/ui/button";
import { SectionCard } from "../../components/ui/card";
import { apiUrl, authHeaders, formatDateTime, Post, workflowTabs } from "../../lib/posts";

export default function ContentWorkspacePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeStatus, setActiveStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadPosts = useCallback(async (status: string, query: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (query.trim()) params.set("search", query.trim());
    const response = await fetch(`${apiUrl}/posts?${params.toString()}`, { headers: authHeaders() });
    if (!response.ok) throw new Error("دریافت پست‌ها ناموفق بود");
    setPosts(await response.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPosts("all", "").catch((err) => {
      setError(err instanceof Error ? err.message : "خطا در دریافت فضای محتوا");
      setLoading(false);
    });
  }, [loadPosts]);

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
    await loadPosts(activeStatus, search);
  }

  async function applyFilters(nextStatus = activeStatus) {
    setActiveStatus(nextStatus);
    setMessage("");
    setError("");
    await loadPosts(nextStatus, search);
  }

  return (
    <AuthGate>
      <AppShell>
        <PageHeader
          eyebrow="فضای عملیاتی محتوا"
          title="فضای محتوا"
          description="مرکز مدیریت چرخه عمر پست‌ها؛ از پیش‌نویس تا آماده‌سازی، زمان‌بندی و پیگیری نتیجه انتشار."
          actionLabel="ایجاد پست جدید"
          actionHref="/compose"
        />

        <SectionCard title="فیلتر و جست‌وجو" description="پست‌ها را بر اساس وضعیت یا متن عنوان، کپشن و هشتگ محدود کنید.">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جست‌وجوی عنوان، کپشن یا هشتگ"
              className="w-full rounded-xl border border-app-border bg-white px-4 py-3 text-sm outline-none ring-app-primary focus:ring-2"
            />
            <Button type="button" onClick={() => applyFilters()}>اعمال فیلتر</Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {workflowTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => applyFilters(tab.value)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${activeStatus === tab.value ? "bg-app-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </SectionCard>

        {message ? <div className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
        {error ? <div className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <SectionCard title="لیست پست‌ها" description="برای ویرایش یا تغییر مرحله هر پست از عملیات همان ردیف استفاده کنید." className="mt-5">
          {loading ? <p className="text-sm text-app-muted">در حال دریافت...</p> : null}
          {!loading && posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-app-border bg-slate-50 p-8 text-center">
              <p className="font-bold text-app-text">هنوز پستی با این فیلتر وجود ندارد.</p>
              <p className="mt-2 text-sm text-app-muted">یک پست جدید بسازید یا فیلتر را تغییر دهید.</p>
              <Button href="/compose" className="mt-4">ایجاد پست جدید</Button>
            </div>
          ) : null}
          <div className="grid gap-3">
            {posts.map((post) => (
              <article key={post.id} className="rounded-2xl border border-app-border bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={post.status} />
                      <CountdownBadge status={post.status} scheduledAt={post.scheduled_at} />
                      {post.campaign ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{post.campaign}</span> : null}
                    </div>
                    <h2 className="mt-3 truncate text-base font-bold text-app-text">{post.title}</h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-7 text-app-muted">{post.caption || "بدون کپشن"}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-app-muted">
                      <span>زمان‌بندی: {formatDateTime(post.scheduled_at)}</span>
                      <span>تلاش انتشار: {post.attempt_count}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button href={`/compose?postId=${post.id}`} variant="secondary" size="sm">ویرایش</Button>
                    {post.status === "draft" || post.status === "failed" || post.status === "cancelled" ? (
                      <Button type="button" variant="secondary" size="sm" onClick={() => changeStatus(post, "ready")}>آماده</Button>
                    ) : null}
                    {post.status !== "cancelled" && post.status !== "published" ? (
                      <Button type="button" variant="ghost" size="sm" onClick={() => changeStatus(post, "cancelled")}>لغو</Button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>
      </AppShell>
    </AuthGate>
  );
}
