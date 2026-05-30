"use client";

import { FormEvent, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ImagePlus, Send, SlidersHorizontal } from "lucide-react";
import { AuthGate } from "../../components/auth-gate";
import { AppShell } from "../../components/app-shell";
import { ComposerActionFooter } from "../../components/composer-action-footer";
import { ComposerReadinessChecks } from "../../components/composer-readiness-checks";
import { RubikaPostPreview } from "../../components/rubika-post-preview";
import { MediaGalleryPicker } from "../../components/media-gallery-picker";
import { ComposerSchedulePanel } from "../../components/composer-schedule-panel";
import { StatusBadge } from "../../components/status-badge";
import { Button } from "../../components/ui/button";
import { Field, Input, Textarea } from "../../components/ui/form";
import { Tag } from "../../components/ui/tag";
import { NoticeBanner, StatusToken, WorkspacePage, WorkspacePanel } from "../../components/workspace-ui";
import { isRubikaConnected, loadWorkspaceOverview, type RubikaSettings, type StoreProfile } from "../../lib/workspace";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const scheduleTimezone = "Asia/Tehran";

type MediaAsset = {
  id: number;
  post_id: number | null;
  original_filename: string;
  content_type: string;
  size_bytes: number;
};

type SaveAction = "draft" | "ready" | "schedule";

type Post = {
  id: number;
  title: string;
  caption: string;
  hashtags: string;
  platform: string;
  status: string;
  timezone: string;
  campaign: string;
  internal_note: string;
  scheduled_at: string | null;
};

const emptyForm = {
  title: "",
  caption: "",
  hashtags: "",
  platform: "rubika",
  timezone: scheduleTimezone,
  campaign: "",
  internal_note: "",
  scheduled_at: null as string | null
};

function ComposePageContent() {
  const searchParams = useSearchParams();
  const editingPostId = searchParams.get("postId");
  const presetScheduledAt = searchParams.get("scheduledAt");
  const isEditing = Boolean(editingPostId);

  const [store, setStore] = useState<StoreProfile | null>(null);
  const [rubika, setRubika] = useState<RubikaSettings | null>(null);
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
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedMedia = useMemo(() => {
    if (!selectedMediaId) return null;
    return mediaAssets.find((asset) => String(asset.id) === selectedMediaId) ?? null;
  }, [mediaAssets, selectedMediaId]);

  const previewImageUrl = selectedFilePreviewUrl || (selectedMedia ? mediaPreviewUrls[selectedMedia.id] : "");

  const finalPreview = useMemo(() => {
    return [form.caption, form.caption ? store?.caption_footer : "", form.hashtags]
      .filter(Boolean)
      .join("\n\n");
  }, [form.caption, form.hashtags, store?.caption_footer]);

  const captionLength = form.caption.length;
  const hashtagCount = form.hashtags.split(/\s+/).filter((item) => item.startsWith("#")).length;
  const timezone = scheduleTimezone;
  const hasSchedule = Boolean(form.scheduled_at);
  const hasTitle = Boolean(form.title.trim());
  const hasPostBody = Boolean(form.caption.trim() || previewImageUrl);
  const rubikaReady = isRubikaConnected(rubika);
  const canMoveToReady = !editingPost || ["draft", "failed", "cancelled"].includes(editingPost.status);
  const canSaveDraft = hasTitle;
  const canMarkReady = hasTitle && hasPostBody && canMoveToReady;
  const canSchedule = canMarkReady && hasSchedule && rubikaReady;
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
    }
  ];
  const readinessDoneCount = readinessItems.filter((item) => item.done).length;
  const readinessScore = Math.round((readinessDoneCount / readinessItems.length) * 100);
  const publishTone = canSchedule ? "success" : canMarkReady ? "primary" : "warning";
  const publishStateLabel = canSchedule ? "آماده زمان‌بندی" : canMarkReady ? "آماده بازبینی" : "در حال تولید";

  function token() {
    return window.localStorage.getItem("rubika_publisher_access") ?? "";
  }

  const loadData = useCallback(async () => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${token()}` };
    const [overview, mediaResponse, postResponse] = await Promise.all([
      loadWorkspaceOverview(),
      fetch(`${apiUrl}/media`, { headers }),
      editingPostId ? fetch(`${apiUrl}/posts/${editingPostId}`, { headers }) : Promise.resolve(null)
    ]);

    setStore(overview.store);
    setRubika(overview.rubika);

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
        campaign: post.campaign || "",
        internal_note: post.internal_note || "",
        scheduled_at: post.scheduled_at
      });
      setShowOptionalDetails(Boolean(post.campaign || post.internal_note));

      const attachedAsset = loadedMediaAssets.find((asset) => asset.post_id === post.id);
      setSelectedMediaId(attachedAsset ? String(attachedAsset.id) : "");
    } else {
      setEditingPost(null);
      setForm({ ...emptyForm, scheduled_at: presetScheduledAt });
      setSelectedMediaId("");
      setShowOptionalDetails(false);
    }

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

  function updateField(field: keyof typeof emptyForm, value: string | null) {
    setForm((current) => ({ ...current, [field]: value }));
    if (message) setMessage("");
  }

  function useDefaults() {
    setForm((current) => ({
      ...current,
      hashtags: store?.default_hashtags || current.hashtags,
      timezone: scheduleTimezone
    }));
    if (message) setMessage("");
  }

  function resetComposer(options: { clearStatus?: boolean } = { clearStatus: true }) {
    if (editingPost) {
      setForm({
        title: editingPost.title,
        caption: editingPost.caption,
        hashtags: editingPost.hashtags,
        platform: editingPost.platform || "rubika",
        timezone: scheduleTimezone,
        campaign: editingPost.campaign || "",
        internal_note: editingPost.internal_note || "",
        scheduled_at: editingPost.scheduled_at
      });
      setShowOptionalDetails(Boolean(editingPost.campaign || editingPost.internal_note));
      const attachedAsset = mediaAssets.find((asset) => asset.post_id === editingPost.id);
      setSelectedMediaId(attachedAsset ? String(attachedAsset.id) : "");
    } else {
      setForm({ ...emptyForm, scheduled_at: presetScheduledAt });
      setSelectedMediaId("");
      setShowOptionalDetails(false);
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
      return;
    }
    if (action === "ready" && !canMarkReady) {
      setError("برای آماده‌سازی، کپشن یا تصویر پست را کامل کنید.");
      return;
    }
    if (action === "schedule" && !canSchedule) {
      setError(rubikaReady ? "برای زمان‌بندی، زمان انتشار را انتخاب کنید." : "برای زمان‌بندی، ابتدا اتصال روبیکا را تست کنید.");
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
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای ذخیره پست");
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
          <section className="rounded-md border border-app-border bg-white px-4 py-3">
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
                {editingPost?.status ? <StatusBadge status={editingPost.status} /> : null}
                <Button href="/calendar" variant="secondary" size="sm">بازگشت به پلنر</Button>
              </div>
            </div>
          </section>

          <form onSubmit={saveDraft} className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="min-w-0 space-y-4">
              <WorkspacePanel
                title="محتوای پست"
                description="ابتدا متن اصلی را کامل کنید؛ جزئیات داخلی در بخش اختیاری قرار دارند."
                action={(
                  <div className="flex flex-wrap gap-2">
                    <Tag tone="primary">روبیکا</Tag>
                    {hasSchedule ? <Tag tone="success">زمان‌بندی شده</Tag> : null}
                  </div>
                )}
                bodyClassName="grid gap-5 p-4"
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
                      className="min-h-[260px] resize-y text-[15px] leading-8"
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

                  <section className="overflow-hidden rounded-md border border-app-border">
                    <button
                      type="button"
                      onClick={() => setShowOptionalDetails((current) => !current)}
                      className="flex w-full items-center justify-between gap-3 bg-slate-50 px-3 py-3 text-right transition hover:bg-slate-100"
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
                      <div className="grid gap-4 border-t border-app-border bg-white p-3 lg:grid-cols-[220px_minmax(0,1fr)]">
                        <Field label="کمپین" hint="برای دسته‌بندی و گزارش‌گیری داخلی.">
                          <Input
                            value={form.campaign}
                            onChange={(event) => updateField("campaign", event.target.value)}
                            placeholder="مثلاً لانچ خرداد"
                          />
                        </Field>

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

              <WorkspacePanel
                title="رسانه"
                description="یک تصویر تازه آپلود کنید یا از کتابخانه رسانه انتخاب کنید."
                action={<Tag tone={previewImageUrl ? "success" : "warning"}>{previewImageUrl ? "انتخاب شده" : "بدون رسانه"}</Tag>}
                bodyClassName="grid gap-3 p-3 lg:grid-cols-[220px_minmax(0,1fr)]"
              >
                <div className="space-y-3">
                  <label className="block cursor-pointer rounded-md border border-dashed border-app-border bg-slate-50 p-3 transition hover:border-slate-400">
                    <input
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
                  previewUrls={mediaPreviewUrls}
                  selectedMediaId={selectedMediaId}
                  loading={loading}
                  onSelect={(assetId) => {
                    setSelectedMediaId(assetId);
                    if (assetId) setSelectedFile(null);
                    if (message) setMessage("");
                  }}
                />
              </WorkspacePanel>

              {message ? <NoticeBanner tone="success" title="انجام شد">{message}</NoticeBanner> : null}
              {error ? <NoticeBanner tone="alert" title="نیاز به بررسی">{error}</NoticeBanner> : null}
            </section>

            <aside className="min-w-0 space-y-4">
              <div className="sticky top-24 space-y-4">
                <WorkspacePanel
                  title="پیش‌نمایش خروجی"
                  description="نمای نزدیک از چیزی که مخاطب روبیکا می‌بیند."
                  action={<StatusToken tone="neutral">Rubika</StatusToken>}
                  bodyClassName="p-3"
                >
                  <RubikaPostPreview imageUrl={previewImageUrl} caption={finalPreview} destination={store?.name || "کانال روبیکا"} />
                </WorkspacePanel>

                <WorkspacePanel
                  title="زمان انتشار"
                  description="انتخاب تاریخ شمسی و ساعت برای ورود به صف."
                  bodyClassName="p-3"
                >
                  <ComposerSchedulePanel
                    scheduledAt={form.scheduled_at}
                    timezone={timezone}
                    onChange={(value) => updateField("scheduled_at", value)}
                  />
                </WorkspacePanel>

                <WorkspacePanel
                  title="بررسی نهایی"
                  description="وضعیت الزامات قبل از ذخیره یا زمان‌بندی."
                  action={<StatusToken tone={canSchedule ? "success" : "warning"}>{readinessScore}%</StatusToken>}
                >
                  <ComposerReadinessChecks items={readinessItems} />
                  <Button href="/media" variant="secondary" className="mt-4 w-full">کتابخانه رسانه</Button>
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
                onUseDefaults={useDefaults}
                onCancel={resetComposer}
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
