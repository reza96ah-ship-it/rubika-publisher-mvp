import { ImageIcon, Send } from "lucide-react";

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
    <div className="rounded-md bg-app-surfaceMuted p-2 shadow-hairline">
      <div className="overflow-hidden rounded-md bg-white shadow-hairline">
        <div className="flex items-center justify-between border-b border-app-border px-3 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-app-primary text-white shadow-sm">
              <Send className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold text-app-text">{destination}</p>
              <p className="text-xs text-app-muted">پیش‌نمایش انتشار</p>
            </div>
          </div>
          <span className="rounded bg-blue-50 px-2 py-1 text-[11px] font-black text-app-primary">Rubika</span>
        </div>

        {imageUrl ? (
          <img src={imageUrl} alt="پیش‌نمایش تصویر پست روبیکا" className="aspect-video w-full object-cover" />
        ) : (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 border-b border-dashed border-app-border bg-slate-50 text-xs text-app-muted">
            <ImageIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
            تصویر اختیاری است
          </div>
        )}

        <div className="min-h-40 whitespace-pre-wrap px-4 py-4 text-sm leading-7 text-slate-700">
          {caption || emptyText}
        </div>

        <div className="flex items-center justify-between border-t border-app-border bg-slate-50 px-4 py-3 text-xs text-app-muted">
          <span>مقصد: {destination}</span>
          <span className="font-bold text-slate-600">پیش‌نویس</span>
        </div>
      </div>
    </div>
  );
}
