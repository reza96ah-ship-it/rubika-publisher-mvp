"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { FileImage, ImageIcon, Images, Link2, Search, UploadCloud, XCircle } from "lucide-react";
import { AuthGate } from "../../components/auth-gate";
import { AppShell } from "../../components/app-shell";
import { StatusBadge } from "../../components/status-badge";
import { Button } from "../../components/ui/button";
import { Tag } from "../../components/ui/tag";
import { DetailGrid, EmptyState, MetricStrip, MetricTile, NoticeBanner, SegmentedControl, StatusToken, WorkspaceHero, WorkspacePage, WorkspacePanel, WorkspaceToolbar } from "../../components/workspace-ui";

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
  const imageAssetCount = assets.filter((asset) => asset.content_type.startsWith("image/")).length;
  const totalSizeBytes = assets.reduce((total, asset) => total + asset.size_bytes, 0);
  const mediaFilterOptions = [
    { label: "همه", value: "all" as const, count: assets.length },
    { label: "متصل", value: "attached" as const, count: attachedCount },
    { label: "آزاد", value: "unused" as const, count: unusedCount }
  ];

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
        <WorkspacePage>
          <WorkspaceHero
            eyebrow="Asset Library"
            title="کتابخانه رسانه"
            description="تصاویر محصول را مثل یک کتابخانه عملیاتی مدیریت کنید: آپلود، جست‌وجو، انتخاب، بررسی اتصال و ارسال سریع به composer."
            actions={(
              <>
                <Button href="/compose" variant="secondary" size="sm">ساخت پست جدید</Button>
                <Button href="/content" variant="secondary" size="sm">کتابخانه محتوا</Button>
              </>
            )}
            meta={(
              <>
                <StatusToken tone="primary">فضای کاری رسانه</StatusToken>
                <StatusToken tone={unusedCount ? "success" : "neutral"}>{unusedCount} رسانه آزاد</StatusToken>
                <StatusToken tone={attachedCount ? "info" : "neutral"}>{attachedCount} متصل به پست</StatusToken>
              </>
            )}
            aside={(
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-app-primary">Library Health</p>
                    <h2 className="mt-2 text-lg font-black text-app-text">آماده برای تولید پست</h2>
                    <p className="mt-1 text-xs leading-5 text-app-muted">دارایی‌های آزاد را سریع به composer منتقل کنید یا اتصال فایل‌های استفاده‌شده را کنترل کنید.</p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-md border border-blue-200 bg-white text-app-primary">
                    <Images className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded border border-blue-100 bg-white p-3">
                    <p className="font-black text-app-text">{imageAssetCount}</p>
                    <p className="mt-1 text-app-muted">تصویر</p>
                  </div>
                  <div className="rounded border border-blue-100 bg-white p-3">
                    <p className="font-black text-app-text">{formatSize(totalSizeBytes)}</p>
                    <p className="mt-1 text-app-muted">حجم کل</p>
                  </div>
                </div>
              </div>
            )}
          />

          {message ? <NoticeBanner tone="success" title="انجام شد">{message}</NoticeBanner> : null}
          {error ? <NoticeBanner tone="alert" title="نیاز به بررسی">{error}</NoticeBanner> : null}

          <MetricStrip>
            <MetricTile label="کل رسانه‌ها" value={assets.length} hint="همه فایل‌های فضای کاری" tone="primary" icon={<Images className="h-4 w-4" aria-hidden="true" />} />
            <MetricTile label="متصل به پست" value={attachedCount} hint="در یک پست استفاده شده" tone={attachedCount ? "info" : "neutral"} icon={<Link2 className="h-4 w-4" aria-hidden="true" />} />
            <MetricTile label="رسانه آزاد" value={unusedCount} hint="آماده استفاده در پست جدید" tone={unusedCount ? "success" : "neutral"} icon={<FileImage className="h-4 w-4" aria-hidden="true" />} />
            <MetricTile label="نمایش فعلی" value={filteredAssets.length} hint="نتیجه جست‌وجو و فیلتر" tone="neutral" icon={<Search className="h-4 w-4" aria-hidden="true" />} />
          </MetricStrip>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
            <div className="min-w-0 space-y-4">
              <WorkspaceToolbar
                meta={(
                  <>
                    <StatusToken tone="neutral">{filteredAssets.length} نتیجه</StatusToken>
                    <StatusToken tone={mediaFilter === "unused" ? "success" : mediaFilter === "attached" ? "info" : "primary"}>
                      {mediaFilter === "unused" ? "رسانه‌های آزاد" : mediaFilter === "attached" ? "رسانه‌های متصل" : "همه رسانه‌ها"}
                    </StatusToken>
                  </>
                )}
              >
                <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
                  <label className="flex min-w-0 items-center gap-2 rounded-md border border-app-border bg-white px-3 py-2">
                    <Search className="h-4 w-4 shrink-0 text-app-muted" aria-hidden="true" />
                    <input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="جست‌وجو بر اساس نام فایل یا عنوان پست"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    />
                  </label>
                  <SegmentedControl options={mediaFilterOptions} value={mediaFilter} onChange={setMediaFilter} />
                </div>
              </WorkspaceToolbar>

              <WorkspacePanel
                title="برد رسانه"
                description="برای دیدن جزئیات و مدیریت اتصال، یک تصویر را انتخاب کنید."
                action={<Button href="/compose" variant="secondary" size="sm">ساخت پست با رسانه</Button>}
                bodyClassName="p-4"
              >
                {loading ? <p className="text-sm text-app-muted">در حال دریافت رسانه‌ها...</p> : null}
                {!loading && assets.length === 0 ? (
                  <EmptyState
                    icon={<ImageIcon className="h-5 w-5" aria-hidden="true" />}
                    title="هنوز تصویری آپلود نشده است"
                    description="اولین تصویر محصول را از پنل آپلود اضافه کنید تا در composer قابل استفاده باشد."
                  />
                ) : null}
                {!loading && assets.length > 0 && filteredAssets.length === 0 ? (
                  <EmptyState
                    title="نتیجه‌ای برای این جست‌وجو پیدا نشد"
                    description="فیلتر یا عبارت جست‌وجو را تغییر دهید."
                  />
                ) : null}
                {!loading && filteredAssets.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                    {filteredAssets.map((asset) => {
                      const previewUrl = mediaPreviewUrls[asset.id];
                      const linkedPost = asset.post_id ? postById.get(asset.post_id) : null;
                      const selected = selectedAssetId === String(asset.id);

                      return (
                        <button
                          key={asset.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setSelectedAssetId(String(asset.id))}
                          className={`overflow-hidden rounded-md border bg-white text-right transition hover:border-blue-200 hover:shadow-sm ${
                            selected ? "border-app-primary ring-2 ring-blue-100" : "border-app-border"
                          }`}
                        >
                          <div className="relative">
                            {previewUrl ? (
                              <img src={previewUrl} alt={asset.original_filename} className="aspect-video w-full object-cover" />
                            ) : (
                              <div className="flex aspect-video w-full items-center justify-center bg-slate-50 text-xs text-app-muted">
                                پیش‌نمایش در دسترس نیست
                              </div>
                            )}
                            <span className="absolute right-2 top-2">
                              <Tag tone={linkedPost ? "primary" : "success"}>{linkedPost ? "در استفاده" : "آزاد"}</Tag>
                            </span>
                          </div>
                          <div className="p-3">
                            <p className="truncate text-sm font-black text-app-text" title={asset.original_filename}>{asset.original_filename}</p>
                            <p className="mt-1 text-xs text-app-muted">{asset.content_type} · {formatSize(asset.size_bytes)}</p>
                            <div className="mt-3 flex min-h-9 items-center gap-2 rounded bg-slate-50 px-2 py-1.5 text-xs text-app-muted ring-1 ring-app-border">
                              <Link2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                              <span className="truncate">{linkedPost ? linkedPost.title : "بدون اتصال به پست"}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </WorkspacePanel>
            </div>

            <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
              <WorkspacePanel
                title="آپلود تصویر"
                description="JPG، PNG یا WEBP را به کتابخانه اضافه کنید."
                action={<StatusToken tone={file ? "primary" : "neutral"}>{file ? "فایل انتخاب شد" : "آماده انتخاب"}</StatusToken>}
              >
                <form onSubmit={upload} className="space-y-4">
                  <label className="block cursor-pointer rounded-md border border-dashed border-app-border bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/60">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) => {
                        setFile(event.target.files?.[0] ?? null);
                        setMessage("");
                        setError("");
                      }}
                      className="sr-only"
                    />
                    <span className="flex items-center gap-2 text-sm font-black text-app-text">
                      <UploadCloud className="h-5 w-5 text-app-primary" aria-hidden="true" />
                      انتخاب فایل از سیستم
                    </span>
                    <span className="mt-2 block text-xs leading-5 text-app-muted">
                      {file ? `${file.name} · ${formatSize(file.size)}` : "برای آپلود، تصویر محصول یا محتوای آماده را انتخاب کنید."}
                    </span>
                  </label>
                  {selectedFilePreviewUrl ? (
                    <img
                      src={selectedFilePreviewUrl}
                      alt="پیش‌نمایش تصویر انتخاب‌شده"
                      className="aspect-video w-full rounded-md object-cover ring-1 ring-app-border"
                    />
                  ) : null}
                  <Button type="submit" disabled={!file || uploading} className="w-full">
                    {uploading ? "در حال آپلود..." : "آپلود تصویر"}
                  </Button>
                </form>
              </WorkspacePanel>

              <WorkspacePanel
                title="بازرس رسانه"
                description="جزئیات فایل، وضعیت استفاده و اتصال به پست."
                action={selectedAsset ? <StatusToken tone={selectedLinkedPost ? "primary" : "success"}>{selectedLinkedPost ? "در استفاده" : "آزاد"}</StatusToken> : null}
              >
                {selectedAsset ? (
                  <div>
                    {selectedPreviewUrl ? (
                      <img src={selectedPreviewUrl} alt={selectedAsset.original_filename} className="aspect-video w-full rounded-md object-cover ring-1 ring-app-border" />
                    ) : (
                      <div className="flex aspect-video w-full items-center justify-center rounded-md bg-slate-50 text-xs text-app-muted ring-1 ring-app-border">
                        پیش‌نمایش در دسترس نیست
                      </div>
                    )}

                    <div className="mt-4">
                      <DetailGrid
                        items={[
                          { label: "نام فایل", value: <span className="break-words">{selectedAsset.original_filename}</span>, hint: "نام اصلی فایل" },
                          { label: "نوع", value: selectedAsset.content_type, hint: "فرمت آپلود" },
                          { label: "حجم", value: formatSize(selectedAsset.size_bytes), hint: "اندازه فایل" },
                          { label: "شناسه", value: `#${selectedAsset.id}`, hint: "شناسه داخلی" }
                        ]}
                      />
                    </div>

                    <div className="mt-4 rounded-md border border-app-border bg-slate-50 p-3">
                      <p className="text-xs font-black text-app-muted">وضعیت اتصال</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Tag tone={selectedLinkedPost ? "primary" : "success"}>{selectedLinkedPost ? "متصل به پست" : "بدون اتصال"}</Tag>
                        {selectedLinkedPost ? <StatusBadge status={selectedLinkedPost.status} /> : null}
                      </div>
                      {selectedLinkedPost ? <p className="mt-2 text-sm font-black text-app-text">{selectedLinkedPost.title}</p> : null}
                    </div>

                    <label className="mt-4 block text-xs font-bold text-app-muted">
                      اتصال به پست
                      <select
                        value={selectedAsset.post_id ? String(selectedAsset.post_id) : ""}
                        onChange={(event) => void attachToPost(selectedAsset.id, event.target.value)}
                        className="mt-2 w-full rounded-md border border-app-border bg-white px-3 py-2 text-sm text-app-text outline-none focus:border-app-primary focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">بدون اتصال</option>
                        {posts.map((post) => (
                          <option key={post.id} value={post.id}>{post.title}</option>
                        ))}
                      </select>
                    </label>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedLinkedPost ? (
                        <Button type="button" variant="ghost" size="sm" onClick={() => void attachToPost(selectedAsset.id, "")}>
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
                ) : (
                  <EmptyState
                    icon={<FileImage className="h-5 w-5" aria-hidden="true" />}
                    title="رسانه‌ای انتخاب نشده"
                    description="برای دیدن جزئیات، یک تصویر را از برد رسانه انتخاب کنید."
                  />
                )}
              </WorkspacePanel>
            </aside>
          </section>
        </WorkspacePage>
      </AppShell>
    </AuthGate>
  );
}
