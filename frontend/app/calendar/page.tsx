"use client";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Grid3X3,
  ImageIcon,
  List,
  Maximize2,
  Minimize2,
  Plus,
  Rows3,
  X
} from "lucide-react";
import Link from "next/link";
import { CSSProperties, DragEvent, useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AppShell } from "../../components/app-shell";
import { AuthGate } from "../../components/auth-gate";
import { ChannelBadges } from "../../components/channel-badges";
import { LoadingRows } from "../../components/loading-skeleton";
import { CountdownBadge } from "../../components/countdown-badge";
import { DataSearchField } from "../../components/data-view";
import { PlannerComposerDrawer } from "../../components/planner-composer-drawer";
import { StatusBadge } from "../../components/status-badge";
import { useToast } from "../../components/toast-provider";
import { Button } from "../../components/ui/button";
import { NMetricTile } from "../../components/nahrino-ui";
import { DetailGrid, EmptyState, NoticeBanner, StatusToken, Timeline, WorkspacePage } from "../../components/workspace-ui";
import { buildCampaignFilterOptions, campaignColorForPost, campaignKeyForPost, campaignLabelForPost, loadCampaigns, type Campaign } from "../../lib/campaigns";
import { apiUrl, authHeaders, type Post } from "../../lib/posts";
import { isRubikaConnected, rubikaStatusLabel, type RubikaSettings } from "../../lib/workspace";
import {
  formatJalaliDate,
  formatJalaliDateTime,
  formatJalaliMonth,
  formatJalaliTime,
  jalaliDateKey,
  sortByScheduleAsc
} from "../../lib/jalali";
import { getJalaliPickerParts, jalaliDateToIsoAtTime } from "../../lib/jalali-picker";

type CalendarFilter = "all" | "scheduled" | "publishing" | "published" | "manual_ready" | "failed";
type ViewMode = "month" | "week" | "list";
type DensityMode = "compact" | "comfortable";

type CalendarDay = {
  date: string;
  key: string;
  day: number;
};

type MediaAsset = {
  id: number;
  post_id: number | null;
  original_filename: string;
  content_type: string;
};

const calendarFilters: Array<{ label: string; value: CalendarFilter }> = [
  { label: "همه", value: "all" },
  { label: "زمان‌بندی", value: "scheduled" },
  { label: "در حال انتشار", value: "publishing" },
  { label: "منتشر", value: "published" },
  { label: "آماده دستی", value: "manual_ready" },
  { label: "ناموفق", value: "failed" }
];

const viewModes: Array<{ label: string; value: ViewMode; icon: typeof Grid3X3 }> = [
  { label: "ماه", value: "month", icon: Grid3X3 },
  { label: "هفته", value: "week", icon: Rows3 },
  { label: "لیست", value: "list", icon: List }
];

const weekDays = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
const calendarStatuses = new Set(["scheduled", "publishing", "published", "manual_ready", "failed"]);
const scheduleTimezone = "Asia/Tehran";

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

function postStatusLabel(status: string) {
  if (status === "failed") return "انتشار ناموفق";
  if (status === "published") return "منتشرشده";
  if (status === "publishing") return "در حال انتشار";
  return "زمان‌بندی‌شده";
}

function postTimelineTone(status: string): "primary" | "success" | "warning" | "alert" {
  if (status === "failed") return "alert";
  if (status === "published") return "success";
  if (status === "publishing") return "primary";
  return "warning";
}

function minutesBetween(first: string | null, second: string | null) {
  const firstTime = dateTime(first);
  const secondTime = dateTime(second);
  if (firstTime === null || secondTime === null) return null;
  return Math.abs(secondTime - firstTime) / 60_000;
}

function dayRangeLabel(days: CalendarDay[]) {
  if (days.length === 0) return "—";
  return `${formatJalaliDate(days[0].date)} تا ${formatJalaliDate(days[days.length - 1].date)}`;
}

function visibleCalendarText(post: Post) {
  return [post.title, post.caption, post.hashtags, post.campaign, post.internal_note, post.last_error].filter(Boolean).join(" ").toLowerCase();
}

export default function CalendarPage() {
  const { showToast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [rubikaSettings, setRubikaSettings] = useState<RubikaSettings | null>(null);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<Record<number, string>>({});
  const [statusFilter, setStatusFilter] = useState<CalendarFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [densityMode, setDensityMode] = useState<DensityMode>("comfortable");
  const [monthAnchor, setMonthAnchor] = useState(new Date().toISOString());
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quickCreateAt, setQuickCreateAt] = useState<string | null>(null);
  const [quickPreviewPostId, setQuickPreviewPostId] = useState<number | null>(null);
  const [draggingPostId, setDraggingPostId] = useState<number | null>(null);
  const [dragTargetDayKey, setDragTargetDayKey] = useState<string | null>(null);
  const [reschedulingPostId, setReschedulingPostId] = useState<number | null>(null);

  const loadPosts = useCallback(async (preservePlannerState = false) => {
    const headers = authHeaders();
    const [response, campaignsResponse, mediaResponse, rubikaResponse] = await Promise.all([
      fetch(`${apiUrl}/posts`, { headers }),
      loadCampaigns(),
      fetch(`${apiUrl}/media`, { headers }),
      fetch(`${apiUrl}/rubika/settings`, { headers })
    ]);
    if (!response.ok) throw new Error("دریافت تقویم انتشار ناموفق بود");
    const data: Post[] = await response.json();
    const sorted = sortByScheduleAsc(data.filter(isCalendarPost));
    const upcoming = sorted.find((post) => {
      const time = dateTime(post.scheduled_at);
      return time !== null && time >= Date.now() && ["scheduled", "publishing"].includes(post.status);
    });
    setPosts(data);
    setCampaigns(campaignsResponse);
    if (mediaResponse.ok) setAssets(await mediaResponse.json());
    if (rubikaResponse.ok) setRubikaSettings(await rubikaResponse.json());
    if (!preservePlannerState) {
      setMonthAnchor(upcoming?.scheduled_at ?? sorted[0]?.scheduled_at ?? new Date().toISOString());
      setSelectedDayKey(upcoming?.scheduled_at ? jalaliDateKey(upcoming.scheduled_at) : sorted[0]?.scheduled_at ? jalaliDateKey(sorted[0].scheduled_at) : jalaliDateKey(new Date().toISOString()));
      setSelectedPostId(upcoming?.id ?? sorted[0]?.id ?? null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPosts().catch((err) => {
      setError(err instanceof Error ? err.message : "خطا در دریافت تقویم انتشار");
      setLoading(false);
    });
  }, [loadPosts]);

  useEffect(() => {
    const imageAssets = assets.filter((asset) => asset.post_id && asset.content_type.startsWith("image/"));
    if (imageAssets.length === 0) {
      setMediaPreviewUrls({});
      return;
    }

    let cancelled = false;
    const createdUrls: string[] = [];

    async function loadPreviews() {
      const entries = await Promise.all(
        imageAssets.map(async (asset) => {
          try {
            const response = await fetch(`${apiUrl}/media/${asset.id}/file`, { headers: authHeaders() });
            if (!response.ok) return null;
            const url = URL.createObjectURL(await response.blob());
            createdUrls.push(url);
            return [asset.id, url] as const;
          } catch {
            return null;
          }
        })
      );
      if (!cancelled) setMediaPreviewUrls(Object.fromEntries(entries.filter(Boolean) as Array<[number, string]>));
    }

    loadPreviews();
    return () => {
      cancelled = true;
      createdUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [assets]);

  const calendarPosts = useMemo(() => sortByScheduleAsc(posts.filter(isCalendarPost)), [posts]);
  const filteredPosts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return calendarPosts
      .filter((post) => statusFilter === "all" || post.status === statusFilter)
      .filter((post) => campaignFilter === "all" || campaignKeyForPost(post) === campaignFilter)
      .filter((post) => !query || visibleCalendarText(post).includes(query));
  }, [calendarPosts, campaignFilter, searchTerm, statusFilter]);

  const campaignOptions = useMemo(() => buildCampaignFilterOptions(calendarPosts, campaigns), [calendarPosts, campaigns]);
  const selectedCampaignOption = useMemo(() => campaignOptions.find((option) => option.value === campaignFilter) ?? null, [campaignFilter, campaignOptions]);

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
  const activeRangeDays = viewMode === "week" ? activeWeekDays : monthDays;
  const activeRangeDayKeys = useMemo(() => new Set(activeRangeDays.map((day) => day.key)), [activeRangeDays]);
  const selectedPost = useMemo(() => {
    if (!selectedPostId) return null;
    return calendarPosts.find((post) => post.id === selectedPostId) ?? null;
  }, [calendarPosts, selectedPostId]);
  const quickPreviewPost = useMemo(() => {
    if (!quickPreviewPostId) return null;
    return calendarPosts.find((post) => post.id === quickPreviewPostId) ?? null;
  }, [calendarPosts, quickPreviewPostId]);
  const assetByPostId = useMemo(() => {
    const map = new Map<number, MediaAsset>();
    for (const asset of assets) {
      if (asset.post_id && !map.has(asset.post_id)) map.set(asset.post_id, asset);
    }
    return map;
  }, [assets]);

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
  const selectedDayPosts = useMemo(() => (activeDayKey ? postsByDay.get(activeDayKey) ?? [] : []), [activeDayKey, postsByDay]);
  const selectedDay = [...monthDays, ...activeWeekDays].find((day) => day.key === activeDayKey) ?? null;
  const selectedDayValue = selectedDay?.date ?? monthAnchor;
  const selectedDayLabel = formatJalaliDate(selectedDayValue);
  const publishedCount = calendarPosts.filter((post) => post.status === "published").length;
  const scheduledCount = calendarPosts.filter((post) => post.status === "scheduled").length;
  const failedCount = calendarPosts.filter((post) => post.status === "failed").length;
  const publishingCount = calendarPosts.filter((post) => post.status === "publishing").length;
  const plannerHealthTone = attentionPosts.length ? "alert" : failedCount ? "warning" : "success";
  const plannerHealthLabel = attentionPosts.length ? `${attentionPosts.length} اقدام فوری` : failedCount ? `${failedCount} خطا` : "برنامه پایدار";
  const currentRangeLabel = viewMode === "week" ? dayRangeLabel(activeWeekDays) : viewMode === "list" ? "فهرست برنامه" : formatJalaliMonth(monthAnchor);
  const visibleRangeCount = filteredPosts.filter((post) => post.scheduled_at && activeRangeDayKeys.has(jalaliDateKey(post.scheduled_at))).length;
  const visiblePostLimit = viewMode === "week" ? (densityMode === "compact" ? 4 : 6) : densityMode === "compact" ? 2 : 3;
  const calendarCellHeight = densityMode === "compact" ? "min-h-24" : "min-h-36";
  const quickPreviewAsset = quickPreviewPost ? assetByPostId.get(quickPreviewPost.id) : null;
  const quickPreviewUrl = quickPreviewAsset ? mediaPreviewUrls[quickPreviewAsset.id] : "";

  useEffect(() => {
    if (!quickPreviewPost) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setQuickPreviewPostId(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [quickPreviewPost]);
  const selectedCampaignWorkload = useMemo(() => {
    if (!selectedCampaignOption) return null;
    const rangePosts = calendarPosts
      .filter((post) => campaignKeyForPost(post) === selectedCampaignOption.value)
      .filter((post) => post.scheduled_at && activeRangeDayKeys.has(jalaliDateKey(post.scheduled_at)));
    return {
      total: rangePosts.length,
      scheduled: rangePosts.filter((post) => post.status === "scheduled").length,
      publishing: rangePosts.filter((post) => post.status === "publishing").length,
      published: rangePosts.filter((post) => post.status === "published").length,
      failed: rangePosts.filter((post) => post.status === "failed").length
    };
  }, [activeRangeDayKeys, calendarPosts, selectedCampaignOption]);
  const selectedDayInsights = useMemo(() => {
    const sortedDayPosts = sortByScheduleAsc(selectedDayPosts);
    const conflicts: Array<{ first: Post; second: Post; gap: number }> = [];
    sortedDayPosts.forEach((post, index) => {
      const nextPostForDay = sortedDayPosts[index + 1];
      if (!nextPostForDay) return;
      const gap = minutesBetween(post.scheduled_at, nextPostForDay.scheduled_at);
      if (gap !== null && gap < 90) conflicts.push({ first: post, second: nextPostForDay, gap: Math.round(gap) });
    });
    const missingMedia = sortedDayPosts.filter((post) => !assetByPostId.has(post.id));
    const failed = sortedDayPosts.filter((post) => post.status === "failed" || post.last_error);
    const publishablePosts = sortedDayPosts.filter((post) => ["scheduled", "publishing"].includes(post.status));
    const rubikaBlocked = publishablePosts.length > 0 && !isRubikaConnected(rubikaSettings);
    const busyHours = new Set(sortedDayPosts.map((post) => getJalaliPickerParts(post.scheduled_at, scheduleTimezone).hour));
    const suggestedSlots = [9, 12, 15, 18, 21]
      .filter((hour) => !busyHours.has(hour))
      .slice(0, 3)
      .map((hour) => ({ hour, label: `${String(hour).padStart(2, "0")}:00` }));
    return { conflicts, missingMedia, failed, publishablePosts, rubikaBlocked, suggestedSlots };
  }, [assetByPostId, rubikaSettings, selectedDayPosts]);
  const selectedDayStatusSummary = useMemo(() => ({
    scheduled: selectedDayPosts.filter((post) => post.status === "scheduled").length,
    publishing: selectedDayPosts.filter((post) => post.status === "publishing").length,
    published: selectedDayPosts.filter((post) => post.status === "published").length,
    failed: selectedDayPosts.filter((post) => post.status === "failed" || post.last_error).length
  }), [selectedDayPosts]);

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

  function openQuickCreateAt(value: string, hour = 9, minute = 0) {
    setQuickCreateAt(jalaliDateToIsoAtTime(value, hour, minute) ?? value);
  }

  function openQuickCreate(value: string) {
    openQuickCreateAt(value, 9, 0);
  }

  function startDraggingPost(event: DragEvent<HTMLButtonElement>, post: Post) {
    if (post.status !== "scheduled" || !post.scheduled_at) return;
    event.stopPropagation();
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(post.id));
    setDraggingPostId(post.id);
  }

  function stopDraggingPost() {
    setDraggingPostId(null);
    setDragTargetDayKey(null);
  }

  function allowDropOnDay(event: DragEvent<HTMLDivElement>, day: CalendarDay) {
    if (!draggingPostId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragTargetDayKey(day.key);
  }

  async function reschedulePost(post: Post, day: CalendarDay) {
    if (!post.scheduled_at || post.status !== "scheduled") return;
    const originalScheduledAt = post.scheduled_at;
    const originalDayKey = jalaliDateKey(originalScheduledAt);
    if (originalDayKey === day.key) return;

    const time = getJalaliPickerParts(originalScheduledAt, scheduleTimezone);
    const scheduledAt = jalaliDateToIsoAtTime(day.date, time.hour, time.minute, scheduleTimezone);
    if (!scheduledAt) {
      showToast({ title: "جابجایی پست ناموفق بود", description: "تاریخ مقصد قابل تبدیل نیست.", tone: "alert" });
      return;
    }

    setError("");
    setReschedulingPostId(post.id);
    setPosts((current) => current.map((item) => item.id === post.id ? { ...item, scheduled_at: scheduledAt } : item));
    setSelectedDayKey(day.key);
    setSelectedPostId(post.id);

    try {
      const response = await fetch(`${apiUrl}/posts/${post.id}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ scheduled_at: scheduledAt, timezone: scheduleTimezone })
      });
      if (!response.ok) throw new Error("زمان‌بندی جدید پست ذخیره نشد");
      const savedPost = await response.json() as Post;
      setPosts((current) => current.map((item) => item.id === post.id ? savedPost : item));
      showToast({ title: "زمان انتشار جابجا شد", description: `${post.title} · ${formatJalaliDateTime(savedPost.scheduled_at)}`, tone: "success" });
    } catch (err) {
      const nextError = err instanceof Error ? err.message : "جابجایی پست ناموفق بود";
      setPosts((current) => current.map((item) => item.id === post.id ? { ...item, scheduled_at: originalScheduledAt } : item));
      setSelectedDayKey(originalDayKey);
      setError(nextError);
      showToast({ title: "جابجایی پست ناموفق بود", description: nextError, tone: "alert" });
    } finally {
      setReschedulingPostId(null);
    }
  }

  function dropPostOnDay(event: DragEvent<HTMLDivElement>, day: CalendarDay) {
    event.preventDefault();
    const postId = Number(event.dataTransfer.getData("text/plain") || draggingPostId);
    const post = posts.find((item) => item.id === postId);
    stopDraggingPost();
    if (post) void reschedulePost(post, day);
  }

  function renderPostChip(post: Post, compact = false) {
    const selected = selectedPost?.id === post.id;
    const draggable = post.status === "scheduled" && Boolean(post.scheduled_at);
    const rescheduling = reschedulingPostId === post.id;
    const asset = assetByPostId.get(post.id);
    const previewUrl = asset ? mediaPreviewUrls[asset.id] : "";
    return (
      <button
        key={post.id}
        type="button"
        data-status={post.status}
        onClick={() => {
          selectPost(post);
          setQuickPreviewPostId(post.id);
        }}
        draggable={draggable}
        onDragStart={(event) => startDraggingPost(event, post)}
        onDragEnd={stopDraggingPost}
        className={`calendar-post-chip app-interactive ${compact ? "calendar-post-chip-compact" : ""} ${selected ? "calendar-post-chip-selected" : ""} ${draggable ? "calendar-post-chip-draggable" : ""} ${rescheduling ? "calendar-post-chip-saving" : ""}`}
        style={{ "--campaign-accent": campaignColorForPost(post, campaigns) } as CSSProperties}
        title={draggable ? "برای تغییر روز انتشار، پست را روی روز جدید بکشید." : undefined}
      >
        <span className="calendar-post-chip-rail" aria-hidden="true" />
        <span className="calendar-post-chip-inner">
          {previewUrl ? (
            <img src={previewUrl} alt="" className="calendar-post-chip-media" />
          ) : (
            !compact ? (
              <span className="calendar-post-chip-media calendar-post-chip-media-empty">
                <ImageIcon className="calendar-post-chip-media-icon" aria-hidden="true" />
              </span>
            ) : null
          )}
          <span className="calendar-post-chip-body">
            <span className="calendar-post-chip-top">
              <span className="calendar-post-chip-time">{formatJalaliTime(post.scheduled_at)}</span>
              <span className="calendar-post-chip-status">{postStatusLabel(post.status)}</span>
            </span>
            <span className="calendar-post-chip-title">{post.title}</span>
            <span className="calendar-post-chip-campaign">
              <span className="calendar-post-chip-dot" aria-hidden="true" />
              <span className="truncate">{campaignKeyForPost(post) !== "none" ? campaignLabelForPost(post, campaigns) : (!compact ? post.caption : "") || "بدون کمپین"}</span>
            </span>
          </span>
        </span>
      </button>
    );
  }

  function renderAgendaPost(post: Post) {
    const selected = selectedPost?.id === post.id;
    const asset = assetByPostId.get(post.id);
    const previewUrl = asset ? mediaPreviewUrls[asset.id] : "";
    return (
      <article
        key={post.id}
        className={`calendar-day-agenda-post ${selected ? "calendar-day-agenda-post-active" : ""}`}
        style={{ "--campaign-accent": campaignColorForPost(post, campaigns) } as CSSProperties}
      >
        <span className="calendar-day-agenda-post-rail" aria-hidden="true" />
        {previewUrl ? (
          <img src={previewUrl} alt={asset?.original_filename ?? ""} className="calendar-day-agenda-thumb" />
        ) : (
          <span className="calendar-day-agenda-thumb calendar-day-agenda-thumb-empty">
            <ImageIcon className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
        <div className="calendar-day-agenda-body">
          <div className="calendar-day-agenda-meta">
            <span className="calendar-day-agenda-time">{formatJalaliTime(post.scheduled_at)}</span>
            <StatusBadge status={post.status} />
            <ChannelBadges platform={post.platform} compact />
          </div>
          <h3>{post.title}</h3>
          <p>{post.caption || campaignLabelForPost(post, campaigns)}</p>
          <div className="calendar-day-agenda-tags">
            <span className="calendar-post-preview-campaign" style={{ "--campaign-accent": campaignColorForPost(post, campaigns) } as CSSProperties}>
              <span aria-hidden="true" />
              {campaignLabelForPost(post, campaigns)}
            </span>
            <CountdownBadge status={post.status} scheduledAt={post.scheduled_at} />
          </div>
        </div>
        <div className="calendar-day-agenda-actions">
          <Button
            type="button"
            variant={selected ? "primary" : "secondary"}
            size="sm"
            onClick={() => {
              selectPost(post);
              setQuickPreviewPostId(post.id);
            }}
          >
            پیش‌نمایش
          </Button>
          <Button href={`/compose?postId=${post.id}`} variant="ghost" size="sm">ویرایش</Button>
        </div>
      </article>
    );
  }

  function renderMonthDayDensity(dayPosts: Post[], hiddenCount: number) {
    if (dayPosts.length === 0) {
      return <span className="calendar-day-empty-hint">برای ساخت پست کلیک کنید</span>;
    }

    return (
      <div className="calendar-day-density-list" aria-label={`${dayPosts.length} پست در این روز`}>
        {dayPosts.slice(0, 3).map((post) => (
          <span key={post.id} className="calendar-day-density-item" style={{ "--campaign-accent": campaignColorForPost(post, campaigns) } as CSSProperties}>
            <span className="calendar-day-density-dot" aria-hidden="true" />
            <span>{formatJalaliTime(post.scheduled_at)}</span>
          </span>
        ))}
        {hiddenCount > 0 ? <span className="calendar-day-density-more">+{hiddenCount} بیشتر</span> : null}
      </div>
    );
  }

  return (
    <AuthGate>
      <AppShell>
        <WorkspacePage className="calendar-pro-page">
          <section className="calendar-pro-hero">
            <div className="calendar-pro-hero-copy">
              <p className="app-section-kicker calendar-pro-kicker text-[10px] font-black">برنامه‌ریز</p>
              <h1>تقویم انتشار</h1>
              <p>نمای عملیاتی برنامه محتوا؛ ببینید چه چیزی زمان‌دار است، چه چیزی گیر کرده و کدام روز ظرفیت دارد.</p>
            </div>
            <div className="calendar-pro-hero-actions">
              <StatusToken tone={plannerHealthTone}>{plannerHealthLabel}</StatusToken>
              <Button type="button" onClick={() => openQuickCreate(selectedDayValue)} size="sm">
                <Plus className="ml-1.5 h-4 w-4" aria-hidden="true" />
                پست جدید
              </Button>
            </div>
          </section>

          <section className="dashboard-kpi-strip calendar-kpi-strip grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="خلاصه تقویم انتشار">
            {[
              { label: "بازه فعال", value: currentRangeLabel, detail: `${visibleRangeCount} در دید · ${publishedCount} منتشر`, tone: "primary" as const, icon: CalendarDays },
              { label: "زمان‌بندی‌شده", value: scheduledCount, detail: "در انتظار انتشار", tone: "warning" as const, icon: Clock3 },
              { label: "در انتشار", value: publishingCount, detail: "job فعال", tone: "primary" as const, icon: Rows3 },
              { label: "ریسک", value: attentionPosts.length, detail: failedCount ? `${failedCount} ناموفق` : "بدون مانع جدی", tone: attentionPosts.length ? "alert" as const : "success" as const, icon: AlertCircle }
            ].map((item) => (
              <NMetricTile key={item.label} {...item} />
            ))}
          </section>

          {error ? <NoticeBanner tone="alert" title="نیاز به بررسی">{error}</NoticeBanner> : null}

          <section className="calendar-pro-workspace">
            <section className="app-studio-panel calendar-pro-planner min-w-0 overflow-hidden rounded-lg">
              <div className="calendar-pro-toolbar border-b border-app-border px-3 py-2.5 sm:py-3">
                <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-center">
                  <div className="calendar-toolbar-title-row flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-black text-app-text">{viewMode === "week" ? dayRangeLabel(activeWeekDays) : formatJalaliMonth(monthAnchor)}</h2>
                    <div className="calendar-toolbar-status-chips flex flex-wrap items-center gap-2">
                      <StatusToken tone="neutral">{monthPostCount} پست در ماه</StatusToken>
                      {nextPost ? <StatusToken tone="success">بعدی: {formatJalaliDateTime(nextPost.scheduled_at)}</StatusToken> : null}
                      <StatusToken tone={attentionPosts.length ? "alert" : "success"}>{attentionPosts.length ? `${attentionPosts.length} نیازمند توجه` : "برنامه پایدار"}</StatusToken>
                      <StatusToken tone="info">پست زمان‌بندی‌شده را برای تغییر روز بکشید</StatusToken>
                      {reschedulingPostId ? <StatusToken tone="warning">در حال ذخیره جابجایی</StatusToken> : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 rounded-md bg-app-surfaceMuted p-1 shadow-hairline">
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

                <div className="calendar-toolbar-filter-row mt-2 grid gap-2 2xl:grid-cols-[minmax(220px,1fr)_190px_auto_auto] 2xl:items-center">
                  <DataSearchField
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="جست‌وجوی عنوان، کپشن، کمپین یا خطا"
                  />
                  <label className="calendar-toolbar-campaign-filter flex items-center gap-2 rounded-md border border-app-border bg-white px-3 py-2 text-xs font-bold text-app-muted shadow-hairline">
                    <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <select value={campaignFilter} onChange={(event) => setCampaignFilter(event.target.value)} className="min-w-0 flex-1 bg-transparent text-xs font-bold text-app-text outline-none">
                      <option value="all">همه کمپین‌ها</option>
                      {campaignOptions.map((campaign) => <option key={campaign.value} value={campaign.value}>{campaign.label} · {campaign.count}</option>)}
                    </select>
                  </label>
                  <div className="flex w-fit rounded-md bg-app-surfaceMuted p-1 shadow-hairline">
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
                  <div className="calendar-toolbar-density-toggle flex w-fit rounded-md bg-app-surfaceMuted p-1 shadow-hairline" aria-label="تراکم تقویم">
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

                <div className="calendar-toolbar-status-filter-row mt-2 flex flex-col justify-between gap-2 lg:flex-row lg:items-center">
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
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="hidden items-center gap-2 text-[11px] font-bold text-app-muted 2xl:flex">
                      {[
                        { label: "زمان‌بندی", tone: "bg-blue-500" },
                        { label: "در انتشار", tone: "bg-sky-500" },
                        { label: "منتشر", tone: "bg-emerald-500" },
                        { label: "ناموفق", tone: "bg-rose-500" }
                      ].map((item) => (
                        <span key={item.label} className="inline-flex items-center gap-1">
                          <span className={`h-2 w-2 rounded-full ${item.tone}`} />
                          {item.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {selectedCampaignOption && selectedCampaignWorkload ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-app-border bg-white px-3 py-2 shadow-hairline">
                    <span className="inline-flex items-center gap-2 text-xs font-black text-app-text">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: selectedCampaignOption.color }} />
                      برنامه کمپین: {selectedCampaignOption.label}
                    </span>
                    <StatusToken tone="neutral">{selectedCampaignWorkload.total} در بازه</StatusToken>
                    <StatusToken tone="warning">{selectedCampaignWorkload.scheduled} زمان‌بندی</StatusToken>
                    <StatusToken tone="primary">{selectedCampaignWorkload.publishing} در انتشار</StatusToken>
                    <StatusToken tone="success">{selectedCampaignWorkload.published} منتشر</StatusToken>
                    <StatusToken tone={selectedCampaignWorkload.failed ? "alert" : "success"}>{selectedCampaignWorkload.failed} خطا</StatusToken>
                    <Button href="/campaigns" variant="ghost" size="sm">مدیر کمپین</Button>
                  </div>
                ) : null}
              </div>

              {!loading ? (
                <section className="calendar-day-agenda" aria-label="برنامه روز انتخاب‌شده">
                  <div className="calendar-day-agenda-head">
                    <div className="min-w-0">
                      <p className="app-section-kicker text-[10px] font-black">نمای روز</p>
                      <h2>{selectedDayLabel}</h2>
                      <p>{selectedDayPosts.length ? `${selectedDayPosts.length} پست زمان‌دار برای این روز` : "روز آزاد برای ساخت برنامه جدید"}</p>
                    </div>
                    <div className="calendar-day-agenda-summary" aria-label="خلاصه وضعیت روز">
                      <StatusToken tone="warning">{selectedDayStatusSummary.scheduled} زمان‌بندی</StatusToken>
                      <StatusToken tone="primary">{selectedDayStatusSummary.publishing} در انتشار</StatusToken>
                      <StatusToken tone="success">{selectedDayStatusSummary.published} منتشر</StatusToken>
                      <StatusToken tone={selectedDayStatusSummary.failed ? "alert" : "success"}>{selectedDayStatusSummary.failed} ریسک</StatusToken>
                    </div>
                  </div>

                  <div className="calendar-day-agenda-intelligence">
                    <div>
                      <p className="text-xs font-black text-app-text">پیشنهاد زمان خالی</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedDayInsights.suggestedSlots.length ? selectedDayInsights.suggestedSlots.map((slot) => (
                          <Button key={slot.hour} type="button" variant="secondary" size="sm" onClick={() => openQuickCreateAt(selectedDayValue, slot.hour, 0)}>
                            {slot.label}
                          </Button>
                        )) : <StatusToken tone="warning">روز شلوغ است</StatusToken>}
                      </div>
                    </div>
                    <div className="calendar-day-agenda-health">
                      {selectedDayInsights.rubikaBlocked ? (
                        <NoticeBanner tone="alert" title="کانال آماده نیست">
                          {rubikaStatusLabel(rubikaSettings)}
                        </NoticeBanner>
                      ) : selectedDayInsights.conflicts.length ? (
                        <NoticeBanner tone="warning" title="فاصله زمانی کم">
                          {selectedDayInsights.conflicts.length} تداخل احتمالی در این روز وجود دارد.
                        </NoticeBanner>
                      ) : selectedDayInsights.missingMedia.length ? (
                        <NoticeBanner tone="warning" title="رسانه ناقص">
                          {selectedDayInsights.missingMedia.length} پست بدون رسانه است.
                        </NoticeBanner>
                      ) : (
                        <NoticeBanner tone="success" title="روز آماده انتشار">
                          فاصله‌بندی و وضعیت این روز پایدار است.
                        </NoticeBanner>
                      )}
                    </div>
                  </div>

                  <div className="calendar-day-agenda-list">
                    {selectedDayPosts.length ? selectedDayPosts.map((post) => renderAgendaPost(post)) : (
                      <EmptyState
                        icon={<CalendarDays className="h-5 w-5" aria-hidden="true" />}
                        title="برای این روز هنوز برنامه‌ای نیست"
                        description="یک زمان پیشنهادی انتخاب کنید یا پست تازه بسازید."
                        action={<Button type="button" onClick={() => openQuickCreate(selectedDayValue)}>ساخت پست برای این روز</Button>}
                      />
                    )}
                  </div>
                </section>
              ) : null}

              {loading ? <LoadingRows rows={5} /> : null}

              {!loading && viewMode !== "list" ? (
                <div className="calendar-planner-viewport">
                  <div className="calendar-planner-board">
                    <div className="calendar-week-header grid grid-cols-7 border-b border-app-border bg-slate-50 text-center text-xs font-black text-slate-500">
                      {weekDays.map((day) => <div key={day} className="px-2 py-2.5">{day}</div>)}
                    </div>
                    <div className="calendar-days-grid grid grid-cols-7">
                      {(viewMode === "week" ? activeWeekDays : monthGrid).map((day, index) => {
                        const dayPosts = day ? postsByDay.get(day.key) ?? [] : [];
                        const isToday = day?.key === todayKey;
                        const isSelectedDay = Boolean(day && activeDayKey === day.key);
                        const dayRisk = dayPosts.some((post) => {
                          const time = dateTime(post.scheduled_at);
                          return post.status === "failed" || (post.status === "scheduled" && time !== null && time < now);
                        });
                        const weekdayLabel = day ? weekDays[weekOffset(new Date(day.date))] : "";
                        const dayStateLabel = dayRisk ? "ریسک" : dayPosts.length ? `${dayPosts.length} پست` : "خالی";

                        return (
                          <div
                            key={day?.key ?? `empty-${index}`}
                            onClick={() => day ? selectDay(day, dayPosts) : undefined}
                            onDragOver={(event) => day ? allowDropOnDay(event, day) : undefined}
                            onDrop={(event) => day ? dropPostOnDay(event, day) : undefined}
                            className={`calendar-day-cell ${day ? "" : "calendar-day-empty"} ${calendarCellHeight} ${dayPosts.length ? "calendar-day-has-posts" : ""} ${dayRisk ? "calendar-day-risk" : ""} ${isToday ? "calendar-day-today" : ""} ${isSelectedDay ? "calendar-day-selected" : ""} ${day && draggingPostId && dragTargetDayKey === day.key ? "calendar-day-drop-target" : ""} ${day && draggingPostId ? "calendar-day-can-drop" : ""}`}
                          >
                            {day ? (
                              <>
                                <div className="calendar-day-head">
                                  <span className="calendar-day-date">
                                    <span className="calendar-day-weekday">{weekdayLabel}</span>
                                    <span className="calendar-day-number">{day.day}</span>
                                  </span>
                                  <div className="calendar-day-actions">
                                    <span className="calendar-day-state">{dayStateLabel}</span>
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        openQuickCreate(day.date);
                                      }}
                                      className="calendar-day-add"
                                      aria-label={`افزودن پست در ${formatJalaliDate(day.date)}`}
                                      title="افزودن پست در این روز"
                                    >
                                      <Plus className="calendar-day-add-icon" aria-hidden="true" />
                                    </button>
                                  </div>
                                </div>
                                <div className="calendar-day-posts" onClick={viewMode === "week" ? (event) => event.stopPropagation() : undefined}>
                                  {viewMode === "month" ? (
                                    renderMonthDayDensity(dayPosts, Math.max(0, dayPosts.length - 3))
                                  ) : (
                                    <>
                                      {dayPosts.slice(0, visiblePostLimit).map((post) => renderPostChip(post, false))}
                                      {dayPosts.length > visiblePostLimit ? (
                                        <button
                                          type="button"
                                          className="calendar-day-more"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            selectDay(day, dayPosts);
                                          }}
                                        >
                                          +{dayPosts.length - visiblePostLimit} مورد دیگر
                                        </button>
                                      ) : null}
                                    </>
                                  )}
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
                    {filteredPosts.map((post) => {
                      const asset = assetByPostId.get(post.id);
                      const previewUrl = asset ? mediaPreviewUrls[asset.id] : "";
                      return (
                      <article key={post.id} className="relative grid gap-3 overflow-hidden px-4 py-3 transition hover:bg-slate-50 lg:grid-cols-[150px_minmax(0,1fr)_140px_110px] lg:items-center">
                        <span className="absolute inset-y-0 right-0 w-1" style={{ backgroundColor: campaignColorForPost(post, campaigns) }} />
                        <div className="text-xs leading-6 text-app-muted">
                          <p className="font-bold text-app-text">{formatJalaliDate(post.scheduled_at)}</p>
                          <p>{formatJalaliTime(post.scheduled_at)}</p>
                        </div>
                        <div className="flex min-w-0 items-center gap-3">
                          {previewUrl ? (
                            <img src={previewUrl} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover ring-1 ring-app-border" />
                          ) : (
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-app-surfaceMuted text-slate-400 shadow-hairline">
                              <ImageIcon className="h-4 w-4" aria-hidden="true" />
                            </span>
                          )}
                          <span className="min-w-0">
                            <span className="block truncate font-bold text-app-text">{post.title}</span>
                            <span className="mt-1 block truncate text-sm text-app-muted">{campaignKeyForPost(post) !== "none" ? campaignLabelForPost(post, campaigns) : post.caption || "بدون کمپین"}</span>
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge status={post.status} />
                          <ChannelBadges platform={post.platform} compact />
                          <CountdownBadge status={post.status} scheduledAt={post.scheduled_at} />
                        </div>
                        <Button type="button" variant={selectedPost?.id === post.id ? "primary" : "secondary"} size="sm" onClick={() => selectPost(post)}>
                          جزئیات
                        </Button>
                      </article>
                    );
                    })}
                  </div>
                </div>
              ) : null}

              {!loading && viewMode === "list" && filteredPosts.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    icon={<CalendarDays className="h-5 w-5" aria-hidden="true" />}
                    title="پستی برای این فیلتر وجود ندارد"
                    description="فیلتر را تغییر دهید یا برای روز انتخاب‌شده یک پست جدید بسازید."
                    action={<Button type="button" onClick={() => openQuickCreate(selectedDayValue)}>ایجاد پست زمان‌بندی‌شده</Button>}
                  />
                </div>
              ) : null}

            </section>

            <aside className="calendar-action-rail" aria-label="عملیات برنامه‌ریز">
              <div className="calendar-action-rail-head">
                <div className="min-w-0">
                  <p className="app-section-kicker text-[10px] font-black">مرکز کنترل</p>
                  <h2>کنترل انتشار</h2>
                  <p>{selectedDayLabel} · {selectedDayPosts.length ? `${selectedDayPosts.length} پست برنامه‌ریزی‌شده` : "روز آزاد برای ساخت برنامه"}</p>
                </div>
                <div className="calendar-action-rail-context">
                  <StatusToken tone={selectedDayInsights.conflicts.length || selectedDayInsights.failed.length || selectedDayInsights.rubikaBlocked ? "alert" : selectedDayInsights.missingMedia.length ? "warning" : "success"}>
                    {selectedDayInsights.conflicts.length || selectedDayInsights.failed.length || selectedDayInsights.rubikaBlocked ? "نیازمند رسیدگی" : selectedDayInsights.missingMedia.length ? "قابل بهبود" : "آماده انتشار"}
                  </StatusToken>
                  <StatusToken tone="neutral">{visibleRangeCount} پست در بازه</StatusToken>
                </div>
              </div>
              <div className="calendar-action-rail-stack">
                <Button type="button" onClick={() => openQuickCreate(selectedDayValue)} className="calendar-action-primary" size="sm">
                  <Plus className="ml-1.5 h-4 w-4" aria-hidden="true" />
                  پست جدید برای این روز
                </Button>
                {selectedPost ? (
                  <>
                    <Button type="button" variant="secondary" size="sm" onClick={() => setQuickPreviewPostId(selectedPost.id)}>
                      پیش‌نمایش پست انتخابی
                    </Button>
                    <Button href={`/compose?postId=${selectedPost.id}`} variant="secondary" size="sm">
                      ویرایش پست انتخابی
                    </Button>
                  </>
                ) : null}
                <Button href="/queue" variant="ghost" className="calendar-action-route" size="sm">صف انتشار</Button>
                <Button href="/campaigns" variant="ghost" className="calendar-action-route" size="sm">مدیر کمپین</Button>
              </div>
              <div className="calendar-action-rail-status">
                {attentionPosts.length ? (
                  <Link href="/content?status=failed" className="calendar-action-rail-alert">
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    {attentionPosts.length} مورد نیازمند رسیدگی
                  </Link>
                ) : (
                  <p className="calendar-action-rail-ok">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    برنامه انتشار پایدار است
                  </p>
                )}
              </div>
            </aside>
          </section>
          {quickPreviewPost && typeof document !== "undefined" ? createPortal(
            <div className="calendar-post-preview-backdrop" role="presentation" onClick={() => setQuickPreviewPostId(null)}>
              <section className="calendar-post-preview-modal" role="dialog" aria-modal="true" aria-label={`پیش‌نمایش ${quickPreviewPost.title}`} onClick={(event) => event.stopPropagation()}>
                <div className="calendar-post-preview-head">
                  <div className="min-w-0">
                    <p className="app-section-kicker text-[10px] font-black">پیش‌نمایش پست</p>
                    <h2>{quickPreviewPost.title}</h2>
                    <p>{formatJalaliDateTime(quickPreviewPost.scheduled_at)} · {campaignLabelForPost(quickPreviewPost, campaigns)}</p>
                  </div>
                  <button type="button" className="calendar-post-preview-close" onClick={() => setQuickPreviewPostId(null)} aria-label="بستن پیش‌نمایش">
                    <X className="calendar-post-preview-close-icon" aria-hidden="true" />
                  </button>
                </div>

                <div className="calendar-post-preview-shell">
                  <div className="calendar-post-preview-media">
                    {quickPreviewUrl ? (
                      <img src={quickPreviewUrl} alt={quickPreviewAsset?.original_filename ?? ""} className="calendar-post-preview-image" />
                    ) : (
                      <span className="calendar-post-preview-image calendar-post-preview-image-empty">
                        <ImageIcon className="h-6 w-6" aria-hidden="true" />
                        بدون رسانه
                      </span>
                    )}
                    <div className="calendar-post-preview-status">
                      <StatusBadge status={quickPreviewPost.status} />
                      <ChannelBadges platform={quickPreviewPost.platform} compact />
                      <CountdownBadge status={quickPreviewPost.status} scheduledAt={quickPreviewPost.scheduled_at} />
                      <span className="calendar-post-preview-campaign" style={{ "--campaign-accent": campaignColorForPost(quickPreviewPost, campaigns) } as CSSProperties}>
                        <span aria-hidden="true" />
                        {campaignLabelForPost(quickPreviewPost, campaigns)}
                      </span>
                    </div>
                  </div>

                  <div className="calendar-post-preview-details">
                    <DetailGrid
                      items={[
                        { label: "زمان انتشار", value: formatJalaliDateTime(quickPreviewPost.scheduled_at) },
                        { label: "کانال", value: quickPreviewPost.platform || "Rubika" },
                        { label: "کمپین", value: campaignLabelForPost(quickPreviewPost, campaigns) },
                        { label: "تلاش انتشار", value: `${quickPreviewPost.attempt_count}` }
                      ]}
                    />
                    <p className="calendar-post-preview-caption">{quickPreviewPost.caption || "کپشن برای این پست ثبت نشده است."}</p>
                    <Timeline
                      items={[
                        {
                          title: "ساخت محتوا",
                          description: "پست در فضای کاری ثبت شده است.",
                          meta: formatJalaliDateTime(quickPreviewPost.created_at),
                          tone: "primary"
                        },
                        {
                          title: "ورود به برنامه انتشار",
                          description: formatJalaliDateTime(quickPreviewPost.scheduled_at),
                          meta: campaignLabelForPost(quickPreviewPost, campaigns),
                          tone: "warning"
                        },
                        {
                          title: "وضعیت فعلی",
                          description: quickPreviewPost.last_error || postStatusLabel(quickPreviewPost.status),
                          meta: formatJalaliDateTime(quickPreviewPost.updated_at),
                          tone: postTimelineTone(quickPreviewPost.status)
                        }
                      ]}
                    />
                  </div>
                </div>

                {quickPreviewPost.last_error ? <NoticeBanner tone="alert">{quickPreviewPost.last_error}</NoticeBanner> : null}

                <div className="calendar-post-preview-actions">
                  <Button href={`/compose?postId=${quickPreviewPost.id}`}>ویرایش پست</Button>
                  <Button href="/queue" variant="secondary">صف انتشار</Button>
                  <Button type="button" variant="ghost" onClick={() => setQuickPreviewPostId(null)}>بستن</Button>
                </div>
              </section>
            </div>,
            document.body
          ) : null}
          <PlannerComposerDrawer scheduledAt={quickCreateAt} defaultCampaign={selectedCampaignOption?.label ?? ""} onClose={() => setQuickCreateAt(null)} onCreated={() => loadPosts(true)} />
        </WorkspacePage>
      </AppShell>
    </AuthGate>
  );
}
