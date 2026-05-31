"use client";

import { DragEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, FileImage, Folder, Grid2X2, Hash, ImageIcon, Images, Link2, List, Save, Search, SlidersHorizontal, UploadCloud, X, XCircle } from "lucide-react";
import { AuthGate } from "../../components/auth-gate";
import { AppShell } from "../../components/app-shell";
import { LoadingRows } from "../../components/loading-skeleton";
import { StatusBadge } from "../../components/status-badge";
import { useToast } from "../../components/toast-provider";
import { Button } from "../../components/ui/button";
import { Field, Input } from "../../components/ui/form";
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
  folder: string;
  tags: string;
  url: string;
};

type PostOption = {
  id: number;
  title: string;
  status: string;
};

type MediaFilter = "all" | "attached" | "unused";
type MediaView = "grid" | "list";
type InspectorTab = "details" | "attach";

function formatSize(size: number) {
  if (!size) return "0 KB";
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function tagList(value: string) {
  return value.split(/[,،\n]/).map((tag) => tag.trim()).filter(Boolean);
}

export default function MediaPage() {
  const { showToast } = useToast();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [posts, setPosts] = useState<PostOption[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilePreviewUrl, setSelectedFilePreviewUrl] = useState("");
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<Record<number, string>>({});
  const [showUploader, setShowUploader] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadFolder, setUploadFolder] = useState("");
  const [uploadTags, setUploadTags] = useState("");
  const [folderFilter, setFolderFilter] = useState("all");
  const [mediaView, setMediaView] = useState<MediaView>("grid");
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("details");
  const [metadataFolder, setMetadataFolder] = useState("");
  const [metadataTags, setMetadataTags] = useState("");
  const [savingMetadata, setSavingMetadata] = useState(false);
  const [draggingAssetId, setDraggingAssetId] = useState<number | null>(null);
  const [dropTargetPostId, setDropTargetPostId] = useState<number | null>(null);
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
    if (files.length === 0) {
      setSelectedFilePreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(files[0]);
    setSelectedFilePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [files]);

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
    if (files.length === 0) return;
    setUploading(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("folder", uploadFolder);
      formData.append("tags", uploadTags);
      const response = await fetch(`${apiUrl}/media/batch`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
        body: formData
      });
      if (!response.ok) throw new Error("آپلود تصاویر ناموفق بود");
      const uploadedAssets = (await response.json()) as MediaAsset[];
      setFiles([]);
      setShowUploader(false);
      setSelectedAssetId(uploadedAssets[0] ? String(uploadedAssets[0].id) : "");
      setMediaFilter("all");
      setFolderFilter("all");
      setSearchTerm("");
      setUploadFolder("");
      setUploadTags("");
      setMessage(`${uploadedAssets.length} تصویر آپلود شد`);
      showToast({ title: `${uploadedAssets.length} تصویر آپلود شد`, description: uploadFolder.trim() ? `پوشه: ${uploadFolder.trim()}` : "به کتابخانه رسانه اضافه شد.", tone: "success" });
      await loadData();
    } catch (err) {
      const nextError = err instanceof Error ? err.message : "خطای آپلود تصویر";
      setError(nextError);
      showToast({ title: "آپلود تصویر ناموفق بود", description: nextError, tone: "alert" });
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
      showToast({ title: "اتصال تصویر ناموفق بود", description: "دوباره تلاش کنید.", tone: "alert" });
      return;
    }

    setMessage("اتصال تصویر به پست ذخیره شد");
    showToast({ title: "اتصال تصویر ذخیره شد", description: postId ? "رسانه به پست انتخاب‌شده متصل شد." : "رسانه از پست جدا شد.", tone: "success" });
    await loadData();
  }

  function startDraggingAsset(event: DragEvent<HTMLButtonElement>, assetId: number) {
    event.dataTransfer.effectAllowed = "link";
    event.dataTransfer.setData("text/plain", String(assetId));
    setSelectedAssetId(String(assetId));
    setInspectorTab("attach");
    setDraggingAssetId(assetId);
  }

  function stopDraggingAsset() {
    setDraggingAssetId(null);
    setDropTargetPostId(null);
  }

  function clearSelectedAsset() {
    setSelectedAssetId("");
    setInspectorTab("details");
    stopDraggingAsset();
  }

  function allowPostDrop(event: DragEvent<HTMLButtonElement>, postId: number) {
    if (!draggingAssetId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "link";
    setDropTargetPostId(postId);
  }

  function dropAssetOnPost(event: DragEvent<HTMLButtonElement>, postId: number) {
    event.preventDefault();
    const assetId = Number(event.dataTransfer.getData("text/plain") || draggingAssetId);
    stopDraggingAsset();
    if (assetId) void attachToPost(assetId, String(postId));
  }

  async function saveMetadata(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedAsset) return;
    setSavingMetadata(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${apiUrl}/media/${selectedAsset.id}/metadata`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`
        },
        body: JSON.stringify({ folder: metadataFolder, tags: metadataTags })
      });
      if (!response.ok) throw new Error("ذخیره دسته‌بندی رسانه ناموفق بود");
      const savedAsset = await response.json() as MediaAsset;
      setAssets((current) => current.map((asset) => asset.id === savedAsset.id ? savedAsset : asset));
      setMessage("دسته‌بندی رسانه ذخیره شد");
      showToast({ title: "دسته‌بندی رسانه ذخیره شد", description: savedAsset.original_filename, tone: "success" });
    } catch (err) {
      const nextError = err instanceof Error ? err.message : "خطای ذخیره دسته‌بندی";
      setError(nextError);
      showToast({ title: "ذخیره دسته‌بندی ناموفق بود", description: nextError, tone: "alert" });
    } finally {
      setSavingMetadata(false);
    }
  }

  const postById = useMemo(() => {
    return new Map(posts.map((post) => [post.id, post]));
  }, [posts]);

  const selectedAsset = useMemo(() => {
    if (!selectedAssetId) return null;
    return assets.find((asset) => String(asset.id) === selectedAssetId) ?? null;
  }, [assets, selectedAssetId]);

  useEffect(() => {
    setMetadataFolder(selectedAsset?.folder ?? "");
    setMetadataTags(selectedAsset?.tags ?? "");
  }, [selectedAsset]);

  const selectedLinkedPost = selectedAsset?.post_id ? postById.get(selectedAsset.post_id) ?? null : null;
  const attachedCount = assets.filter((asset) => asset.post_id).length;
  const unusedCount = assets.length - attachedCount;
  const totalSizeBytes = assets.reduce((total, asset) => total + asset.size_bytes, 0);
  const folders = useMemo(() => Array.from(new Set(assets.map((asset) => asset.folder.trim()).filter(Boolean))).sort(), [assets]);
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
      const matchesFolder = folderFilter === "all" || asset.folder === folderFilter;
      const linkedPost = asset.post_id ? postById.get(asset.post_id) : null;
      const searchableText = `${asset.original_filename} ${asset.content_type} ${asset.folder} ${asset.tags} ${linkedPost?.title ?? ""}`.toLowerCase();
      return matchesFilter && matchesFolder && (!normalizedSearch || searchableText.includes(normalizedSearch));
    });
  }, [assets, folderFilter, mediaFilter, postById, searchTerm]);

  const selectedPreviewUrl = selectedAsset ? mediaPreviewUrls[selectedAsset.id] : "";
  const hasActiveFilters = mediaFilter !== "all" || folderFilter !== "all" || Boolean(searchTerm.trim());

  function clearFilters() {
    setMediaFilter("all");
    setFolderFilter("all");
    setSearchTerm("");
  }

  return (
    <AuthGate>
      <AppShell>
        <WorkspacePage>
          <section className="app-studio-panel rounded-lg px-4 py-3">
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
                  آپلود تصاویر
                </Button>
              </div>
            </div>
          </section>

          {message ? <NoticeBanner tone="success" title="انجام شد">{message}</NoticeBanner> : null}
          {error ? <NoticeBanner tone="alert" title="نیاز به بررسی">{error}</NoticeBanner> : null}

          <section className="app-studio-surface grid overflow-hidden rounded-lg sm:grid-cols-2 xl:grid-cols-4">
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
              title="آپلود گروهی تصاویر"
              description="تا 20 فایل JPG، PNG یا WEBP را با پوشه و برچسب مشترک به کتابخانه اضافه کنید."
              action={<StatusToken tone={files.length ? "primary" : "neutral"}>{files.length ? `${files.length} فایل انتخاب شد` : "آماده انتخاب"}</StatusToken>}
              bodyClassName="p-3"
            >
              <form onSubmit={upload} className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
                <div className="space-y-4">
                  <label className="app-interactive block cursor-pointer rounded-md border border-dashed border-app-borderStrong bg-app-surfaceMuted px-3 py-4 hover:border-blue-300 hover:bg-blue-50">
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) => {
                        setFiles(Array.from(event.target.files ?? []).slice(0, 20));
                        setMessage("");
                        setError("");
                      }}
                      className="sr-only"
                    />
                    <span className="flex items-center gap-2 text-sm font-black text-app-text">
                      <UploadCloud className="h-5 w-5 text-app-primary" aria-hidden="true" />
                      انتخاب چند تصویر از سیستم
                    </span>
                    <span className="mt-1 block text-xs text-app-muted">
                      {files.length ? `${files.length} فایل · ${formatSize(files.reduce((total, file) => total + file.size, 0))}` : "تصاویر محصول یا محتوای آماده را یک‌جا انتخاب کنید."}
                    </span>
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="پوشه" hint="برای کمپین، محصول یا فصل محتوایی.">
                      <Input value={uploadFolder} onChange={(event) => setUploadFolder(event.target.value)} placeholder="مثلاً لانچ خرداد" />
                    </Field>
                    <Field label="برچسب‌ها" hint="با ویرگول جدا کنید.">
                      <Input value={uploadTags} onChange={(event) => setUploadTags(event.target.value)} placeholder="محصول، بنر، فروش ویژه" />
                    </Field>
                  </div>

                  {files.length ? (
                    <div className="flex flex-wrap gap-2">
                      {files.slice(0, 6).map((file) => <Tag key={`${file.name}-${file.size}`}>{file.name}</Tag>)}
                      {files.length > 6 ? <Tag tone="primary">+{files.length - 6} فایل دیگر</Tag> : null}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" disabled={!files.length || uploading}>
                      {uploading ? "در حال آپلود..." : `ثبت ${files.length || ""} تصویر`}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => {
                      setFiles([]);
                      setShowUploader(false);
                    }}>
                      بستن
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  {selectedFilePreviewUrl ? (
                    <img src={selectedFilePreviewUrl} alt="پیش‌نمایش اولین تصویر انتخاب‌شده" className="aspect-video w-full rounded-md object-cover ring-1 ring-app-border" />
                  ) : (
                    <div className="flex aspect-video items-center justify-center rounded-md bg-slate-50 text-xs text-app-muted ring-1 ring-app-border">
                      پیش‌نمایش اولین فایل
                    </div>
                  )}
                  {files.length > 1 ? <Tag tone="primary" className="absolute left-2 top-2">+{files.length - 1} تصویر</Tag> : null}
                </div>
              </form>
            </WorkspacePanel>
          ) : null}

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
            <div className="min-w-0 space-y-4">
              <WorkspacePanel
                title="دارایی‌های رسانه‌ای"
                description="برای دیدن جزئیات و مدیریت اتصال، یک تصویر را انتخاب کنید."
                action={(
                  <div className="flex items-center gap-2">
                    <div className="inline-flex rounded-md bg-app-surfaceMuted p-1 shadow-hairline">
                      <button
                        type="button"
                        onClick={() => setMediaView("grid")}
                        className={`app-interactive rounded p-1.5 ${mediaView === "grid" ? "bg-white text-app-primary shadow-sm" : "text-slate-500 hover:text-app-primary"}`}
                        aria-label="نمایش شبکه‌ای"
                        title="نمایش شبکه‌ای"
                      >
                        <Grid2X2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setMediaView("list")}
                        className={`app-interactive rounded p-1.5 ${mediaView === "list" ? "bg-white text-app-primary shadow-sm" : "text-slate-500 hover:text-app-primary"}`}
                        aria-label="نمایش فهرستی"
                        title="نمایش فهرستی"
                      >
                        <List className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                    <Button href="/compose" variant="secondary" size="sm">ساخت پست</Button>
                  </div>
                )}
                bodyClassName="p-4"
              >
                <WorkspaceToolbar
                  meta={(
                    <>
                      {hasActiveFilters ? (
                        <button type="button" onClick={clearFilters} className="app-interactive inline-flex items-center gap-1 text-xs font-bold text-app-primary hover:text-app-primaryHover">
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                          پاک کردن فیلترها
                        </button>
                      ) : null}
                      <StatusToken tone="neutral">{filteredAssets.length} نتیجه</StatusToken>
                    </>
                  )}
                  className="mb-4"
                >
                  <label className="flex min-w-0 items-center gap-2 rounded-md bg-white px-3 py-2 shadow-hairline">
                    <Search className="h-4 w-4 shrink-0 text-app-muted" aria-hidden="true" />
                    <input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="جست‌وجو بر اساس نام فایل یا عنوان پست"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    />
                  </label>
                </WorkspaceToolbar>
                {folders.length ? (
                  <div className="mb-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => setFolderFilter("all")} className={`app-interactive rounded px-2.5 py-1.5 text-xs font-bold ${folderFilter === "all" ? "bg-app-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-app-primary"}`}>
                      همه پوشه‌ها
                    </button>
                    {folders.map((folder) => (
                      <button key={folder} type="button" onClick={() => setFolderFilter(folder)} className={`app-interactive inline-flex items-center gap-1 rounded px-2.5 py-1.5 text-xs font-bold ${folderFilter === folder ? "bg-app-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-app-primary"}`}>
                        <Folder className="h-3.5 w-3.5" aria-hidden="true" />
                        {folder}
                      </button>
                    ))}
                  </div>
                ) : null}
                {loading ? <LoadingRows rows={3} /> : null}
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
                  <div className={mediaView === "grid" ? "grid gap-3 md:grid-cols-2 2xl:grid-cols-3" : "grid gap-2"}>
                    {filteredAssets.map((asset) => {
                      const previewUrl = mediaPreviewUrls[asset.id];
                      const linkedPost = asset.post_id ? postById.get(asset.post_id) : null;
                      const selected = selectedAssetId === String(asset.id);

                      return (
                        <button
                          key={asset.id}
                          type="button"
                          draggable
                          aria-pressed={selected}
                          onClick={() => {
                            if (selected) {
                              clearSelectedAsset();
                            } else {
                              setSelectedAssetId(String(asset.id));
                              setInspectorTab("details");
                            }
                          }}
                          onDragStart={(event) => startDraggingAsset(event, asset.id)}
                          onDragEnd={stopDraggingAsset}
                          title="برای اتصال سریع، رسانه را روی پست مقصد بکشید."
                          className={`cursor-grab overflow-hidden rounded-md bg-white text-right shadow-hairline transition active:cursor-grabbing hover:shadow-soft ${
                            mediaView === "list" ? "flex min-w-0 items-stretch" : ""
                          } ${
                            selected ? "ring-2 ring-app-primary" : ""
                          }`}
                        >
                          <div className={`relative shrink-0 ${mediaView === "list" ? "w-32 sm:w-44" : ""}`}>
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
                            {selected ? <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-app-primary text-white shadow-sm"><CheckCircle2 className="h-4 w-4" aria-hidden="true" /></span> : null}
                          </div>
                          <div className="min-w-0 flex-1 p-3">
                            <p className="truncate text-sm font-black text-app-text" title={asset.original_filename}>{asset.original_filename}</p>
                            <p className="mt-1 text-xs text-app-muted">{asset.content_type} · {formatSize(asset.size_bytes)}</p>
                            {asset.folder ? (
                              <p className="mt-2 flex items-center gap-1 truncate text-[11px] font-bold text-app-primary">
                                <Folder className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                {asset.folder}
                              </p>
                            ) : null}
                            {tagList(asset.tags).length ? (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {tagList(asset.tags).slice(0, 3).map((tag) => <Tag key={tag}>{tag}</Tag>)}
                              </div>
                            ) : null}
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
                action={selectedAsset ? (
                  <div className="flex items-center gap-2">
                    <StatusToken tone={selectedLinkedPost ? "primary" : "success"}>{selectedLinkedPost ? "در استفاده" : "آزاد"}</StatusToken>
                    <button
                      type="button"
                      onClick={clearSelectedAsset}
                      className="app-interactive flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-app-text"
                      aria-label="لغو انتخاب رسانه"
                      title="لغو انتخاب رسانه"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ) : null}
                bodyClassName="p-0"
              >
                <div className="grid grid-cols-2 border-b border-app-border bg-app-surfaceMuted p-1">
                  <button
                    type="button"
                    onClick={() => setInspectorTab("details")}
                    className={`app-interactive flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-black ${inspectorTab === "details" ? "bg-white text-app-primary shadow-sm" : "text-slate-500 hover:text-app-text"}`}
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                    جزئیات
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectorTab("attach")}
                    className={`app-interactive flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-black ${inspectorTab === "attach" ? "bg-white text-app-primary shadow-sm" : "text-slate-500 hover:text-app-text"}`}
                  >
                    <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
                    اتصال به پست
                  </button>
                </div>
                {inspectorTab === "details" && selectedAsset ? (
                  <div className="p-4">
                    {selectedPreviewUrl ? (
                      <img src={selectedPreviewUrl} alt={selectedAsset.original_filename} className="aspect-video max-h-64 w-full rounded-md object-cover ring-1 ring-app-border xl:max-h-none" />
                    ) : (
                      <div className="flex h-56 w-full items-center justify-center rounded-md bg-slate-50 text-xs text-app-muted ring-1 ring-app-border xl:h-auto xl:aspect-video">
                        پیش‌نمایش در دسترس نیست
                      </div>
                    )}

                    <div className="mt-4">
                      <DetailGrid
                        items={[
                          { label: "نام فایل", value: <span className="break-words">{selectedAsset.original_filename}</span>, hint: "نام اصلی فایل" },
                          { label: "نوع", value: selectedAsset.content_type, hint: "فرمت آپلود" },
                          { label: "حجم", value: formatSize(selectedAsset.size_bytes), hint: "اندازه فایل" },
                          { label: "شناسه", value: `#${selectedAsset.id}`, hint: "شناسه داخلی" },
                          { label: "پوشه", value: selectedAsset.folder || "بدون پوشه", hint: "دسته‌بندی کتابخانه" },
                          { label: "برچسب", value: tagList(selectedAsset.tags).length || "بدون برچسب", hint: "تعداد برچسب‌ها" }
                        ]}
                      />
                    </div>

                    <form onSubmit={saveMetadata} className="mt-4 rounded-md bg-app-surfaceMuted p-3 shadow-hairline">
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4 text-app-primary" aria-hidden="true" />
                        <p className="text-xs font-black text-app-text">سازمان‌دهی رسانه</p>
                      </div>
                      <div className="mt-3 grid gap-3">
                        <Field label="پوشه">
                          <Input value={metadataFolder} onChange={(event) => setMetadataFolder(event.target.value)} placeholder="مثلاً محصولات تابستانی" />
                        </Field>
                        <Field label="برچسب‌ها" hint="برای جست‌وجوی سریع‌تر با ویرگول جدا کنید.">
                          <Input value={metadataTags} onChange={(event) => setMetadataTags(event.target.value)} placeholder="محصول، استوری، فروش ویژه" />
                        </Field>
                      </div>
                      {tagList(metadataTags).length ? (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {tagList(metadataTags).map((tag) => <Tag key={tag}><Hash className="ml-1 h-3 w-3" aria-hidden="true" />{tag}</Tag>)}
                        </div>
                      ) : null}
                      <Button type="submit" variant="secondary" size="sm" className="mt-3 w-full" disabled={savingMetadata}>
                        <Save className="ml-2 h-4 w-4" aria-hidden="true" />
                        {savingMetadata ? "در حال ذخیره..." : "ذخیره دسته‌بندی"}
                      </Button>
                    </form>

                    <div className="mt-4 rounded-md bg-app-surfaceMuted p-3 shadow-hairline">
                      <p className="text-xs font-black text-app-muted">وضعیت اتصال</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Tag tone={selectedLinkedPost ? "primary" : "success"}>{selectedLinkedPost ? "متصل به پست" : "بدون اتصال"}</Tag>
                        {selectedLinkedPost ? <StatusBadge status={selectedLinkedPost.status} /> : null}
                      </div>
                      {selectedLinkedPost ? <p className="mt-2 text-sm font-black text-app-text">{selectedLinkedPost.title}</p> : null}
                    </div>

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
                ) : inspectorTab === "details" ? (
                  <EmptyState
                    icon={<FileImage className="h-5 w-5" aria-hidden="true" />}
                    title="رسانه‌ای انتخاب نشده"
                    description="برای دیدن جزئیات، یک تصویر را از برد رسانه انتخاب کنید."
                  />
                ) : (
                  <div className="p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <p className="text-xs font-black text-app-text">انتخاب مقصد</p>
                      <StatusToken tone={draggingAssetId ? "primary" : "neutral"}>{draggingAssetId ? "مقصد را انتخاب کنید" : "اتصال سریع"}</StatusToken>
                    </div>
                    {posts.length ? (
                      <div className="grid gap-2">
                        {posts.slice(0, 8).map((post) => {
                          const isDropTarget = dropTargetPostId === post.id;
                          return (
                            <button
                              key={post.id}
                              type="button"
                              disabled={!selectedAsset && !draggingAssetId}
                              onClick={() => selectedAsset && void attachToPost(selectedAsset.id, String(post.id))}
                              onDragOver={(event) => allowPostDrop(event, post.id)}
                              onDragLeave={() => setDropTargetPostId(null)}
                              onDrop={(event) => dropAssetOnPost(event, post.id)}
                              className={`app-interactive flex min-w-0 items-center justify-between gap-3 rounded-md px-3 py-2 text-right shadow-hairline disabled:cursor-not-allowed disabled:opacity-55 ${
                                isDropTarget ? "bg-blue-50 ring-2 ring-app-primary" : "bg-white hover:bg-slate-50"
                              }`}
                            >
                              <span className="min-w-0">
                                <span className="block truncate text-xs font-black text-app-text">{post.title}</span>
                                <span className="mt-1 block text-[11px] text-app-muted">برای اتصال رسانه انتخاب کنید</span>
                              </span>
                              <StatusBadge status={post.status} />
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <EmptyState title="هنوز پستی ساخته نشده است" description="برای استفاده از اتصال سریع، ابتدا یک پست بسازید." />
                    )}
                    {selectedAsset ? (
                      <label className="mt-4 block text-xs font-bold text-app-muted">
                        اتصال دقیق
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
                    ) : null}
                  </div>
                )}
              </WorkspacePanel>
            </aside>
          </section>
        </WorkspacePage>
      </AppShell>
    </AuthGate>
  );
}
