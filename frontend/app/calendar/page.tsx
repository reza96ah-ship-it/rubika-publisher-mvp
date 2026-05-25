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
import { apiUrl, authHeaders, type Post } from "../../lib/posts";
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

type CalendarFilter = "all" | "scheduled" | "publishing" | "published" | "failed";

const calendarFilters: Array<{ label: string; value: CalendarFilter }> = [
  { label: "همه برنامه‌ها", value: "all" },
  { label: "زمان‌بندی‌شده", value: "scheduled" },
  { label: "در حال انتشار", value: "publishing" },
  { label: "منتشرشده", value: "published" },
  { label: "ناموفق", value: "failed" }
];

const calendarStatuses = new Set(["scheduled", "publishing", "published", "failed"]);

function isCalendarPost(post: Post) {
  return Boolean(post.scheduled_at && calendarStatuses.has(post.status));
}

function dateTime(value?: string | null) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : null;
}

export default function CalendarPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [statusFilter, setStatusFilter] = useState<CalendarFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPosts() {
      const response = await fetch(`${apiUrl}/posts`, { headers: authHeaders() });
      if (!response.ok) throw new Error("دریافت تقویم انتشار ناموفق بود");
      setPosts(await response.json());
      setLoading(false);
    }

    loadPosts().catch((err) => {
      setError(err instanceof Error ? err.message : "خطا در دریافت تقویم انتشار");
      setLoading(false);
    });
  }, []);

  const calendarPosts = useMemo(() => sortByScheduleAsc(posts.filter(isCalendarPost)), [posts]);
  const filteredPosts = useMemo(() => {
    if (statusFilter === "all") return calendarPosts;
    return calendarPosts.filter((post) => post.status === statusFilter);
  }, [calendarPosts, statusFilter]);

  const groups = useMemo(() => {
    const byDate = new Map<string, CalendarGroup>();

    for (const post of filteredPosts) {
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
  }, [filteredPosts]);

  const now = Date.now();
  const todayKey = jalaliDateKey(new Date().toISOString());
  const weekEnd = now + 7 * 24 * 60 * 60 * 1000;
  const upcomingPosts = calendarPosts.filter((post) => {
    const time = dateTime(post.scheduled_at);
    return time !== null && time >= now && time <= weekEnd && ["scheduled", "publishing"].includes(post.status);
  });
  const todayPosts = calendarPosts.filter((post) => jalaliDateKey(post.scheduled_at) === todayKey);
  const failedPosts = calendarPosts.filter((post) => post.status === "failed");
  const attentionPosts = calendarPosts
    .filter((post) => {
      const time = dateTime(post.scheduled_at);
      return post.status === "failed" || (post.status === "scheduled" && time !== null && time < now);
    })
    .slice(0, 5);
  const monthLabel = groups.length > 0 ? formatJalaliMonth(groups[0].sampleDate) : formatJalaliMonth(new Date().toISOString());
  const nextPost = calendarPosts.find((post) => {
    const time = dateTime(post.scheduled_at);
    return time !== null && time >= now && ["scheduled", "publishing"].includes(post.status);
  });

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

        <section className="mb-5 grid gap-4 lg:grid-cols-4">
          <SectionCard title="ماه فعال" description="بر اساس نزدیک‌ترین پست زمان‌بندی‌شده.">
            <p className="text-2xl font-black text-app-text">{monthLabel}</p>
            <p className="mt-2 text-sm text-app-muted">تعداد روزهای دارای برنامه: {groups.length}</p>
          </SectionCard>

          <SectionCard title="پست بعدی" description="نزدیک‌ترین انتشار آینده.">
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

          <SectionCard title="هفته آینده" description="پست‌های آینده در ۷ روز بعد.">
            <p className="text-2xl font-black text-app-text">{upcomingPosts.length}</p>
            <p className="mt-2 text-sm text-app-muted">پست فعال در بازه نزدیک</p>
          </SectionCard>

          <SectionCard title="نیازمند توجه" description="خطاها یا زمان‌های گذشته.">
            <p className={`text-2xl font-black ${attentionPosts.length > 0 ? "text-rose-700" : "text-app-text"}`}>{attentionPosts.length}</p>
            <p className="mt-2 text-sm text-app-muted">مورد عملیاتی برای بررسی</p>
          </SectionCard>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <SectionCard
            title="نمای روزهای شمسی"
            description="پست‌ها بر اساس روز جلالی گروه‌بندی شده‌اند. هر کارت یک روز کاری تقویم انتشار است."
            action={(
              <div className="flex flex-wrap gap-2">
                {calendarFilters.map((filter) => (
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
            {!loading && groups.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-app-border bg-slate-50 p-8 text-center">
                <p className="font-bold text-app-text">برای این فیلتر پستی در تقویم نیست.</p>
                <p className="mt-2 text-sm text-app-muted">از composer برای انتخاب زمان انتشار استفاده کنید یا فیلتر را تغییر دهید.</p>
                <Button href="/compose" className="mt-4">ایجاد پست زمان‌بندی‌شده</Button>
              </div>
            ) : null}

            <div className="grid gap-4">
              {groups.map((group) => (
                <article key={group.key} className="overflow-hidden rounded-2xl border border-app-border bg-white shadow-sm">
                  <header className="flex items-center gap-4 border-b border-app-border bg-slate-50 p-4">
                    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-white ring-1 ring-app-border">
                      <span className="text-xs font-semibold text-app-muted">{formatJalaliWeekday(group.sampleDate)}</span>
                      <span className="text-2xl font-black text-app-primary">{formatJalaliDayNumber(group.sampleDate)}</span>
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-black text-app-text">{formatJalaliDate(group.sampleDate)}</h2>
                      <p className="mt-1 text-xs text-app-muted">{group.posts.length} پست در این روز</p>
                    </div>
                    {jalaliDateKey(group.sampleDate) === todayKey ? (
                      <span className="mr-auto rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                        امروز
                      </span>
                    ) : null}
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
                              {post.attempt_count > 0 ? (
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                  تلاش: {post.attempt_count}
                                </span>
                              ) : null}
                            </div>
                            <h3 className="mt-3 truncate font-bold text-app-text">{post.title}</h3>
                            <p className="mt-2 line-clamp-2 text-sm leading-7 text-app-muted">{post.caption || "بدون کپشن"}</p>
                            {post.last_error ? <p className="mt-2 text-xs leading-6 text-rose-600">{post.last_error}</p> : null}
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

          <div className="space-y-5">
            <SectionCard title="خلاصه عملیاتی" description="دید سریع از وضعیت تقویم و صف نزدیک.">
              <div className="grid gap-3">
                <div className="rounded-xl border border-app-border bg-white p-4">
                  <p className="text-xs font-semibold text-app-muted">امروز</p>
                  <p className="mt-2 text-2xl font-black text-app-text">{todayPosts.length}</p>
                  <p className="mt-1 text-xs text-app-muted">پست در روز جاری</p>
                </div>
                <div className="rounded-xl border border-app-border bg-white p-4">
                  <p className="text-xs font-semibold text-app-muted">ناموفق</p>
                  <p className={`mt-2 text-2xl font-black ${failedPosts.length > 0 ? "text-rose-700" : "text-app-text"}`}>{failedPosts.length}</p>
                  <p className="mt-1 text-xs text-app-muted">پست نیازمند بازیابی</p>
                </div>
                <div className="rounded-xl border border-app-border bg-white p-4">
                  <p className="text-xs font-semibold text-app-muted">پوشش تقویم</p>
                  <p className="mt-2 text-2xl font-black text-app-text">{calendarPosts.length}</p>
                  <p className="mt-1 text-xs text-app-muted">پست دارای زمان انتشار</p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="موردهای نیازمند توجه" description="خطاها یا پست‌هایی که زمانشان گذشته است.">
              {attentionPosts.length === 0 ? <p className="text-sm text-app-muted">فعلاً مورد بحرانی در تقویم نیست.</p> : null}
              <div className="space-y-3">
                {attentionPosts.map((post) => (
                  <Link key={post.id} href={`/compose?postId=${post.id}`} className="block rounded-xl border border-app-border bg-white p-4 transition hover:bg-slate-50">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={post.status} />
                      <span className="text-xs text-app-muted">{formatJalaliDateTime(post.scheduled_at)}</span>
                    </div>
                    <p className="mt-3 truncate font-bold text-app-text">{post.title}</p>
                    {post.last_error ? <p className="mt-2 line-clamp-2 text-xs leading-6 text-rose-600">{post.last_error}</p> : null}
                  </Link>
                ))}
              </div>
              {attentionPosts.length > 0 ? <Button href="/queue" variant="secondary" className="mt-4 w-full">باز کردن صف انتشار</Button> : null}
            </SectionCard>
          </div>
        </section>
      </AppShell>
    </AuthGate>
  );
}
