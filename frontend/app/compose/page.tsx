"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthGate } from "../../components/auth-gate";
import { AppShell } from "../../components/app-shell";
import { ComposerActionFooter } from "../../components/composer-action-footer";
import { PageHeader } from "../../components/page-header";
import { RubikaPostPreview } from "../../components/rubika-post-preview";
import { MediaGalleryPicker } from "../../components/media-gallery-picker";
import { ComposerSchedulePanel } from "../../components/composer-schedule-panel";
import { Button } from "../../components/ui/button";
import { SectionCard } from "../../components/ui/card";
import { Field, Input, Textarea } from "../../components/ui/form";
import { Tag } from "../../components/ui/tag";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Store = {
  default_hashtags: string;
  caption_footer: string;
  timezone?: string;
};

type MediaAsset = {
  id: number;
  post_id: number | null;
  original_filename: string;
  content_type: string;
  size_bytes: number;
};

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
  timezone: "Asia/Tehran",
  campaign: "",
  internal_note: "",
  scheduled_at: null as string | null
};

function ComposePageContent() {
  const searchParams = useSearchParams();
  const editingPostId = searchParams.get("postId");
  const isEditing = Boolean(editingPostId);

  const [store, setStore] = useState<Store | null>(null);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<Record<number, string>>({});
  const [form, setForm] = useState(emptyForm);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [selectedMediaId, setSelectedMediaId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePreviewUrl, setSelectedFilePreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  const timezone = form.timezone || store?.timezone || "Asia/Tehran";
  const hasSchedule = Boolean(form.scheduled_at);

  function token() {
    return window.localStorage.getItem("rubika_publisher_access") ?? "";
  }

  async function loadData() {
    setLoading(true);
    const headers = { Authorization: `Bearer ${token()}` };
    const requests = [
      fetch(`${apiUrl}/stores/active`, { headers }),
      fetch(`${apiUrl}/media`, { headers })
    ];

    if (editingPostId) {
      requests.push(fetch(`${apiUrl}/posts/${editingPostId}`, { headers }));
    }

    const [storeResponse, mediaResponse, postResponse] = await Promise.all(requests);

    if (storeResponse.ok) setStore(await storeResponse.json());

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
        timezone: post.timezone || "Asia/Tehran",
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
  }

  useEffect(() => {
    loadData().catch((err) => {
      setError(err instanceof Error ? err.message : isEditing ? "خطا در دریافت اطلاعات پست برای ویرایش" : "خطا در دریافت اطلاعات اولیه composer");
      setLoading(false);
    });
  }, [editingPostId]);

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
      hashtags: store?.default_hashtags || current.hashtags
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
        timezone: editingPost.timezone || "Asia/Tehran",
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
      body: JSON.stringify({ scheduled_at: scheduledAt, timezone })
    });

    if (!response.ok) throw new Error("زمان‌بندی پست ناموفق بود");
    return response.json() as Promise<Post>;
  }

  async function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
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
        body: JSON.stringify(form)
      });

      if (!response.ok) throw new Error(isEditing ? "به‌روزرسانی پست ناموفق بود" : "ذخیره پیش‌نویس ناموفق بود");
      const savedPost = await response.json();

      await syncSelectedMedia(savedPost.id);

      if (form.scheduled_at) {
        await schedulePost(savedPost.id, form.scheduled_at);
      }

      if (!isEditing) {
        resetComposer({ clearStatus: false });
      }

      setMessage(form.scheduled_at ? "پست ذخیره و زمان‌بندی شد" : isEditing ? "پست به‌روزرسانی شد" : "پست به عنوان پیش‌نویس ذخیره شد");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای ذخیره پیش‌نویس");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthGate>
      <AppShell>
        <PageHeader
          eyebrow={isEditing ? "ویرایش محتوا" : "ایجاد محتوا"}
          title={isEditing ? "ویرایش پست روبیکا" : "ایجاد پست روبیکا"}
          description={isEditing ? "اطلاعات پست موجود را ویرایش کنید و تغییرات را روی همان پست ذخیره کنید." : "پست را از یک محیط متمرکز بسازید: تصویر، کپشن، هشتگ، پیش‌نمایش و ذخیره پیش‌نویس در یک جریان واحد."}
          actionLabel="فضای محتوا"
          actionHref="/content"
        />

        <form onSubmit={saveDraft} className="grid gap-5 xl:grid-cols-5">
          <section className="space-y-5 xl:col-span-3">
            <SectionCard title="رسانه پست" description="تصویر جدید آپلود کنید یا از کتابخانه رسانه انتخاب کنید.">
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

            <SectionCard title="متن پست" description="عنوان داخلی، کپشن عمومی و هشتگ‌ها را تنظیم کنید.">
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
                  {hasSchedule ? <Tag tone="success">زمان‌بندی شده</Tag> : null}
                </div>
              </div>
            </SectionCard>

            <SectionCard title="زمان‌بندی انتشار" description="در صورت انتخاب زمان، پست بعد از ذخیره وارد وضعیت زمان‌بندی‌شده می‌شود.">
              <ComposerSchedulePanel
                scheduledAt={form.scheduled_at}
                timezone={timezone}
                onChange={(value) => updateField("scheduled_at", value)}
              />
            </SectionCard>

            {message ? <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
            {error ? <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

            <ComposerActionFooter
              saving={saving}
              disabled={!form.title.trim()}
              hasSchedule={hasSchedule}
              onUseDefaults={useDefaults}
              onCancel={resetComposer}
            />
          </section>

          <aside className="xl:col-span-2">
            <div className="sticky top-24 space-y-5">
              <SectionCard title="پیش‌نمایش روبیکا" description="پیش‌نمایش نهایی تصویر، کپشن، فوتر فروشگاه و هشتگ‌ها.">
                <RubikaPostPreview imageUrl={previewImageUrl} caption={finalPreview} destination="فروشگاه نمونه" />
              </SectionCard>

              <SectionCard title="راهنمای سریع">
                <div className="space-y-3 text-sm leading-7 text-app-muted">
                  <p>۱. تصویر را آپلود یا از کتابخانه انتخاب کنید.</p>
                  <p>۲. کپشن و هشتگ‌ها را کامل کنید.</p>
                  <p>۳. در صورت نیاز، زمان انتشار را انتخاب کنید.</p>
                  <p>{isEditing ? "۴. تغییرات را روی همان پست ذخیره کنید." : "۴. پست را به عنوان پیش‌نویس یا زمان‌بندی‌شده ذخیره کنید."}</p>
                </div>
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
