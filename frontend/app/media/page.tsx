"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { FileImage, ImageIcon, Images, Link2, Search, UploadCloud, XCircle } from "lucide-react";
import { AuthGate } from "../../components/auth-gate";
import { AppShell } from "../../components/app-shell";
import { StatusBadge } from "../../components/status-badge";
import { Button } from "../../components/ui/button";
import { Tag } from "../../components/ui/tag";
import { DetailGrid, EmptyState, NoticeBanner, StatusToken, WorkspacePage, WorkspacePanel, WorkspaceToolbar } from "../../components/workspace-ui";

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
  if (!size) return "0 KB";
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
  const [showUploader, setShowUploader] = useState(false);
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
      setShowUploader(false);
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
  const totalSizeBytes = assets.reduce((total, asset) => total + asset.size_bytes, 0);
  const mediaSummary = [
    { label: "همه رسانه‌ها", detail: "دارایی‌های فضای کاری", value: "all" as const, count: assets.length, icon: Images, tone: "text-app-primary" },
    { label: "رسانه آزاد", detail: "آماده استفاده در پست", value: "unused" as const, count: unusedCount, icon: FileImage, tone: unusedCount ? "text-emerald-700" : "text-slate-500" },
    { label: "متصل به پست", detail: "در حال استفاده", value: "attached" as const, count: attachedCount, icon: Link2, tone: attachedCount ? "text-sky-700" : "text-slate-500" },
    { label: "حجم کتابخانه", detail: "مصرف فایل‌های رسانه‌ای", value: null, count: formatSize(totalSizeBytes), icon: ImageIcon, tone: "text-slate-700" }
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
          <section className="rounded-md border border-app-border bg-white px-4 py-3">
            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
              <div>
                <p className="text-[10px] font-black text-app-primary">کتابخانه دارایی‌ها</p>
                <h1 className="mt-1 text-xl font-black text-app-text">رسانه‌های فضای کاری</h1>
                <p className="mt-1 text-xs leading-5 text-app-muted">تصاویر را جست‌وجو، بررسی و برای استفاده در پست‌های روبیکا آماده کنید.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusToken tone={unusedCount ? "success" : "neutral"}>{unusedCount} رسانه آزاد</StatusToken>
                <StatusToken tone="neutral">{formatSize(totalSizeBytes)} حجم کل</StatusToken>
                <Button type="button" size="sm" onClick={() => setShowUploader((current) => !current)}>
                  <UploadCloud className="ml-1.5 h-4 w-4" aria-hidden="true" />
                  آپلود تصویر
                </Button>
              </div>
            </div>
          </section>

          {message ? <NoticeBanner tone="success" title="انجام شد">{message}</NoticeBanner> : null}
          {error ? <NoticeBanner tone="alert" title="نیاز به بررسی">{error}</NoticeBanner> : null}

          <section className="grid overflow-hidden rounded-md border border-app-border bg-white sm:grid-cols-2 xl:grid-cols-4">
            {mediaSummary.map((item) => {
              const Icon = item.icon;
              const active = item.value === mediaFilter;
              const content = (
                <>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-50 ${item.tone}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-baseline gap-2">
                      <span className={`text-lg font-black ${item.tone}`}>{item.count}</span>
                      <span className="truncate text-xs font-bold text-app-text">{item.label}</span>
                    </span>
                    <span className="mt-1 block truncate text-[11px] text-app-muted">{item.detail}</span>
                  </span>
                </>
              );

              return item.value ? (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setMediaFilter(item.value)}
                  className={`flex min-w-0 items-start gap-3 border-b border-app-border p-3 text-right transition hover:bg-slate-50 sm:border-l sm:last:border-l-0 xl:border-b-0 ${
                    active ? "bg-blue-50/60 ring-1 ring-inset ring-blue-200" : ""
                  }`}
                >
                  {content}
                </button>
              ) : (
                <div key={item.label} className="flex min-w-0 items-start gap-3 border-b border-app-border p-3 sm:border-l sm:last:border-l-0 xl:border-b-0">
                  {content}
                </div>
              );
            })}
          </section>

          {showUploader ? (
            <WorkspacePanel
              title="آپلود تصویر جدید"
              description="JPG، PNG یا WEBP را به کتابخانه اضافه کنید."
              action={<StatusToken tone={file ? "primary" : "neutral"}>{file ? "فایل انتخاب شد" : "آماده انتخاب"}</StatusToken>}
              bodyClassName="p-3"
            >
              <form onSubmit={upload} className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto] lg:items-center">
                <label className="block cursor-pointer rounded-md border border-dashed border-app-border bg-slate-50 px-3 py-3 transition hover:border-blue-200 hover:bg-blue-50/60">
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
                  <span className="mt-1 block truncate text-xs text-app-muted">
                    {file ? `${file.name} · ${formatSize(file.size)}` : "تصویر محصول یا محتوای آماده را انتخاب کنید."}
                  </span>
                </label>
                {selectedFilePreviewUrl ? (
                  <img src={selectedFilePreviewUrl} alt="پیش‌نمایش تصویر انتخاب‌شده" className="aspect-video w-full rounded-md object-cover ring-1 ring-app-border" />
                ) : (
                  <div className="flex aspect-video items-center justify-center rounded-md bg-slate-50 text-xs text-app-muted ring-1 ring-app-border">
                    پیش‌نمایش فایل
                  </div>
                )}
                <div className="flex flex-wrap gap-2 lg:flex-col">
                  <Button type="submit" disabled={!file || uploading}>
                    {uploading ? "در حال آپلود..." : "ثبت تصویر"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => {
                    setFile(null);
                    setShowUploader(false);
                  }}>
                    بستن
                  </Button>
                </div>
              </form>
            </WorkspacePanel>
          ) : null}

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
            <div className="min-w-0 space-y-4">
              <WorkspacePanel
                title="دارایی‌های رسانه‌ای"
                description="برای دیدن جزئیات و مدیریت اتصال، یک تصویر را انتخاب کنید."
                action={<Button href="/compose" variant="secondary" size="sm">ساخت پست با رسانه</Button>}
                bodyClassName="p-4"
              >
                <WorkspaceToolbar
                  meta={<StatusToken tone="neutral">{filteredAssets.length} نتیجه</StatusToken>}
                  className="mb-4"
                >
                  <label className="flex min-w-0 items-center gap-2 rounded-md border border-app-border bg-white px-3 py-2">
                    <Search className="h-4 w-4 shrink-0 text-app-muted" aria-hidden="true" />
                    <input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="جست‌وجو بر اساس نام فایل یا عنوان پست"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    />
                  </label>
                </WorkspaceToolbar>
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
