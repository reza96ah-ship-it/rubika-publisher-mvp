"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "../components/auth-gate";
import { AppShell } from "../components/app-shell";
import { CountdownBadge } from "../components/countdown-badge";
import { DashboardCard } from "../components/dashboard-card";
import { PageHeader } from "../components/page-header";
import { ReadinessJourney } from "../components/readiness-journey";
import { StatusBadge } from "../components/status-badge";
import { Button } from "../components/ui/button";
import { SectionCard } from "../components/ui/card";
import { apiUrl, authHeaders, formatDateTime, Post } from "../lib/posts";
import { loadWorkspaceOverview, RubikaSettings, StoreProfile } from "../lib/workspace";

function statusCount(posts: Post[], status: string) {
  return posts.filter((post) => post.status === status).length;
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [store, setStore] = useState<StoreProfile | null>(null);
  const [rubika, setRubika] = useState<RubikaSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const [response, overview] = await Promise.all([
        fetch(`${apiUrl}/posts`, { headers: authHeaders() }),
        loadWorkspaceOverview()
      ]);
      if (!response.ok) throw new Error("دریافت داشبورد ناموفق بود");
      setPosts(await response.json());
      setStore(overview.store);
      setRubika(overview.rubika);
      setLoading(false);
    }

    loadDashboard().catch((err) => {
      setError(err instanceof Error ? err.message : "خطا در دریافت داشبورد");
      setLoading(false);
    });
  }, []);

  const scheduledPosts = useMemo(() => {
    return posts
      .filter((post) => post.status === "scheduled" && post.scheduled_at)
      .sort((first, second) => String(first.scheduled_at).localeCompare(String(second.scheduled_at)));
  }, [posts]);

  const nextPost = scheduledPosts[0];
  const attentionPosts = posts.filter((post) => ["draft", "ready", "failed"].includes(post.status)).slice(0, 4);

  return (
    <AuthGate>
      <AppShell>
        <PageHeader
          eyebrow="مرکز کنترل انتشار"
          title="داشبورد انتشار روبیکا"
          description="وضعیت آماده‌سازی، صف انتشار، پست بعدی و خطاهای مهم را در یک نمای عملیاتی ببینید."
          actionLabel="ایجاد پست جدید"
          actionHref="/compose"
        />

        {error ? <div className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        {loading ? <p className="mb-5 text-sm text-app-muted">در حال دریافت داشبورد...</p> : null}

        <ReadinessJourney store={store} rubika={rubika} posts={posts} loading={loading} />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCard label="پیش‌نویس" value={String(statusCount(posts, "draft"))} hint="نیازمند تکمیل یا آماده‌سازی" />
          <DashboardCard label="آماده" value={String(statusCount(posts, "ready"))} hint="آماده ورود به زمان‌بندی" />
          <DashboardCard label="زمان‌بندی‌شده" value={String(statusCount(posts, "scheduled"))} hint="منتظر رسیدن زمان انتشار" />
          <DashboardCard label="ناموفق" value={String(statusCount(posts, "failed"))} hint="نیازمند بررسی یا تلاش مجدد" />
        </div>

        <section className="mt-6 grid gap-5 xl:grid-cols-3">
          <SectionCard title="پست بعدی" description="نزدیک‌ترین پست زمان‌بندی‌شده و شمارش معکوس آن." className="xl:col-span-2">
            {nextPost ? (
              <div className="rounded-2xl border border-app-border bg-slate-50 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={nextPost.status} />
                  <CountdownBadge status={nextPost.status} scheduledAt={nextPost.scheduled_at} />
                </div>
                <h2 className="mt-4 text-xl font-black text-app-text">{nextPost.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-7 text-app-muted">{nextPost.caption || "بدون کپشن"}</p>
                <p className="mt-3 text-sm text-app-muted">زمان انتشار: {formatDateTime(nextPost.scheduled_at)}</p>
                <Button href={`/compose?postId=${nextPost.id}`} variant="secondary" className="mt-4">باز کردن پست</Button>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-app-border bg-slate-50 p-8 text-center">
                <p className="font-bold text-app-text">هنوز پست زمان‌بندی‌شده‌ای وجود ندارد.</p>
                <p className="mt-2 text-sm text-app-muted">از composer یک زمان انتشار انتخاب کنید.</p>
                <Button href="/compose" className="mt-4">زمان‌بندی اولین پست</Button>
              </div>
            )}
          </SectionCard>

          <SectionCard title="مسیرهای سریع" description="بخش‌های پرکاربرد برای ادامه کار روزانه.">
            <div className="grid gap-3">
              <Button href="/content" variant="secondary">فضای محتوا</Button>
              <Button href="/queue" variant="secondary">صف انتشار</Button>
              <Button href="/calendar" variant="secondary">تقویم جلالی</Button>
              <Button href="/rubika" variant="secondary">اتصال روبیکا</Button>
            </div>
          </SectionCard>
        </section>

        <SectionCard title="اقدام‌های بعدی" description="پست‌هایی که هنوز نیاز به تکمیل، آماده‌سازی یا بررسی خطا دارند." className="mt-6">
          {attentionPosts.length === 0 ? <p className="text-sm text-app-muted">مورد فوری برای اقدام وجود ندارد.</p> : null}
          <div className="grid gap-3 lg:grid-cols-2">
            {attentionPosts.map((post) => (
              <div key={post.id} className="rounded-2xl border border-app-border bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={post.status} />
                  <CountdownBadge status={post.status} scheduledAt={post.scheduled_at} />
                </div>
                <h3 className="mt-3 font-bold text-app-text">{post.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-7 text-app-muted">{post.caption || "بدون کپشن"}</p>
                <Button href={`/compose?postId=${post.id}`} variant="secondary" size="sm" className="mt-3">باز کردن</Button>
              </div>
            ))}
          </div>
        </SectionCard>
      </AppShell>
    </AuthGate>
  );
}
