"use client";

import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Grid3X3,
  List,
  Plus,
  Rows3
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../../components/app-shell";
import { AuthGate } from "../../components/auth-gate";
import { CountdownBadge } from "../../components/countdown-badge";
import { PageHeader } from "../../components/page-header";
import { StatusBadge } from "../../components/status-badge";
import { Button } from "../../components/ui/button";
import { SectionCard, SurfaceCard } from "../../components/ui/card";
import { apiUrl, authHeaders, type Post } from "../../lib/posts";
import {
  formatJalaliDate,
  formatJalaliDateTime,
  formatJalaliMonth,
  formatJalaliTime,
  jalaliDateKey,
  sortByScheduleAsc
} from "../../lib/jalali";

type CalendarFilter = "all" | "scheduled" | "publishing" | "published" | "failed";
type ViewMode = "month" | "week" | "list";

type CalendarDay = {
  date: string;
  key: string;
  day: number;
};

const calendarFilters: Array<{ label: string; value: CalendarFilter }> = [
  { label: "همه", value: "all" },
  { label: "زمان‌بندی", value: "scheduled" },
  { label: "در حال انتشار", value: "publishing" },
  { label: "منتشر", value: "published" },
  { label: "ناموفق", value: "failed" }
];

const viewModes: Array<{ label: string; value: ViewMode; icon: typeof Grid3X3 }> = [
  { label: "ماه", value: "month", icon: Grid3X3 },
  { label: "هفته", value: "week", icon: Rows3 },
  { label: "لیست", value: "list", icon: List }
];

const weekDays = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
const calendarStatuses = new Set(["scheduled", "publishing", "published", "failed"]);

function isCalendarPost(post: Post) {
  return Boolean(post.scheduled_at && calendarStatuses.has(post.status));
}

function dateTime(value?: string | null) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : null;
}

function jalaliParts(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const parts = new Intl.DateTimeFormat("en-US-u-ca-persian-nu-latn", {
    calendar: "persian",
    numberingSystem: "latn",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(byType.year),
    month: Number(byType.month),
    day: Number(byType.day)
  };
}

function addDays(value: string | Date, days: number) {
  const date = typeof value === "string" ? new Date(value) : new Date(value);
  date.setDate(date.getDate() + days);
  return date;
}

function weekOffset(date: Date) {
  return (date.getDay() + 1) % 7;
}

function makeCalendarDay(date: Date): CalendarDay {
  return {
    date: date.toISOString(),
    key: jalaliDateKey(date.toISOString()),
    day: jalaliParts(date).day
  };
}

function buildMonthDays(anchorIso: string) {
  const anchor = new Date(anchorIso);
  const target = jalaliParts(anchor);
  const scanStart = addDays(anchor, -45);
  const days: CalendarDay[] = [];

  for (let index = 0; index <= 90; index += 1) {
    const date = addDays(scanStart, index);
    const parts = jalaliParts(date);
    if (parts.year === target.year && parts.month === target.month) {
      days.push(makeCalendarDay(date));
    }
  }

  return days;
}

function buildMonthGrid(days: CalendarDay[]) {
  if (days.length === 0) return [];
  const firstOffset = weekOffset(new Date(days[0].date));
  const endOffset = (7 - ((firstOffset + days.length) % 7)) % 7;
  return [
    ...Array.from({ length: firstOffset }, () => null),
    ...days,
    ...Array.from({ length: endOffset }, () => null)
  ];
}

function buildWeekDays(anchorIso: string) {
  const anchor = new Date(anchorIso);
  const start = addDays(anchor, -weekOffset(anchor));
  return Array.from({ length: 7 }, (_, index) => makeCalendarDay(addDays(start, index)));
}

function shiftPersianMonth(anchorIso: string, direction: -1 | 1) {
  const days = buildMonthDays(anchorIso);
  const boundary = direction === 1 ? days[days.length - 1] : days[0];
  if (!boundary) return new Date().toISOString();
  return addDays(boundary.date, direction).toISOString();
}

function statusCount(posts: Post[], status: CalendarFilter) {
  if (status === "all") return posts.length;
  return posts.filter((post) => post.status === status).length;
}

function postTone(status: string) {
  if (status === "failed") return "border-rose-200 bg-rose-50 text-rose-700";
  if (status === "published") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "publishing") return "border-sky-200 bg-sky-50 text-sky-700";
  return "border-blue-200 bg-blue-50 text-blue-700";
}

function dayRangeLabel(days: CalendarDay[]) {
  if (days.length === 0) return "—";
  return `${formatJalaliDate(days[0].date)} تا ${formatJalaliDate(days[days.length - 1].date)}`;
}

export default function CalendarPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [statusFilter, setStatusFilter] = useState<CalendarFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [monthAnchor, setMonthAnchor] = useState(new Date().toISOString());
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPosts() {
      const response = await fetch(`${apiUrl}/posts`, { headers: authHeaders() });
      if (!response.ok) throw new Error("دریافت تقویم انتشار ناموفق بود");
      const data: Post[] = await response.json();
      const sorted = sortByScheduleAsc(data.filter(isCalendarPost));
      const upcoming = sorted.find((post) => {
        const time = dateTime(post.scheduled_at);
        return time !== null && time >= Date.now() && ["scheduled", "publishing"].includes(post.status);
      });
      setPosts(data);
      setMonthAnchor(upcoming?.scheduled_at ?? sorted[0]?.scheduled_at ?? new Date().toISOString());
      setSelectedPostId(upcoming?.id ?? sorted[0]?.id ?? null);
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

  const postsByDay = useMemo(() => {
    const map = new Map<string, Post[]>();
    for (const post of filteredPosts) {
      if (!post.scheduled_at) continue;
      const key = jalaliDateKey(post.scheduled_at);
      map.set(key, [...(map.get(key) ?? []), post]);
    }
    return map;
  }, [filteredPosts]);

  const monthDays = useMemo(() => buildMonthDays(monthAnchor), [monthAnchor]);
  const monthGrid = useMemo(() => buildMonthGrid(monthDays), [monthDays]);
  const activeWeekDays = useMemo(() => buildWeekDays(monthAnchor), [monthAnchor]);
  const selectedPost = useMemo(() => {
    if (selectedPostId) {
      return calendarPosts.find((post) => post.id === selectedPostId) ?? filteredPosts[0] ?? null;
    }
    return filteredPosts[0] ?? calendarPosts[0] ?? null;
  }, [calendarPosts, filteredPosts, selectedPostId]);

  const now = Date.now();
  const todayKey = jalaliDateKey(new Date().toISOString());
  const weekEnd = now + 7 * 24 * 60 * 60 * 1000;
  const nextPost = calendarPosts.find((post) => {
    const time = dateTime(post.scheduled_at);
    return time !== null && time >= now && ["scheduled", "publishing"].includes(post.status);
  });
  const upcomingPosts = calendarPosts.filter((post) => {
    const time = dateTime(post.scheduled_at);
    return time !== null && time >= now && time <= weekEnd && ["scheduled", "publishing"].includes(post.status);
  });
  const attentionPosts = calendarPosts.filter((post) => {
    const time = dateTime(post.scheduled_at);
    return post.status === "failed" || (post.status === "scheduled" && time !== null && time < now);
  });
  const monthPostCount = filteredPosts.filter((post) => postsByDay.has(jalaliDateKey(post.scheduled_at)) && monthDays.some((day) => day.key === jalaliDateKey(post.scheduled_at))).length;

  function selectPost(post: Post) {
    setSelectedPostId(post.id);
    if (post.scheduled_at) setMonthAnchor(post.scheduled_at);
  }

  function renderPostChip(post: Post, compact = false) {
    const selected = selectedPost?.id === post.id;
    return (
      <button
        key={post.id}
        type="button"
        onClick={() => selectPost(post)}
        className={`w-full rounded-md border px-2 py-1.5 text-right text-[11px] leading-5 transition hover:border-app-primary ${postTone(post.status)} ${
          selected ? "ring-2 ring-blue-200" : ""
        }`}
      >
        <span className="block font-bold">{formatJalaliTime(post.scheduled_at)} · {post.title}</span>
        {!compact ? <span className="mt-0.5 block truncate opacity-75">{post.caption || "بدون کپشن"}</span> : null}
      </button>
    );
  }

  return (
    <AuthGate>
      <AppShell>
        <PageHeader
          eyebrow="تقویم جلالی محتوا"
          title="تقویم انتشار"
          description="برنامه‌ریزی ماهانه، هفتگی و لیستی برای پیدا کردن شکاف‌ها، خطاها و پست بعدی انتشار."
          actionLabel="ایجاد پست جدید"
          actionHref="/compose"
        />

        {error ? <div className="mb-5 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <section className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SurfaceCard>
            <p className="text-sm font-semibold text-app-muted">ماه فعال</p>
            <p className="mt-2 text-2xl font-black text-app-text">{formatJalaliMonth(monthAnchor)}</p>
            <p className="mt-2 text-xs leading-6 text-app-muted">{monthPostCount} پست در نمای فعلی ماه</p>
          </SurfaceCard>
          <SurfaceCard>
            <p className="text-sm font-semibold text-app-muted">پست بعدی</p>
            {nextPost ? (
              <>
                <p className="mt-2 truncate text-base font-black text-app-text">{nextPost.title}</p>
                <CountdownBadge status={nextPost.status} scheduledAt={nextPost.scheduled_at} className="mt-3" />
              </>
            ) : (
              <p className="mt-2 text-sm text-app-muted">هنوز پست آینده ندارید.</p>
            )}
          </SurfaceCard>
          <SurfaceCard>
            <p className="text-sm font-semibold text-app-muted">هفته آینده</p>
            <p className="mt-2 text-2xl font-black text-app-text">{upcomingPosts.length}</p>
            <p className="mt-2 text-xs leading-6 text-app-muted">پست آماده انتشار در ۷ روز آینده</p>
          </SurfaceCard>
          <SurfaceCard>
            <p className="text-sm font-semibold text-app-muted">نیازمند توجه</p>
            <p className={`mt-2 text-2xl font-black ${attentionPosts.length > 0 ? "text-rose-700" : "text-app-text"}`}>{attentionPosts.length}</p>
            <p className="mt-2 text-xs leading-6 text-app-muted">خطاها یا پست‌های زمان‌گذشته</p>
          </SurfaceCard>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <SectionCard>
            <div className="mb-4 flex flex-col gap-3 border-b border-app-border pb-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-base font-black text-app-text">برنامه‌ریز انتشار</h2>
                <p className="mt-1 text-xs leading-6 text-app-muted">
                  {viewMode === "week" ? dayRangeLabel(activeWeekDays) : formatJalaliMonth(monthAnchor)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-lg border border-app-border bg-slate-50 p-1">
                  {viewModes.map((mode) => {
                    const Icon = mode.icon;
                    const active = viewMode === mode.value;
                    return (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => setViewMode(mode.value)}
                        className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-bold transition ${
                          active ? "bg-white text-app-primary shadow-sm ring-1 ring-app-border" : "text-slate-600 hover:text-app-text"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        {mode.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1 rounded-lg border border-app-border bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setMonthAnchor(shiftPersianMonth(monthAnchor, 1))}
                    className="rounded-md p-2 text-slate-600 transition hover:bg-slate-100"
                    aria-label="ماه بعد"
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMonthAnchor(new Date().toISOString())}
                    className="rounded-md px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                  >
                    امروز
                  </button>
                  <button
                    type="button"
                    onClick={() => setMonthAnchor(shiftPersianMonth(monthAnchor, -1))}
                    className="rounded-md p-2 text-slate-600 transition hover:bg-slate-100"
                    aria-label="ماه قبل"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {calendarFilters.map((filter) => {
                const active = statusFilter === filter.value;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setStatusFilter(filter.value)}
                    className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
                      active ? "bg-app-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {filter.label}
                    <span className={`mr-2 rounded px-1.5 py-0.5 ${active ? "bg-white/20 text-white" : "bg-white text-slate-500"}`}>
                      {statusCount(calendarPosts, filter.value)}
                    </span>
                  </button>
                );
              })}
            </div>

            {loading ? <p className="text-sm text-app-muted">در حال دریافت...</p> : null}

            {!loading && filteredPosts.length === 0 ? (
              <div className="rounded-lg border border-dashed border-app-border bg-slate-50 p-8 text-center">
                <CalendarDays className="mx-auto h-8 w-8 text-app-muted" aria-hidden="true" />
                <p className="mt-3 font-bold text-app-text">برای این فیلتر پستی در تقویم نیست.</p>
                <p className="mt-2 text-sm text-app-muted">از composer برای انتخاب زمان انتشار استفاده کنید یا فیلتر را تغییر دهید.</p>
                <Button href="/compose" className="mt-4">
                  <Plus className="ml-2 h-4 w-4" aria-hidden="true" />
                  ایجاد پست زمان‌بندی‌شده
                </Button>
              </div>
            ) : null}

            {viewMode !== "list" && filteredPosts.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-app-border bg-white">
                <div className="grid grid-cols-7 border-b border-app-border bg-slate-50 text-center text-xs font-black text-slate-500">
                  {weekDays.map((day) => (
                    <div key={day} className="px-2 py-3">{day}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7">
                  {(viewMode === "week" ? activeWeekDays : monthGrid).map((day, index) => {
                    const dayPosts = day ? postsByDay.get(day.key) ?? [] : [];
                    const isToday = day?.key === todayKey;
                    const isSelectedDay = Boolean(day && selectedPost?.scheduled_at && jalaliDateKey(selectedPost.scheduled_at) === day.key);

                    return (
                      <div
                        key={day?.key ?? `empty-${index}`}
                        className={`min-h-32 border-b border-l border-app-border p-2 text-right last:border-l-0 ${
                          day ? "bg-white" : "bg-slate-50/70"
                        } ${isSelectedDay ? "bg-blue-50/40" : ""}`}
                      >
                        {day ? (
                          <>
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <span className={`flex h-7 w-7 items-center justify-center rounded-md text-sm font-black ${
                                isToday ? "bg-app-primary text-white" : "text-app-text"
                              }`}>
                                {day.day}
                              </span>
                              {dayPosts.length > 0 ? <span className="text-[11px] font-bold text-app-muted">{dayPosts.length} پست</span> : null}
                            </div>
                            <div className="space-y-1.5">
                              {dayPosts.slice(0, viewMode === "week" ? 5 : 3).map((post) => renderPostChip(post, viewMode === "month"))}
                              {dayPosts.length > (viewMode === "week" ? 5 : 3) ? (
                                <button type="button" className="w-full rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">
                                  +{dayPosts.length - (viewMode === "week" ? 5 : 3)} مورد دیگر
                                </button>
                              ) : null}
                            </div>
                          </>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {viewMode === "list" && filteredPosts.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-app-border bg-white">
                <div className="hidden grid-cols-[150px_minmax(0,1fr)_140px_110px] gap-4 border-b border-app-border bg-slate-50 px-4 py-3 text-xs font-black text-app-muted lg:grid">
                  <span>زمان</span>
                  <span>محتوا</span>
                  <span>وضعیت</span>
                  <span>عملیات</span>
                </div>
                <div className="divide-y divide-app-border">
                  {filteredPosts.map((post) => (
                    <article key={post.id} className="grid gap-3 px-4 py-3 transition hover:bg-slate-50 lg:grid-cols-[150px_minmax(0,1fr)_140px_110px] lg:items-center">
                      <div className="text-xs leading-6 text-app-muted">
                        <p className="font-bold text-app-text">{formatJalaliDate(post.scheduled_at)}</p>
                        <p>{formatJalaliTime(post.scheduled_at)}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-app-text">{post.title}</p>
                        <p className="mt-1 line-clamp-1 text-sm text-app-muted">{post.caption || "بدون کپشن"}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge status={post.status} />
                        <CountdownBadge status={post.status} scheduledAt={post.scheduled_at} />
                      </div>
                      <Button type="button" variant={selectedPost?.id === post.id ? "primary" : "secondary"} size="sm" onClick={() => selectPost(post)}>
                        جزئیات
                      </Button>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </SectionCard>

          <aside className="space-y-5">
            <SectionCard title="بازبین برنامه" description="جزئیات پست انتخاب‌شده و عملیات سریع.">
              {selectedPost ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={selectedPost.status} />
                    <CountdownBadge status={selectedPost.status} scheduledAt={selectedPost.scheduled_at} />
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-app-text">{selectedPost.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-app-muted">{selectedPost.caption || "بدون کپشن"}</p>
                  </div>

                  <div className="grid gap-3 text-xs text-app-muted">
                    <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-app-border">
                      <p className="flex items-center gap-2 font-bold text-app-text">
                        <Clock3 className="h-4 w-4" aria-hidden="true" />
                        زمان انتشار
                      </p>
                      <p className="mt-2">{formatJalaliDateTime(selectedPost.scheduled_at)}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-app-border">
                      <p className="font-bold text-app-text">کمپین</p>
                      <p className="mt-2">{selectedPost.campaign || "بدون کمپین"}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-app-border">
                      <p className="font-bold text-app-text">تلاش انتشار</p>
                      <p className="mt-2">{selectedPost.attempt_count} تلاش ثبت شده</p>
                    </div>
                  </div>

                  {selectedPost.last_error ? (
                    <div className="rounded-lg bg-rose-50 p-3 text-xs leading-6 text-rose-700 ring-1 ring-rose-100">
                      <p className="flex items-center gap-2 font-bold">
                        <AlertCircle className="h-4 w-4" aria-hidden="true" />
                        آخرین خطا
                      </p>
                      <p className="mt-1">{selectedPost.last_error}</p>
                    </div>
                  ) : null}

                  <div className="grid gap-2">
                    <Button href={`/compose?postId=${selectedPost.id}`}>ویرایش در کمپوزر</Button>
                    <Button href="/queue" variant="secondary">باز کردن صف انتشار</Button>
                    <Button href="/logs" variant="secondary">لاگ انتشار</Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-app-muted">برای مشاهده جزئیات، یک پست را از تقویم انتخاب کنید.</p>
              )}
            </SectionCard>

            <SectionCard title="موردهای نیازمند توجه" description="خطاها یا پست‌هایی که زمانشان گذشته است.">
              {attentionPosts.length === 0 ? <p className="text-sm text-app-muted">فعلاً مورد بحرانی در تقویم نیست.</p> : null}
              <div className="space-y-2">
                {attentionPosts.slice(0, 5).map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => selectPost(post)}
                    className="w-full rounded-lg border border-app-border bg-white p-3 text-right transition hover:bg-slate-50"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={post.status} />
                      <span className="text-xs text-app-muted">{formatJalaliDateTime(post.scheduled_at)}</span>
                    </div>
                    <p className="mt-2 truncate text-sm font-bold text-app-text">{post.title}</p>
                  </button>
                ))}
              </div>
            </SectionCard>
          </aside>
        </section>
      </AppShell>
    </AuthGate>
  );
}
