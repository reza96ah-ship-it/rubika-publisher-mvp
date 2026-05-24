"use client";

import { useCallback, useEffect, useState } from "react";
import { AuthGate } from "../../components/auth-gate";
import { AppShell } from "../../components/app-shell";
import { CountdownBadge } from "../../components/countdown-badge";
import { PageHeader } from "../../components/page-header";
import { StatusBadge } from "../../components/status-badge";
import { Button } from "../../components/ui/button";
import { SectionCard } from "../../components/ui/card";
import { apiUrl, authHeaders, formatDateTime, Post } from "../../lib/posts";

export default function QueuePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadQueue = useCallback(async () => {
    setLoading(true);
    const response = await fetch(`${apiUrl}/posts`, { headers: authHeaders() });
    if (!response.ok) throw new Error("دریافت صف انتشار ناموفق بود");
    const allPosts = (await response.json()) as Post[];
    setPosts(allPosts.filter((post) => ["ready", "scheduled", "publishing", "failed"].includes(post.status)));
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

        <SectionCard title="پست‌های داخل صف" description="نمای عملیاتی برای بررسی زمان‌بندی، خطاها و تلاش مجدد انتشار.">
          {loading ? <p className="text-sm text-app-muted">در حال دریافت...</p> : null}
          {!loading && posts.length === 0 ? <p className="text-sm text-app-muted">فعلاً پستی در صف انتشار نیست.</p> : null}
          <div className="grid gap-3">
            {posts.map((post) => (
              <article key={post.id} className="rounded-2xl border border-app-border bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={post.status} />
                      <CountdownBadge status={post.status} scheduledAt={post.scheduled_at} />
                      <span className="text-xs text-app-muted">زمان‌بندی: {formatDateTime(post.scheduled_at)}</span>
                    </div>
                    <h2 className="mt-3 truncate font-bold text-app-text">{post.title}</h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-7 text-app-muted">{post.caption || "بدون کپشن"}</p>
                    {post.last_error ? <p className="mt-2 text-xs text-rose-600">{post.last_error}</p> : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button href={`/compose?postId=${post.id}`} variant="secondary" size="sm">باز کردن</Button>
                    {post.status === "failed" ? (
                      <Button type="button" size="sm" onClick={() => retryPost(post)}>تلاش مجدد</Button>
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
