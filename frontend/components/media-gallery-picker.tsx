import { useMemo, useState } from "react";
import { Folder, Hash, ImageIcon, Link2, Search } from "lucide-react";
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
      <label className="flex items-center gap-2 rounded-md border border-app-border bg-white px-3 py-2">
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
      <div className="mt-3 grid max-h-[420px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect("")}
          className={`rounded-md border p-2.5 text-right transition ${!selectedMediaId ? "border-app-primary bg-blue-50 ring-2 ring-blue-100" : "border-app-border bg-white hover:bg-slate-50"}`}
        >
          <div className="flex aspect-video items-center justify-center rounded bg-slate-100 text-app-muted">
            <ImageIcon className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="mt-2 text-sm font-bold text-app-text">بدون انتخاب رسانه</p>
          <p className="mt-1 text-xs text-app-muted">پست فقط با متن ذخیره می‌شود.</p>
        </button>

        {filteredAssets.map((asset) => {
          const selected = selectedMediaId === String(asset.id);
          const previewUrl = previewUrls[asset.id];
          const tags = tagList(asset.tags);

          return (
            <button
              key={asset.id}
              type="button"
              onClick={() => onSelect(String(asset.id))}
              className={`overflow-hidden rounded-md border text-right transition ${selected ? "border-app-primary bg-blue-50 ring-2 ring-blue-100" : "border-app-border bg-white hover:bg-slate-50"}`}
            >
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
