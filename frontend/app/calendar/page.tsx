"use client";

import { useEffect, useState } from "react";
import { AuthGate } from "../../components/auth-gate";
import { AppShell } from "../../components/app-shell";
import { PageHeader } from "../../components/page-header";
import { StatusBadge } from "../../components/status-badge";
import { SectionCard } from "../../components/ui/card";
import { apiUrl, authHeaders, formatDateTime, Post } from "../../lib/posts";

export default function CalendarPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPosts() {
      const response = await fetch(`${apiUrl}/posts?status=scheduled`, { headers: authHeaders() });
      if (!response.ok) throw new Error("دریافت تقویم انتشار ناموفق بود");
      setPosts(await response.json());
      setLoading(false);
    }

    loadPosts().catch((err) => {
      setError(err instanceof Error ? err.message : "خطا در دریافت تقویم انتشار");
      setLoading(false);
    });
  }, []);

  return (
    <AuthGate>
      <AppShell>
        <PageHeader
          eyebrow="تقویم محتوا"
          title="تقویم انتشار"
          description="نمای تاریخ‌محور پست‌هایی که وارد وضعیت زمان‌بندی‌شده شده‌اند. انتشار خودکار در Phase 4B فعال می‌شود."
          actionLabel="ایجاد پست جدید"
          actionHref="/compose"
        />

        {error ? <div className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <SectionCard title="پست‌های زمان‌بندی‌شده" description="فعلاً این نما یک تقویم عملیاتی ساده است و فقط پست‌های دارای زمان انتشار را نشان می‌دهد.">
          {loading ? <p className="text-sm text-app-muted">در حال دریافت...</p> : null}
          {!loading && posts.length === 0 ? <p className="text-sm text-app-muted">هنوز پستی زمان‌بندی نشده است.</p> : null}
          <div className="grid gap-3">
            {posts.map((post) => (
              <article key={post.id} className="rounded-2xl border border-app-border bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={post.status} />
                      <span className="text-xs text-app-muted">{formatDateTime(post.scheduled_at)}</span>
                    </div>
                    <h2 className="mt-3 font-bold text-app-text">{post.title}</h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-7 text-app-muted">{post.caption || "بدون کپشن"}</p>
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
