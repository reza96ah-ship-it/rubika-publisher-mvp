"use client";

import { AlertTriangle, BarChart3, CheckCircle2, CheckSquare2, Download, FileImage, ImageIcon, PieChart, Plus, Printer, RefreshCw, Target, TimerReset, TrendingUp, XCircle, Zap } from "lucide-react";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "../../components/app-shell";
import { AuthGate } from "../../components/auth-gate";
import { DataRow, DataSearchField, DataTable, DataToolbar } from "../../components/data-view";
import { LoadingRows } from "../../components/loading-skeleton";
import { PublishingWorkspaceHeader } from "../../components/publishing-workspace";
import { StatusBadge } from "../../components/status-badge";
import { useToast } from "../../components/toast-provider";
import { Button } from "../../components/ui/button";
import { Field, Input, Select, Textarea } from "../../components/ui/form";
import { DetailGrid, EmptyState, NoticeBanner, StatusToken, Timeline, WorkspacePage, WorkspacePanel } from "../../components/workspace-ui";
import { assignPostsToCampaign, campaignColorForPost, campaignLabelForPost, createCampaign, loadCampaigns, updateCampaign, type Campaign, type CampaignStatus } from "../../lib/campaigns";
import { getJalaliMonthLength, getJalaliMonthStartOffset, getJalaliPickerParts, jalaliMonthNames, jalaliPickerPartsToIso, persianWeekdays, type JalaliPickerParts } from "../../lib/jalali-picker";
import { apiUrl, authHeaders, formatDateTime, type Post } from "../../lib/posts";

type MediaAsset = {
  id: number;
  post_id: number | null;
  original_filename: string;
  content_type: string;
  size_bytes: number;
  folder: string;
  tags: string;
  url: string;
};

type PublishAttempt = {
  id: number;
  post_id: number;
  post_title: string;
  action: string;
  status: string;
  request_payload: string;
  response_payload: string;
  error: string;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
};

type CampaignStats = {
  total: number;
  draft: number;
  ready: number;
  scheduled: number;
  publishing: number;
  published: number;
  failed: number;
  media: number;
  health: number;
};

type CampaignForm = {
  name: string;
  goal: string;
  status: CampaignStatus;
  color: string;
  owner: string;
  starts_at: string | null;
  ends_at: string | null;
  notes: string;
};

type EditorMode = "edit" | "create";
type CampaignDateField = "starts_at" | "ends_at";

const statusLabels: Record<string, string> = {
  active: "فعال",
  paused: "متوقف",
  completed: "تکمیل‌شده",
  archived: "آرشیوشده"
};

const postStatusLabels: Record<string, string> = {
  draft: "پیش‌نویس",
  ready: "آماده",
  scheduled: "زمان‌بندی‌شده",
  publishing: "در حال انتشار",
  published: "منتشرشده",
  failed: "ناموفق",
  cancelled: "لغوشده"
};

const campaignStatusOptions: Array<{ value: CampaignStatus; label: string }> = [
  { value: "active", label: "فعال" },
  { value: "paused", label: "متوقف" },
  { value: "completed", label: "تکمیل‌شده" },
  { value: "archived", label: "آرشیوشده" }
];

const emptyCampaignForm: CampaignForm = {
  name: "",
  goal: "",
  status: "active",
  color: "#0F766E",
  owner: "",
  starts_at: null,
  ends_at: null,
  notes: ""
};

function campaignToForm(campaign: Campaign): CampaignForm {
  return {
    name: campaign.name,
    goal: campaign.goal,
    status: campaignStatusOptions.some((option) => option.value === campaign.status) ? campaign.status as CampaignStatus : "active",
    color: campaign.color || "#0F766E",
    owner: campaign.owner,
    starts_at: campaign.starts_at,
    ends_at: campaign.ends_at,
    notes: campaign.notes
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function sameJalaliDay(parts: JalaliPickerParts | null, year: number, month: number, day: number) {
  return Boolean(parts && parts.year === year && parts.month === month && parts.day === day);
}

function formatJalaliSelection(value: string | null) {
  if (!value) return "انتخاب نشده";
  const parts = getJalaliPickerParts(value, "Asia/Tehran");
  return `${parts.day} ${jalaliMonthNames[parts.month - 1]} ${parts.year}، ${pad(parts.hour)}:${pad(parts.minute)}`;
}

function CampaignJalaliDateField({
  label,
  value,
  open,
  onOpenChange,
  onChange
}: {
  label: string;
  value: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (value: string | null) => void;
}) {
  const timezone = "Asia/Tehran";
  const [draft, setDraft] = useState<JalaliPickerParts>(() => getJalaliPickerParts(value, timezone));
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selectedParts = value ? getJalaliPickerParts(value, timezone) : null;
  const todayParts = getJalaliPickerParts(null, timezone);
  const monthLength = getJalaliMonthLength(draft.year, draft.month);
  const startOffset = getJalaliMonthStartOffset(draft.year, draft.month);
  const dayCells = useMemo(() => [...Array.from({ length: startOffset }, () => null), ...Array.from({ length: monthLength }, (_, index) => index + 1)], [monthLength, startOffset]);

  useEffect(() => {
    setDraft(getJalaliPickerParts(value, timezone));
  }, [value]);

  useEffect(() => {
    if (!open) return;

    function closeOnOutside(event: PointerEvent) {
      const target = event.target;
      if (target instanceof Node && rootRef.current?.contains(target)) return;
      onOpenChange(false);
    }

    window.addEventListener("pointerdown", closeOnOutside);
    return () => window.removeEventListener("pointerdown", closeOnOutside);
  }, [onOpenChange, open]);

  function emit(next: JalaliPickerParts) {
    setDraft(next);
    onChange(jalaliPickerPartsToIso(next, timezone));
  }

  function moveMonth(delta: number) {
    const absoluteMonth = draft.month + delta;
    const nextYear = draft.year + Math.floor((absoluteMonth - 1) / 12);
    const nextMonth = ((absoluteMonth - 1 + 240) % 12) + 1;
    const nextLength = getJalaliMonthLength(nextYear, nextMonth);
    setDraft({ ...draft, year: nextYear, month: nextMonth, day: Math.min(draft.day, nextLength) });
  }

  function changeTime(field: "hour" | "minute", nextValue: string) {
    const parsed = Number(nextValue);
    if (!Number.isNaN(parsed)) emit({ ...draft, [field]: parsed });
  }

  return (
    <div ref={rootRef} className="relative" dir="rtl">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className={`app-row flex w-full items-center justify-between gap-3 rounded-md border bg-white p-3 text-right transition hover:bg-blue-50/40 ${
          open ? "border-blue-200 ring-2 ring-blue-100" : "border-app-border"
        }`}
      >
        <span className="min-w-0">
          <span className="block text-xs font-black text-app-text">{label}</span>
          <span className="mt-1 block truncate text-[11px] font-bold text-app-muted">{formatJalaliSelection(value)}</span>
        </span>
        <span className={`rounded-md px-2.5 py-1.5 text-[11px] font-black ${value ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-app-primary"}`}>
          {value ? "تغییر" : "انتخاب"}
        </span>
      </button>

      {open ? (
        <div className="app-popover absolute bottom-full right-0 z-[70] mb-2 w-[244px] rounded-lg border border-app-border bg-white p-2.5 shadow-lift">
          <div className="flex items-center justify-between gap-1.5">
            <Button type="button" variant="ghost" size="sm" onClick={() => moveMonth(-1)} className="h-7 px-2">قبل</Button>
            <p className="min-w-20 text-center text-xs font-black text-app-primary">{jalaliMonthNames[draft.month - 1]} {draft.year}</p>
            <Button type="button" variant="ghost" size="sm" onClick={() => moveMonth(1)} className="h-7 px-2">بعد</Button>
          </div>

          <div className="mt-2 grid grid-cols-7 gap-0.5 text-center text-[9px] font-black text-app-muted">
            {persianWeekdays.map((weekday) => <span key={weekday}>{weekday.slice(0, 1)}</span>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-0.5">
            {dayCells.map((day, index) => {
              if (!day) return <span key={`empty-${index}`} className="h-7" />;
              const selected = sameJalaliDay(selectedParts, draft.year, draft.month, day);
              const today = sameJalaliDay(todayParts, draft.year, draft.month, day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => emit({ ...draft, day })}
                  className={`h-7 rounded text-[11px] font-black transition ${selected ? "bg-app-primary text-white shadow-sm" : today ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-app-primary"}`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-2 grid grid-cols-2 gap-1.5">
            <label className="text-[10px] font-black text-app-muted">
              ساعت
              <select value={draft.hour} onChange={(event) => changeTime("hour", event.target.value)} className="mt-1 h-8 w-full rounded-md border border-app-border bg-white px-2 text-xs font-bold text-app-text outline-none focus:ring-2 focus:ring-blue-100">
                {Array.from({ length: 24 }, (_, hour) => <option key={hour} value={hour}>{pad(hour)}</option>)}
              </select>
            </label>
            <label className="text-[10px] font-black text-app-muted">
              دقیقه
              <select value={draft.minute} onChange={(event) => changeTime("minute", event.target.value)} className="mt-1 h-8 w-full rounded-md border border-app-border bg-white px-2 text-xs font-bold text-app-text outline-none focus:ring-2 focus:ring-blue-100">
                {Array.from({ length: 12 }, (_, index) => index * 5).map((minute) => <option key={minute} value={minute}>{pad(minute)}</option>)}
              </select>
            </label>
          </div>

          <div className="mt-2 flex justify-between gap-1.5 border-t border-app-border pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => { onChange(null); onOpenChange(false); }} className="h-7 px-2">حذف</Button>
            <Button type="button" size="sm" onClick={() => onOpenChange(false)} className="h-7 px-2">تایید</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function campaignStatusTone(status: string): "primary" | "success" | "warning" | "neutral" {
  if (status === "active") return "primary";
  if (status === "completed") return "success";
  if (status === "paused") return "warning";
  return "neutral";
}

function isQueued(post: Post) {
  return ["ready", "scheduled", "publishing"].includes(post.status);
}

function postActivityTime(post: Post) {
  const value = post.published_at || post.failed_at || post.scheduled_at || post.updated_at || post.created_at;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function dayKey(value: string | null | undefined) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "unknown";
  return date.toISOString().slice(0, 10);
}

function dayLabel(key: string) {
  if (key === "unknown") return "نامشخص";
  return new Intl.DateTimeFormat("fa-IR", { month: "short", day: "numeric" }).format(new Date(`${key}T00:00:00Z`));
}

function isWithinDays(value: string | null | undefined, days: number) {
  const time = value ? new Date(value).getTime() : NaN;
  if (Number.isNaN(time)) return false;
  return time >= Date.now() - days * 24 * 60 * 60 * 1000;
}

function riskScoreForPost(post: Post, hasMedia: boolean) {
  let score = 0;
  if (post.status === "failed") score += 42;
  if (post.last_error) score += 26;
  if (post.attempt_count > 1) score += Math.min(24, (post.attempt_count - 1) * 8);
  if (!hasMedia) score += 8;
  if (post.status === "draft") score += 6;
  return Math.min(100, score);
}

function buildCampaignStats(posts: Post[], mediaByPostId: Map<number, MediaAsset[]>): CampaignStats {
  const draft = posts.filter((post) => post.status === "draft").length;
  const ready = posts.filter((post) => post.status === "ready").length;
  const scheduled = posts.filter((post) => post.status === "scheduled").length;
  const publishing = posts.filter((post) => post.status === "publishing").length;
  const published = posts.filter((post) => post.status === "published").length;
  const failed = posts.filter((post) => post.status === "failed" || post.last_error).length;
  const media = posts.filter((post) => (mediaByPostId.get(post.id) ?? []).length > 0).length;
  const total = posts.length;
  const successRatio = total ? published / total : 0;
  const queueRatio = total ? (ready + scheduled + publishing) / total : 0;
  const mediaRatio = total ? media / total : 0;
  const failurePenalty = total ? failed / total : 0;
  const health = Math.max(0, Math.min(100, Math.round(42 + successRatio * 30 + queueRatio * 14 + mediaRatio * 14 - failurePenalty * 34)));
  return { total, draft, ready, scheduled, publishing, published, failed, media, health };
}

function formatBytes(value: number) {
  if (!value) return "0 KB";
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function percent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function csvCell(value: string | number | null | undefined) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function toCsv(rows: Array<Array<string | number | null | undefined>>) {
  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}

function safeFileName(value: string) {
  return value.trim().replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, "-").slice(0, 64) || "campaign";
}

function downloadTextFile(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function CampaignsPage() {
  const { showToast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [attempts, setAttempts] = useState<PublishAttempt[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<Record<number, string>>({});
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>("edit");
  const [campaignForm, setCampaignForm] = useState<CampaignForm>(emptyCampaignForm);
  const [campaignColorDraft, setCampaignColorDraft] = useState(emptyCampaignForm.color);
  const [openCampaignCalendar, setOpenCampaignCalendar] = useState<CampaignDateField | null>(null);
  const [savingCampaign, setSavingCampaign] = useState(false);
  const [assignmentSearch, setAssignmentSearch] = useState("");
  const [selectedAssignIds, setSelectedAssignIds] = useState<Set<number>>(new Set());
  const [assigningPosts, setAssigningPosts] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadWorkspace = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const headers = authHeaders();
      const [campaignResponse, postsResponse, mediaResponse, attemptsResponse] = await Promise.all([
        loadCampaigns(),
        fetch(`${apiUrl}/posts`, { headers }),
        fetch(`${apiUrl}/media`, { headers }),
        fetch(`${apiUrl}/publish-attempts`, { headers })
      ]);
      if (!postsResponse.ok) throw new Error("دریافت پست‌ها برای کمپین ناموفق بود");
      const nextPosts = await postsResponse.json() as Post[];
      const nextMedia = mediaResponse.ok ? await mediaResponse.json() as MediaAsset[] : [];
      const nextAttempts = attemptsResponse.ok ? await attemptsResponse.json() as PublishAttempt[] : [];
      setCampaigns(campaignResponse);
      setPosts(nextPosts);
      setAttempts(nextAttempts);
      setMediaAssets(nextMedia);
      setSelectedCampaignId((current) => current ?? campaignResponse[0]?.id ?? null);
      if (campaignResponse.length === 0) {
        setEditorMode("create");
        setCampaignForm(emptyCampaignForm);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWorkspace().catch((err) => {
      setError(err instanceof Error ? err.message : "خطا در دریافت فضای کمپین");
      setLoading(false);
      setRefreshing(false);
    });
  }, [loadWorkspace]);

  useEffect(() => {
    if (mediaAssets.length === 0) {
      setMediaPreviewUrls({});
      return;
    }

    let cancelled = false;
    const createdUrls: string[] = [];

    async function loadPreviews() {
      const imageAssets = mediaAssets.filter((asset) => asset.post_id && asset.content_type.startsWith("image/")).slice(0, 64);
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
  }, [mediaAssets]);

  const mediaByPostId = useMemo(() => {
    const map = new Map<number, MediaAsset[]>();
    mediaAssets.forEach((asset) => {
      if (!asset.post_id) return;
      map.set(asset.post_id, [...(map.get(asset.post_id) ?? []), asset]);
    });
    return map;
  }, [mediaAssets]);

  const campaignRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return campaigns
      .map((campaign) => {
        const linkedPosts = posts.filter((post) => post.campaign_id === campaign.id);
        return { campaign, posts: linkedPosts, stats: buildCampaignStats(linkedPosts, mediaByPostId) };
      })
      .filter((row) => {
        if (!query) return true;
        return `${row.campaign.name} ${row.campaign.goal} ${row.campaign.owner} ${row.campaign.notes}`.toLowerCase().includes(query);
      })
      .sort((first, second) => {
        if (first.campaign.status === "active" && second.campaign.status !== "active") return -1;
        if (first.campaign.status !== "active" && second.campaign.status === "active") return 1;
        return second.stats.health - first.stats.health || second.stats.total - first.stats.total;
      });
  }, [campaigns, mediaByPostId, posts, search]);

  const selectedRow = useMemo(() => {
    if (!selectedCampaignId) return campaignRows[0] ?? null;
    return campaignRows.find((row) => row.campaign.id === selectedCampaignId) ?? campaignRows[0] ?? null;
  }, [campaignRows, selectedCampaignId]);

  useEffect(() => {
    if (editorMode !== "edit") return;
    if (selectedRow) {
      setCampaignForm(campaignToForm(selectedRow.campaign));
    }
  }, [editorMode, selectedRow]);

  useEffect(() => {
    setCampaignColorDraft(/^#[0-9A-Fa-f]{6}$/.test(campaignForm.color) ? campaignForm.color : emptyCampaignForm.color);
  }, [campaignForm.color]);

  useEffect(() => {
    setAssignmentSearch("");
    setSelectedAssignIds(new Set());
  }, [selectedCampaignId]);

  const selectedPosts = useMemo(() => {
    return [...(selectedRow?.posts ?? [])].sort((first, second) => postActivityTime(second) - postActivityTime(first));
  }, [selectedRow]);

  const selectedAssets = useMemo(() => {
    const ids = new Set(selectedPosts.map((post) => post.id));
    return mediaAssets.filter((asset) => asset.post_id && ids.has(asset.post_id));
  }, [mediaAssets, selectedPosts]);

  const selectedAttempts = useMemo(() => {
    const ids = new Set(selectedPosts.map((post) => post.id));
    return attempts.filter((attempt) => ids.has(attempt.post_id));
  }, [attempts, selectedPosts]);

  const campaignInsights = useMemo(() => {
    const published = selectedPosts.filter((post) => post.status === "published").length;
    const failed = selectedPosts.filter((post) => post.status === "failed" || post.last_error).length;
    const queued = selectedPosts.filter(isQueued).length;
    const draft = selectedPosts.filter((post) => post.status === "draft").length;
    const withMedia = selectedPosts.filter((post) => (mediaByPostId.get(post.id) ?? []).length > 0).length;
    const successfulAttempts = selectedAttempts.filter((attempt) => attempt.status === "success").length;
    const failedAttempts = selectedAttempts.filter((attempt) => attempt.status === "failed").length;
    const completedAttempts = successfulAttempts + failedAttempts;
    const recentPublished = selectedPosts.filter((post) => post.status === "published" && isWithinDays(post.published_at, 7)).length;
    const recentFailed = selectedPosts.filter((post) => (post.status === "failed" || post.last_error) && isWithinDays(post.failed_at || post.updated_at, 7)).length;
    const trendKeys = Array.from({ length: 10 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (9 - index));
      return date.toISOString().slice(0, 10);
    });
    const trend = trendKeys.map((key) => {
      const dayPosts = selectedPosts.filter((post) => dayKey(post.published_at || post.failed_at || post.scheduled_at || post.updated_at) === key);
      return {
        key,
        label: dayLabel(key),
        activity: dayPosts.length,
        published: dayPosts.filter((post) => post.status === "published").length,
        failed: dayPosts.filter((post) => post.status === "failed" || post.last_error).length
      };
    });
    const maxActivity = Math.max(1, ...trend.map((point) => point.activity));
    const riskPosts = selectedPosts
      .map((post) => ({ post, score: riskScoreForPost(post, (mediaByPostId.get(post.id) ?? []).length > 0) }))
      .filter((item) => item.score > 0)
      .sort((first, second) => second.score - first.score || postActivityTime(second.post) - postActivityTime(first.post))
      .slice(0, 5);
    const statusMix = [
      { label: "منتشر", value: published, color: "#059669" },
      { label: "در جریان", value: queued, color: "#2563EB" },
      { label: "پیش‌نویس", value: draft, color: "#64748B" },
      { label: "ریسک", value: failed, color: "#E11D48" }
    ];
    return {
      published,
      failed,
      queued,
      draft,
      withMedia,
      mediaCoverage: percent(withMedia, selectedPosts.length),
      deliveryRate: percent(published, published + failed),
      attemptSuccessRate: percent(successfulAttempts, completedAttempts),
      failedAttempts,
      recentPublished,
      recentFailed,
      trend,
      maxActivity,
      riskPosts,
      statusMix
    };
  }, [mediaByPostId, selectedAttempts, selectedPosts]);

  const assignablePosts = useMemo(() => {
    if (!selectedRow) return [];
    const query = assignmentSearch.trim().toLowerCase();
    return posts
      .filter((post) => post.campaign_id !== selectedRow.campaign.id)
      .filter((post) => {
        if (!query) return true;
        return `${post.title} ${post.caption} ${post.hashtags} ${post.campaign} ${post.status}`.toLowerCase().includes(query);
      })
      .sort((first, second) => postActivityTime(second) - postActivityTime(first))
      .slice(0, 30);
  }, [assignmentSearch, posts, selectedRow]);

  const activeCount = campaigns.filter((campaign) => campaign.status === "active").length;
  const failedCount = selectedRow?.stats.failed ?? 0;
  const queuedCount = selectedRow ? selectedRow.stats.ready + selectedRow.stats.scheduled + selectedRow.stats.publishing : 0;
  const healthTone: "success" | "warning" | "alert" = (selectedRow?.stats.health ?? 0) >= 76 ? "success" : (selectedRow?.stats.health ?? 0) >= 50 ? "warning" : "alert";

  function previewUrlForPost(post: Post) {
    const asset = (mediaByPostId.get(post.id) ?? [])[0];
    return asset ? mediaPreviewUrls[asset.id] ?? "" : "";
  }

  function toggleAssignPost(postId: number) {
    setSelectedAssignIds((current) => {
      const next = new Set(current);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }

  function toggleAllAssignable() {
    const visibleIds = assignablePosts.map((post) => post.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedAssignIds.has(id));
    setSelectedAssignIds((current) => {
      const next = new Set(current);
      if (allSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  }

  function updateCampaignField<K extends keyof CampaignForm>(field: K, value: CampaignForm[K]) {
    setCampaignForm((current) => ({ ...current, [field]: value }));
    if (message) setMessage("");
  }

  function commitCampaignColor(value: string) {
    if (!/^#[0-9A-Fa-f]{6}$/.test(value)) return;
    updateCampaignField("color", value.toUpperCase());
  }

  function focusCampaignEditor() {
    window.setTimeout(() => {
      document.getElementById("campaign-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => document.getElementById("campaign-name-input")?.focus(), 250);
    }, 0);
  }

  function startNewCampaign() {
    setEditorMode("create");
    setCampaignForm(emptyCampaignForm);
    setSelectedCampaignId(null);
    setMessage("");
    setError("");
    focusCampaignEditor();
  }

  function editCampaign(campaign: Campaign) {
    setEditorMode("edit");
    setSelectedCampaignId(campaign.id);
    setCampaignForm(campaignToForm(campaign));
    setMessage("");
    setError("");
  }

  async function saveCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = campaignForm.name.trim();
    if (!name) {
      setError("نام کمپین الزامی است.");
      showToast({ title: "نام کمپین لازم است", description: "برای ذخیره کمپین، یک نام مشخص وارد کنید.", tone: "warning" });
      return;
    }

    setSavingCampaign(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        name,
        goal: campaignForm.goal.trim(),
        status: campaignForm.status,
        color: campaignForm.color,
        owner: campaignForm.owner.trim(),
        starts_at: campaignForm.starts_at,
        ends_at: campaignForm.ends_at,
        notes: campaignForm.notes.trim()
      };
      const savedCampaign = editorMode === "create"
        ? await createCampaign(payload)
        : selectedRow
          ? await updateCampaign(selectedRow.campaign.id, payload)
          : await createCampaign(payload);

      setCampaigns((current) => {
        const exists = current.some((campaign) => campaign.id === savedCampaign.id);
        return exists
          ? current.map((campaign) => campaign.id === savedCampaign.id ? savedCampaign : campaign)
          : [savedCampaign, ...current];
      });
      setSelectedCampaignId(savedCampaign.id);
      setEditorMode("edit");
      setCampaignForm(campaignToForm(savedCampaign));
      setMessage(editorMode === "create" ? "کمپین جدید ساخته شد." : "کمپین به‌روزرسانی شد.");
      showToast({ title: editorMode === "create" ? "کمپین ساخته شد" : "کمپین ذخیره شد", description: savedCampaign.name, tone: "success" });
    } catch (err) {
      const nextError = err instanceof Error ? err.message : "ذخیره کمپین ناموفق بود";
      setError(nextError);
      showToast({ title: "ذخیره کمپین ناموفق بود", description: nextError, tone: "alert" });
    } finally {
      setSavingCampaign(false);
    }
  }

  async function assignSelectedPosts() {
    if (!selectedRow || selectedAssignIds.size === 0) return;
    setAssigningPosts(true);
    setError("");
    setMessage("");
    try {
      const result = await assignPostsToCampaign([...selectedAssignIds], selectedRow.campaign.id);
      setPosts((current) => current.map((post) => result.post_ids.includes(post.id) ? { ...post, campaign_id: selectedRow.campaign.id, campaign: selectedRow.campaign.name } : post));
      setSelectedAssignIds(new Set());
      const skippedText = result.skipped_post_ids.length ? `، ${result.skipped_post_ids.length} مورد رد شد` : "";
      setMessage(`${result.updated_count} پست به کمپین وصل شد${skippedText}.`);
      showToast({ title: "پست‌ها به کمپین وصل شدند", description: `${result.updated_count} پست به ${selectedRow.campaign.name} اضافه شد`, tone: "success" });
    } catch (err) {
      const nextError = err instanceof Error ? err.message : "اتصال پست‌ها به کمپین ناموفق بود";
      setError(nextError);
      showToast({ title: "اتصال گروهی ناموفق بود", description: nextError, tone: "alert" });
    } finally {
      setAssigningPosts(false);
    }
  }

  async function removePostFromCampaign(post: Post) {
    setAssigningPosts(true);
    setError("");
    setMessage("");
    try {
      const result = await assignPostsToCampaign([post.id], null);
      setPosts((current) => current.map((item) => result.post_ids.includes(item.id) ? { ...item, campaign_id: null, campaign: "" } : item));
      setMessage("پست از کمپین جدا شد.");
      showToast({ title: "پست از کمپین جدا شد", description: post.title, tone: "success" });
    } catch (err) {
      const nextError = err instanceof Error ? err.message : "جدا کردن پست از کمپین ناموفق بود";
      setError(nextError);
      showToast({ title: "جدا کردن پست ناموفق بود", description: nextError, tone: "alert" });
    } finally {
      setAssigningPosts(false);
    }
  }

  function buildCampaignReportRows() {
    if (!selectedRow) return [];
    const campaign = selectedRow.campaign;
    return [
      ["گزارش کمپین", campaign.name],
      ["تاریخ خروجی", formatDateTime(new Date().toISOString())],
      ["وضعیت", statusLabels[campaign.status] ?? campaign.status],
      ["مالک", campaign.owner || "تعریف نشده"],
      ["بازه", `${formatDateTime(campaign.starts_at)} تا ${formatDateTime(campaign.ends_at)}`],
      ["هدف", campaign.goal || campaign.notes || "تعریف نشده"],
      [],
      ["شاخص", "مقدار"],
      ["سلامت کمپین", `${selectedRow.stats.health}%`],
      ["نرخ تحویل", `${campaignInsights.deliveryRate}%`],
      ["پوشش رسانه", `${campaignInsights.mediaCoverage}%`],
      ["موفقیت تلاش‌ها", `${campaignInsights.attemptSuccessRate}%`],
      ["انتشار در ۷ روز", campaignInsights.recentPublished],
      ["ریسک هفته", campaignInsights.recentFailed],
      ["پست‌های متصل", selectedPosts.length],
      ["دارایی‌های متصل", selectedAssets.length],
      ["تلاش‌های انتشار", selectedAttempts.length],
      [],
      ["ترکیب وضعیت", "تعداد"],
      ...campaignInsights.statusMix.map((item) => [item.label, item.value]),
      [],
      ["روند ۱۰ روزه", "فعالیت", "منتشر", "خطا"],
      ...campaignInsights.trend.map((point) => [point.label, point.activity, point.published, point.failed]),
      [],
      ["پست‌های اولویت‌دار", "امتیاز ریسک", "وضعیت", "خطا/یادداشت"],
      ...(campaignInsights.riskPosts.length
        ? campaignInsights.riskPosts.map(({ post, score }) => [post.title, `${score}%`, postStatusLabels[post.status] ?? post.status, post.last_error || `${post.attempt_count} تلاش ثبت‌شده`])
        : [["ریسک فعالی دیده نمی‌شود", "0%", "", ""]]),
      [],
      ["پست‌های متصل", "شناسه", "وضعیت", "زمان", "تلاش", "رسانه", "خطا"],
      ...selectedPosts.map((post) => [
        post.title,
        post.id,
        postStatusLabels[post.status] ?? post.status,
        formatDateTime(post.scheduled_at || post.published_at || post.failed_at || post.updated_at),
        post.attempt_count,
        (mediaByPostId.get(post.id) ?? []).length,
        post.last_error
      ])
    ];
  }

  function exportCampaignCsv() {
    if (!selectedRow) return;
    const filename = `${safeFileName(selectedRow.campaign.name)}-campaign-report.csv`;
    downloadTextFile(filename, `\ufeff${toCsv(buildCampaignReportRows())}`, "text/csv;charset=utf-8");
    showToast({ title: "گزارش CSV آماده شد", description: selectedRow.campaign.name, tone: "success" });
  }

  function exportCampaignHtml() {
    if (!selectedRow) return;
    const campaign = selectedRow.campaign;
    const filename = `${safeFileName(campaign.name)}-campaign-report.html`;
    const statusRows = campaignInsights.statusMix.map((item) => `
      <tr><td><span class="dot" style="background:${item.color}"></span>${escapeHtml(item.label)}</td><td>${item.value}</td><td>${percent(item.value, selectedPosts.length)}%</td></tr>
    `).join("");
    const trendRows = campaignInsights.trend.map((point) => `
      <tr><td>${escapeHtml(point.label)}</td><td>${point.activity}</td><td>${point.published}</td><td>${point.failed}</td></tr>
    `).join("");
    const priorityRows = (campaignInsights.riskPosts.length
      ? campaignInsights.riskPosts.map(({ post, score }) => `
        <tr><td>${escapeHtml(post.title)}</td><td>${score}%</td><td>${escapeHtml(postStatusLabels[post.status] ?? post.status)}</td><td>${escapeHtml(post.last_error || `${post.attempt_count} تلاش ثبت‌شده`)}</td></tr>
      `)
      : [`<tr><td colspan="4">ریسک فعالی برای پست‌های این کمپین دیده نمی‌شود.</td></tr>`]).join("");
    const postRows = selectedPosts.map((post) => `
      <tr>
        <td>${escapeHtml(post.title)}</td>
        <td>${escapeHtml(postStatusLabels[post.status] ?? post.status)}</td>
        <td>${escapeHtml(formatDateTime(post.scheduled_at || post.published_at || post.failed_at || post.updated_at))}</td>
        <td>${post.attempt_count}</td>
        <td>${(mediaByPostId.get(post.id) ?? []).length}</td>
        <td>${escapeHtml(post.last_error)}</td>
      </tr>
    `).join("");
    const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(campaign.name)} - گزارش کمپین</title>
  <style>
    body{margin:0;background:#f3f7f8;color:#172332;font-family:Tahoma,Arial,sans-serif;line-height:1.7}
    main{max-width:1080px;margin:0 auto;padding:32px}
    header,.panel{background:#fff;border:1px solid #d8e5e8;border-radius:12px;box-shadow:0 12px 32px rgba(33,61,75,.07)}
    header{padding:24px;border-top:5px solid ${campaign.color || "#0F766E"}}
    h1{margin:0 0 8px;font-size:26px} h2{margin:0 0 12px;font-size:17px}
    .muted{color:#65758a}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:18px 0}.metric{background:#f6fafb;border:1px solid #e1eaed;border-radius:10px;padding:14px}
    .metric b{display:block;font-size:24px;color:#0f766e}.panel{padding:18px;margin-top:16px}
    table{width:100%;border-collapse:collapse;font-size:13px}td,th{border-bottom:1px solid #e5edf0;padding:9px;text-align:right;vertical-align:top}th{background:#f6fafb;color:#526274}
    .dot{display:inline-block;width:8px;height:8px;border-radius:999px;margin-left:8px}
    @media print{body{background:white}main{padding:0}header,.panel{box-shadow:none;break-inside:avoid}}
  </style>
</head>
<body>
  <main>
    <header>
      <p class="muted">گزارش کمپین · ${escapeHtml(formatDateTime(new Date().toISOString()))}</p>
      <h1>${escapeHtml(campaign.name)}</h1>
      <p>${escapeHtml(campaign.goal || campaign.notes || "هدف کمپین تعریف نشده است.")}</p>
      <p class="muted">وضعیت: ${escapeHtml(statusLabels[campaign.status] ?? campaign.status)} · مالک: ${escapeHtml(campaign.owner || "تعریف نشده")} · بازه: ${escapeHtml(formatDateTime(campaign.starts_at))} تا ${escapeHtml(formatDateTime(campaign.ends_at))}</p>
    </header>
    <section class="grid">
      <div class="metric"><span>سلامت</span><b>${selectedRow.stats.health}%</b></div>
      <div class="metric"><span>نرخ تحویل</span><b>${campaignInsights.deliveryRate}%</b></div>
      <div class="metric"><span>پوشش رسانه</span><b>${campaignInsights.mediaCoverage}%</b></div>
      <div class="metric"><span>موفقیت تلاش‌ها</span><b>${campaignInsights.attemptSuccessRate}%</b></div>
    </section>
    <section class="panel"><h2>ترکیب وضعیت</h2><table><thead><tr><th>وضعیت</th><th>تعداد</th><th>سهم</th></tr></thead><tbody>${statusRows}</tbody></table></section>
    <section class="panel"><h2>روند ۱۰ روزه</h2><table><thead><tr><th>روز</th><th>فعالیت</th><th>منتشر</th><th>خطا</th></tr></thead><tbody>${trendRows}</tbody></table></section>
    <section class="panel"><h2>اولویت‌های رسیدگی</h2><table><thead><tr><th>پست</th><th>ریسک</th><th>وضعیت</th><th>جزئیات</th></tr></thead><tbody>${priorityRows}</tbody></table></section>
    <section class="panel"><h2>پست‌های متصل</h2><table><thead><tr><th>پست</th><th>وضعیت</th><th>زمان</th><th>تلاش</th><th>رسانه</th><th>خطا</th></tr></thead><tbody>${postRows}</tbody></table></section>
  </main>
</body>
</html>`;
    downloadTextFile(filename, html, "text/html;charset=utf-8");
    showToast({ title: "گزارش HTML آماده شد", description: "فایل را می‌توانید چاپ یا ارسال کنید.", tone: "success" });
  }

  return (
    <AuthGate>
      <AppShell>
        <WorkspacePage>
          <PublishingWorkspaceHeader
            activeTab="campaigns"
            title="مرکز کمپین‌ها"
            description="سلامت، برنامه انتشار، پست‌ها و دارایی‌های هر کمپین را در یک نمای عملیاتی مدیریت کنید."
            counts={{ campaigns: campaigns.length, content: posts.length, queue: posts.filter(isQueued).length, failed: posts.filter((post) => post.status === "failed").length }}
            meta={(
              <>
                <StatusToken tone="primary">{activeCount} کمپین فعال</StatusToken>
                <StatusToken tone="neutral">{campaigns.length} کل کمپین</StatusToken>
              </>
            )}
            action={(
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" size="sm" disabled={refreshing} onClick={() => loadWorkspace(true)}>
                  <RefreshCw className={`ml-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
                  به‌روزرسانی
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={startNewCampaign}>
                  <Target className="ml-2 h-4 w-4" aria-hidden="true" />
                  کمپین جدید
                </Button>
                <Button href="/compose" size="sm">
                  <Plus className="ml-2 h-4 w-4" aria-hidden="true" />
                  پست جدید
                </Button>
              </div>
            )}
          />

          {error ? <NoticeBanner tone="alert" title="نیاز به بررسی">{error}</NoticeBanner> : null}
          {message ? <NoticeBanner tone="success" title="انجام شد">{message}</NoticeBanner> : null}

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_410px]">
            <WorkspacePanel
              title="پورتفولیوی کمپین"
              description="کمپین‌ها را بر اساس وضعیت، سلامت و حجم محتوای متصل بررسی کنید."
              action={<StatusToken tone="neutral">{campaignRows.length} نتیجه</StatusToken>}
            >
              <DataToolbar
                meta={(
                  <>
                    <StatusToken tone="neutral">{campaigns.length} کمپین</StatusToken>
                    <StatusToken tone="neutral">{posts.filter((post) => post.campaign_id).length} پست متصل</StatusToken>
                  </>
                )}
              >
                <DataSearchField value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جست‌وجوی نام، هدف، مالک یا یادداشت کمپین" />
              </DataToolbar>

              {loading ? <LoadingRows rows={5} /> : null}

              {!loading && campaignRows.length === 0 ? (
                <div className="mt-4">
                  <EmptyState
                    icon={<Target className="h-5 w-5" aria-hidden="true" />}
                    title="هنوز کمپین قابل نمایش وجود ندارد"
                    description="از استودیو تولید محتوا یک کمپین سریع بسازید یا پست‌ها را به کمپین‌های موجود وصل کنید."
                    action={<Button type="button" onClick={startNewCampaign}>ساخت کمپین</Button>}
                  />
                </div>
              ) : null}

              <div className="mt-4 grid gap-3">
                {campaignRows.map((row) => {
                  const selected = selectedRow?.campaign.id === row.campaign.id;
                  return (
                    <button
                      key={row.campaign.id}
                      type="button"
                      onClick={() => editCampaign(row.campaign)}
                      className={`app-row grid gap-3 rounded-lg border p-3 text-right transition hover:bg-blue-50/40 lg:grid-cols-[minmax(0,1fr)_130px_110px] lg:items-center ${
                        selected ? "border-blue-200 bg-blue-50/70 ring-1 ring-blue-100" : "border-app-border bg-white"
                      }`}
                    >
                      <span className="flex min-w-0 items-start gap-3">
                        <span className="mt-1 h-9 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: row.campaign.color }} />
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="truncate text-sm font-black text-app-text">{row.campaign.name}</span>
                            <StatusToken tone={campaignStatusTone(row.campaign.status)}>{statusLabels[row.campaign.status] ?? row.campaign.status}</StatusToken>
                          </span>
                          <span className="mt-1 line-clamp-2 text-xs leading-5 text-app-muted">{row.campaign.goal || row.campaign.notes || "هدف کمپین هنوز تعریف نشده است."}</span>
                        </span>
                      </span>
                      <span className="grid grid-cols-3 gap-2 text-center lg:grid-cols-1 lg:text-right">
                        <span className="text-xs font-bold text-app-muted"><strong className="text-app-text">{row.stats.total}</strong> پست</span>
                        <span className="text-xs font-bold text-app-muted"><strong className="text-emerald-700">{row.stats.published}</strong> منتشر</span>
                        <span className="text-xs font-bold text-app-muted"><strong className={row.stats.failed ? "text-rose-700" : "text-app-text"}>{row.stats.failed}</strong> خطا</span>
                      </span>
                      <span className="min-w-0">
                        <span className="mb-1 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-black text-app-muted">سلامت</span>
                          <span className="text-xs font-black text-app-text">{row.stats.health}%</span>
                        </span>
                        <span className="block h-2 overflow-hidden rounded-full bg-slate-100">
                          <span className="block h-full rounded-full" style={{ width: `${row.stats.health}%`, backgroundColor: row.stats.health >= 76 ? "#059669" : row.stats.health >= 50 ? "#D97706" : "#E11D48" }} />
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </WorkspacePanel>

            <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
              <WorkspacePanel title="جزئیات کمپین" description="سلامت، زمان‌بندی و ریسک‌های کمپین انتخاب‌شده." bodyClassName="p-4">
                {selectedRow ? (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-app-border bg-app-surfaceMuted p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-black text-app-muted">کمپین انتخاب‌شده</p>
                          <h2 className="mt-1 truncate text-lg font-black text-app-text">{selectedRow.campaign.name}</h2>
                        </div>
                        <span className="h-10 w-10 shrink-0 rounded-lg shadow-hairline" style={{ backgroundColor: selectedRow.campaign.color }} />
                      </div>
                      <p className="mt-3 text-sm leading-6 text-app-muted">{selectedRow.campaign.goal || selectedRow.campaign.notes || "هدف و یادداشت کمپین هنوز تکمیل نشده است."}</p>
                    </div>

                    <DetailGrid
                      items={[
                        { label: "سلامت کمپین", value: <StatusToken tone={healthTone}>{selectedRow.stats.health}%</StatusToken>, hint: "بر اساس انتشار، صف، رسانه و خطا" },
                        { label: "وضعیت", value: statusLabels[selectedRow.campaign.status] ?? selectedRow.campaign.status },
                        { label: "مالک", value: selectedRow.campaign.owner || "تعریف نشده" },
                        { label: "بازه", value: `${formatDateTime(selectedRow.campaign.starts_at)} تا ${formatDateTime(selectedRow.campaign.ends_at)}` }
                      ]}
                    />

                    <div className="grid gap-2 sm:grid-cols-3">
                      <div className="rounded-md bg-emerald-50 p-3 text-emerald-800 shadow-hairline">
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        <p className="mt-2 text-lg font-black">{selectedRow.stats.published}</p>
                        <p className="text-[11px] font-bold">منتشرشده</p>
                      </div>
                      <div className="rounded-md bg-blue-50 p-3 text-blue-800 shadow-hairline">
                        <TimerReset className="h-4 w-4" aria-hidden="true" />
                        <p className="mt-2 text-lg font-black">{queuedCount}</p>
                        <p className="text-[11px] font-bold">در جریان</p>
                      </div>
                      <div className="rounded-md bg-rose-50 p-3 text-rose-800 shadow-hairline">
                        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                        <p className="mt-2 text-lg font-black">{failedCount}</p>
                        <p className="text-[11px] font-bold">نیازمند توجه</p>
                      </div>
                    </div>

                    <div className="rounded-md border border-app-border bg-white p-3 shadow-hairline">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-xs font-black text-app-text">قیف عملکرد کمپین</p>
                        <StatusToken tone="neutral">{selectedRow.stats.total} پست</StatusToken>
                      </div>
                      {[
                        { label: "پوشش رسانه", value: selectedRow.stats.media, total: selectedRow.stats.total, color: "#2563EB" },
                        { label: "در جریان انتشار", value: queuedCount, total: selectedRow.stats.total, color: "#0F766E" },
                        { label: "انتشار موفق", value: selectedRow.stats.published, total: selectedRow.stats.total, color: "#059669" },
                        { label: "ریسک خطا", value: failedCount, total: selectedRow.stats.total, color: "#E11D48" }
                      ].map((item) => {
                        const ratio = percent(item.value, item.total);
                        return (
                          <div key={item.label} className="py-2">
                            <div className="mb-1 flex items-center justify-between gap-2 text-[11px] font-black">
                              <span className="text-app-muted">{item.label}</span>
                              <span className="text-app-text">{ratio}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full" style={{ width: `${ratio}%`, backgroundColor: item.color }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <Timeline
                      items={[
                        {
                          title: "تعریف کمپین",
                          description: selectedRow.campaign.goal || "کمپین ساخته شده اما هدف آن هنوز کامل نیست.",
                          meta: formatDateTime(selectedRow.campaign.created_at),
                          tone: "primary"
                        },
                        {
                          title: "برنامه محتوا",
                          description: selectedRow.stats.scheduled ? `${selectedRow.stats.scheduled} پست زمان‌بندی شده است.` : "هنوز پست زمان‌بندی‌شده‌ای برای این کمپین دیده نمی‌شود.",
                          meta: selectedRow.campaign.starts_at ? `شروع: ${formatDateTime(selectedRow.campaign.starts_at)}` : undefined,
                          tone: selectedRow.stats.scheduled ? "warning" : "neutral"
                        },
                        {
                          title: failedCount ? "ریسک فعال" : "وضعیت پایدار",
                          description: failedCount ? `${failedCount} پست یا تلاش نیازمند بازیابی است.` : "خطای فعالی برای این کمپین دیده نمی‌شود.",
                          meta: selectedRow.campaign.ends_at ? `پایان: ${formatDateTime(selectedRow.campaign.ends_at)}` : undefined,
                          tone: failedCount ? "alert" : "success"
                        }
                      ]}
                    />
                  </div>
                ) : (
                  <EmptyState title="کمپینی انتخاب نشده است" description="از لیست کمپین‌ها یک مورد را انتخاب کنید." />
                )}
              </WorkspacePanel>

              <WorkspacePanel
                title={editorMode === "create" ? "ساخت کمپین" : "ویرایش کمپین"}
                description={editorMode === "create" ? "کمپین جدید را با هدف، رنگ و مالک مشخص بسازید." : "مشخصات عملیاتی کمپین انتخاب‌شده را به‌روزرسانی کنید."}
                bodyClassName="p-4"
                className="scroll-mt-24"
                action={editorMode === "create" ? <StatusToken tone="primary">جدید</StatusToken> : selectedRow ? <StatusToken tone={campaignStatusTone(selectedRow.campaign.status)}>{statusLabels[selectedRow.campaign.status] ?? selectedRow.campaign.status}</StatusToken> : null}
              >
                <form id="campaign-editor" onSubmit={saveCampaign} className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_86px]">
                    <Field label="نام کمپین" required>
                      <Input id="campaign-name-input" value={campaignForm.name} onChange={(event) => updateCampaignField("name", event.target.value)} placeholder="مثلاً لانچ تابستان" required />
                    </Field>
                    <Field label="رنگ">
                      <Input
                        value={campaignColorDraft}
                        onInput={(event) => setCampaignColorDraft(event.currentTarget.value)}
                        onChange={(event) => setCampaignColorDraft(event.target.value)}
                        onBlur={(event) => commitCampaignColor(event.currentTarget.value)}
                        type="color"
                        className="h-[42px] p-1"
                        aria-label="رنگ کمپین"
                      />
                    </Field>
                  </div>

                  <Field label="هدف کمپین" hint="یک جمله واضح برای خروجی و سنجش کمپین.">
                    <Textarea value={campaignForm.goal} onChange={(event) => updateCampaignField("goal", event.target.value)} className="min-h-20" placeholder="افزایش فروش محصول، معرفی مجموعه جدید یا اطلاع‌رسانی رویداد..." />
                  </Field>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="وضعیت">
                      <Select value={campaignForm.status} onChange={(event) => updateCampaignField("status", event.target.value as CampaignStatus)}>
                        {campaignStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </Select>
                    </Field>
                    <Field label="مالک">
                      <Input value={campaignForm.owner} onChange={(event) => updateCampaignField("owner", event.target.value)} placeholder="نام مسئول کمپین" />
                    </Field>
                  </div>

                  <div className="grid gap-3">
                    <CampaignJalaliDateField
                      label="شروع کمپین"
                      value={campaignForm.starts_at}
                      open={openCampaignCalendar === "starts_at"}
                      onOpenChange={(nextOpen) => setOpenCampaignCalendar(nextOpen ? "starts_at" : null)}
                      onChange={(value) => updateCampaignField("starts_at", value)}
                    />
                    <CampaignJalaliDateField
                      label="پایان کمپین"
                      value={campaignForm.ends_at}
                      open={openCampaignCalendar === "ends_at"}
                      onOpenChange={(nextOpen) => setOpenCampaignCalendar(nextOpen ? "ends_at" : null)}
                      onChange={(value) => updateCampaignField("ends_at", value)}
                    />
                  </div>

                  <Field label="یادداشت">
                    <Textarea value={campaignForm.notes} onChange={(event) => updateCampaignField("notes", event.target.value)} className="min-h-24" placeholder="بودجه، فرضیه، نکته اجرایی یا تصمیم‌های تیم..." />
                  </Field>

                  <div className="flex flex-wrap gap-2 border-t border-app-border pt-3">
                    <Button type="submit" disabled={savingCampaign}>
                      {savingCampaign ? "در حال ذخیره" : editorMode === "create" ? "ساخت کمپین" : "ذخیره تغییرات"}
                    </Button>
                    {editorMode === "create" && selectedRow ? (
                      <Button type="button" variant="ghost" onClick={() => editCampaign(selectedRow.campaign)} disabled={savingCampaign}>لغو</Button>
                    ) : (
                      <Button type="button" variant="ghost" onClick={startNewCampaign} disabled={savingCampaign}>کمپین جدید</Button>
                    )}
                  </div>
                </form>
              </WorkspacePanel>
            </aside>
          </section>

          {selectedRow ? (
            <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
              <WorkspacePanel
                title="تحلیل کمپین"
                description="خلاصه عملکرد، پوشش رسانه، روند فعالیت و ریسک‌های عملیاتی کمپین انتخاب‌شده."
                action={(
                  <div className="flex flex-wrap gap-2">
                    <StatusToken tone={campaignInsights.recentFailed ? "alert" : "success"}>{campaignInsights.recentPublished} انتشار در ۷ روز</StatusToken>
                    <Button type="button" variant="secondary" size="sm" onClick={exportCampaignCsv}>
                      <Download className="ml-2 h-4 w-4" aria-hidden="true" />
                      CSV
                    </Button>
                    <Button type="button" variant="secondary" size="sm" onClick={exportCampaignHtml}>
                      <Printer className="ml-2 h-4 w-4" aria-hidden="true" />
                      گزارش
                    </Button>
                  </div>
                )}
                bodyClassName="p-4"
                className="xl:col-span-2"
              >
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="app-row bg-white p-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-app-muted">نرخ تحویل کمپین</p>
                        <p className="mt-2 text-2xl font-black text-emerald-700">{campaignInsights.deliveryRate}%</p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                    </div>
                    <p className="mt-3 text-xs leading-5 text-app-muted">{campaignInsights.published} منتشر، {campaignInsights.failed} نیازمند بررسی</p>
                  </div>
                  <div className="app-row bg-white p-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-app-muted">پوشش رسانه</p>
                        <p className="mt-2 text-2xl font-black text-sky-700">{campaignInsights.mediaCoverage}%</p>
                      </div>
                      <FileImage className="h-5 w-5 text-sky-600" aria-hidden="true" />
                    </div>
                    <p className="mt-3 text-xs leading-5 text-app-muted">{campaignInsights.withMedia} پست دارای رسانه از {selectedPosts.length} پست</p>
                  </div>
                  <div className="app-row bg-white p-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-app-muted">موفقیت تلاش‌ها</p>
                        <p className="mt-2 text-2xl font-black text-app-primary">{campaignInsights.attemptSuccessRate}%</p>
                      </div>
                      <Zap className="h-5 w-5 text-app-primary" aria-hidden="true" />
                    </div>
                    <p className="mt-3 text-xs leading-5 text-app-muted">{selectedAttempts.length} تلاش ثبت‌شده، {campaignInsights.failedAttempts} شکست</p>
                  </div>
                  <div className="app-row bg-white p-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-app-muted">ریسک هفته</p>
                        <p className={`mt-2 text-2xl font-black ${campaignInsights.recentFailed ? "text-rose-700" : "text-emerald-700"}`}>{campaignInsights.recentFailed}</p>
                      </div>
                      <AlertTriangle className={`h-5 w-5 ${campaignInsights.recentFailed ? "text-rose-600" : "text-emerald-600"}`} aria-hidden="true" />
                    </div>
                    <p className="mt-3 text-xs leading-5 text-app-muted">خطاهای جدید یا پست‌های دارای آخرین خطا در ۷ روز اخیر</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                  <div className="rounded-lg border border-app-border bg-white p-4 shadow-hairline">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="flex items-center gap-2 text-sm font-black text-app-text">
                          <BarChart3 className="h-4 w-4 text-app-primary" aria-hidden="true" />
                          روند فعالیت ۱۰ روزه
                        </p>
                        <p className="mt-1 text-xs leading-5 text-app-muted">بر اساس انتشار، زمان‌بندی، خطا و آخرین تغییر پست‌های همین کمپین.</p>
                      </div>
                      <StatusToken tone="neutral">{campaignInsights.queued} در جریان</StatusToken>
                    </div>
                    <div className="mt-5 flex h-44 items-end gap-2 border-b border-app-border px-1 pb-2">
                      {campaignInsights.trend.map((point) => {
                        const height = Math.max(10, Math.round((point.activity / campaignInsights.maxActivity) * 100));
                        return (
                          <div key={point.key} className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
                            <div className="flex h-32 w-full items-end justify-center">
                              <div
                                className={`relative w-full max-w-8 rounded-t-md transition group-hover:opacity-85 ${point.failed ? "bg-rose-500" : point.published ? "bg-emerald-500" : point.activity ? "bg-app-primary" : "bg-slate-200"}`}
                                style={{ height: `${height}%` }}
                              >
                                <span className="absolute -top-2 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full border border-white bg-current shadow-sm" />
                              </div>
                            </div>
                            <span className="truncate text-[10px] font-bold text-app-muted">{point.label}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-[11px] font-bold text-app-muted">
                      <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> انتشار</span>
                      <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-app-primary" /> فعالیت</span>
                      <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> خطا</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-lg border border-app-border bg-white p-4 shadow-hairline">
                      <p className="flex items-center gap-2 text-sm font-black text-app-text">
                        <PieChart className="h-4 w-4 text-app-primary" aria-hidden="true" />
                        ترکیب وضعیت
                      </p>
                      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                        <div className="flex h-full">
                          {campaignInsights.statusMix.map((item) => (
                            <span key={item.label} style={{ width: `${percent(item.value, selectedPosts.length)}%`, backgroundColor: item.color }} />
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {campaignInsights.statusMix.map((item) => (
                          <div key={item.label} className="rounded-md bg-app-surfaceMuted p-2">
                            <p className="flex items-center gap-1.5 text-[11px] font-black text-app-muted">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                              {item.label}
                            </p>
                            <p className="mt-1 text-sm font-black text-app-text">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg border border-app-border bg-white p-4 shadow-hairline">
                      <p className="flex items-center gap-2 text-sm font-black text-app-text">
                        <TrendingUp className="h-4 w-4 text-app-primary" aria-hidden="true" />
                        اولویت‌های رسیدگی
                      </p>
                      {campaignInsights.riskPosts.length === 0 ? (
                        <p className="mt-3 rounded-md bg-emerald-50 p-3 text-xs font-bold leading-5 text-emerald-800">ریسک فعالی برای پست‌های این کمپین دیده نمی‌شود.</p>
                      ) : (
                        <div className="mt-3 space-y-2">
                          {campaignInsights.riskPosts.map(({ post, score }) => (
                            <Link key={post.id} href={`/compose?postId=${post.id}`} className="app-row flex items-center justify-between gap-3 rounded-md border border-app-border bg-app-surfaceMuted p-2 hover:bg-blue-50/60">
                              <span className="min-w-0">
                                <span className="block truncate text-xs font-black text-app-text">{post.title}</span>
                                <span className="mt-1 block truncate text-[11px] text-app-muted">{post.last_error || `${post.attempt_count} تلاش ثبت‌شده`}</span>
                              </span>
                              <StatusToken tone={score >= 60 ? "alert" : "warning"}>{score}%</StatusToken>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </WorkspacePanel>

              <WorkspacePanel
                title="پست‌های متصل"
                description="محتوای مرتبط با کمپین انتخاب‌شده و آخرین وضعیت عملیاتی هر پست."
                action={<StatusToken tone="neutral">{selectedPosts.length} پست</StatusToken>}
                bodyClassName="p-3"
              >
                <div className="rounded-lg border border-app-border bg-app-surfaceMuted p-3 shadow-hairline">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-app-text">اتصال سریع پست‌ها</p>
                      <p className="mt-1 text-xs leading-5 text-app-muted">پست‌های بدون این کمپین را انتخاب کنید و گروهی به کمپین فعلی وصل کنید.</p>
                    </div>
                    <StatusToken tone={selectedAssignIds.size ? "primary" : "neutral"}>{selectedAssignIds.size} انتخاب</StatusToken>
                  </div>
                  <div className="mt-3 grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
                    <DataSearchField value={assignmentSearch} onChange={(event) => setAssignmentSearch(event.target.value)} placeholder="جست‌وجوی پست برای اتصال" />
                    <Button type="button" variant="secondary" size="sm" onClick={toggleAllAssignable} disabled={assignablePosts.length === 0 || assigningPosts}>
                      <CheckSquare2 className="ml-2 h-4 w-4" aria-hidden="true" />
                      انتخاب همه
                    </Button>
                    <Button type="button" size="sm" onClick={assignSelectedPosts} disabled={selectedAssignIds.size === 0 || assigningPosts}>
                      {assigningPosts ? "در حال اتصال" : "اتصال به کمپین"}
                    </Button>
                  </div>
                  <div className="mt-3 max-h-72 overflow-y-auto rounded-md border border-app-border bg-white">
                    {assignablePosts.length === 0 ? (
                      <div className="p-4">
                        <EmptyState title="پست قابل اتصال پیدا نشد" description="همه پست‌های موجود به این کمپین وصل شده‌اند یا نتیجه‌ای برای جست‌وجو وجود ندارد." />
                      </div>
                    ) : (
                      <div className="divide-y divide-app-border">
                        {assignablePosts.map((post) => {
                          const checked = selectedAssignIds.has(post.id);
                          const previewUrl = previewUrlForPost(post);
                          return (
                            <button
                              key={post.id}
                              type="button"
                              onClick={() => toggleAssignPost(post.id)}
                              className={`app-row flex w-full items-center gap-3 p-3 text-right transition ${checked ? "bg-blue-50/70" : "bg-white hover:bg-slate-50"}`}
                            >
                              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-white ${checked ? "border-app-primary bg-app-primary" : "border-app-border bg-white"}`}>
                                {checked ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                              </span>
                              <span className="flex h-12 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-50 ring-1 ring-app-border">
                                {previewUrl ? <img src={previewUrl} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-black text-app-text">{post.title}</span>
                                <span className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-bold text-app-muted">
                                  <StatusBadge status={post.status} />
                                  <span>{campaignLabelForPost(post, campaigns)}</span>
                                </span>
                              </span>
                              <span className="hidden text-[11px] font-bold text-app-muted sm:block">{formatDateTime(post.scheduled_at || post.published_at || post.updated_at)}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <DataTable
                  columns={["پست", "وضعیت", "زمان", "اقدام"]}
                  gridClassName="lg:grid-cols-[minmax(0,1fr)_120px_160px_150px]"
                  empty={selectedPosts.length === 0 ? <EmptyState title="هنوز پستی به این کمپین وصل نیست" description="در استودیو تولید محتوا، پست را به این کمپین متصل کنید." /> : null}
                >
                  {selectedPosts.map((post) => {
                    const previewUrl = previewUrlForPost(post);
                    return (
                      <DataRow key={post.id} gridClassName="lg:grid-cols-[minmax(0,1fr)_120px_160px_150px]">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-14 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-50 ring-1 ring-app-border">
                            {previewUrl ? <img src={previewUrl} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-app-text">{post.title}</p>
                            <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-app-muted">
                              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: campaignColorForPost(post, campaigns) }} />
                              {campaignLabelForPost(post, campaigns)}
                            </p>
                          </div>
                        </div>
                        <div><StatusBadge status={post.status} /></div>
                        <div className="text-xs leading-6 text-app-muted">
                          <p>{formatDateTime(post.scheduled_at || post.published_at || post.updated_at)}</p>
                          <p>{post.attempt_count} تلاش</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button href={`/compose?postId=${post.id}`} variant="secondary" size="sm">باز کردن</Button>
                          <Button type="button" variant="ghost" size="sm" disabled={assigningPosts} onClick={() => removePostFromCampaign(post)}>
                            <XCircle className="ml-1.5 h-4 w-4" aria-hidden="true" />
                            جدا کردن
                          </Button>
                        </div>
                      </DataRow>
                    );
                  })}
                </DataTable>
              </WorkspacePanel>

              <WorkspacePanel
                title="دارایی‌های متصل"
                description="رسانه‌هایی که در پست‌های این کمپین استفاده شده‌اند."
                action={(
                  <div className="flex flex-wrap gap-2">
                    <StatusToken tone="neutral">{selectedAssets.length} فایل</StatusToken>
                    <Button href={`/media?campaignId=${selectedRow.campaign.id}`} variant="secondary" size="sm">نمای رسانه‌ها</Button>
                  </div>
                )}
                bodyClassName="p-3"
              >
                {selectedAssets.length === 0 ? (
                  <EmptyState icon={<FileImage className="h-5 w-5" aria-hidden="true" />} title="دارایی رسانه‌ای متصل نیست" description="برای حرفه‌ای‌تر شدن کمپین، رسانه‌های مرتبط را به پست‌ها وصل کنید." action={<Button href={`/media?campaignId=${selectedRow.campaign.id}`} variant="secondary">رفتن به رسانه‌ها</Button>} />
                ) : (
                  <div className="grid gap-2">
                    {selectedAssets.slice(0, 8).map((asset) => (
                      <Link key={asset.id} href={`/media?campaignId=${selectedRow.campaign.id}`} className="app-row flex items-center gap-3 rounded-md border border-app-border bg-white p-2 hover:bg-blue-50/50">
                        <div className="flex h-14 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-50 ring-1 ring-app-border">
                          {mediaPreviewUrls[asset.id] ? <img src={mediaPreviewUrls[asset.id]} alt={asset.original_filename} className="h-full w-full object-cover" /> : <FileImage className="h-4 w-4 text-slate-400" aria-hidden="true" />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-black text-app-text">{asset.original_filename}</p>
                          <p className="mt-1 text-[11px] text-app-muted">{formatBytes(asset.size_bytes)} · {asset.folder || "بدون پوشه"}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </WorkspacePanel>
            </section>
          ) : null}
        </WorkspacePage>
      </AppShell>
    </AuthGate>
  );
}
