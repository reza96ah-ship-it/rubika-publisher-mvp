"use client";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Grid3X3,
  List,
  Maximize2,
  Minimize2,
  Plus,
  Rows3
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../../components/app-shell";
import { AuthGate } from "../../components/auth-gate";
import { CountdownBadge } from "../../components/countdown-badge";
import { DataSearchField } from "../../components/data-view";
import { PublishingWorkspaceHeader } from "../../components/publishing-workspace";
import { StatusBadge } from "../../components/status-badge";
import { Button } from "../../components/ui/button";
import { DetailGrid, EmptyState, InspectorPanel, NoticeBanner, StatusToken, WorkspacePage } from "../../components/workspace-ui";
import { apiUrl, authHeaders, type Post } from "../../lib/posts";
import {
  formatJalaliDate,
  formatJalaliDateTime,
  formatJalaliMonth,
  formatJalaliTime,
  jalaliDateKey,
  sortByScheduleAsc
} from "../../lib/jalali";
import { jalaliDateToIsoAtTime } from "../../lib/jalali-picker";

type CalendarFilter = "all" | "scheduled" | "publishing" | "published" | "failed";
type ViewMode = "month" | "week" | "list";
type DensityMode = "compact" | "comfortable";

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

function visibleCalendarText(post: Post) {
  return [post.title, post.caption, post.hashtags, post.campaign, post.internal_note, post.last_error].filter(Boolean).join(" ").toLowerCase();
}

function createPostHref(value: string) {
  const scheduledAt = jalaliDateToIsoAtTime(value, 9, 0) ?? value;
  return `/compose?scheduledAt=${encodeURIComponent(scheduledAt)}`;
}

export default function CalendarPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [statusFilter, setStatusFilter] = useState<CalendarFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [densityMode, setDensityMode] = useState<DensityMode>("comfortable");
  const [monthAnchor, setMonthAnchor] = useState(new Date().toISOString());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
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
      setSelectedDayKey(upcoming?.scheduled_at ? jalaliDateKey(upcoming.scheduled_at) : sorted[0]?.scheduled_at ? jalaliDateKey(sorted[0].scheduled_at) : jalaliDateKey(new Date().toISOString()));
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
    const query = searchTerm.trim().toLowerCase();
    return calendarPosts
      .filter((post) => statusFilter === "all" || post.status === statusFilter)
      .filter((post) => !query || visibleCalendarText(post).includes(query));
  }, [calendarPosts, searchTerm, statusFilter]);

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
    if (!selectedPostId) return null;
    return calendarPosts.find((post) => post.id === selectedPostId) ?? null;
  }, [calendarPosts, selectedPostId]);

  const now = Date.now();
  const todayKey = jalaliDateKey(new Date().toISOString());
  const nextPost = calendarPosts.find((post) => {
    const time = dateTime(post.scheduled_at);
    return time !== null && time >= now && ["scheduled", "publishing"].includes(post.status);
  });
  const attentionPosts = calendarPosts.filter((post) => {
    const time = dateTime(post.scheduled_at);
    return post.status === "failed" || (post.status === "scheduled" && time !== null && time < now);
  });
  const monthPostCount = filteredPosts.filter((post) => postsByDay.has(jalaliDateKey(post.scheduled_at)) && monthDays.some((day) => day.key === jalaliDateKey(post.scheduled_at))).length;
  const activeDayKey = selectedDayKey ?? (selectedPost?.scheduled_at ? jalaliDateKey(selectedPost.scheduled_at) : todayKey);
  const selectedDayPosts = activeDayKey ? postsByDay.get(activeDayKey) ?? [] : [];
  const selectedDay = [...monthDays, ...activeWeekDays].find((day) => day.key === activeDayKey) ?? null;
  const selectedDayValue = selectedDay?.date ?? monthAnchor;
  const selectedDayLabel = formatJalaliDate(selectedDayValue);
  const selectedDayCreateHref = createPostHref(selectedDayValue);
  const publishedCount = calendarPosts.filter((post) => post.status === "published").length;
  const scheduledCount = calendarPosts.filter((post) => post.status === "scheduled").length;
  const failedCount = calendarPosts.filter((post) => post.status === "failed").length;
  const visiblePostLimit = viewMode === "week" ? (densityMode === "compact" ? 4 : 6) : densityMode === "compact" ? 2 : 3;
  const calendarCellHeight = densityMode === "compact" ? "min-h-24" : "min-h-36";

  function selectPost(post: Post) {
    setSelectedPostId(post.id);
    if (post.scheduled_at) setMonthAnchor(post.scheduled_at);
    if (post.scheduled_at) setSelectedDayKey(jalaliDateKey(post.scheduled_at));
  }

  function selectDay(day: CalendarDay, dayPosts: Post[]) {
    setSelectedDayKey(day.key);
    setMonthAnchor(day.date);
    setSelectedPostId(dayPosts[0]?.id ?? null);
  }

  function movePlannerMonth(direction: -1 | 1) {
    const nextAnchor = shiftPersianMonth(monthAnchor, direction);
    setMonthAnchor(nextAnchor);
    setSelectedDayKey(jalaliDateKey(nextAnchor));
    setSelectedPostId(null);
  }

  function goToToday() {
    const today = new Date().toISOString();
    setMonthAnchor(today);
    setSelectedDayKey(jalaliDateKey(today));
    setSelectedPostId(null);
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
        <WorkspacePage>
          <PublishingWorkspaceHeader
            activeTab="calendar"
            title="تقویم انتشار"
            description="برنامه انتشار را با نماهای ماه، هفته و لیست کنترل کنید."
            counts={{
              calendar: calendarPosts.length,
              queue: scheduledCount,
              published: publishedCount,
              failed: failedCount
            }}
            meta={(
              <>
                <StatusToken tone="warning">{scheduledCount} زمان‌بندی‌شده</StatusToken>
                <StatusToken tone={failedCount ? "alert" : "success"}>{failedCount ? `${failedCount} خطای تقویمی` : "بدون خطای تقویمی"}</StatusToken>
              </>
            )}
          />

          {error ? <NoticeBanner tone="alert" title="نیاز به بررسی">{error}</NoticeBanner> : null}

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
            <section className="min-w-0 overflow-hidden rounded-md border border-app-border bg-white">
              <div className="border-b border-app-border px-3 py-3">
                <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-center">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-black text-app-text">{viewMode === "week" ? dayRangeLabel(activeWeekDays) : formatJalaliMonth(monthAnchor)}</h2>
                    <StatusToken tone="neutral">{monthPostCount} پست در ماه</StatusToken>
                    {nextPost ? <StatusToken tone="success">بعدی: {formatJalaliDateTime(nextPost.scheduled_at)}</StatusToken> : null}
                    <StatusToken tone={attentionPosts.length ? "alert" : "success"}>{attentionPosts.length ? `${attentionPosts.length} نیازمند توجه` : "برنامه پایدار"}</StatusToken>
                  </div>
                  <div className="flex items-center gap-1 rounded-md border border-app-border bg-white p-1">
                    <button type="button" onClick={() => movePlannerMonth(1)} className="rounded p-2 text-slate-600 transition hover:bg-slate-100" aria-label="ماه بعد">
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={goToToday} className="rounded px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100">
                      امروز
                    </button>
                    <button type="button" onClick={() => movePlannerMonth(-1)} className="rounded p-2 text-slate-600 transition hover:bg-slate-100" aria-label="ماه قبل">
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 2xl:grid-cols-[minmax(220px,1fr)_auto_auto] 2xl:items-center">
                  <DataSearchField
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="جست‌وجوی عنوان، کپشن، کمپین یا خطا"
                  />
                  <div className="flex w-fit rounded-md border border-app-border bg-slate-50 p-1">
                    {viewModes.map((mode) => {
                      const Icon = mode.icon;
                      const active = viewMode === mode.value;
                      return (
                        <button
                          key={mode.value}
                          type="button"
                          onClick={() => setViewMode(mode.value)}
                          className={`inline-flex items-center gap-1 rounded px-3 py-1.5 text-xs font-bold transition ${
                            active ? "bg-white text-app-primary shadow-sm ring-1 ring-blue-200" : "text-slate-600 hover:text-app-primary"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                          {mode.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex w-fit rounded-md border border-app-border bg-slate-50 p-1" aria-label="تراکم تقویم">
                    <button
                      type="button"
                      onClick={() => setDensityMode("compact")}
                      className={`inline-flex items-center gap-1 rounded px-2.5 py-1.5 text-xs font-bold transition ${densityMode === "compact" ? "bg-white text-app-primary shadow-sm ring-1 ring-blue-200" : "text-slate-600 hover:text-app-primary"}`}
                    >
                      <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
                      فشرده
                    </button>
                    <button
                      type="button"
                      onClick={() => setDensityMode("comfortable")}
                      className={`inline-flex items-center gap-1 rounded px-2.5 py-1.5 text-xs font-bold transition ${densityMode === "comfortable" ? "bg-white text-app-primary shadow-sm ring-1 ring-blue-200" : "text-slate-600 hover:text-app-primary"}`}
                    >
                      <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                      باز
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-col justify-between gap-2 lg:flex-row lg:items-center">
                  <div className="flex flex-wrap gap-1.5">
                    {calendarFilters.map((filter) => {
                      const active = statusFilter === filter.value;
                      return (
                        <button
                          key={filter.value}
                          type="button"
                          onClick={() => setStatusFilter(filter.value)}
                          className={`rounded px-2.5 py-1.5 text-xs font-bold transition ${
                            active ? "bg-app-primary text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-app-primary"
                          }`}
                        >
                          {filter.label}
                          <span className={`mr-1.5 rounded px-1.5 py-0.5 ${active ? "bg-white/20 text-white" : "bg-white text-slate-500"}`}>
                            {statusCount(calendarPosts, filter.value)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <Button href={selectedDayCreateHref} size="sm">
                    <Plus className="ml-1.5 h-4 w-4" aria-hidden="true" />
                    پست جدید در {selectedDayLabel}
                  </Button>
                </div>
              </div>

              {loading ? <p className="p-4 text-sm text-app-muted">در حال دریافت برنامه انتشار...</p> : null}

              {!loading && viewMode !== "list" ? (
                <div className="overflow-x-auto">
                  <div className="min-w-[820px]">
                    <div className="grid grid-cols-7 border-b border-app-border bg-slate-50 text-center text-xs font-black text-slate-500">
                      {weekDays.map((day) => <div key={day} className="px-2 py-2.5">{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7">
                      {(viewMode === "week" ? activeWeekDays : monthGrid).map((day, index) => {
                        const dayPosts = day ? postsByDay.get(day.key) ?? [] : [];
                        const isToday = day?.key === todayKey;
                        const isSelectedDay = Boolean(day && activeDayKey === day.key);

                        return (
                          <div
                            key={day?.key ?? `empty-${index}`}
                            onClick={() => day ? selectDay(day, dayPosts) : undefined}
                            className={`${calendarCellHeight} border-b border-l border-app-border p-2 text-right transition last:border-l-0 ${
                              day ? "bg-white hover:bg-blue-50/40" : "bg-slate-50/70"
                            } ${isSelectedDay ? "bg-blue-50/70 ring-1 ring-inset ring-blue-200" : ""}`}
                          >
                            {day ? (
                              <>
                                <div className="mb-2 flex items-center justify-between gap-1">
                                  <span className={`flex h-7 w-7 items-center justify-center rounded-md text-sm font-black ${isToday ? "bg-app-primary text-white" : "text-app-text"}`}>
                                    {day.day}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    {dayPosts.length > 0 ? <span className="text-[10px] font-bold text-app-muted">{dayPosts.length} پست</span> : null}
                                    <Link
                                      href={createPostHref(day.date)}
                                      onClick={(event) => event.stopPropagation()}
                                      className="flex h-6 w-6 items-center justify-center rounded text-slate-400 transition hover:bg-blue-100 hover:text-app-primary"
                                      aria-label={`افزودن پست در ${formatJalaliDate(day.date)}`}
                                      title="افزودن پست در این روز"
                                    >
                                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                                    </Link>
                                  </div>
                                </div>
                                <div className="space-y-1.5" onClick={(event) => event.stopPropagation()}>
                                  {dayPosts.slice(0, visiblePostLimit).map((post) => renderPostChip(post, viewMode === "month"))}
                                  {dayPosts.length > visiblePostLimit ? (
                                    <span className="block w-full rounded bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">
                                      +{dayPosts.length - visiblePostLimit} مورد دیگر
                                    </span>
                                  ) : null}
                                </div>
                              </>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}

              {!loading && viewMode === "list" && filteredPosts.length > 0 ? (
                <div>
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

              {!loading && viewMode === "list" && filteredPosts.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    icon={<CalendarDays className="h-5 w-5" aria-hidden="true" />}
                    title="پستی برای این فیلتر وجود ندارد"
                    description="فیلتر را تغییر دهید یا برای روز انتخاب‌شده یک پست جدید بسازید."
                    action={<Button href={selectedDayCreateHref}>ایجاد پست زمان‌بندی‌شده</Button>}
                  />
                </div>
              ) : null}
            </section>

            <div className="xl:sticky xl:top-20 xl:self-start">
              <InspectorPanel
                title="برنامه روز"
                description={`${selectedDayLabel} · ${selectedDayPosts.length} پست`}
                footer={(
                  <Button href={selectedDayCreateHref} className="w-full" size="sm">
                    <Plus className="ml-1.5 h-4 w-4" aria-hidden="true" />
                    افزودن پست در این روز
                  </Button>
                )}
              >
                <div className="space-y-2">
                  {selectedDayPosts.length === 0 ? (
                    <p className="rounded-md border border-dashed border-app-border bg-slate-50 px-3 py-4 text-center text-xs leading-6 text-app-muted">
                      برای این روز هنوز پستی ثبت نشده است.
                    </p>
                  ) : null}
                  {selectedDayPosts.map((post) => (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => selectPost(post)}
                      className={`w-full rounded-md border p-3 text-right transition hover:border-blue-200 hover:bg-blue-50 ${
                        selectedPost?.id === post.id ? "border-app-primary bg-blue-50 ring-2 ring-blue-100" : "border-app-border bg-white"
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={post.status} />
                        <span className="text-xs font-bold text-app-muted">{formatJalaliTime(post.scheduled_at)}</span>
                      </div>
                      <p className="mt-2 truncate text-sm font-black text-app-text">{post.title}</p>
                    </button>
                  ))}
                </div>

                <div className="mt-4 border-t border-app-border pt-4">
                  {selectedPost ? (
                    <div className="space-y-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status={selectedPost.status} />
                          <CountdownBadge status={selectedPost.status} scheduledAt={selectedPost.scheduled_at} />
                        </div>
                        <h3 className="mt-3 text-base font-black text-app-text">{selectedPost.title}</h3>
                        <p className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-xs leading-6 text-app-muted ring-1 ring-app-border">
                          {selectedPost.caption || "بدون کپشن"}
                        </p>
                      </div>

                      <DetailGrid
                        items={[
                          { label: "زمان", value: formatJalaliDateTime(selectedPost.scheduled_at) },
                          { label: "کمپین", value: selectedPost.campaign || "بدون کمپین" },
                          { label: "تلاش", value: `${selectedPost.attempt_count}` },
                          { label: "شناسه", value: `#${selectedPost.id}` }
                        ]}
                      />

                      {selectedPost.last_error ? <NoticeBanner tone="alert">{selectedPost.last_error}</NoticeBanner> : null}

                      <div className="grid gap-2">
                        <Button href={`/compose?postId=${selectedPost.id}`}>ویرایش پست</Button>
                        <Button href="/queue" variant="secondary">باز کردن صف انتشار</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Clock3 className="mx-auto h-5 w-5 text-slate-400" aria-hidden="true" />
                      <p className="mt-2 text-xs leading-6 text-app-muted">یک پست را برای مشاهده جزئیات انتخاب کنید.</p>
                    </div>
                  )}
                </div>

                {attentionPosts.length ? (
                  <Link href="/content?status=failed" className="mt-4 flex items-center gap-2 rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    {attentionPosts.length} مورد نیازمند رسیدگی
                  </Link>
                ) : (
                  <p className="mt-4 flex items-center gap-2 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    برنامه انتشار پایدار است
                  </p>
                )}
              </InspectorPanel>
            </div>
          </section>
        </WorkspacePage>
      </AppShell>
    </AuthGate>
  );
}
