"use client";

import { FormEvent, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarClock, ClipboardCheck, ImagePlus, MessageSquareText } from "lucide-react";
import { AuthGate } from "../../components/auth-gate";
import { AppShell } from "../../components/app-shell";
import { ComposerActionFooter } from "../../components/composer-action-footer";
import { ComposerReadinessChecks } from "../../components/composer-readiness-checks";
import { ComposerStepRail, type ComposerStep } from "../../components/composer-step-rail";
import { PageHeader } from "../../components/page-header";
import { RubikaPostPreview } from "../../components/rubika-post-preview";
import { MediaGalleryPicker } from "../../components/media-gallery-picker";
import { ComposerSchedulePanel } from "../../components/composer-schedule-panel";
import { StatusBadge } from "../../components/status-badge";
import { Button } from "../../components/ui/button";
import { SectionCard } from "../../components/ui/card";
import { Field, Input, Textarea } from "../../components/ui/form";
import { Tag } from "../../components/ui/tag";
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
  const activeStep = !hasTitle && !hasPostBody ? "media" : !canMarkReady ? "text" : !hasSchedule ? "schedule" : "review";
  const workflowSteps: ComposerStep[] = [
    {
      label: "رسانه",
      helper: previewImageUrl ? "تصویر پست انتخاب شده" : "پست بدون تصویر هم قابل ذخیره است",
      icon: ImagePlus,
      state: previewImageUrl ? "done" : activeStep === "media" ? "active" : "pending"
    },
    {
      label: "متن",
      helper: canMarkReady ? "عنوان و محتوای پست آماده است" : "عنوان و کپشن یا رسانه را کامل کنید",
      icon: MessageSquareText,
      state: canMarkReady ? "done" : activeStep === "text" ? "active" : "pending"
    },
    {
      label: "زمان‌بندی",
      helper: hasSchedule ? "زمان انتشار انتخاب شده" : "برای صف انتشار یک زمان انتخاب کنید",
      icon: CalendarClock,
      state: hasSchedule ? "done" : activeStep === "schedule" ? "active" : "pending"
    },
    {
      label: "بررسی",
      helper: canSchedule ? "آماده ورود به صف انتشار" : "وضعیت نهایی را بررسی کنید",
      icon: ClipboardCheck,
      state: canSchedule ? "done" : activeStep === "review" ? "active" : "pending"
    }
  ];
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

      const attachedAsset = loadedMediaAssets.find((asset) => asset.post_id === post.id);
      setSelectedMediaId(attachedAsset ? String(attachedAsset.id) : "");
    } else {
      setEditingPost(null);
      setForm(emptyForm);
      setSelectedMediaId("");
    }

    setLoading(false);
  }, [editingPostId]);

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
      const attachedAsset = mediaAssets.find((asset) => asset.post_id === editingPost.id);
      setSelectedMediaId(attachedAsset ? String(attachedAsset.id) : "");
    } else {
      setForm(emptyForm);
      setSelectedMediaId("");
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
        <PageHeader
          eyebrow={isEditing ? "ویرایش محتوا" : "ایجاد محتوا"}
          title={isEditing ? "ویرایش پست روبیکا" : "ایجاد پست روبیکا"}
          description={isEditing ? "محتوای پست، رسانه، زمان انتشار و وضعیت بعدی را در یک مسیر مشخص به‌روزرسانی کنید." : "پست را مرحله‌به‌مرحله بسازید، وضعیت آماده‌سازی را ببینید و آن را به پیش‌نویس، آماده یا زمان‌بندی‌شده تبدیل کنید."}
          actionLabel="فضای محتوا"
          actionHref="/content"
        />

        <ComposerStepRail steps={workflowSteps} />

        <form onSubmit={saveDraft} className="grid gap-5 xl:grid-cols-5">
          <section className="space-y-5 xl:col-span-3">
            <SectionCard title="۱. رسانه پست" description="تصویر جدید آپلود کنید یا از کتابخانه رسانه انتخاب کنید.">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-dashed border-app-border bg-slate-50 p-4">
                  <p className="mb-2 text-sm font-semibold text-app-text">آپلود تصویر جدید</p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => {
                      setSelectedFile(event.target.files?.[0] ?? null);
                      if (event.target.files?.[0]) setSelectedMediaId("");
                      if (message) setMessage("");
                    }}
                    className="w-full text-sm text-app-muted"
                  />
                  {selectedFilePreviewUrl ? (
                    <img src={selectedFilePreviewUrl} alt="پیش‌نمایش فایل انتخاب‌شده" className="mt-4 aspect-video w-full rounded-xl object-cover ring-1 ring-app-border" />
                  ) : null}
                </div>

                <div className="rounded-2xl border border-app-border bg-white p-4">
                  <p className="text-sm font-semibold text-app-text">انتخاب از کتابخانه</p>
                  <p className="mt-1 text-xs leading-6 text-app-muted">به‌جای لیست متنی، تصویر را مستقیم از گالری انتخاب کنید.</p>
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
                </div>
              </div>
            </SectionCard>

            <SectionCard title="۲. متن پست" description="عنوان داخلی، کپشن عمومی و هشتگ‌ها را تنظیم کنید.">
              <div className="grid gap-5">
                <Field label="عنوان داخلی پست" required hint="این عنوان برای مدیریت داخلی استفاده می‌شود و در روبیکا نمایش داده نمی‌شود.">
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
                    className="min-h-44"
                    placeholder="متن پست روبیکا را وارد کنید..."
                  />
                </Field>

                <Field label="هشتگ‌ها" hint={`${hashtagCount} هشتگ شناسایی شد`}>
                  <Textarea
                    value={form.hashtags}
                    onChange={(event) => updateField("hashtags", event.target.value)}
                    className="min-h-24"
                    placeholder="#روبیکا #فروشگاه #محصول"
                  />
                </Field>

                <div className="flex flex-wrap gap-2">
                  <Tag tone="primary">مقصد: روبیکا</Tag>
                  <Tag tone={previewImageUrl ? "success" : "warning"}>{previewImageUrl ? "تصویر انتخاب شده" : "بدون تصویر"}</Tag>
                  <Tag tone={form.caption ? "success" : "neutral"}>{form.caption ? "کپشن آماده" : "کپشن خالی"}</Tag>
                  {isEditing ? <Tag tone="neutral">ویرایش پست موجود</Tag> : null}
                  {editingPost?.status ? <StatusBadge status={editingPost.status} /> : null}
                  {hasSchedule ? <Tag tone="success">زمان‌بندی شده</Tag> : null}
                </div>
              </div>
            </SectionCard>

            <SectionCard title="۳. زمان‌بندی انتشار" description="با انتخاب زمان، دکمه زمان‌بندی پست فعال می‌شود.">
              <ComposerSchedulePanel
                scheduledAt={form.scheduled_at}
                timezone={timezone}
                onChange={(value) => updateField("scheduled_at", value)}
              />
            </SectionCard>

            {message ? <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
            {error ? <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

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
          </section>

          <aside className="xl:col-span-2">
            <div className="sticky top-24 space-y-5">
              <SectionCard title="۴. پیش‌نمایش روبیکا" description="خروجی نهایی تصویر، کپشن، فوتر فروشگاه و هشتگ‌ها.">
                <RubikaPostPreview imageUrl={previewImageUrl} caption={finalPreview} destination={store?.name || "کانال روبیکا"} />
              </SectionCard>

              <SectionCard title="بررسی نهایی" description="وضعیت‌های لازم برای ذخیره، آماده‌سازی و زمان‌بندی.">
                <ComposerReadinessChecks items={readinessItems} />
                <Button href="/media" variant="secondary" className="mt-4 w-full">رفتن به کتابخانه رسانه</Button>
              </SectionCard>
            </div>
          </aside>
        </form>
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
