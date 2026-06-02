"use client";

import { FormEvent, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarClock, ChevronDown, Cloud, Eye, FileText, ImagePlus, Images, Plus, Send, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { AuthGate } from "../../components/auth-gate";
import { AppShell } from "../../components/app-shell";
import { ApprovalBadge } from "../../components/approval-badge";
import { ComposerActionFooter } from "../../components/composer-action-footer";
import { ComposerReadinessChecks } from "../../components/composer-readiness-checks";
import { RubikaPostPreview } from "../../components/rubika-post-preview";
import { MediaGalleryPicker } from "../../components/media-gallery-picker";
import { ComposerSchedulePanel } from "../../components/composer-schedule-panel";
import { ComposerStepRail, type ComposerStep } from "../../components/composer-step-rail";
import { ComposerStartPanel } from "../../components/composer-start-panel";
import { StatusBadge } from "../../components/status-badge";
import { useToast } from "../../components/toast-provider";
import { Button } from "../../components/ui/button";
import { Field, Input, Select, Textarea } from "../../components/ui/form";
import { Tag } from "../../components/ui/tag";
import { NoticeBanner, StatusToken, WorkspacePage, WorkspacePanel } from "../../components/workspace-ui";
import { createCampaign, loadCampaigns, type Campaign } from "../../lib/campaigns";
import { approvalBlocksPublishing, approvalConfig } from "../../lib/posts";
import { isRubikaConnected, loadWorkspaceOverview, type RubikaSettings, type StoreProfile } from "../../lib/workspace";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const scheduleTimezone = "Asia/Tehran";
const localDraftKey = "rubika_publisher_compose_draft";

type MediaAsset = {
  id: number;
  post_id: number | null;
  original_filename: string;
  content_type: string;
  size_bytes: number;
  folder: string;
  tags: string;
};

type SaveAction = "draft" | "ready" | "schedule";
type AutosaveState = "idle" | "dirty" | "saved" | "restored";
type StudioPanel = "preview" | "schedule" | "review";

type Post = {
  id: number;
  title: string;
  caption: string;
  hashtags: string;
  platform: string;
  status: string;
  timezone: string;
  campaign_id: number | null;
  campaign: string;
  internal_note: string;
  scheduled_at: string | null;
  approval_status: string;
  approval_note: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string;
};

const emptyForm = {
  title: "",
  caption: "",
  hashtags: "",
  platform: "rubika",
  timezone: scheduleTimezone,
  campaign_id: null as number | null,
  campaign: "",
  internal_note: "",
  scheduled_at: null as string | null
};

function ComposePageContent() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const editingPostId = searchParams.get("postId");
  const presetScheduledAt = searchParams.get("scheduledAt");
  const isEditing = Boolean(editingPostId);

  const [store, setStore] = useState<StoreProfile | null>(null);
  const [rubika, setRubika] = useState<RubikaSettings | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<Record<number, string>>({});
  const [form, setForm] = useState(emptyForm);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [selectedMediaId, setSelectedMediaId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePreviewUrl, setSelectedFilePreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);
  const [savingAction, setSavingAction] = useState<SaveAction | null>(null);
  const [composerReady, setComposerReady] = useState(false);
  const [autosaveState, setAutosaveState] = useState<AutosaveState>("idle");
  const [autosaveAt, setAutosaveAt] = useState("");
  const [studioPanel, setStudioPanel] = useState<StudioPanel>("preview");
  const [showComposerEntry, setShowComposerEntry] = useState(true);
  const [quickCampaignName, setQuickCampaignName] = useState("");
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const selectedMedia = useMemo(() => {
    if (!selectedMediaId) return null;
    return mediaAssets.find((asset) => String(asset.id) === selectedMediaId) ?? null;
  }, [mediaAssets, selectedMediaId]);

  const previewImageUrl = selectedFilePreviewUrl || (selectedMedia ? mediaPreviewUrls[selectedMedia.id] : "");
  const readyMediaPreviewUrls = useMemo(() => {
    return mediaAssets
      .map((asset) => mediaPreviewUrls[asset.id])
      .filter(Boolean)
      .slice(0, 3);
  }, [mediaAssets, mediaPreviewUrls]);
  const brandAvatarUrl = store?.avatar_asset_id ? mediaPreviewUrls[store.avatar_asset_id] : store?.logo_asset_id ? mediaPreviewUrls[store.logo_asset_id] : "";
  const selectedCampaign = useMemo(() => {
    if (form.campaign_id === null) return null;
    return campaigns.find((campaign) => campaign.id === form.campaign_id) ?? null;
  }, [campaigns, form.campaign_id]);

  const finalPreview = useMemo(() => {
    const hasVisiblePostContent = Boolean(form.caption.trim() || previewImageUrl);
    return [form.caption, hasVisiblePostContent ? store?.default_cta : "", hasVisiblePostContent ? store?.caption_footer : "", form.hashtags]
      .filter(Boolean)
      .join("\n\n");
  }, [form.caption, form.hashtags, previewImageUrl, store?.caption_footer, store?.default_cta]);

  const captionLength = form.caption.length;
  const hashtagCount = form.hashtags.split(/\s+/).filter((item) => item.startsWith("#")).length;
  const timezone = scheduleTimezone;
  const hasSchedule = Boolean(form.scheduled_at);
  const hasTitle = Boolean(form.title.trim());
  const hasPostBody = Boolean(form.caption.trim() || previewImageUrl);
  const hasLocalDraftContent = Boolean(form.title.trim() || form.caption.trim() || form.hashtags.trim() || form.campaign_id || form.campaign.trim() || form.internal_note.trim() || form.scheduled_at || selectedMediaId);
  const rubikaReady = isRubikaConnected(rubika);
  const canMoveToReady = !editingPost || ["draft", "failed", "cancelled"].includes(editingPost.status);
  const reviewBlocksSchedule = editingPost ? approvalBlocksPublishing(editingPost) : false;
  const canSaveDraft = hasTitle;
  const canMarkReady = hasTitle && hasPostBody && canMoveToReady;
  const canSchedule = canMarkReady && hasSchedule && rubikaReady && !reviewBlocksSchedule;
  const readinessItems = [
    {
      label: "عنوان داخلی",
      detail: hasTitle ? "عنوان برای مدیریت محتوا ثبت شده است." : "برای ذخیره پست، عنوان داخلی لازم است.",
      done: hasTitle,
      required: true
    },
    {
      label: "متن یا رسانه",
      detail: hasPostBody ? "پست محتوای قابل انتشار دارد." : "حداقل کپشن یا تصویر برای آماده‌سازی پیشنهاد می‌شود.",
      done: hasPostBody,
      required: true
    },
    {
      label: "اتصال روبیکا",
      detail: rubikaReady ? "اتصال روبیکا تست شده و آماده انتشار است." : "برای زمان‌بندی نهایی، اتصال روبیکا را تست کنید.",
      done: rubikaReady,
      required: true
    },
    {
      label: "زمان انتشار",
      detail: hasSchedule ? "پست می‌تواند وارد صف زمان‌بندی شود." : "بدون زمان انتشار، پست به عنوان پیش‌نویس یا آماده ذخیره می‌شود.",
      done: hasSchedule
    },
    {
      label: "کیت برند",
      detail: store?.brand_voice || store?.default_cta ? "لحن یا CTA برند برای خروجی آماده است." : "در تنظیمات فروشگاه، لحن و CTA برند را کامل کنید.",
      done: Boolean(store?.brand_voice || store?.default_cta)
    }
  ];
  const readinessDoneCount = readinessItems.filter((item) => item.done).length;
  const readinessScore = Math.round((readinessDoneCount / readinessItems.length) * 100);
  const publishTone = canSchedule ? "success" : canMarkReady ? "primary" : "warning";
  const publishStateLabel = canSchedule ? "آماده زمان‌بندی" : canMarkReady ? "آماده بازبینی" : "در حال تولید";
  const autosaveLabel = autosaveState === "dirty"
    ? "در حال ذخیره محلی..."
    : autosaveAt
      ? `ذخیره خودکار ${new Date(autosaveAt).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}`
      : "ذخیره خودکار فعال";
  const composerSteps: ComposerStep[] = [
    {
      label: "محتوا",
      helper: hasTitle && hasPostBody ? "عنوان و محتوای اصلی آماده است." : "عنوان داخلی و کپشن یا رسانه را کامل کنید.",
      icon: FileText,
      state: hasTitle && hasPostBody ? "done" : "active"
    },
    {
      label: "رسانه",
      helper: previewImageUrl ? "تصویر خروجی انتخاب شده است." : "رسانه اختیاری است؛ برای پست تصویری انتخاب کنید.",
      icon: Images,
      state: previewImageUrl ? "done" : hasPostBody ? "active" : "pending"
    },
    {
      label: "زمان انتشار",
      helper: hasSchedule ? "تاریخ و ساعت ورود به صف مشخص است." : "برای انتشار خودکار، تاریخ و ساعت را انتخاب کنید.",
      icon: CalendarClock,
      state: hasSchedule ? "done" : canMarkReady ? "active" : "pending"
    },
    {
      label: "بازبینی نهایی",
      helper: reviewBlocksSchedule ? "این پست قبل از زمان‌بندی باید تایید شود." : canSchedule ? "پست آماده ورود به صف انتشار است." : "پیش‌نمایش و الزام‌های انتشار را بررسی کنید.",
      icon: ShieldCheck,
      state: canSchedule ? "done" : canMarkReady ? "active" : "pending"
    }
  ];
  const studioPanels: Array<{ label: string; value: StudioPanel; icon: typeof Eye; ready?: boolean }> = [
    { label: "پیش‌نمایش", value: "preview", icon: Eye, ready: hasPostBody },
    { label: "زمان انتشار", value: "schedule", icon: CalendarClock, ready: hasSchedule },
    { label: "بازبینی", value: "review", icon: ShieldCheck, ready: canSchedule }
  ];

  function token() {
    return window.localStorage.getItem("rubika_publisher_access") ?? "";
  }

  const loadData = useCallback(async () => {
    setLoading(true);
    setComposerReady(false);
    const headers = { Authorization: `Bearer ${token()}` };
    const [overview, loadedCampaigns, mediaResponse, postsResponse, postResponse] = await Promise.all([
      loadWorkspaceOverview(),
      loadCampaigns(),
      fetch(`${apiUrl}/media`, { headers }),
      fetch(`${apiUrl}/posts`, { headers }),
      editingPostId ? fetch(`${apiUrl}/posts/${editingPostId}`, { headers }) : Promise.resolve(null)
    ]);

    setStore(overview.store);
    setRubika(overview.rubika);
    setCampaigns(loadedCampaigns);
    if (postsResponse.ok) setPosts(await postsResponse.json());

    let loadedMediaAssets: MediaAsset[] = [];
    if (mediaResponse.ok) {
      loadedMediaAssets = await mediaResponse.json();
      setMediaAssets(loadedMediaAssets);
    }

    if (editingPostId) {
      if (!postResponse?.ok) {
        throw new Error("دریافت پست برای ویرایش ناموفق بود");
      }

      const post = (await postResponse.json()) as Post;
      setEditingPost(post);
      setForm({
        title: post.title,
        caption: post.caption,
        hashtags: post.hashtags,
        platform: post.platform || "rubika",
        timezone: scheduleTimezone,
        campaign_id: post.campaign_id ?? null,
        campaign: post.campaign || "",
        internal_note: post.internal_note || "",
        scheduled_at: post.scheduled_at
      });
      setShowOptionalDetails(Boolean(post.campaign_id || post.campaign || post.internal_note));

      const attachedAsset = loadedMediaAssets.find((asset) => asset.post_id === post.id);
      setSelectedMediaId(attachedAsset ? String(attachedAsset.id) : "");
      setShowComposerEntry(false);
    } else {
      let restoredDraft: { form: typeof emptyForm; selectedMediaId: string; savedAt: string } | null = null;
      try {
        const savedDraft = window.localStorage.getItem(localDraftKey);
        restoredDraft = savedDraft ? JSON.parse(savedDraft) : null;
      } catch {
        window.localStorage.removeItem(localDraftKey);
      }
      setEditingPost(null);
      setForm(restoredDraft?.form ? { ...emptyForm, ...restoredDraft.form, scheduled_at: presetScheduledAt || restoredDraft.form.scheduled_at } : { ...emptyForm, scheduled_at: presetScheduledAt });
      const restoredMediaId = restoredDraft?.selectedMediaId ?? "";
      setSelectedMediaId(loadedMediaAssets.some((asset) => String(asset.id) === restoredMediaId) ? restoredMediaId : "");
      setShowOptionalDetails(Boolean(restoredDraft?.form?.campaign_id || restoredDraft?.form?.campaign || restoredDraft?.form?.internal_note));
      setShowComposerEntry(!restoredDraft?.form && !restoredMediaId && !presetScheduledAt);
      if (restoredDraft?.savedAt) {
        setAutosaveState("restored");
        setAutosaveAt(restoredDraft.savedAt);
      }
    }

    setComposerReady(true);
    setLoading(false);
  }, [editingPostId, presetScheduledAt]);

  useEffect(() => {
    loadData().catch((err) => {
      setError(err instanceof Error ? err.message : isEditing ? "خطا در دریافت اطلاعات پست برای ویرایش" : "خطا در دریافت اطلاعات اولیه composer");
      setLoading(false);
    });
  }, [isEditing, loadData]);

  useEffect(() => {
    if (!selectedFile) {
      setSelectedFilePreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setSelectedFilePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  useEffect(() => {
    if (mediaAssets.length === 0) {
      setMediaPreviewUrls({});
      return;
    }

    let cancelled = false;
    const createdUrls: string[] = [];

    async function loadPreviews() {
      const imageAssets = mediaAssets.filter((asset) => asset.content_type.startsWith("image/"));
      const entries = await Promise.all(
        imageAssets.map(async (asset) => {
          try {
            const response = await fetch(`${apiUrl}/media/${asset.id}/file`, {
              headers: { Authorization: `Bearer ${token()}` }
            });
            if (!response.ok) return null;
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            createdUrls.push(url);
            return [asset.id, url] as const;
          } catch {
            return null;
          }
        })
      );

      if (!cancelled) {
        setMediaPreviewUrls(Object.fromEntries(entries.filter(Boolean) as Array<[number, string]>));
      } else {
        createdUrls.forEach((url) => URL.revokeObjectURL(url));
      }
    }

    loadPreviews();

    return () => {
      cancelled = true;
      createdUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [mediaAssets]);

  useEffect(() => {
    if (!composerReady || isEditing) return;
    if (!hasLocalDraftContent) {
      window.localStorage.removeItem(localDraftKey);
      setAutosaveAt("");
      setAutosaveState("idle");
      return;
    }
    setAutosaveState("dirty");
    const timeout = window.setTimeout(() => {
      const savedAt = new Date().toISOString();
      window.localStorage.setItem(localDraftKey, JSON.stringify({ form, selectedMediaId, savedAt }));
      setAutosaveAt(savedAt);
      setAutosaveState("saved");
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [composerReady, form, hasLocalDraftContent, isEditing, selectedMediaId]);

  function clearAutosavedDraft() {
    window.localStorage.removeItem(localDraftKey);
    setAutosaveAt("");
    setAutosaveState("idle");
  }

  function updateField(field: keyof typeof emptyForm, value: typeof emptyForm[keyof typeof emptyForm]) {
    setForm((current) => ({ ...current, [field]: value }));
    if (message) setMessage("");
  }

  function selectCampaign(campaignId: string) {
    if (!campaignId) {
      setForm((current) => ({ ...current, campaign_id: null, campaign: "" }));
      return;
    }
    const campaign = campaigns.find((item) => String(item.id) === campaignId);
    setForm((current) => ({ ...current, campaign_id: campaign?.id ?? null, campaign: campaign?.name ?? "" }));
    if (message) setMessage("");
  }

  async function quickCreateCampaign() {
    const name = quickCampaignName.trim() || form.campaign.trim();
    if (!name) {
      showToast({ title: "نام کمپین لازم است", description: "برای ساخت کمپین، یک نام کوتاه وارد کنید.", tone: "warning" });
      return;
    }
    setCreatingCampaign(true);
    setError("");
    try {
      const createdCampaign = await createCampaign({
        name,
        color: store?.brand_accent_color || store?.brand_primary_color || "#0F766E"
      });
      setCampaigns((current) => [createdCampaign, ...current.filter((campaign) => campaign.id !== createdCampaign.id)]);
      setForm((current) => ({ ...current, campaign_id: createdCampaign.id, campaign: createdCampaign.name }));
      setQuickCampaignName("");
      showToast({ title: "کمپین ساخته شد", description: "پست فعلی به کمپین جدید متصل شد.", tone: "success" });
    } catch (err) {
      const nextError = err instanceof Error ? err.message : "ساخت کمپین ناموفق بود";
      setError(nextError);
      showToast({ title: "ساخت کمپین ناموفق بود", description: nextError, tone: "alert" });
    } finally {
      setCreatingCampaign(false);
    }
  }

  function applyDefaults() {
    const defaultCaption = [store?.description, store?.default_cta].filter(Boolean).join("\n\n");
    setForm((current) => ({
      ...current,
      caption: current.caption || defaultCaption,
      hashtags: store?.default_hashtags || current.hashtags,
      timezone: scheduleTimezone
    }));
    if (message) setMessage("");
  }

  function openComposerSection(sectionId: "composer-content" | "composer-media") {
    setShowComposerEntry(false);
    window.setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function startWithUpload() {
    setShowComposerEntry(false);
    window.setTimeout(() => uploadInputRef.current?.click(), 0);
  }

  function startWithDefaults() {
    applyDefaults();
    openComposerSection("composer-content");
  }

  function resetComposer(options: { clearStatus?: boolean } = { clearStatus: true }) {
    if (editingPost) {
      setForm({
        title: editingPost.title,
        caption: editingPost.caption,
        hashtags: editingPost.hashtags,
        platform: editingPost.platform || "rubika",
        timezone: scheduleTimezone,
        campaign_id: editingPost.campaign_id ?? null,
        campaign: editingPost.campaign || "",
        internal_note: editingPost.internal_note || "",
        scheduled_at: editingPost.scheduled_at
      });
      setShowOptionalDetails(Boolean(editingPost.campaign_id || editingPost.campaign || editingPost.internal_note));
      const attachedAsset = mediaAssets.find((asset) => asset.post_id === editingPost.id);
      setSelectedMediaId(attachedAsset ? String(attachedAsset.id) : "");
    } else {
      setForm({ ...emptyForm, scheduled_at: presetScheduledAt });
      setSelectedMediaId("");
      setShowOptionalDetails(false);
      clearAutosavedDraft();
    }

    setSelectedFile(null);

    if (options.clearStatus) {
      setMessage("");
      setError("");
    }
  }

  async function uploadSelectedFile() {
    if (!selectedFile) return null;

    const formData = new FormData();
    formData.append("file", selectedFile);
    const response = await fetch(`${apiUrl}/media`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}` },
      body: formData
    });

    if (!response.ok) throw new Error("آپلود تصویر ناموفق بود");
    return response.json() as Promise<MediaAsset>;
  }

  async function attachMedia(assetId: number, postId: number | null) {
    const response = await fetch(`${apiUrl}/media/${assetId}/attach`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`
      },
      body: JSON.stringify({ post_id: postId })
    });

    if (!response.ok) throw new Error("اتصال تصویر به پست ناموفق بود");
  }

  async function syncSelectedMedia(postId: number) {
    const attachedAssets = mediaAssets.filter((asset) => asset.post_id === postId);
    const uploadedAsset = await uploadSelectedFile();

    if (uploadedAsset) {
      await Promise.all(attachedAssets.map((asset) => attachMedia(asset.id, null)));
      await attachMedia(uploadedAsset.id, postId);
      return;
    }

    if (selectedMediaId) {
      await Promise.all(attachedAssets.filter((asset) => String(asset.id) !== selectedMediaId).map((asset) => attachMedia(asset.id, null)));
      await attachMedia(Number(selectedMediaId), postId);
      return;
    }

    await Promise.all(attachedAssets.map((asset) => attachMedia(asset.id, null)));
  }

  async function schedulePost(postId: number, scheduledAt: string) {
    const response = await fetch(`${apiUrl}/posts/${postId}/schedule`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`
      },
      body: JSON.stringify({ scheduled_at: scheduledAt, timezone: scheduleTimezone })
    });

    if (!response.ok) throw new Error("زمان‌بندی پست ناموفق بود");
    return response.json() as Promise<Post>;
  }

  async function markReadyPost(postId: number) {
    const response = await fetch(`${apiUrl}/posts/${postId}/ready`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}` }
    });

    if (!response.ok) throw new Error("آماده‌سازی پست ناموفق بود");
    return response.json() as Promise<Post>;
  }

  async function changePostStatus(postId: number, status: string) {
    const response = await fetch(`${apiUrl}/posts/${postId}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) throw new Error("تغییر وضعیت پست ناموفق بود");
    return response.json() as Promise<Post>;
  }

  async function persistPost(action: SaveAction) {
    if (!canSaveDraft) {
      setError("برای ذخیره پست، عنوان داخلی را وارد کنید.");
      showToast({ title: "عنوان داخلی لازم است", description: "قبل از ذخیره، یک عنوان برای مدیریت محتوا وارد کنید.", tone: "warning" });
      return;
    }
    if (action === "ready" && !canMarkReady) {
      setError("برای آماده‌سازی، کپشن یا تصویر پست را کامل کنید.");
      showToast({ title: "محتوای پست کامل نیست", description: "برای آماده‌سازی، کپشن یا تصویر اضافه کنید.", tone: "warning" });
      return;
    }
    if (action === "schedule" && !canSchedule) {
      const scheduleError = reviewBlocksSchedule ? "این پست برای زمان‌بندی باید تایید بازبینی داشته باشد." : rubikaReady ? "برای زمان‌بندی، زمان انتشار را انتخاب کنید." : "برای زمان‌بندی، ابتدا اتصال روبیکا را تست کنید.";
      setError(scheduleError);
      showToast({ title: "زمان‌بندی هنوز آماده نیست", description: scheduleError, tone: "warning" });
      return;
    }

    setSavingAction(action);
    setMessage("");
    setError("");

    try {
      const endpoint = isEditing ? `${apiUrl}/posts/${editingPostId}` : `${apiUrl}/posts`;
      const response = await fetch(endpoint, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`
        },
        body: JSON.stringify({ ...form, timezone: scheduleTimezone })
      });

      if (!response.ok) throw new Error(isEditing ? "به‌روزرسانی پست ناموفق بود" : "ذخیره پیش‌نویس ناموفق بود");
      const savedPost = (await response.json()) as Post;

      await syncSelectedMedia(savedPost.id);

      if (action === "schedule" && form.scheduled_at) {
        await schedulePost(savedPost.id, form.scheduled_at);
      } else if (action === "ready") {
        await markReadyPost(savedPost.id);
      } else if (isEditing && editingPost?.status === "scheduled" && !form.scheduled_at) {
        await changePostStatus(savedPost.id, "draft");
      }

      if (!isEditing) {
        clearAutosavedDraft();
        resetComposer({ clearStatus: false });
      }

      const successMessage = action === "schedule"
        ? "پست ذخیره و وارد صف زمان‌بندی شد"
        : action === "ready"
          ? "پست برای زمان‌بندی آماده شد"
          : isEditing
            ? "تغییرات پست ذخیره شد"
            : "پست به عنوان پیش‌نویس ذخیره شد";

      setMessage(successMessage);
      showToast({ title: successMessage, description: action === "schedule" ? "پست در صف انتشار قرار گرفت." : "نسخه جدید در فضای کاری ثبت شد.", tone: "success" });
      await loadData();
    } catch (err) {
      const nextError = err instanceof Error ? err.message : "خطای ذخیره پست";
      setError(nextError);
      showToast({ title: "ذخیره پست ناموفق بود", description: nextError, tone: "alert" });
    } finally {
      setSavingAction(null);
    }
  }

  async function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await persistPost(hasSchedule ? "schedule" : "draft");
  }

  return (
    <AuthGate>
      <AppShell>
        <WorkspacePage className="space-y-4">
          <section className="app-studio-panel rounded-lg px-4 py-3">
            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
              <div>
                <p className="text-[10px] font-black text-app-primary">استودیوی انتشار</p>
                <h1 className="mt-1 text-xl font-black text-app-text">{isEditing ? "ویرایش پست روبیکا" : "پست جدید روبیکا"}</h1>
                <p className="mt-1 text-xs leading-5 text-app-muted">محتوا را کامل کنید، خروجی را ببینید و زمان انتشار را از یک مسیر متمرکز تنظیم کنید.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusToken tone={publishTone} className="gap-1">
                  <Send className="h-3.5 w-3.5" aria-hidden="true" />
                  {publishStateLabel}
                </StatusToken>
                <StatusToken tone={rubikaReady ? "success" : "warning"}>{rubikaReady ? "روبیکا متصل" : "اتصال روبیکا لازم است"}</StatusToken>
                {!isEditing ? <StatusToken tone={autosaveState === "dirty" ? "warning" : "neutral"}><Cloud className="h-3.5 w-3.5" aria-hidden="true" />{autosaveLabel}</StatusToken> : null}
                {editingPost?.status ? <StatusBadge status={editingPost.status} /> : null}
                {editingPost ? <ApprovalBadge status={editingPost.approval_status} compact /> : null}
                <Button href="/calendar" variant="secondary" size="sm">بازگشت به پلنر</Button>
              </div>
            </div>
          </section>

          {!isEditing && showComposerEntry ? (
            <ComposerStartPanel
              storeName={store?.name || "فضای کاری روبیکا"}
              storeCategory={store?.category}
              brandColor={store?.brand_primary_color}
              avatarUrl={brandAvatarUrl}
              mediaPreviewUrls={readyMediaPreviewUrls}
              hasDefaults={Boolean(store?.default_hashtags || store?.default_cta || store?.description)}
              onStartText={() => openComposerSection("composer-content")}
              onUploadImage={startWithUpload}
              onChooseMedia={() => openComposerSection("composer-media")}
              onUseDefaults={startWithDefaults}
            />
          ) : null}

          <form onSubmit={saveDraft} className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="min-w-0 space-y-4">
              <div id="composer-content">
                <WorkspacePanel
                title="محتوای پست"
                description="متن اصلی را روی بوم ویرایش کامل کنید؛ اطلاعات داخلی تیم در بخش اختیاری باقی می‌مانند."
                action={(
                  <div className="flex flex-wrap gap-2">
                    <Tag tone="primary">روبیکا</Tag>
                    {hasSchedule ? <Tag tone="success">زمان‌بندی شده</Tag> : null}
                  </div>
                )}
                bodyClassName="grid gap-5 p-5"
              >
                  <Field label="عنوان داخلی پست" required hint="فقط برای مدیریت محتوا و صف انتشار؛ مخاطب این عنوان را نمی‌بیند.">
                    <Input
                      value={form.title}
                      onChange={(event) => updateField("title", event.target.value)}
                      placeholder="مثلاً معرفی محصول جدید"
                      required
                    />
                  </Field>

                  <Field label="کپشن" hint={`${captionLength} کاراکتر`}>
                    <Textarea
                      value={form.caption}
                      onChange={(event) => updateField("caption", event.target.value)}
                      className="min-h-[320px] resize-y border-0 bg-app-canvas px-4 py-3 text-[15px] leading-8 shadow-hairline"
                      placeholder="متن پست روبیکا را وارد کنید..."
                    />
                  </Field>

                  <Field label="هشتگ‌ها" hint={`${hashtagCount} هشتگ شناسایی شد`}>
                    <Input
                      value={form.hashtags}
                      onChange={(event) => updateField("hashtags", event.target.value)}
                      placeholder="#روبیکا #فروشگاه #محصول"
                    />
                  </Field>

                  <section className="overflow-hidden rounded-md bg-app-surfaceMuted shadow-hairline">
                    <button
                      type="button"
                      onClick={() => setShowOptionalDetails((current) => !current)}
                      className="flex w-full items-center justify-between gap-3 px-3 py-3 text-right transition hover:bg-slate-100"
                      aria-expanded={showOptionalDetails}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4 shrink-0 text-app-primary" aria-hidden="true" />
                        <span>
                          <span className="block text-sm font-black text-app-text">جزئیات اختیاری</span>
                          <span className="mt-1 block text-xs text-app-muted">کمپین و یادداشت داخلی تیم</span>
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        {form.campaign ? <Tag tone="primary">{form.campaign}</Tag> : null}
                        {form.internal_note ? <Tag tone="neutral">یادداشت دارد</Tag> : null}
                        <ChevronDown className={`h-4 w-4 text-slate-500 transition ${showOptionalDetails ? "rotate-180" : ""}`} aria-hidden="true" />
                      </span>
                    </button>

                    {showOptionalDetails ? (
                      <div className="grid gap-4 border-t border-app-border bg-white p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-app-text">کمپین</p>
                              <p className="mt-1 text-xs leading-5 text-app-muted">پست را به یک کمپین واقعی برای فیلتر و گزارش‌گیری وصل کنید.</p>
                            </div>
                            {selectedCampaign ? (
                              <span className="mt-0.5 h-4 w-4 shrink-0 rounded shadow-hairline" style={{ backgroundColor: selectedCampaign.color }} aria-hidden="true" />
                            ) : null}
                          </div>

                          <div className="mt-2 grid gap-2">
                            <Select value={form.campaign_id ?? ""} onChange={(event) => selectCampaign(event.target.value)}>
                              <option value="">بدون کمپین</option>
                              {campaigns.map((campaign) => (
                                <option key={campaign.id} value={campaign.id}>
                                  {campaign.name} · {campaign.post_count} پست
                                </option>
                              ))}
                            </Select>

                            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                              <Input value={quickCampaignName} onChange={(event) => setQuickCampaignName(event.target.value)} placeholder="نام کمپین جدید، مثلاً لانچ خرداد" />
                              <Button type="button" variant="secondary" size="sm" onClick={quickCreateCampaign} disabled={creatingCampaign}>
                                <Plus className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
                                {creatingCampaign ? "در حال ساخت" : "ساخت کمپین"}
                              </Button>
                            </div>
                          </div>

                          {selectedCampaign ? (
                            <p className="mt-2 line-clamp-2 text-xs leading-5 text-app-muted">{selectedCampaign.goal || selectedCampaign.notes || "هدف کمپین هنوز تعریف نشده است."}</p>
                          ) : null}
                        </div>

                        <Field label="یادداشت داخلی" hint="این متن فقط برای تیم نمایش داده می‌شود.">
                          <Textarea
                            value={form.internal_note}
                            onChange={(event) => updateField("internal_note", event.target.value)}
                            className="min-h-24"
                            placeholder="نکته برای تیم، تایید مدیر یا دلیل زمان‌بندی..."
                          />
                        </Field>
                      </div>
                    ) : null}
                  </section>
                </WorkspacePanel>
              </div>

              <div id="composer-media">
                <WorkspacePanel
                  title="رسانه"
                  description="یک تصویر تازه آپلود کنید یا از کتابخانه رسانه انتخاب کنید."
                  action={<Tag tone={previewImageUrl ? "success" : "warning"}>{previewImageUrl ? "انتخاب شده" : "بدون رسانه"}</Tag>}
                  bodyClassName="grid gap-4 p-4 lg:grid-cols-[230px_minmax(0,1fr)]"
                >
                  <div className="space-y-3">
                    <label className="app-interactive block cursor-pointer rounded-md border border-dashed border-app-borderStrong bg-app-surfaceMuted p-3 hover:border-blue-300 hover:bg-blue-50">
                      <input
                        ref={uploadInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) => {
                          setSelectedFile(event.target.files?.[0] ?? null);
                          if (event.target.files?.[0]) setSelectedMediaId("");
                          if (message) setMessage("");
                        }}
                        className="sr-only"
                      />
                      <span className="flex items-center gap-2 text-sm font-black text-app-text">
                        <ImagePlus className="h-4 w-4" aria-hidden="true" />
                        آپلود تصویر
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-app-muted">JPEG، PNG یا WEBP</span>
                    </label>
                    {selectedFilePreviewUrl ? (
                      <img src={selectedFilePreviewUrl} alt="پیش‌نمایش فایل انتخاب‌شده" className="aspect-video w-full rounded-md object-cover ring-1 ring-app-border" />
                    ) : null}
                  </div>
                  <MediaGalleryPicker
                    assets={mediaAssets}
                    campaigns={campaigns}
                    posts={posts}
                    previewUrls={mediaPreviewUrls}
                    selectedMediaId={selectedMediaId}
                    activeCampaignId={form.campaign_id}
                    loading={loading}
                    onSelect={(assetId) => {
                      setSelectedMediaId(assetId);
                      setSelectedFile(null);
                      if (message) setMessage("");
                    }}
                  />
                </WorkspacePanel>
              </div>

              {message ? <NoticeBanner tone="success" title="انجام شد">{message}</NoticeBanner> : null}
              {error ? <NoticeBanner tone="alert" title="نیاز به بررسی">{error}</NoticeBanner> : null}
            </section>

            <aside className="min-w-0 space-y-4">
              <div className="sticky top-24 space-y-4">
                <ComposerStepRail steps={composerSteps} />

                <WorkspacePanel
                  title="بازرس استودیو"
                  description="پیش‌نمایش، زمان‌بندی و کنترل نهایی را در یک فضای متمرکز بررسی کنید."
                  action={<StatusToken tone={publishTone}>{readinessScore}%</StatusToken>}
                  bodyClassName="p-0"
                >
                  <div className="grid grid-cols-3 border-b border-app-border bg-app-surfaceMuted p-1">
                    {studioPanels.map((panel) => {
                      const Icon = panel.icon;
                      const active = studioPanel === panel.value;
                      return (
                        <button
                          key={panel.value}
                          type="button"
                          onClick={() => setStudioPanel(panel.value)}
                          className={`app-interactive relative flex min-w-0 flex-col items-center gap-1 rounded-md px-2 py-2 text-[11px] font-black ${
                            active ? "bg-white text-app-primary shadow-sm" : "text-slate-500 hover:text-app-text"
                          }`}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                          <span className="truncate">{panel.label}</span>
                          <span className={`absolute left-2 top-2 h-1.5 w-1.5 rounded-full ${panel.ready ? "bg-emerald-500" : "bg-slate-300"}`} />
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-3">
                    {studioPanel === "preview" ? (
                      <div>
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <p className="text-xs font-black text-app-text">خروجی مخاطب</p>
                          <StatusToken tone="neutral">Rubika</StatusToken>
                        </div>
                        <RubikaPostPreview imageUrl={previewImageUrl} caption={finalPreview} destination={store?.name || "کانال روبیکا"} brandColor={store?.brand_primary_color} avatarUrl={brandAvatarUrl} />
                        <div className="mt-3 grid grid-cols-3 divide-x divide-x-reverse divide-app-border overflow-hidden rounded-md bg-app-surfaceMuted text-center shadow-hairline">
                          <div className="p-2"><p className="text-sm font-black text-app-text">{captionLength}</p><p className="mt-1 text-[10px] text-app-muted">کاراکتر</p></div>
                          <div className="p-2"><p className="text-sm font-black text-app-text">{hashtagCount}</p><p className="mt-1 text-[10px] text-app-muted">هشتگ</p></div>
                          <div className="p-2"><p className="text-sm font-black text-app-text">{previewImageUrl ? "1" : "0"}</p><p className="mt-1 text-[10px] text-app-muted">رسانه</p></div>
                        </div>
                      </div>
                    ) : null}

                    {studioPanel === "schedule" ? (
                      <ComposerSchedulePanel
                        scheduledAt={form.scheduled_at}
                        timezone={timezone}
                        onChange={(value) => updateField("scheduled_at", value)}
                      />
                    ) : null}

                    {studioPanel === "review" ? (
                      <div>
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <p className="text-xs font-black text-app-text">کنترل پیش از انتشار</p>
                          <StatusToken tone={canSchedule ? "success" : "warning"}>{canSchedule ? "آماده صف" : "نیازمند تکمیل"}</StatusToken>
                        </div>
                        {editingPost ? (
                          <div className="mb-3 rounded-md border border-app-border bg-app-surfaceMuted/70 p-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <ApprovalBadge status={editingPost.approval_status} />
                              {editingPost.reviewed_by ? <StatusToken tone="neutral">{editingPost.reviewed_by}</StatusToken> : null}
                            </div>
                            <p className="mt-2 text-xs leading-5 text-app-muted">{approvalConfig(editingPost.approval_status).description}</p>
                            {editingPost.approval_note ? <p className="mt-2 rounded bg-white px-3 py-2 text-xs leading-5 text-app-muted shadow-hairline">{editingPost.approval_note}</p> : null}
                          </div>
                        ) : null}
                        <ComposerReadinessChecks items={readinessItems} />
                        <Button href="/media" variant="secondary" className="mt-4 w-full">کتابخانه رسانه</Button>
                      </div>
                    ) : null}
                  </div>
                </WorkspacePanel>
              </div>
            </aside>

            <div className="xl:col-span-2">
              <ComposerActionFooter
                savingAction={savingAction}
                canSaveDraft={canSaveDraft}
                canMarkReady={canMarkReady}
                canSchedule={canSchedule}
                hasSchedule={hasSchedule}
                isEditing={isEditing}
                onUseDefaults={applyDefaults}
                onCancel={resetComposer}
                autosaveLabel={!isEditing ? autosaveLabel : undefined}
                onSaveDraft={() => persistPost("draft")}
                onMarkReady={() => persistPost("ready")}
                onSchedule={() => persistPost("schedule")}
              />
            </div>
          </form>
        </WorkspacePage>
      </AppShell>
    </AuthGate>
  );
}

export default function ComposePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-app-muted">در حال آماده‌سازی composer...</div>}>
      <ComposePageContent />
    </Suspense>
  );
}
