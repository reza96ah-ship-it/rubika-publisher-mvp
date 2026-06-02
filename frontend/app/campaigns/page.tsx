"use client";

import { AlertTriangle, CheckCircle2, FileImage, ImageIcon, Plus, RefreshCw, Target, TimerReset } from "lucide-react";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
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
import { campaignColorForPost, campaignLabelForPost, createCampaign, loadCampaigns, updateCampaign, type Campaign, type CampaignStatus } from "../../lib/campaigns";
import { apiUrl, authHeaders, formatDateTime, fromDatetimeLocalValue, toDatetimeLocalValue, type Post } from "../../lib/posts";

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
  starts_at: string;
  ends_at: string;
  notes: string;
};

type EditorMode = "edit" | "create";

const statusLabels: Record<string, string> = {
  active: "فعال",
  paused: "متوقف",
  completed: "تکمیل‌شده",
  archived: "آرشیوشده"
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
  starts_at: "",
  ends_at: "",
  notes: ""
};

function campaignToForm(campaign: Campaign): CampaignForm {
  return {
    name: campaign.name,
    goal: campaign.goal,
    status: campaignStatusOptions.some((option) => option.value === campaign.status) ? campaign.status as CampaignStatus : "active",
    color: campaign.color || "#0F766E",
    owner: campaign.owner,
    starts_at: toDatetimeLocalValue(campaign.starts_at),
    ends_at: toDatetimeLocalValue(campaign.ends_at),
    notes: campaign.notes
  };
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

export default function CampaignsPage() {
  const { showToast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<Record<number, string>>({});
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>("edit");
  const [campaignForm, setCampaignForm] = useState<CampaignForm>(emptyCampaignForm);
  const [savingCampaign, setSavingCampaign] = useState(false);
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
      const [campaignResponse, postsResponse, mediaResponse] = await Promise.all([
        loadCampaigns(),
        fetch(`${apiUrl}/posts`, { headers }),
        fetch(`${apiUrl}/media`, { headers })
      ]);
      if (!postsResponse.ok) throw new Error("دریافت پست‌ها برای کمپین ناموفق بود");
      const nextPosts = await postsResponse.json() as Post[];
      const nextMedia = mediaResponse.ok ? await mediaResponse.json() as MediaAsset[] : [];
      setCampaigns(campaignResponse);
      setPosts(nextPosts);
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

  const selectedPosts = useMemo(() => {
    return [...(selectedRow?.posts ?? [])].sort((first, second) => postActivityTime(second) - postActivityTime(first));
  }, [selectedRow]);

  const selectedAssets = useMemo(() => {
    const ids = new Set(selectedPosts.map((post) => post.id));
    return mediaAssets.filter((asset) => asset.post_id && ids.has(asset.post_id));
  }, [mediaAssets, selectedPosts]);

  const activeCount = campaigns.filter((campaign) => campaign.status === "active").length;
  const failedCount = selectedRow?.stats.failed ?? 0;
  const queuedCount = selectedRow ? selectedRow.stats.ready + selectedRow.stats.scheduled + selectedRow.stats.publishing : 0;
  const healthTone: "success" | "warning" | "alert" = (selectedRow?.stats.health ?? 0) >= 76 ? "success" : (selectedRow?.stats.health ?? 0) >= 50 ? "warning" : "alert";

  function previewUrlForPost(post: Post) {
    const asset = (mediaByPostId.get(post.id) ?? [])[0];
    return asset ? mediaPreviewUrls[asset.id] ?? "" : "";
  }

  function updateCampaignField<K extends keyof CampaignForm>(field: K, value: CampaignForm[K]) {
    setCampaignForm((current) => ({ ...current, [field]: value }));
    if (message) setMessage("");
  }

  function startNewCampaign() {
    setEditorMode("create");
    setCampaignForm(emptyCampaignForm);
    setSelectedCampaignId(null);
    setMessage("");
    setError("");
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
        starts_at: campaignForm.starts_at ? fromDatetimeLocalValue(campaignForm.starts_at) : null,
        ends_at: campaignForm.ends_at ? fromDatetimeLocalValue(campaignForm.ends_at) : null,
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
                action={editorMode === "create" ? <StatusToken tone="primary">جدید</StatusToken> : selectedRow ? <StatusToken tone={campaignStatusTone(selectedRow.campaign.status)}>{statusLabels[selectedRow.campaign.status] ?? selectedRow.campaign.status}</StatusToken> : null}
              >
                <form onSubmit={saveCampaign} className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_86px]">
                    <Field label="نام کمپین" required>
                      <Input value={campaignForm.name} onChange={(event) => updateCampaignField("name", event.target.value)} placeholder="مثلاً لانچ تابستان" required />
                    </Field>
                    <Field label="رنگ">
                      <Input value={campaignForm.color} onChange={(event) => updateCampaignField("color", event.target.value)} type="color" className="h-[42px] p-1" aria-label="رنگ کمپین" />
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

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="شروع">
                      <Input value={campaignForm.starts_at} onChange={(event) => updateCampaignField("starts_at", event.target.value)} type="datetime-local" />
                    </Field>
                    <Field label="پایان">
                      <Input value={campaignForm.ends_at} onChange={(event) => updateCampaignField("ends_at", event.target.value)} type="datetime-local" />
                    </Field>
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
                title="پست‌های متصل"
                description="محتوای مرتبط با کمپین انتخاب‌شده و آخرین وضعیت عملیاتی هر پست."
                action={<StatusToken tone="neutral">{selectedPosts.length} پست</StatusToken>}
                bodyClassName="p-3"
              >
                <DataTable
                  columns={["پست", "وضعیت", "زمان", "اقدام"]}
                  gridClassName="lg:grid-cols-[minmax(0,1fr)_120px_160px_100px]"
                  empty={selectedPosts.length === 0 ? <EmptyState title="هنوز پستی به این کمپین وصل نیست" description="در استودیو تولید محتوا، پست را به این کمپین متصل کنید." /> : null}
                >
                  {selectedPosts.map((post) => {
                    const previewUrl = previewUrlForPost(post);
                    return (
                      <DataRow key={post.id} gridClassName="lg:grid-cols-[minmax(0,1fr)_120px_160px_100px]">
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
                        <Button href={`/compose?postId=${post.id}`} variant="secondary" size="sm">باز کردن</Button>
                      </DataRow>
                    );
                  })}
                </DataTable>
              </WorkspacePanel>

              <WorkspacePanel
                title="دارایی‌های متصل"
                description="رسانه‌هایی که در پست‌های این کمپین استفاده شده‌اند."
                action={<StatusToken tone="neutral">{selectedAssets.length} فایل</StatusToken>}
                bodyClassName="p-3"
              >
                {selectedAssets.length === 0 ? (
                  <EmptyState icon={<FileImage className="h-5 w-5" aria-hidden="true" />} title="دارایی رسانه‌ای متصل نیست" description="برای حرفه‌ای‌تر شدن کمپین، رسانه‌های مرتبط را به پست‌ها وصل کنید." action={<Button href="/media" variant="secondary">رفتن به رسانه‌ها</Button>} />
                ) : (
                  <div className="grid gap-2">
                    {selectedAssets.slice(0, 8).map((asset) => (
                      <Link key={asset.id} href="/media" className="app-row flex items-center gap-3 rounded-md border border-app-border bg-white p-2 hover:bg-blue-50/50">
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
