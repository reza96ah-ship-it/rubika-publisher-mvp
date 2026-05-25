type RubikaPostPreviewProps = {
  imageUrl?: string;
  caption: string;
  destination?: string;
  emptyText?: string;
};

export function RubikaPostPreview({
  imageUrl,
  caption,
  destination = "کانال روبیکا",
  emptyText = "متن نهایی پست اینجا نمایش داده می‌شود."
}: RubikaPostPreviewProps) {
  return (
    <div className="rounded-md border border-app-border bg-slate-100 p-2">
      <div className="overflow-hidden rounded-md bg-white ring-1 ring-app-border">
        <div className="flex items-center justify-between border-b border-app-border px-3 py-2.5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded bg-blue-100 ring-1 ring-blue-200" />
            <div>
              <p className="text-sm font-bold text-app-text">{destination}</p>
              <p className="text-xs text-app-muted">پیش‌نمایش انتشار</p>
            </div>
          </div>
          <span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-black text-slate-600">Rubika</span>
        </div>

        {imageUrl ? (
          <img src={imageUrl} alt="پیش‌نمایش تصویر پست روبیکا" className="aspect-video w-full object-cover" />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center border-b border-dashed border-app-border bg-slate-50 text-sm text-app-muted">
            تصویری انتخاب نشده است
          </div>
        )}

        <div className="min-h-48 whitespace-pre-wrap px-4 py-4 text-sm leading-7 text-slate-700">
          {caption || emptyText}
        </div>

        <div className="flex items-center justify-between border-t border-app-border bg-slate-50 px-4 py-3 text-xs text-app-muted">
          <span>مقصد: {destination}</span>
          <span>پیش‌نویس</span>
        </div>
      </div>
    </div>
  );
}
