"use client";

import { AlignCenter, AlignLeft, AlignRight, ImagePlus, Palette, Redo2, RotateCcw, Save, SmilePlus, Trash2, Type, X } from "lucide-react";
import { PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { StatusToken } from "./workspace-ui";

type EditorLayer = {
  id: string;
  type: "text" | "sticker";
  value: string;
  x: number;
  y: number;
  color: string;
  fontFamily: string;
  fontSize: number;
  align: "left" | "center" | "right";
};

type ImageAdjustments = {
  brightness: number;
  contrast: number;
  saturation: number;
};

type MediaImageEditorProps = {
  imageUrl: string;
  filename: string;
  saving?: boolean;
  onClose: () => void;
  onSave: (file: File) => Promise<void>;
};

const colorSwatches = ["#FFFFFF", "#0F172A", "#0F766E", "#2563EB", "#E11D48", "#F59E0B", "#7C3AED", "#16A34A"];
const stickers = ["✨", "🔥", "🎉", "❤️", "⭐", "✅", "📣", "🛍️", "🎁", "💎", "🌿", "☀️"];
const fontOptions = [
  { label: "وزیرمتن", value: "Vazirmatn" },
  { label: "لاله‌زار", value: "Lalezar" },
  { label: "نسخ نوتو", value: "Noto Naskh Arabic" },
  { label: "Tahoma", value: "Tahoma" }
];
const initialAdjustments: ImageAdjustments = { brightness: 100, contrast: 100, saturation: 100 };

function createLayerId() {
  return `layer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function imageFilter(adjustments: ImageAdjustments) {
  return `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`;
}

export function MediaImageEditor({ imageUrl, filename, saving = false, onClose, onSave }: MediaImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ layerId: string; offsetX: number; offsetY: number } | null>(null);
  const [layers, setLayers] = useState<EditorLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState("");
  const [draftText, setDraftText] = useState("متن جدید");
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(initialAdjustments);
  const [imageReady, setImageReady] = useState(false);
  const [error, setError] = useState("");

  const selectedLayer = useMemo(() => layers.find((layer) => layer.id === selectedLayerId) ?? null, [layers, selectedLayerId]);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.filter = imageFilter(adjustments);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    context.restore();

    layers.forEach((layer) => {
      context.save();
      context.textAlign = layer.align;
      context.textBaseline = "middle";
      context.direction = "rtl";
      context.fillStyle = layer.color;
      context.font = `${layer.type === "sticker" ? Math.round(layer.fontSize * 1.2) : layer.fontSize}px ${layer.type === "sticker" ? "Arial" : layer.fontFamily}`;
      context.shadowColor = "rgba(15, 23, 42, 0.32)";
      context.shadowBlur = Math.max(2, Math.round(layer.fontSize / 14));
      context.shadowOffsetY = Math.max(1, Math.round(layer.fontSize / 22));
      context.fillText(layer.value, layer.x, layer.y);
      context.restore();
    });
  }, [adjustments, layers]);

  useEffect(() => {
    setImageReady(false);
    setError("");
    const image = new Image();
    image.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const maxWidth = 1600;
      const scale = Math.min(1, maxWidth / image.naturalWidth);
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      imageRef.current = image;
      setImageReady(true);
    };
    image.onerror = () => setError("بارگذاری تصویر برای ویرایش ناموفق بود.");
    image.src = imageUrl;
    return () => {
      imageRef.current = null;
    };
  }, [imageUrl]);

  useEffect(() => {
    if (imageReady) renderCanvas();
  }, [imageReady, renderCanvas]);

  function canvasPoint(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const bounds = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) * (canvas.width / bounds.width),
      y: (event.clientY - bounds.top) * (canvas.height / bounds.height)
    };
  }

  function hitLayer(point: { x: number; y: number }) {
    return [...layers].reverse().find((layer) => {
      const estimatedWidth = Math.max(layer.fontSize, layer.value.length * layer.fontSize * (layer.type === "sticker" ? 0.8 : 0.52));
      const left = layer.align === "center" ? layer.x - estimatedWidth / 2 : layer.align === "right" ? layer.x - estimatedWidth : layer.x;
      return point.x >= left - 16 && point.x <= left + estimatedWidth + 16 && point.y >= layer.y - layer.fontSize && point.y <= layer.y + layer.fontSize;
    }) ?? null;
  }

  function startDrag(event: PointerEvent<HTMLCanvasElement>) {
    const point = canvasPoint(event);
    const layer = hitLayer(point);
    if (!layer) {
      setSelectedLayerId("");
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedLayerId(layer.id);
    dragRef.current = { layerId: layer.id, offsetX: point.x - layer.x, offsetY: point.y - layer.y };
  }

  function dragLayer(event: PointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const point = canvasPoint(event);
    setLayers((current) => current.map((layer) => layer.id === drag.layerId ? { ...layer, x: point.x - drag.offsetX, y: point.y - drag.offsetY } : layer));
  }

  function stopDrag() {
    dragRef.current = null;
  }

  function addText() {
    const canvas = canvasRef.current;
    if (!canvas || !draftText.trim()) return;
    const layer: EditorLayer = {
      id: createLayerId(),
      type: "text",
      value: draftText.trim(),
      x: canvas.width / 2,
      y: canvas.height / 2,
      color: "#FFFFFF",
      fontFamily: "Vazirmatn",
      fontSize: Math.max(28, Math.round(canvas.width / 18)),
      align: "center"
    };
    setLayers((current) => [...current, layer]);
    setSelectedLayerId(layer.id);
  }

  function addSticker(value: string) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const layer: EditorLayer = {
      id: createLayerId(),
      type: "sticker",
      value,
      x: canvas.width / 2,
      y: canvas.height / 2,
      color: "#FFFFFF",
      fontFamily: "Arial",
      fontSize: Math.max(36, Math.round(canvas.width / 14)),
      align: "center"
    };
    setLayers((current) => [...current, layer]);
    setSelectedLayerId(layer.id);
  }

  function updateSelectedLayer(patch: Partial<EditorLayer>) {
    if (!selectedLayerId) return;
    setLayers((current) => current.map((layer) => layer.id === selectedLayerId ? { ...layer, ...patch } : layer));
  }

  function removeSelectedLayer() {
    if (!selectedLayerId) return;
    setLayers((current) => current.filter((layer) => layer.id !== selectedLayerId));
    setSelectedLayerId("");
  }

  function resetEditor() {
    setLayers([]);
    setSelectedLayerId("");
    setAdjustments(initialAdjustments);
    setError("");
  }

  async function saveEditedImage() {
    const canvas = canvasRef.current;
    if (!canvas || !imageReady) return;
    setError("");
    renderCanvas();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 0.94));
    if (!blob) {
      setError("ساخت خروجی تصویر ناموفق بود.");
      return;
    }
    const baseName = filename.replace(/\.[^.]+$/, "") || "image";
    await onSave(new File([blob], `${baseName}-edited.png`, { type: "image/png" }));
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="ویرایشگر تصویر">
      <section className="flex max-h-[96vh] w-full max-w-[1480px] flex-col overflow-hidden rounded-lg border border-app-border bg-app-canvas shadow-2xl">
        <header className="flex flex-col justify-between gap-3 border-b border-app-border bg-white px-4 py-3 lg:flex-row lg:items-center">
          <div>
            <p className="text-[10px] font-black text-app-primary">استودیوی خلاقه</p>
            <h2 className="mt-1 text-lg font-black text-app-text">ویرایش تصویر</h2>
            <p className="mt-1 text-xs text-app-muted">{filename} · نسخه جدید در کتابخانه ذخیره می‌شود و فایل اصلی دست‌نخورده می‌ماند.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusToken tone={layers.length ? "primary" : "neutral"}>{layers.length} لایه</StatusToken>
            <Button type="button" variant="secondary" size="sm" onClick={resetEditor}>
              <RotateCcw className="ml-1.5 h-4 w-4" aria-hidden="true" />
              بازنشانی
            </Button>
            <Button type="button" size="sm" disabled={!imageReady || saving} onClick={() => void saveEditedImage()}>
              <Save className="ml-1.5 h-4 w-4" aria-hidden="true" />
              {saving ? "در حال ذخیره" : "ذخیره نسخه جدید"}
            </Button>
            <button type="button" onClick={onClose} className="app-interactive flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-app-text" aria-label="بستن ویرایشگر" title="بستن ویرایشگر">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 overflow-auto xl:grid-cols-[280px_minmax(0,1fr)_260px]">
          <aside className="space-y-4 border-b border-app-border bg-white p-4 xl:border-b-0 xl:border-l">
            <section>
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4 text-app-primary" aria-hidden="true" />
                <h3 className="text-xs font-black text-app-text">متن فارسی</h3>
              </div>
              <textarea value={draftText} onChange={(event) => setDraftText(event.target.value)} className="mt-3 min-h-20 w-full resize-y rounded-md border border-app-border bg-app-canvas px-3 py-2 text-sm leading-6 text-app-text outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" dir="rtl" />
              <Button type="button" variant="secondary" size="sm" className="mt-2 w-full" onClick={addText}>
                <ImagePlus className="ml-1.5 h-4 w-4" aria-hidden="true" />
                افزودن متن
              </Button>
            </section>

            <section className="border-t border-app-border pt-4">
              <div className="flex items-center gap-2">
                <SmilePlus className="h-4 w-4 text-app-primary" aria-hidden="true" />
                <h3 className="text-xs font-black text-app-text">استیکر و ایموجی</h3>
              </div>
              <div className="mt-3 grid grid-cols-6 gap-1.5">
                {stickers.map((sticker) => (
                  <button key={sticker} type="button" onClick={() => addSticker(sticker)} className="app-interactive flex aspect-square items-center justify-center rounded-md bg-app-surfaceMuted text-lg hover:bg-blue-50" title={`افزودن ${sticker}`}>
                    {sticker}
                  </button>
                ))}
              </div>
            </section>

            <section className="border-t border-app-border pt-4">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-app-primary" aria-hidden="true" />
                <h3 className="text-xs font-black text-app-text">تنظیم تصویر</h3>
              </div>
              {(["brightness", "contrast", "saturation"] as const).map((field) => (
                <label key={field} className="mt-3 block text-xs font-bold text-app-muted">
                  {field === "brightness" ? "روشنایی" : field === "contrast" ? "کنتراست" : "اشباع رنگ"} · {adjustments[field]}%
                  <input type="range" min="50" max="150" value={adjustments[field]} onChange={(event) => setAdjustments((current) => ({ ...current, [field]: Number(event.target.value) }))} className="mt-2 w-full accent-blue-600" />
                </label>
              ))}
            </section>
          </aside>

          <div className="app-studio-grid flex min-h-[440px] items-center justify-center overflow-auto bg-slate-100 p-4 lg:p-6">
            {error ? <p className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
            <canvas
              ref={canvasRef}
              onPointerDown={startDrag}
              onPointerMove={dragLayer}
              onPointerUp={stopDrag}
              onPointerCancel={stopDrag}
              className={`max-h-[70vh] max-w-full rounded-md bg-white shadow-lift ${imageReady ? "cursor-move" : "hidden"}`}
            />
          </div>

          <aside className="border-t border-app-border bg-white p-4 xl:border-r xl:border-t-0">
            <div className="flex items-center gap-2">
              <Redo2 className="h-4 w-4 text-app-primary" aria-hidden="true" />
              <h3 className="text-xs font-black text-app-text">تنظیم لایه</h3>
            </div>
            {selectedLayer ? (
              <div className="mt-3 space-y-4">
                {selectedLayer.type === "text" ? (
                  <>
                    <label className="block text-xs font-bold text-app-muted">
                      متن
                      <textarea value={selectedLayer.value} onChange={(event) => updateSelectedLayer({ value: event.target.value })} className="mt-2 min-h-20 w-full resize-y rounded-md border border-app-border bg-app-canvas px-3 py-2 text-sm leading-6 text-app-text outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" dir="rtl" />
                    </label>
                    <label className="block text-xs font-bold text-app-muted">
                      فونت فارسی
                      <select value={selectedLayer.fontFamily} onChange={(event) => updateSelectedLayer({ fontFamily: event.target.value })} className="mt-2 w-full rounded-md border border-app-border bg-white px-3 py-2 text-sm text-app-text outline-none focus:border-blue-300">
                        {fontOptions.map((font) => <option key={font.value} value={font.value}>{font.label}</option>)}
                      </select>
                    </label>
                  </>
                ) : (
                  <div className="rounded-md bg-app-surfaceMuted p-3 text-center text-4xl shadow-hairline">{selectedLayer.value}</div>
                )}

                <label className="block text-xs font-bold text-app-muted">
                  اندازه · {selectedLayer.fontSize}px
                  <input type="range" min="20" max="180" value={selectedLayer.fontSize} onChange={(event) => updateSelectedLayer({ fontSize: Number(event.target.value) })} className="mt-2 w-full accent-blue-600" />
                </label>

                {selectedLayer.type === "text" ? (
                  <div>
                    <p className="text-xs font-bold text-app-muted">رنگ متن</p>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {colorSwatches.map((color) => (
                        <button key={color} type="button" onClick={() => updateSelectedLayer({ color })} className={`aspect-square rounded-md border shadow-hairline ${selectedLayer.color === color ? "ring-2 ring-app-primary ring-offset-2" : "border-app-border"}`} style={{ backgroundColor: color }} aria-label={`انتخاب رنگ ${color}`} title={color} />
                      ))}
                    </div>
                    <label className="mt-3 flex items-center justify-between gap-3 rounded-md bg-app-surfaceMuted px-3 py-2 text-xs font-bold text-app-muted shadow-hairline">
                      رنگ دلخواه
                      <input type="color" value={selectedLayer.color} onChange={(event) => updateSelectedLayer({ color: event.target.value })} className="h-7 w-12 cursor-pointer rounded border-0 bg-transparent p-0" />
                    </label>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {([
                        { value: "right", icon: AlignRight, label: "راست‌چین" },
                        { value: "center", icon: AlignCenter, label: "وسط‌چین" },
                        { value: "left", icon: AlignLeft, label: "چپ‌چین" }
                      ] as const).map((option) => {
                        const Icon = option.icon;
                        return (
                          <button key={option.value} type="button" onClick={() => updateSelectedLayer({ align: option.value })} className={`app-interactive flex items-center justify-center rounded-md p-2 ${selectedLayer.align === option.value ? "bg-blue-50 text-app-primary ring-1 ring-blue-200" : "bg-app-surfaceMuted text-slate-500"}`} aria-label={option.label} title={option.label}>
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <Button type="button" variant="danger" size="sm" className="w-full" onClick={removeSelectedLayer}>
                  <Trash2 className="ml-1.5 h-4 w-4" aria-hidden="true" />
                  حذف لایه
                </Button>
              </div>
            ) : (
              <div className="mt-3 rounded-md border border-dashed border-app-borderStrong bg-app-surfaceMuted p-4 text-xs leading-6 text-app-muted">
                یک متن یا استیکر اضافه کنید، سپس آن را روی تصویر بکشید تا مکان دقیقش تنظیم شود.
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}
