"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ImageIcon, Link2, Search, UploadCloud, XCircle } from "lucide-react";
import { AuthGate } from "../../components/auth-gate";
import { AppShell } from "../../components/app-shell";
import { PageHeader } from "../../components/page-header";
import { StatusBadge } from "../../components/status-badge";
import { Button } from "../../components/ui/button";
import { SectionCard } from "../../components/ui/card";
import { Tag } from "../../components/ui/tag";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type MediaAsset = {
  id: number;
  post_id: number | null;
  original_filename: string;
  stored_filename: string;
  content_type: string;
  size_bytes: number;
  url: string;
};

type PostOption = {
  id: number;
  title: string;
  status: string;
};

type MediaFilter = "all" | "attached" | "unused";

const mediaFilters: Array<{ label: string; value: MediaFilter }> = [
  { label: "همه رسانه‌ها", value: "all" },
  { label: "متصل به پست", value: "attached" },
  { label: "بدون اتصال", value: "unused" }
];

function formatSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export default function MediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [posts, setPosts] = useState<PostOption[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilePreviewUrl, setSelectedFilePreviewUrl] = useState("");
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function token() {
    return window.localStorage.getItem("rubika_publisher_access") ?? "";
  }

  const loadData = useCallback(async () => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${token()}` };
    const mediaResponse = await fetch(`${apiUrl}/media`, { headers });
    const postsResponse = await fetch(`${apiUrl}/posts`, { headers });
    if (mediaResponse.ok) {
      const loadedAssets = (await mediaResponse.json()) as MediaAsset[];
      setAssets(loadedAssets);
      setSelectedAssetId((current) => {
        if (loadedAssets.some((asset) => String(asset.id) === current)) return current;
        return loadedAssets[0] ? String(loadedAssets[0].id) : "";
      });
    }
    if (postsResponse.ok) setPosts(await postsResponse.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData().catch(() => {
      setError("خطا در دریافت رسانه‌ها");
      setLoading(false);
    });
  }, [loadData]);

  useEffect(() => {
    if (!file) {
      setSelectedFilePreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(file);
    setSelectedFilePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (assets.length === 0) {
      setMediaPreviewUrls({});
      return;
    }

    let cancelled = false;
    const createdUrls: string[] = [];

    async function loadPreviews() {
      const imageAssets = assets.filter((asset) => asset.content_type.startsWith("image/"));
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
  }, [assets]);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;
    setUploading(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${apiUrl}/media`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
        body: formData
      });
      if (!response.ok) throw new Error("آپلود تصویر ناموفق بود");
      const uploadedAsset = (await response.json()) as MediaAsset;
      setFile(null);
      setSelectedAssetId(String(uploadedAsset.id));
      setMediaFilter("all");
      setSearchTerm("");
      setMessage("تصویر آپلود شد");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای آپلود تصویر");
    } finally {
      setUploading(false);
    }
  }

  async function attachToPost(assetId: number, value: string) {
    setMessage("");
    setError("");
    const postId = value ? Number(value) : null;
    const response = await fetch(`${apiUrl}/media/${assetId}/attach`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`
      },
      body: JSON.stringify({ post_id: postId })
    });

    if (!response.ok) {
      setError("اتصال تصویر به پست ناموفق بود");
      return;
    }

    setMessage("اتصال تصویر به پست ذخیره شد");
    await loadData();
  }

  const postById = useMemo(() => {
    return new Map(posts.map((post) => [post.id, post]));
  }, [posts]);

  const selectedAsset = useMemo(() => {
    if (!selectedAssetId) return null;
    return assets.find((asset) => String(asset.id) === selectedAssetId) ?? null;
  }, [assets, selectedAssetId]);

  const selectedLinkedPost = selectedAsset?.post_id ? postById.get(selectedAsset.post_id) ?? null : null;
  const attachedCount = assets.filter((asset) => asset.post_id).length;
  const unusedCount = assets.length - attachedCount;

  const filteredAssets = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return assets.filter((asset) => {
      const matchesFilter =
        mediaFilter === "all" ||
        (mediaFilter === "attached" && asset.post_id) ||
        (mediaFilter === "unused" && !asset.post_id);
      const linkedPost = asset.post_id ? postById.get(asset.post_id) : null;
      const searchableText = `${asset.original_filename} ${asset.content_type} ${linkedPost?.title ?? ""}`.toLowerCase();
      return matchesFilter && (!normalizedSearch || searchableText.includes(normalizedSearch));
    });
  }, [assets, mediaFilter, postById, searchTerm]);

  const selectedPreviewUrl = selectedAsset ? mediaPreviewUrls[selectedAsset.id] : "";

  return (
    <AuthGate>
      <AppShell>
        <PageHeader
          eyebrow="دارایی‌های محتوا"
          title="کتابخانه رسانه"
          description="تصاویر محصول را جست‌وجو، فیلتر، بررسی و به پست‌های آماده انتشار وصل کنید."
        />

        {message ? <div className="mb-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
        {error ? <div className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <section className="mb-5 grid gap-4 lg:grid-cols-4">
          <SectionCard title="کل رسانه‌ها" description="همه تصاویر فضای کاری.">
            <p className="text-2xl font-black text-app-text">{assets.length}</p>
            <p className="mt-2 text-sm text-app-muted">فایل در کتابخانه</p>
          </SectionCard>
          <SectionCard title="متصل" description="در یک پست استفاده شده.">
            <p className="text-2xl font-black text-app-text">{attachedCount}</p>
            <p className="mt-2 text-sm text-app-muted">رسانه دارای پست</p>
          </SectionCard>
          <SectionCard title="بدون اتصال" description="آماده استفاده در پست جدید.">
            <p className="text-2xl font-black text-app-text">{unusedCount}</p>
            <p className="mt-2 text-sm text-app-muted">رسانه آزاد</p>
          </SectionCard>
          <SectionCard title="نمایش فعلی" description="نتیجه جست‌وجو و فیلتر.">
            <p className="text-2xl font-black text-app-text">{filteredAssets.length}</p>
            <p className="mt-2 text-sm text-app-muted">رسانه قابل مشاهده</p>
          </SectionCard>
        </section>

        <section className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <SectionCard title="آپلود تصویر" description="JPG، PNG، WEBP تا ۸ مگابایت.">
              <form onSubmit={upload}>
                <label className="block rounded-2xl border border-dashed border-app-border bg-slate-50 p-4 text-sm text-app-muted">
                  <span className="flex items-center gap-2 font-semibold text-app-text">
                    <UploadCloud className="h-5 w-5 text-app-primary" aria-hidden="true" />
                    انتخاب فایل
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                    className="mt-4 w-full text-sm"
                  />
                </label>
                {selectedFilePreviewUrl ? (
                  <img
                    src={selectedFilePreviewUrl}
                    alt="پیش‌نمایش تصویر انتخاب‌شده"
                    className="mt-4 aspect-video w-full rounded-xl object-cover ring-1 ring-app-border"
                  />
                ) : null}
                <Button type="submit" disabled={!file || uploading} className="mt-5 w-full">
                  {uploading ? "در حال آپلود..." : "آپلود تصویر"}
                </Button>
              </form>
            </SectionCard>

            <SectionCard title="جزئیات رسانه" description="رسانه انتخاب‌شده و اتصال آن به پست.">
              {selectedAsset ? (
                <div>
                  {selectedPreviewUrl ? (
                    <img src={selectedPreviewUrl} alt={selectedAsset.original_filename} className="aspect-video w-full rounded-xl object-cover ring-1 ring-app-border" />
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-slate-50 text-xs text-app-muted ring-1 ring-app-border">
                      پیش‌نمایش در دسترس نیست
                    </div>
                  )}

                  <div className="mt-4 space-y-3 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-app-muted">نام فایل</p>
                      <p className="mt-1 break-words font-bold text-app-text">{selectedAsset.original_filename}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-app-border">
                        <p className="text-xs text-app-muted">نوع</p>
                        <p className="mt-1 text-xs font-semibold text-app-text">{selectedAsset.content_type}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-app-border">
                        <p className="text-xs text-app-muted">حجم</p>
                        <p className="mt-1 text-xs font-semibold text-app-text">{formatSize(selectedAsset.size_bytes)}</p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-app-border">
                      <p className="text-xs text-app-muted">وضعیت اتصال</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Tag tone={selectedLinkedPost ? "primary" : "neutral"}>{selectedLinkedPost ? "متصل به پست" : "بدون اتصال"}</Tag>
                        {selectedLinkedPost ? <StatusBadge status={selectedLinkedPost.status} /> : null}
                      </div>
                      {selectedLinkedPost ? <p className="mt-2 text-sm font-bold text-app-text">{selectedLinkedPost.title}</p> : null}
                    </div>
                    <label className="block text-xs font-semibold text-app-muted">
                      اتصال به پست
                      <select
                        value={selectedAsset.post_id ?? ""}
                        onChange={(event) => attachToPost(selectedAsset.id, event.target.value)}
                        className="mt-2 w-full rounded-xl border border-app-border bg-white px-3 py-2 text-sm text-app-text outline-none focus:border-app-primary focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">بدون اتصال</option>
                        {posts.map((post) => (
                          <option key={post.id} value={post.id}>{post.title}</option>
                        ))}
                      </select>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedLinkedPost ? (
                        <Button type="button" variant="ghost" size="sm" onClick={() => attachToPost(selectedAsset.id, "")}>
                          <XCircle className="ml-2 h-4 w-4" aria-hidden="true" />
                          جدا کردن
                        </Button>
                      ) : null}
                      {selectedLinkedPost ? (
                        <Button href={`/compose?postId=${selectedLinkedPost.id}`} variant="secondary" size="sm">
                          باز کردن پست
                        </Button>
                      ) : (
                        <Button href="/compose" variant="secondary" size="sm">
                          ساخت پست جدید
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-app-border bg-slate-50 p-5 text-center text-sm text-app-muted">
                  برای دیدن جزئیات، یک رسانه را از کتابخانه انتخاب کنید.
                </div>
              )}
            </SectionCard>
          </aside>

          <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-soft">
            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-lg font-bold text-app-text">کتابخانه تصاویر</h2>
                <p className="mt-1 text-sm text-app-muted">برای مدیریت اتصال، روی یک تصویر کلیک کنید.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {mediaFilters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setMediaFilter(filter.value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      mediaFilter === filter.value ? "bg-app-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-xl border border-app-border bg-white px-3 py-2">
              <Search className="h-4 w-4 text-app-muted" aria-hidden="true" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="جست‌وجو بر اساس نام فایل یا عنوان پست"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            {loading ? <p className="mt-5 text-sm text-app-muted">در حال دریافت...</p> : null}
            {!loading && assets.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-app-border bg-slate-50 p-8 text-center">
                <ImageIcon className="mx-auto h-8 w-8 text-app-muted" aria-hidden="true" />
                <p className="mt-3 font-bold text-app-text">هنوز تصویری آپلود نشده است.</p>
                <p className="mt-2 text-sm text-app-muted">اولین تصویر محصول را از پنل آپلود اضافه کنید.</p>
              </div>
            ) : null}
            {!loading && assets.length > 0 && filteredAssets.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-app-border bg-slate-50 p-8 text-center">
                <p className="font-bold text-app-text">نتیجه‌ای برای این جست‌وجو پیدا نشد.</p>
                <p className="mt-2 text-sm text-app-muted">فیلتر یا عبارت جست‌وجو را تغییر دهید.</p>
              </div>
            ) : null}

            <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {filteredAssets.map((asset) => {
                const previewUrl = mediaPreviewUrls[asset.id];
                const linkedPost = asset.post_id ? postById.get(asset.post_id) : null;
                const selected = selectedAssetId === String(asset.id);

                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => setSelectedAssetId(String(asset.id))}
                    className={`overflow-hidden rounded-2xl border bg-white text-right shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                      selected ? "border-app-primary ring-2 ring-blue-100" : "border-app-border"
                    }`}
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt={asset.original_filename} className="aspect-video w-full object-cover" />
                    ) : (
                      <div className="flex aspect-video w-full items-center justify-center bg-slate-50 text-xs text-app-muted">
                        پیش‌نمایش در دسترس نیست
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-bold text-app-text" title={asset.original_filename}>{asset.original_filename}</p>
                          <p className="mt-1 text-xs text-app-muted">{asset.content_type} · {formatSize(asset.size_bytes)}</p>
                        </div>
                        <Tag tone={linkedPost ? "primary" : "neutral"}>{linkedPost ? "متصل" : "آزاد"}</Tag>
                      </div>
                      <div className="mt-3 flex min-h-10 items-center gap-2 text-xs text-app-muted">
                        <Link2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="truncate">{linkedPost ? linkedPost.title : "بدون اتصال به پست"}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </AppShell>
    </AuthGate>
  );
}
