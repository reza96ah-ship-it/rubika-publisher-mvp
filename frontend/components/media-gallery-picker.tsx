import { useMemo, useState } from "react";
import { CheckCircle2, Folder, Hash, ImageIcon, Link2, Search } from "lucide-react";
import { Skeleton } from "./loading-skeleton";
import { Tag } from "./ui/tag";

type MediaAsset = {
  id: number;
  post_id: number | null;
  original_filename: string;
  content_type: string;
  size_bytes: number;
  folder: string;
  tags: string;
};

type MediaGalleryPickerProps = {
  assets: MediaAsset[];
  previewUrls: Record<number, string>;
  selectedMediaId: string;
  loading?: boolean;
  onSelect: (assetId: string) => void;
};

function formatSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function tagList(value: string) {
  return value.split(/[,،\n]/).map((tag) => tag.trim()).filter(Boolean);
}

export function MediaGalleryPicker({ assets, previewUrls, selectedMediaId, loading = false, onSelect }: MediaGalleryPickerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [folderFilter, setFolderFilter] = useState("all");
  const imageAssets = useMemo(() => assets.filter((asset) => asset.content_type.startsWith("image/")), [assets]);
  const folders = useMemo(() => Array.from(new Set(imageAssets.map((asset) => asset.folder.trim()).filter(Boolean))).sort(), [imageAssets]);
  const filteredAssets = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return imageAssets.filter((asset) => {
      const matchesFolder = folderFilter === "all" || asset.folder === folderFilter;
      const searchableText = `${asset.original_filename} ${asset.folder} ${asset.tags}`.toLowerCase();
      return matchesFolder && (!normalizedSearch || searchableText.includes(normalizedSearch));
    });
  }, [folderFilter, imageAssets, searchTerm]);

  if (loading) {
    return (
      <div className="mt-3 grid grid-cols-3 gap-2" aria-label="در حال دریافت رسانه‌ها">
        <Skeleton className="aspect-square w-full" />
        <Skeleton className="aspect-square w-full" />
        <Skeleton className="aspect-square w-full" />
      </div>
    );
  }

  if (imageAssets.length === 0) {
    return (
      <div className="mt-3 rounded-md border border-dashed border-app-border bg-slate-50 p-4 text-center text-sm text-app-muted">
        هنوز تصویری در کتابخانه رسانه وجود ندارد.
      </div>
    );
  }

  return (
    <div>
      <label className="flex items-center gap-2 rounded-md bg-white px-3 py-2 shadow-hairline">
        <Search className="h-4 w-4 shrink-0 text-app-muted" aria-hidden="true" />
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="جست‌وجوی نام، پوشه یا برچسب"
          className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
        />
      </label>
      {folders.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <button type="button" onClick={() => setFolderFilter("all")} className={`rounded px-2 py-1 text-[11px] font-bold ${folderFilter === "all" ? "bg-app-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-app-primary"}`}>
            همه پوشه‌ها
          </button>
          {folders.map((folder) => (
            <button key={folder} type="button" onClick={() => setFolderFilter(folder)} className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-bold ${folderFilter === folder ? "bg-app-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-app-primary"}`}>
              <Folder className="h-3 w-3" aria-hidden="true" />
              {folder}
            </button>
          ))}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => onSelect("")}
        className={`mt-3 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-right transition ${
          !selectedMediaId ? "bg-blue-50 text-app-primary shadow-hairline ring-1 ring-blue-200" : "bg-app-surfaceMuted text-app-muted hover:bg-slate-100"
        }`}
      >
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${!selectedMediaId ? "bg-white text-app-primary" : "bg-white text-app-muted"}`}>
          <ImageIcon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-black">پست بدون تصویر</span>
          <span className="mt-0.5 block text-xs">فقط کپشن برای انتشار استفاده می‌شود.</span>
        </span>
        {!selectedMediaId ? <CheckCircle2 className="mr-auto h-4 w-4 shrink-0 text-app-primary" aria-hidden="true" /> : null}
      </button>
      <div className="mt-3 grid max-h-[360px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
        {filteredAssets.map((asset) => {
          const selected = selectedMediaId === String(asset.id);
          const previewUrl = previewUrls[asset.id];
          const tags = tagList(asset.tags);

          return (
            <button
              key={asset.id}
              type="button"
              onClick={() => onSelect(String(asset.id))}
              className={`relative overflow-hidden rounded-md text-right transition ${selected ? "bg-blue-50 shadow-hairline ring-2 ring-app-primary" : "bg-white shadow-hairline hover:bg-slate-50 hover:shadow-soft"}`}
            >
              {selected ? <span className="absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-app-primary text-white shadow-sm"><CheckCircle2 className="h-4 w-4" aria-hidden="true" /></span> : null}
              {previewUrl ? (
                <img src={previewUrl} alt={asset.original_filename} className="aspect-video w-full object-cover" />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center bg-slate-100 text-xs text-app-muted">
                  پیش‌نمایش در دسترس نیست
                </div>
              )}
              <div className="p-2.5">
                <p className="truncate text-sm font-bold text-app-text" title={asset.original_filename}>{asset.original_filename}</p>
                <p className="mt-1 text-xs text-app-muted">{asset.content_type} · {formatSize(asset.size_bytes)}</p>
                {asset.folder ? <p className="mt-2 flex items-center gap-1 truncate text-[11px] font-bold text-app-primary"><Folder className="h-3 w-3 shrink-0" aria-hidden="true" />{asset.folder}</p> : null}
                {tags.length ? <div className="mt-2 flex flex-wrap gap-1">{tags.slice(0, 2).map((tag) => <Tag key={tag}><Hash className="ml-1 h-3 w-3" aria-hidden="true" />{tag}</Tag>)}</div> : null}
                {asset.post_id ? <p className="mt-2 flex items-center gap-1 text-[11px] text-amber-700"><Link2 className="h-3 w-3" aria-hidden="true" />متصل به پست {asset.post_id}</p> : null}
              </div>
            </button>
          );
        })}
        {filteredAssets.length === 0 ? (
          <div className="rounded-md border border-dashed border-app-border bg-slate-50 p-4 text-center text-xs leading-5 text-app-muted sm:col-span-2">
            رسانه‌ای با این جست‌وجو یا پوشه پیدا نشد.
          </div>
        ) : null}
      </div>
    </div>
  );
}
