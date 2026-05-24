type MediaAsset = {
  id: number;
  post_id: number | null;
  original_filename: string;
  content_type: string;
  size_bytes: number;
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

export function MediaGalleryPicker({ assets, previewUrls, selectedMediaId, loading = false, onSelect }: MediaGalleryPickerProps) {
  const imageAssets = assets.filter((asset) => asset.content_type.startsWith("image/"));

  if (loading) {
    return <p className="mt-3 text-xs text-app-muted">در حال دریافت رسانه‌ها...</p>;
  }

  if (imageAssets.length === 0) {
    return (
      <div className="mt-3 rounded-xl border border-dashed border-app-border bg-slate-50 p-4 text-center text-sm text-app-muted">
        هنوز تصویری در کتابخانه رسانه وجود ندارد.
      </div>
    );
  }

  return (
    <div className="mt-3 grid max-h-[360px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => onSelect("")}
        className={`rounded-2xl border p-3 text-right transition ${!selectedMediaId ? "border-app-primary bg-blue-50 ring-2 ring-blue-100" : "border-app-border bg-white hover:bg-slate-50"}`}
      >
        <div className="flex aspect-video items-center justify-center rounded-xl bg-slate-100 text-xs text-app-muted">
          بدون تصویر
        </div>
        <p className="mt-3 text-sm font-bold text-app-text">بدون انتخاب رسانه</p>
        <p className="mt-1 text-xs text-app-muted">پست فقط با متن ذخیره می‌شود.</p>
      </button>

      {imageAssets.map((asset) => {
        const selected = selectedMediaId === String(asset.id);
        const previewUrl = previewUrls[asset.id];

        return (
          <button
            key={asset.id}
            type="button"
            onClick={() => onSelect(String(asset.id))}
              className={`overflow-hidden rounded-2xl border text-right transition ${selected ? "border-app-primary bg-blue-50 ring-2 ring-blue-100" : "border-app-border bg-white hover:bg-slate-50"}`}
          >
            {previewUrl ? (
              <img src={previewUrl} alt={asset.original_filename} className="aspect-video w-full object-cover" />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center bg-slate-100 text-xs text-app-muted">
                پیش‌نمایش در دسترس نیست
              </div>
            )}
            <div className="p-3">
              <p className="truncate text-sm font-bold text-app-text" title={asset.original_filename}>{asset.original_filename}</p>
              <p className="mt-1 text-xs text-app-muted">{asset.content_type} · {formatSize(asset.size_bytes)}</p>
              {asset.post_id ? <p className="mt-1 text-xs text-amber-700">متصل به پست {asset.post_id}</p> : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}
