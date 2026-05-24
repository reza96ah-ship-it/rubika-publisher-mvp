"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "../../components/auth-gate";
import { AppShell } from "../../components/app-shell";
import { CountdownBadge } from "../../components/countdown-badge";
import { PageHeader } from "../../components/page-header";
import { StatusBadge } from "../../components/status-badge";
import { Button } from "../../components/ui/button";
import { SectionCard } from "../../components/ui/card";
import { apiUrl, authHeaders, Post } from "../../lib/posts";
import {
  formatJalaliDate,
  formatJalaliDateTime,
  formatJalaliDayNumber,
  formatJalaliMonth,
  formatJalaliTime,
  formatJalaliWeekday,
  jalaliDateKey,
  sortByScheduleAsc
} from "../../lib/jalali";

type CalendarGroup = {
  key: string;
  sampleDate: string;
  posts: Post[];
};

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

  const sortedPosts = useMemo(() => sortByScheduleAsc(posts), [posts]);

  const groups = useMemo(() => {
    const byDate = new Map<string, CalendarGroup>();

    for (const post of sortedPosts) {
      if (!post.scheduled_at) continue;
      const key = jalaliDateKey(post.scheduled_at);
      const current = byDate.get(key);
      if (current) {
        current.posts.push(post);
      } else {
        byDate.set(key, { key, sampleDate: post.scheduled_at, posts: [post] });
      }
    }

    return Array.from(byDate.values());
  }, [sortedPosts]);

  const monthLabel = groups.length > 0 ? formatJalaliMonth(groups[0].sampleDate) : formatJalaliMonth(new Date().toISOString());
  const nextPost = sortedPosts[0];

  return (
    <AuthGate>
      <AppShell>
        <PageHeader
          eyebrow="تقویم جلالی محتوا"
          title="تقویم انتشار"
          description="نمای راست‌به‌چپ و شمسی برای کنترل پست‌های زمان‌بندی‌شده، پیدا کردن شکاف‌های تقویم و باز کردن سریع هر پست."
          actionLabel="ایجاد پست جدید"
          actionHref="/compose"
        />

        {error ? <div className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <section className="mb-5 grid gap-4 lg:grid-cols-3">
          <SectionCard title="ماه فعال" description="بر اساس نزدیک‌ترین پست زمان‌بندی‌شده.">
            <p className="text-2xl font-black text-app-text">{monthLabel}</p>
            <p className="mt-2 text-sm text-app-muted">تعداد روزهای دارای برنامه: {groups.length}</p>
          </SectionCard>

          <SectionCard title="پست بعدی" description="نزدیک‌ترین انتشار زمان‌بندی‌شده.">
            {nextPost ? (
              <div>
                <p className="font-bold text-app-text">{nextPost.title}</p>
                <p className="mt-2 text-sm text-app-muted">{formatJalaliDateTime(nextPost.scheduled_at)}</p>
                <CountdownBadge status={nextPost.status} scheduledAt={nextPost.scheduled_at} className="mt-3" />
              </div>
            ) : (
              <p className="text-sm text-app-muted">هنوز پستی زمان‌بندی نشده است.</p>
            )}
          </SectionCard>

          <SectionCard title="وضعیت تقویم" description="خلاصه عملیاتی صف زمان‌بندی.">
            <p className="text-2xl font-black text-app-text">{sortedPosts.length}</p>
            <p className="mt-2 text-sm text-app-muted">پست زمان‌بندی‌شده در تقویم شمسی</p>
          </SectionCard>
        </section>

        <SectionCard title="نمای روزهای شمسی" description="پست‌ها بر اساس روز جلالی گروه‌بندی شده‌اند. هر کارت یک روز کاری تقویم انتشار است.">
          {loading ? <p className="text-sm text-app-muted">در حال دریافت...</p> : null}
          {!loading && groups.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-app-border bg-slate-50 p-8 text-center">
              <p className="font-bold text-app-text">هنوز پستی زمان‌بندی نشده است.</p>
              <p className="mt-2 text-sm text-app-muted">از composer برای انتخاب زمان انتشار استفاده کنید.</p>
              <Button href="/compose" className="mt-4">ایجاد پست زمان‌بندی‌شده</Button>
            </div>
          ) : null}

          <div className="grid gap-4 xl:grid-cols-2">
            {groups.map((group) => (
              <article key={group.key} className="overflow-hidden rounded-2xl border border-app-border bg-white shadow-sm">
                <header className="flex items-center gap-4 border-b border-app-border bg-slate-50 p-4">
                  <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-white ring-1 ring-app-border">
                    <span className="text-xs font-semibold text-app-muted">{formatJalaliWeekday(group.sampleDate)}</span>
                    <span className="text-2xl font-black text-app-primary">{formatJalaliDayNumber(group.sampleDate)}</span>
                  </div>
                  <div>
                    <h2 className="font-black text-app-text">{formatJalaliDate(group.sampleDate)}</h2>
                    <p className="mt-1 text-xs text-app-muted">{group.posts.length} پست در این روز</p>
                  </div>
                </header>

                <div className="space-y-3 p-4">
                  {group.posts.map((post) => (
                    <Link key={post.id} href={`/compose?postId=${post.id}`} className="block rounded-xl border border-app-border bg-white p-4 transition hover:bg-slate-50">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={post.status} />
                            <CountdownBadge status={post.status} scheduledAt={post.scheduled_at} />
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-app-primary">
                              {formatJalaliTime(post.scheduled_at)}
                            </span>
                          </div>
                          <h3 className="mt-3 truncate font-bold text-app-text">{post.title}</h3>
                          <p className="mt-2 line-clamp-2 text-sm leading-7 text-app-muted">{post.caption || "بدون کپشن"}</p>
                        </div>
                        <span className="text-xs text-app-muted">ویرایش</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </SectionCard>
      </AppShell>
    </AuthGate>
  );
}
