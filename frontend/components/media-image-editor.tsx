"use client";

import { AlignCenter, AlignLeft, AlignRight, ArrowDown, ArrowUp, Copy, Crop, Eye, EyeOff, FlipHorizontal, GripVertical, Group, ImagePlus, Layers3, Lock, Maximize2, Minus, Palette, Plus, RectangleHorizontal, Redo2, RotateCcw, RotateCw, Save, ShieldCheck, SmilePlus, Square, Trash2, Type, Undo2, Ungroup, Unlock, X, type LucideIcon } from "lucide-react";
import { PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "./ui/button";
import { StatusToken } from "./workspace-ui";

type EditorLayer = {
  id: string;
  type: "text" | "sticker";
  value: string;
  x: number;
  y: number;
  color: string;
  backgroundColor: string;
  backgroundOpacity: number;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  boxWidth: number;
  padding: number;
  radius: number;
  outlineColor: string;
  outlineWidth: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetY: number;
  align: "left" | "center" | "right";
  rotation: number;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  groupId?: string;
};

type ImageAdjustments = {
  brightness: number;
  contrast: number;
  saturation: number;
};

type CropPresetId = "original" | "rubika" | "square" | "portrait" | "story" | "landscape";

type ImageCropSettings = {
  presetId: CropPresetId;
  scale: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
  flipX: boolean;
};

type MediaImageEditorProps = {
  imageUrl: string;
  filename: string;
  saving?: boolean;
  onClose: () => void;
  onSave: (file: File) => Promise<void>;
};

type EditorSnapshot = {
  layers: EditorLayer[];
  adjustments: ImageAdjustments;
  crop: ImageCropSettings;
  canvasSize: { width: number; height: number };
};

type ActiveTransform = {
  layerId: string;
  mode: "resize" | "rotate";
  initialFontSize: number;
  initialRotation: number;
  initialDistance: number;
  initialAngle: number;
};

type CanvasGuides = {
  centerX: boolean;
  centerY: boolean;
};

const colorSwatches = ["#FFFFFF", "#0F172A", "#0F766E", "#2563EB", "#E11D48", "#F59E0B", "#7C3AED", "#16A34A"];
const labelSwatches = ["#0F172A", "#0F766E", "#2563EB", "#E11D48", "#F59E0B", "#FFFFFF"];
const stickers = ["✨", "🔥", "🎉", "❤️", "⭐", "✅", "📣", "🛍️", "🎁", "💎", "🌿", "☀️"];
const fontSampleText = "فروش ویژه محصول";
const fontOptions = [
  { label: "وزیرمتن", value: "Vazirmatn" },
  { label: "لاله‌زار", value: "Lalezar" },
  { label: "B Badr", value: "BBadr" },
  { label: "B Baran", value: "BBaran" },
  { label: "B Bardiya", value: "BBardiya" },
  { label: "B Compset", value: "BCompset" },
  { label: "B Davat", value: "BDavat" },
  { label: "B Elham", value: "BElham" },
  { label: "B Esfehan Bold", value: "BEsfehanBold" },
  { label: "B Fantezy", value: "BFantezy" },
  { label: "B Farnaz", value: "BFarnaz" },
  { label: "B Ferdosi", value: "BFerdosi" },
  { label: "B Hamid", value: "BHamid" },
  { label: "B Helal", value: "BHelal" },
  { label: "B Homa", value: "BHoma" },
  { label: "B Jadid Bold", value: "BJadidBold" },
  { label: "B Jalal", value: "BJalal" },
  { label: "B Koodak Bold", value: "BKoodakBold" },
  { label: "B Kourosh", value: "BKourosh" },
  { label: "B Lotus", value: "BLotus" },
  { label: "B Mahsa", value: "BMahsa" },
  { label: "B Mehr Bold", value: "BMehrBold" },
  { label: "B Mitra", value: "BMitra" },
  { label: "B Morvarid", value: "BMorvarid" },
  { label: "B Narm", value: "BNarm" },
  { label: "B Nasim Bold", value: "BNasimBold" },
  { label: "B Nazanin", value: "BNazanin" },
  { label: "B Roya", value: "BRoya" },
  { label: "B Setareh Bold", value: "BSetarehBold" },
  { label: "B Shiraz", value: "BShiraz" },
  { label: "B Sina Bold", value: "BSinaBold" },
  { label: "B Tabassom", value: "BTabassom" },
  { label: "B Tehran", value: "BTehran" },
  { label: "B Titr Bold", value: "BTitrBold" },
  { label: "B Titr TGE Bold", value: "BTitrTGEBold" },
  { label: "B Traffic", value: "BTraffic" },
  { label: "B Vahid Bold", value: "BVahidBold" },
  { label: "B Yagut", value: "BYagut" },
  { label: "B Yas", value: "BYas" },
  { label: "B Yekan", value: "BYekan" },
  { label: "B Zar", value: "BZar" },
  { label: "B Ziba", value: "BZiba" },
  { label: "Tahoma", value: "Tahoma" }
];
const textStylePresets = [
  { label: "تیتر فروش", value: "فروش ویژه", color: "#FFFFFF", backgroundColor: "#E11D48", fontFamily: "Lalezar", fontWeight: 700, fontSizeRatio: 12, radius: 18, padding: 18, outlineWidth: 0, shadowBlur: 8 },
  { label: "قیمت", value: "۲۹۹ هزار تومان", color: "#0F172A", backgroundColor: "#FFFFFF", fontFamily: "Vazirmatn", fontWeight: 900, fontSizeRatio: 16, radius: 14, padding: 16, outlineWidth: 0, shadowBlur: 5 },
  { label: "دعوت به اقدام", value: "همین حالا سفارش بده", color: "#FFFFFF", backgroundColor: "#0F766E", fontFamily: "Vazirmatn", fontWeight: 800, fontSizeRatio: 20, radius: 999, padding: 16, outlineWidth: 0, shadowBlur: 6 },
  { label: "زیرتیتر", value: "ارسال سریع و تضمین کیفیت", color: "#FFFFFF", backgroundColor: "#0F172A", fontFamily: "BNazanin", fontWeight: 700, fontSizeRatio: 24, radius: 12, padding: 14, outlineWidth: 1, shadowBlur: 4 }
];
const initialAdjustments: ImageAdjustments = { brightness: 100, contrast: 100, saturation: 100 };
const initialCrop: ImageCropSettings = { presetId: "original", scale: 100, offsetX: 0, offsetY: 0, rotation: 0, flipX: false };
const cropPresets: Array<{ id: CropPresetId; label: string; detail: string; width: number; height: number; icon: LucideIcon }> = [
  { id: "original", label: "اصلی", detail: "نسبت فایل", width: 0, height: 0, icon: Crop },
  { id: "rubika", label: "روبیکا", detail: "1080×1080", width: 1080, height: 1080, icon: Square },
  { id: "square", label: "مربع", detail: "1080×1080", width: 1080, height: 1080, icon: Square },
  { id: "portrait", label: "پرتره", detail: "1080×1350", width: 1080, height: 1350, icon: RectangleHorizontal },
  { id: "story", label: "استوری", detail: "1080×1920", width: 1080, height: 1920, icon: RectangleHorizontal },
  { id: "landscape", label: "افقی", detail: "1200×675", width: 1200, height: 675, icon: RectangleHorizontal }
];

function createLayerId() {
  return `layer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function imageFilter(adjustments: ImageAdjustments) {
  return `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`;
}

function cloneLayers(layers: EditorLayer[]) {
  return layers.map((layer) => ({ ...layer }));
}

function normalizeAngle(angle: number) {
  const normalized = angle % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function boundedSourceRect(image: HTMLImageElement, targetSize: { width: number; height: number }, crop: ImageCropSettings) {
  const sourceRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = targetSize.width / targetSize.height;
  const baseWidth = sourceRatio > targetRatio ? image.naturalHeight * targetRatio : image.naturalWidth;
  const baseHeight = sourceRatio > targetRatio ? image.naturalHeight : image.naturalWidth / targetRatio;
  const zoom = Math.max(1, crop.scale / 100);
  const width = Math.max(1, Math.min(image.naturalWidth, baseWidth / zoom));
  const height = Math.max(1, Math.min(image.naturalHeight, baseHeight / zoom));
  const maxLeft = Math.max(0, image.naturalWidth - width);
  const maxTop = Math.max(0, image.naturalHeight - height);
  const left = Math.max(0, Math.min(maxLeft, maxLeft / 2 + (crop.offsetX / 100) * (maxLeft / 2)));
  const top = Math.max(0, Math.min(maxTop, maxTop / 2 + (crop.offsetY / 100) * (maxTop / 2)));
  return { left, top, width, height };
}

function originalCanvasSize(image: HTMLImageElement) {
  const maxWidth = 1600;
  const scale = Math.min(1, maxWidth / image.naturalWidth);
  return {
    width: Math.max(1, Math.round(image.naturalWidth * scale)),
    height: Math.max(1, Math.round(image.naturalHeight * scale))
  };
}

function layerFont(layer: EditorLayer) {
  const weight = layer.type === "text" ? layer.fontWeight : 700;
  const size = layer.type === "sticker" ? Math.round(layer.fontSize * 1.2) : layer.fontSize;
  const family = layer.type === "sticker" ? "Arial" : layer.fontFamily;
  return `${weight} ${size}px "${family.replace(/"/g, '\\"')}"`;
}

function fontPreviewStyle(fontFamily: string, fontWeight = 400) {
  return {
    direction: "rtl" as const,
    fontFamily: `"${fontFamily}"`,
    fontSynthesis: "none",
    fontWeight
  };
}

async function loadLayerFonts(layers: EditorLayer[]) {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  const fontSet = document.fonts as FontFaceSet & {
    load?: (font: string, text?: string) => Promise<FontFace[]>;
    ready?: Promise<FontFaceSet>;
  };
  const fontRequests = Array.from(new Set(
    layers
      .filter((layer) => layer.visible && layer.type === "text")
      .map((layer) => layerFont({ ...layer, fontSize: 32 }))
  ));

  if (typeof fontSet.load === "function") {
    await Promise.all(fontRequests.map((font) => fontSet.load?.(font, "فروش ویژه محصول")));
  }
  if (fontSet.ready) {
    await fontSet.ready;
    return;
  }
  await new Promise((resolve) => window.setTimeout(resolve, 180));
}

function splitTextLines(context: CanvasRenderingContext2D, layer: EditorLayer) {
  if (layer.type !== "text") return [layer.value];
  const maxWidth = Math.max(layer.fontSize * 2, layer.boxWidth - layer.padding * 2);
  const paragraphs = layer.value.split(/\n/);
  const lines: string[] = [];

  paragraphs.forEach((paragraph) => {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push("");
      return;
    }

    let line = "";
    words.forEach((word) => {
      const nextLine = line ? `${line} ${word}` : word;
      if (line && context.measureText(nextLine).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = nextLine;
      }
    });
    lines.push(line);
  });

  return lines;
}

function roughTextLineCount(layer: EditorLayer) {
  if (layer.type !== "text") return 1;
  const maxChars = Math.max(4, Math.floor((layer.boxWidth - layer.padding * 2) / Math.max(8, layer.fontSize * 0.52)));
  return layer.value.split(/\n/).reduce((total, line) => total + Math.max(1, Math.ceil(line.length / maxChars)), 0);
}

function drawRoundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const nextRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + nextRadius, y);
  context.lineTo(x + width - nextRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + nextRadius);
  context.lineTo(x + width, y + height - nextRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - nextRadius, y + height);
  context.lineTo(x + nextRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - nextRadius);
  context.lineTo(x, y + nextRadius);
  context.quadraticCurveTo(x, y, x + nextRadius, y);
  context.closePath();
}

function hexToRgba(hex: string, opacity: number) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3 ? normalized.split("").map((item) => item + item).join("") : normalized.padEnd(6, "0").slice(0, 6);
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${Math.max(0, Math.min(100, opacity)) / 100})`;
}

export function MediaImageEditor({ imageUrl, filename, saving = false, onClose, onSave }: MediaImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const artboardRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ layerId: string; offsetX: number; offsetY: number } | null>(null);
  const transformRef = useRef<ActiveTransform | null>(null);
  const layerDragRef = useRef<string | null>(null);
  const [layers, setLayers] = useState<EditorLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState("");
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([]);
  const [draftText, setDraftText] = useState("متن جدید");
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(initialAdjustments);
  const [crop, setCrop] = useState<ImageCropSettings>(initialCrop);
  const [past, setPast] = useState<EditorSnapshot[]>([]);
  const [future, setFuture] = useState<EditorSnapshot[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 1, height: 1 });
  const [zoom, setZoom] = useState(100);
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [guides, setGuides] = useState<CanvasGuides>({ centerX: false, centerY: false });
  const [imageReady, setImageReady] = useState(false);
  const [error, setError] = useState("");

  const selectedLayer = useMemo(() => layers.find((layer) => layer.id === selectedLayerId) ?? null, [layers, selectedLayerId]);
  const selectedBounds = selectedLayer?.visible ? layerBounds(selectedLayer) : null;
  const selectedFontOption = useMemo(() => {
    if (!selectedLayer || selectedLayer.type !== "text") return null;
    return fontOptions.find((font) => font.value === selectedLayer.fontFamily) ?? fontOptions[0];
  }, [selectedLayer]);

  const snapshot = useCallback((): EditorSnapshot => ({
    layers: cloneLayers(layers),
    adjustments: { ...adjustments },
    crop: { ...crop },
    canvasSize: { ...canvasSize }
  }), [adjustments, canvasSize, crop, layers]);

  const remember = useCallback(() => {
    setPast((current) => [...current, snapshot()].slice(-80));
    setFuture([]);
  }, [snapshot]);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.filter = imageFilter(adjustments);
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate((crop.rotation * Math.PI) / 180);
    context.scale(crop.flipX ? -1 : 1, 1);
    const drawWidth = crop.rotation % 180 === 0 ? canvas.width : canvas.height;
    const drawHeight = crop.rotation % 180 === 0 ? canvas.height : canvas.width;
    const source = boundedSourceRect(image, { width: drawWidth, height: drawHeight }, crop);
    context.drawImage(image, source.left, source.top, source.width, source.height, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    context.restore();

    layers.filter((layer) => layer.visible).forEach((layer) => {
      context.save();
      context.translate(layer.x, layer.y);
      context.rotate((layer.rotation * Math.PI) / 180);
      context.globalAlpha = layer.opacity / 100;
      context.textAlign = layer.align;
      context.textBaseline = "middle";
      context.direction = "rtl";
      context.fillStyle = layer.color;
      context.font = layerFont(layer);
      (context as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = layer.type === "text" ? `${layer.letterSpacing}px` : "0px";
      context.shadowColor = layer.shadowColor;
      context.shadowBlur = layer.shadowBlur;
      context.shadowOffsetY = layer.shadowOffsetY;

      if (layer.type === "text") {
        const lines = splitTextLines(context, layer);
        const lineHeight = layer.fontSize * layer.lineHeight;
        const height = lines.length * lineHeight + layer.padding * 2;
        const backgroundLeft = layer.align === "center" ? -layer.boxWidth / 2 : layer.align === "right" ? -layer.boxWidth : 0;
        if (layer.backgroundOpacity > 0) {
          context.save();
          context.shadowColor = "rgba(15, 23, 42, 0.16)";
          context.shadowBlur = Math.max(4, layer.shadowBlur);
          context.shadowOffsetY = Math.max(2, layer.shadowOffsetY);
          context.fillStyle = hexToRgba(layer.backgroundColor, layer.backgroundOpacity);
          drawRoundedRect(context, backgroundLeft, -height / 2, layer.boxWidth, height, layer.radius);
          context.fill();
          context.restore();
        }

        context.shadowColor = layer.shadowColor;
        context.shadowBlur = layer.shadowBlur;
        context.shadowOffsetY = layer.shadowOffsetY;
        context.fillStyle = layer.color;
        context.strokeStyle = layer.outlineColor;
        context.lineWidth = layer.outlineWidth;
        const textX = layer.align === "center" ? 0 : layer.align === "right" ? -layer.padding : layer.padding;
        lines.forEach((line, index) => {
          const y = -((lines.length - 1) * lineHeight) / 2 + index * lineHeight;
          if (layer.outlineWidth > 0) context.strokeText(line, textX, y);
          context.fillText(line, textX, y);
        });
      } else {
        context.fillText(layer.value, 0, 0);
      }
      context.restore();
    });
  }, [adjustments, crop, layers]);

  const fitCanvas = useCallback((size: { width: number; height: number }) => {
    const viewport = viewportRef.current;
    if (!viewport || !size.width || !size.height) return;
    const nextZoom = Math.min(100, ((viewport.clientWidth - 64) / size.width) * 100, ((viewport.clientHeight - 64) / size.height) * 100);
    setZoom(Math.max(20, Math.round(nextZoom)));
  }, []);

  useEffect(() => {
    setImageReady(false);
    setError("");
    const image = new Image();
    image.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const nextSize = originalCanvasSize(image);
      canvas.width = nextSize.width;
      canvas.height = nextSize.height;
      imageRef.current = image;
      setCanvasSize(nextSize);
      setImageReady(true);
      window.setTimeout(() => fitCanvas(nextSize), 0);
    };
    image.onerror = () => setError("بارگذاری تصویر برای ویرایش ناموفق بود.");
    image.src = imageUrl;
    return () => {
      imageRef.current = null;
    };
  }, [fitCanvas, imageUrl]);

  useEffect(() => {
    if (!imageReady) return;
    let cancelled = false;
    renderCanvas();
    void loadLayerFonts(layers).then(() => {
      if (!cancelled) renderCanvas();
    });
    return () => {
      cancelled = true;
    };
  }, [imageReady, layers, renderCanvas]);

  useEffect(() => {
    setSelectedLayerIds((current) => current.filter((id) => layers.some((layer) => layer.id === id)));
    setSelectedLayerId((current) => layers.some((layer) => layer.id === current) ? current : "");
  }, [layers]);

  function canvasPointFromClient(clientX: number, clientY: number) {
    const artboard = artboardRef.current;
    if (!artboard) return { x: 0, y: 0 };
    const bounds = artboard.getBoundingClientRect();
    return {
      x: (clientX - bounds.left) * (canvasSize.width / bounds.width),
      y: (clientY - bounds.top) * (canvasSize.height / bounds.height)
    };
  }

  function canvasPoint(event: PointerEvent<HTMLElement>) {
    return canvasPointFromClient(event.clientX, event.clientY);
  }

  function snapPoint(point: { x: number; y: number }) {
    const threshold = Math.max(8, canvasSize.width * 0.012);
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    const snapX = Math.abs(point.x - centerX) <= threshold;
    const snapY = Math.abs(point.y - centerY) <= threshold;
    setGuides({ centerX: snapX, centerY: snapY });
    return {
      x: Math.max(0, Math.min(canvasSize.width, snapX ? centerX : point.x)),
      y: Math.max(0, Math.min(canvasSize.height, snapY ? centerY : point.y))
    };
  }

  function layerWidth(layer: EditorLayer) {
    if (layer.type === "text") return layer.boxWidth;
    return Math.max(layer.fontSize, layer.value.length * layer.fontSize * 0.8);
  }

  function layerBounds(layer: EditorLayer) {
    const width = layerWidth(layer);
    const height = layer.type === "text" ? roughTextLineCount(layer) * layer.fontSize * layer.lineHeight + layer.padding * 2 : layer.fontSize * 2;
    const left = layer.align === "center" ? layer.x - width / 2 : layer.align === "right" ? layer.x - width : layer.x;
    return { left, top: layer.y - height / 2, width, height };
  }

  function hitLayer(point: { x: number; y: number }) {
    return [...layers].reverse().find((layer) => {
      if (!layer.visible || layer.locked) return false;
      const bounds = layerBounds(layer);
      return point.x >= bounds.left - 16 && point.x <= bounds.left + bounds.width + 16 && point.y >= bounds.top - 16 && point.y <= bounds.top + bounds.height + 16;
    }) ?? null;
  }

  function startDrag(event: PointerEvent<HTMLCanvasElement>) {
    const point = canvasPoint(event);
    const layer = hitLayer(point);
    if (!layer) {
      setSelectedLayerId("");
      setSelectedLayerIds([]);
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedLayerId(layer.id);
    setSelectedLayerIds((current) => current.includes(layer.id) ? current : [layer.id]);
    remember();
    dragRef.current = { layerId: layer.id, offsetX: point.x - layer.x, offsetY: point.y - layer.y };
  }

  function dragLayer(event: PointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const pointer = canvasPoint(event);
    const point = snapPoint({ x: pointer.x - drag.offsetX, y: pointer.y - drag.offsetY });
    setLayers((current) => current.map((layer) => layer.id === drag.layerId ? { ...layer, x: point.x, y: point.y } : layer));
  }

  function stopDrag() {
    dragRef.current = null;
    setGuides({ centerX: false, centerY: false });
  }

  function startTransform(event: PointerEvent<HTMLButtonElement>, mode: ActiveTransform["mode"]) {
    if (!selectedLayer || selectedLayer.locked) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = canvasPoint(event);
    const deltaX = point.x - selectedLayer.x;
    const deltaY = point.y - selectedLayer.y;
    remember();
    transformRef.current = {
      layerId: selectedLayer.id,
      mode,
      initialFontSize: selectedLayer.fontSize,
      initialRotation: selectedLayer.rotation,
      initialDistance: Math.max(1, Math.hypot(deltaX, deltaY)),
      initialAngle: Math.atan2(deltaY, deltaX)
    };
  }

  function transformLayer(event: PointerEvent<HTMLButtonElement>) {
    const transform = transformRef.current;
    if (!transform) return;
    const layer = layers.find((item) => item.id === transform.layerId);
    if (!layer || layer.locked) return;
    const point = canvasPoint(event);
    const deltaX = point.x - layer.x;
    const deltaY = point.y - layer.y;

    if (transform.mode === "resize") {
      const nextSize = Math.max(20, Math.min(240, Math.round(transform.initialFontSize * (Math.hypot(deltaX, deltaY) / transform.initialDistance))));
      setLayers((current) => current.map((item) => item.id === transform.layerId ? { ...item, fontSize: nextSize } : item));
      return;
    }

    const angle = Math.atan2(deltaY, deltaX);
    const nextRotation = normalizeAngle(transform.initialRotation + ((angle - transform.initialAngle) * 180) / Math.PI);
    setLayers((current) => current.map((item) => item.id === transform.layerId ? { ...item, rotation: Math.round(nextRotation) } : item));
  }

  function stopTransform() {
    transformRef.current = null;
  }

  const restoreSnapshot = useCallback((next: EditorSnapshot) => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = next.canvasSize.width;
      canvas.height = next.canvasSize.height;
    }
    setLayers(cloneLayers(next.layers));
    setAdjustments({ ...next.adjustments });
    setCrop({ ...next.crop });
    setCanvasSize({ ...next.canvasSize });
    setSelectedLayerId((current) => next.layers.some((layer) => layer.id === current) ? current : "");
    setSelectedLayerIds((current) => current.filter((id) => next.layers.some((layer) => layer.id === id)));
  }, []);

  const undo = useCallback(() => {
    const previous = past[past.length - 1];
    if (!previous) return;
    setPast((current) => current.slice(0, -1));
    setFuture((current) => [snapshot(), ...current].slice(0, 80));
    restoreSnapshot(previous);
  }, [past, restoreSnapshot, snapshot]);

  const redo = useCallback(() => {
    const next = future[0];
    if (!next) return;
    setPast((current) => [...current, snapshot()].slice(-80));
    setFuture((current) => current.slice(1));
    restoreSnapshot(next);
  }, [future, restoreSnapshot, snapshot]);

  function createTextLayer(value = draftText.trim(), preset?: typeof textStylePresets[number]) {
    const canvas = canvasRef.current;
    if (!canvas || !value.trim()) return null;
    return {
      id: createLayerId(),
      type: "text",
      value: value.trim(),
      x: canvas.width / 2,
      y: canvas.height / 2,
      color: preset?.color ?? "#FFFFFF",
      backgroundColor: preset?.backgroundColor ?? "#0F172A",
      backgroundOpacity: preset ? 82 : 0,
      fontFamily: preset?.fontFamily ?? "Vazirmatn",
      fontSize: Math.max(24, Math.round(canvas.width / (preset?.fontSizeRatio ?? 18))),
      fontWeight: preset?.fontWeight ?? 800,
      lineHeight: 1.22,
      letterSpacing: 0,
      boxWidth: Math.max(260, Math.round(canvas.width * 0.68)),
      padding: preset?.padding ?? 14,
      radius: preset?.radius ?? 12,
      outlineColor: "#0F172A",
      outlineWidth: preset?.outlineWidth ?? 0,
      shadowColor: "rgba(15, 23, 42, 0.35)",
      shadowBlur: preset?.shadowBlur ?? 6,
      shadowOffsetY: 3,
      align: "center",
      rotation: 0,
      name: `متن ${layers.filter((item) => item.type === "text").length + 1}`,
      visible: true,
      locked: false,
      opacity: 100
    } satisfies EditorLayer;
  }

  function addText() {
    const layer = createTextLayer();
    if (!layer) return;
    remember();
    setLayers((current) => [...current, layer]);
    setSelectedLayerId(layer.id);
    setSelectedLayerIds([layer.id]);
  }

  function addPresetText(preset: typeof textStylePresets[number]) {
    const layer = createTextLayer(preset.value, preset);
    if (!layer) return;
    remember();
    setLayers((current) => [...current, layer]);
    setSelectedLayerId(layer.id);
    setSelectedLayerIds([layer.id]);
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
      backgroundColor: "#0F172A",
      backgroundOpacity: 0,
      fontFamily: "Arial",
      fontSize: Math.max(36, Math.round(canvas.width / 14)),
      fontWeight: 700,
      lineHeight: 1,
      letterSpacing: 0,
      boxWidth: Math.max(120, Math.round(canvas.width * 0.24)),
      padding: 0,
      radius: 0,
      outlineColor: "#0F172A",
      outlineWidth: 0,
      shadowColor: "rgba(15, 23, 42, 0.32)",
      shadowBlur: Math.max(2, Math.round(canvas.width / 220)),
      shadowOffsetY: 2,
      align: "center",
      rotation: 0,
      name: `استیکر ${layers.filter((item) => item.type === "sticker").length + 1}`,
      visible: true,
      locked: false,
      opacity: 100
    };
    remember();
    setLayers((current) => [...current, layer]);
    setSelectedLayerId(layer.id);
    setSelectedLayerIds([layer.id]);
  }

  function updateSelectedLayer(patch: Partial<EditorLayer>) {
    if (!selectedLayerId || selectedLayer?.locked) return;
    remember();
    setLayers((current) => current.map((layer) => layer.id === selectedLayerId ? { ...layer, ...patch } : layer));
  }

  const removeSelectedLayer = useCallback(() => {
    if (!selectedLayerIds.length) return;
    remember();
    setLayers((current) => current.filter((layer) => !selectedLayerIds.includes(layer.id) || layer.locked));
    setSelectedLayerId("");
    setSelectedLayerIds([]);
  }, [remember, selectedLayerIds]);

  const duplicateSelectedLayer = useCallback(() => {
    const selectedLayers = layers.filter((layer) => selectedLayerIds.includes(layer.id));
    if (!selectedLayers.length) return;
    const duplicates = selectedLayers.map((layer) => ({ ...layer, id: createLayerId(), name: `${layer.name} کپی`, x: layer.x + 24, y: layer.y + 24, groupId: undefined }));
    remember();
    setLayers((current) => [...current, ...duplicates]);
    setSelectedLayerId(duplicates[duplicates.length - 1].id);
    setSelectedLayerIds(duplicates.map((layer) => layer.id));
  }, [layers, remember, selectedLayerIds]);

  function resetEditor() {
    if (layers.length || adjustments.brightness !== 100 || adjustments.contrast !== 100 || adjustments.saturation !== 100) remember();
    setLayers([]);
    setSelectedLayerId("");
    setSelectedLayerIds([]);
    setAdjustments(initialAdjustments);
    setCrop(initialCrop);
    if (imageRef.current && canvasRef.current) {
      const nextSize = originalCanvasSize(imageRef.current);
      canvasRef.current.width = nextSize.width;
      canvasRef.current.height = nextSize.height;
      setCanvasSize(nextSize);
      window.setTimeout(() => fitCanvas(nextSize), 0);
    }
    setError("");
  }

  function updateAdjustment(field: keyof ImageAdjustments, value: number) {
    remember();
    setAdjustments((current) => ({ ...current, [field]: value }));
  }

  function applyCropPreset(presetId: CropPresetId) {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!image || !canvas) return;
    const preset = cropPresets.find((item) => item.id === presetId);
    if (!preset) return;
    const nextSize = preset.id === "original" ? originalCanvasSize(image) : { width: preset.width, height: preset.height };
    const scaleX = nextSize.width / canvasSize.width;
    const scaleY = nextSize.height / canvasSize.height;
    remember();
    canvas.width = nextSize.width;
    canvas.height = nextSize.height;
    setCanvasSize(nextSize);
    setCrop((current) => ({ ...current, presetId, offsetX: 0, offsetY: 0, scale: 100 }));
    setLayers((current) => current.map((layer) => ({ ...layer, x: layer.x * scaleX, y: layer.y * scaleY, fontSize: Math.max(20, Math.round(layer.fontSize * Math.min(scaleX, scaleY))) })));
    window.setTimeout(() => fitCanvas(nextSize), 0);
  }

  function updateCrop(patch: Partial<ImageCropSettings>) {
    remember();
    setCrop((current) => ({ ...current, ...patch }));
  }

  function rotateImage() {
    updateCrop({ rotation: normalizeAngle(crop.rotation + 90) });
  }

  function selectLayer(layerId: string, additive = false) {
    setSelectedLayerId(layerId);
    setSelectedLayerIds((current) => {
      if (!additive) return [layerId];
      return current.includes(layerId) ? current.filter((id) => id !== layerId) : [...current, layerId];
    });
  }

  function updateLayer(layerId: string, patch: Partial<EditorLayer>, withHistory = true) {
    const layer = layers.find((item) => item.id === layerId);
    if (!layer) return;
    if (withHistory) remember();
    setLayers((current) => current.map((item) => item.id === layerId ? { ...item, ...patch } : item));
  }

  function moveLayer(layerId: string, direction: "up" | "down") {
    const index = layers.findIndex((layer) => layer.id === layerId);
    if (index < 0) return;
    const nextIndex = direction === "up" ? index + 1 : index - 1;
    if (nextIndex < 0 || nextIndex >= layers.length) return;
    remember();
    setLayers((current) => {
      const next = [...current];
      const [layer] = next.splice(index, 1);
      next.splice(nextIndex, 0, layer);
      return next;
    });
  }

  function reorderLayer(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;
    const sourceIndex = layers.findIndex((layer) => layer.id === sourceId);
    const targetIndex = layers.findIndex((layer) => layer.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;
    remember();
    setLayers((current) => {
      const next = [...current];
      const [layer] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, layer);
      return next;
    });
  }

  function alignSelected(mode: "left" | "centerX" | "right" | "top" | "centerY" | "bottom") {
    if (!selectedLayerIds.length) return;
    const selected = layers.filter((layer) => selectedLayerIds.includes(layer.id) && !layer.locked);
    if (!selected.length) return;
    remember();
    setLayers((current) => current.map((layer) => {
      if (!selectedLayerIds.includes(layer.id) || layer.locked) return layer;
      const bounds = layerBounds(layer);
      if (mode === "left") return { ...layer, x: layer.x - bounds.left };
      if (mode === "centerX") return { ...layer, x: canvasSize.width / 2 };
      if (mode === "right") return { ...layer, x: layer.x + (canvasSize.width - (bounds.left + bounds.width)) };
      if (mode === "top") return { ...layer, y: layer.y - bounds.top };
      if (mode === "centerY") return { ...layer, y: canvasSize.height / 2 };
      return { ...layer, y: layer.y + (canvasSize.height - (bounds.top + bounds.height)) };
    }));
  }

  function groupSelected() {
    if (selectedLayerIds.length < 2) return;
    const groupId = `group-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    remember();
    setLayers((current) => current.map((layer) => selectedLayerIds.includes(layer.id) ? { ...layer, groupId } : layer));
  }

  function ungroupSelected() {
    if (!selectedLayerIds.length) return;
    remember();
    setLayers((current) => current.map((layer) => selectedLayerIds.includes(layer.id) ? { ...layer, groupId: undefined } : layer));
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select")) return;
      const commandKey = event.ctrlKey || event.metaKey;
      if (commandKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if (commandKey && event.key.toLowerCase() === "d") {
        event.preventDefault();
        duplicateSelectedLayer();
        return;
      }
      if ((event.key === "Delete" || event.key === "Backspace") && selectedLayerIds.length) {
        event.preventDefault();
        removeSelectedLayer();
        return;
      }
      if (!selectedLayer || selectedLayer.locked || !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const distance = event.shiftKey ? 10 : 1;
      const patch = {
        x: selectedLayer.x + (event.key === "ArrowRight" ? distance : event.key === "ArrowLeft" ? -distance : 0),
        y: selectedLayer.y + (event.key === "ArrowDown" ? distance : event.key === "ArrowUp" ? -distance : 0)
      };
      remember();
      setLayers((current) => current.map((layer) => layer.id === selectedLayer.id ? { ...layer, x: Math.max(0, Math.min(canvasSize.width, patch.x)), y: Math.max(0, Math.min(canvasSize.height, patch.y)) } : layer));
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canvasSize.height, canvasSize.width, duplicateSelectedLayer, redo, remember, removeSelectedLayer, selectedLayer, selectedLayerIds.length, undo]);

  async function saveEditedImage() {
    const canvas = canvasRef.current;
    if (!canvas || !imageReady) return;
    setError("");
    await loadLayerFonts(layers);
    renderCanvas();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 0.94));
    if (!blob) {
      setError("ساخت خروجی تصویر ناموفق بود.");
      return;
    }
    const baseName = filename.replace(/\.[^.]+$/, "") || "image";
    const preset = cropPresets.find((item) => item.id === crop.presetId);
    const suffix = preset && preset.id !== "original" ? `${preset.id}-variant` : "edited";
    await onSave(new File([blob], `${baseName}-${suffix}.png`, { type: "image/png" }));
  }

  return createPortal((
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="ویرایشگر تصویر">
      <div aria-hidden="true" className="pointer-events-none fixed -top-96 h-0 w-0 overflow-hidden opacity-0">
        {fontOptions.map((font) => (
          <span key={font.value} style={fontPreviewStyle(font.value, font.value.includes("Bold") ? 700 : 400)}>
            {fontSampleText}
          </span>
        ))}
      </div>
      <section className="flex max-h-[96vh] w-full max-w-[1480px] flex-col overflow-hidden rounded-lg border border-app-border bg-app-canvas shadow-2xl">
        <header className="flex flex-col justify-between gap-3 border-b border-app-border bg-white px-4 py-3 lg:flex-row lg:items-center">
          <div>
            <p className="text-[10px] font-black text-app-primary">استودیوی خلاقه</p>
            <h2 className="mt-1 text-lg font-black text-app-text">ویرایش تصویر</h2>
            <p className="mt-1 text-xs text-app-muted">{filename} · نسخه جدید در کتابخانه ذخیره می‌شود و فایل اصلی دست‌نخورده می‌ماند.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusToken tone={layers.length ? "primary" : "neutral"}>{layers.length} لایه</StatusToken>
            <StatusToken tone="neutral">{canvasSize.width}×{canvasSize.height}</StatusToken>
            <button type="button" onClick={undo} disabled={!past.length} className="app-interactive flex h-8 w-8 items-center justify-center rounded-md border border-app-border bg-white text-slate-600 shadow-hairline hover:bg-blue-50 hover:text-app-primary disabled:pointer-events-none disabled:opacity-40" aria-label="بازگشت" title="بازگشت (Ctrl+Z)">
              <Undo2 className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={redo} disabled={!future.length} className="app-interactive flex h-8 w-8 items-center justify-center rounded-md border border-app-border bg-white text-slate-600 shadow-hairline hover:bg-blue-50 hover:text-app-primary disabled:pointer-events-none disabled:opacity-40" aria-label="انجام دوباره" title="انجام دوباره (Ctrl+Shift+Z)">
              <Redo2 className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => setShowSafeZone((current) => !current)} className={`app-interactive flex h-8 w-8 items-center justify-center rounded-md border shadow-hairline ${showSafeZone ? "border-blue-200 bg-blue-50 text-app-primary" : "border-app-border bg-white text-slate-600 hover:bg-blue-50 hover:text-app-primary"}`} aria-label="نمایش محدوده امن" title="محدوده امن روبیکا">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </button>
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

        <div className="grid min-h-0 flex-1 overflow-auto lg:grid-cols-[240px_minmax(320px,1fr)_300px]">
          <aside className="space-y-4 border-b border-app-border bg-white p-4 lg:border-b-0 lg:border-l">
            <section>
              <div className="flex items-center gap-2">
                <Crop className="h-4 w-4 text-app-primary" aria-hidden="true" />
                <h3 className="text-xs font-black text-app-text">کراپ و خروجی</h3>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {cropPresets.map((preset) => {
                  const Icon = preset.icon;
                  const active = crop.presetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyCropPreset(preset.id)}
                      className={`app-interactive rounded-md border p-2 text-right shadow-hairline ${active ? "border-blue-300 bg-blue-50 text-app-primary ring-1 ring-blue-200" : "border-app-border bg-white text-app-text hover:bg-slate-50"}`}
                    >
                      <span className="flex items-center gap-2 text-xs font-black">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        {preset.label}
                      </span>
                      <span className="mt-1 block text-[10px] font-bold text-app-muted">{preset.detail}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 rounded-md bg-app-surfaceMuted p-3 shadow-hairline">
                <label className="block text-xs font-bold text-app-muted">
                  بزرگ‌نمایی تصویر · {crop.scale}%
                  <input type="range" min="100" max="220" value={crop.scale} onChange={(event) => updateCrop({ scale: Number(event.target.value) })} className="mt-2 w-full accent-blue-600" />
                </label>
                <label className="mt-3 block text-xs font-bold text-app-muted">
                  جابه‌جایی افقی · {crop.offsetX}
                  <input type="range" min="-100" max="100" value={crop.offsetX} onChange={(event) => updateCrop({ offsetX: Number(event.target.value) })} className="mt-2 w-full accent-blue-600" />
                </label>
                <label className="mt-3 block text-xs font-bold text-app-muted">
                  جابه‌جایی عمودی · {crop.offsetY}
                  <input type="range" min="-100" max="100" value={crop.offsetY} onChange={(event) => updateCrop({ offsetY: Number(event.target.value) })} className="mt-2 w-full accent-blue-600" />
                </label>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={rotateImage}>
                    <RotateCw className="ml-1.5 h-4 w-4" aria-hidden="true" />
                    چرخش ۹۰°
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={() => updateCrop({ flipX: !crop.flipX })}>
                    <FlipHorizontal className="ml-1.5 h-4 w-4" aria-hidden="true" />
                    قرینه
                  </Button>
                </div>
              </div>
            </section>

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
              <div className="mt-3 grid grid-cols-2 gap-2">
                {textStylePresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => addPresetText(preset)}
                    className="app-interactive rounded-md border border-app-border bg-white px-2 py-2 text-right text-[11px] font-black text-app-text shadow-hairline hover:border-blue-200 hover:bg-blue-50 hover:text-app-primary"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
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
                  <input type="range" min="50" max="150" value={adjustments[field]} onChange={(event) => updateAdjustment(field, Number(event.target.value))} className="mt-2 w-full accent-blue-600" />
                </label>
              ))}
            </section>
          </aside>

          <div ref={viewportRef} className="app-studio-grid relative flex min-h-[440px] items-center justify-center overflow-auto bg-slate-100 p-4 lg:p-6">
            {error ? <p className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
            <div
              ref={artboardRef}
              className={`relative shrink-0 overflow-visible rounded-md bg-white shadow-lift ${imageReady ? "" : "hidden"}`}
              style={{ width: `${Math.round((canvasSize.width * zoom) / 100)}px`, height: `${Math.round((canvasSize.height * zoom) / 100)}px` }}
            >
              <canvas
                ref={canvasRef}
                onPointerDown={startDrag}
                onPointerMove={dragLayer}
                onPointerUp={stopDrag}
                onPointerCancel={stopDrag}
                className="h-full w-full cursor-move rounded-md"
              />
              {showSafeZone ? (
                <div className="pointer-events-none absolute inset-[8%] rounded border border-dashed border-emerald-400/90">
                  <span className="absolute right-2 top-2 rounded bg-emerald-500/90 px-1.5 py-1 text-[10px] font-black leading-none text-white">محدوده امن روبیکا</span>
                </div>
              ) : null}
              {guides.centerX ? <span className="pointer-events-none absolute inset-y-0 left-1/2 border-l border-dashed border-blue-500" /> : null}
              {guides.centerY ? <span className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-blue-500" /> : null}
              {selectedLayer && selectedBounds ? (
                <div
                  className="pointer-events-none absolute border border-blue-500"
                  style={{
                    left: `${(selectedBounds.left / canvasSize.width) * 100}%`,
                    top: `${(selectedBounds.top / canvasSize.height) * 100}%`,
                    width: `${(selectedBounds.width / canvasSize.width) * 100}%`,
                    height: `${(selectedBounds.height / canvasSize.height) * 100}%`,
                    transform: `rotate(${selectedLayer.rotation}deg)`
                  }}
                >
                  {["-left-1.5 -top-1.5", "-right-1.5 -top-1.5", "-bottom-1.5 -left-1.5"].map((position) => (
                    <span key={position} className={`absolute h-3 w-3 rounded-sm border border-blue-600 bg-white ${position}`} />
                  ))}
                  <button
                    type="button"
                    onPointerDown={(event) => startTransform(event, "resize")}
                    onPointerMove={transformLayer}
                    onPointerUp={stopTransform}
                    onPointerCancel={stopTransform}
                    className="pointer-events-auto absolute -bottom-2 -right-2 h-4 w-4 cursor-nwse-resize rounded-sm border border-blue-600 bg-white shadow-sm"
                    aria-label="تغییر اندازه لایه"
                    title="برای تغییر اندازه بکشید"
                  />
                  <span className="absolute -top-8 left-1/2 h-8 border-l border-blue-500" />
                  <button
                    type="button"
                    onPointerDown={(event) => startTransform(event, "rotate")}
                    onPointerMove={transformLayer}
                    onPointerUp={stopTransform}
                    onPointerCancel={stopTransform}
                    className="pointer-events-auto absolute -top-11 left-1/2 flex h-5 w-5 -translate-x-1/2 cursor-grab items-center justify-center rounded-full border border-blue-600 bg-white text-blue-700 shadow-sm active:cursor-grabbing"
                    aria-label="چرخاندن لایه"
                    title="برای چرخاندن بکشید"
                  >
                    <RotateCw className="h-3 w-3" aria-hidden="true" />
                  </button>
                </div>
              ) : null}
            </div>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-md border border-app-border bg-white/95 p-1 shadow-soft">
              <button type="button" onClick={() => setZoom((current) => Math.max(20, current - 10))} className="app-interactive flex h-7 w-7 items-center justify-center rounded text-slate-600 hover:bg-blue-50 hover:text-app-primary" aria-label="کوچک‌نمایی" title="کوچک‌نمایی">
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="min-w-12 text-center text-[11px] font-black text-app-text">{zoom}%</span>
              <button type="button" onClick={() => setZoom((current) => Math.min(180, current + 10))} className="app-interactive flex h-7 w-7 items-center justify-center rounded text-slate-600 hover:bg-blue-50 hover:text-app-primary" aria-label="بزرگ‌نمایی" title="بزرگ‌نمایی">
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => fitCanvas(canvasSize)} className="app-interactive flex h-7 w-7 items-center justify-center rounded text-slate-600 hover:bg-blue-50 hover:text-app-primary" aria-label="جای دادن در صفحه" title="جای دادن در صفحه">
                <Maximize2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <aside className="min-h-0 border-t border-app-border bg-white lg:border-r lg:border-t-0">
            <div className="max-h-full overflow-auto p-4">
              <section>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Layers3 className="h-4 w-4 text-app-primary" aria-hidden="true" />
                    <h3 className="text-xs font-black text-app-text">لایه‌ها</h3>
                  </div>
                  <StatusToken tone={selectedLayerIds.length > 1 ? "primary" : "neutral"}>{selectedLayerIds.length || 0} انتخاب</StatusToken>
                </div>

                <div className="mt-3 flex items-center gap-1 rounded-md bg-app-surfaceMuted p-1 shadow-hairline">
                  <button type="button" onClick={() => alignSelected("centerX")} disabled={!selectedLayerIds.length} className="app-interactive flex h-8 flex-1 items-center justify-center rounded text-slate-600 hover:bg-white hover:text-app-primary disabled:pointer-events-none disabled:opacity-40" aria-label="تراز افقی وسط" title="تراز افقی وسط">
                    <AlignCenter className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => alignSelected("centerY")} disabled={!selectedLayerIds.length} className="app-interactive flex h-8 flex-1 items-center justify-center rounded text-slate-600 hover:bg-white hover:text-app-primary disabled:pointer-events-none disabled:opacity-40" aria-label="تراز عمودی وسط" title="تراز عمودی وسط">
                    <AlignCenter className="h-4 w-4 rotate-90" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={groupSelected} disabled={selectedLayerIds.length < 2} className="app-interactive flex h-8 flex-1 items-center justify-center rounded text-slate-600 hover:bg-white hover:text-app-primary disabled:pointer-events-none disabled:opacity-40" aria-label="گروه کردن" title="گروه کردن">
                    <Group className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={ungroupSelected} disabled={!selectedLayerIds.length} className="app-interactive flex h-8 flex-1 items-center justify-center rounded text-slate-600 hover:bg-white hover:text-app-primary disabled:pointer-events-none disabled:opacity-40" aria-label="خروج از گروه" title="خروج از گروه">
                    <Ungroup className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {[...layers].reverse().map((layer) => {
                    const active = selectedLayerIds.includes(layer.id);
                    const groupIndex = layer.groupId ? layers.filter((item) => item.groupId === layer.groupId).findIndex((item) => item.id === layer.id) + 1 : 0;
                    return (
                      <div
                        key={layer.id}
                        draggable
                        onDragStart={() => {
                          layerDragRef.current = layer.id;
                        }}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => {
                          if (layerDragRef.current) reorderLayer(layerDragRef.current, layer.id);
                          layerDragRef.current = null;
                        }}
                        className={`rounded-md border p-2 shadow-hairline transition ${active ? "border-blue-300 bg-blue-50/70" : "border-app-border bg-white hover:bg-app-surfaceMuted"} ${layer.visible ? "" : "opacity-60"}`}
                      >
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => selectLayer(layer.id, true)} className={`app-interactive flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${active ? "bg-blue-600 text-white" : "bg-app-surfaceMuted text-slate-500"}`} aria-label="انتخاب لایه" title="انتخاب لایه">
                            <GripVertical className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button type="button" onClick={() => selectLayer(layer.id)} className="min-w-0 flex-1 text-right" title={layer.name}>
                            <span className="block truncate text-xs font-black text-app-text">{layer.name}</span>
                            <span className="mt-0.5 block truncate text-[10px] font-bold text-app-muted">{layer.type === "text" ? layer.value : "استیکر"}{layer.groupId ? ` · گروه ${groupIndex}` : ""}</span>
                          </button>
                          <button type="button" onClick={() => updateLayer(layer.id, { visible: !layer.visible })} className="app-interactive flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-app-surfaceMuted text-slate-600 hover:bg-white hover:text-app-primary" aria-label={layer.visible ? "پنهان کردن لایه" : "نمایش لایه"} title={layer.visible ? "پنهان کردن" : "نمایش"}>
                            {layer.visible ? <Eye className="h-4 w-4" aria-hidden="true" /> : <EyeOff className="h-4 w-4" aria-hidden="true" />}
                          </button>
                          <button type="button" onClick={() => updateLayer(layer.id, { locked: !layer.locked })} className="app-interactive flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-app-surfaceMuted text-slate-600 hover:bg-white hover:text-app-primary" aria-label={layer.locked ? "باز کردن قفل لایه" : "قفل کردن لایه"} title={layer.locked ? "باز کردن قفل" : "قفل کردن"}>
                            {layer.locked ? <Lock className="h-4 w-4" aria-hidden="true" /> : <Unlock className="h-4 w-4" aria-hidden="true" />}
                          </button>
                        </div>
                        <div className="mt-2 grid grid-cols-[1fr_auto_auto] gap-1">
                          <input value={layer.name} onFocus={() => remember()} onChange={(event) => updateLayer(layer.id, { name: event.target.value }, false)} className="h-8 rounded-md border border-app-border bg-white px-2 text-xs font-bold text-app-text outline-none focus:border-blue-300" aria-label="نام لایه" />
                          <button type="button" onClick={() => moveLayer(layer.id, "up")} className="app-interactive flex h-8 w-8 items-center justify-center rounded-md bg-app-surfaceMuted text-slate-600 hover:bg-white hover:text-app-primary" aria-label="انتقال لایه به جلو" title="انتقال به جلو">
                            <ArrowUp className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button type="button" onClick={() => moveLayer(layer.id, "down")} className="app-interactive flex h-8 w-8 items-center justify-center rounded-md bg-app-surfaceMuted text-slate-600 hover:bg-white hover:text-app-primary" aria-label="انتقال لایه به عقب" title="انتقال به عقب">
                            <ArrowDown className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="mt-5 border-t border-app-border pt-4">
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
                          <textarea value={selectedLayer.value} disabled={selectedLayer.locked} onChange={(event) => updateSelectedLayer({ value: event.target.value })} className="mt-2 min-h-20 w-full resize-y rounded-md border border-app-border bg-app-canvas px-3 py-2 text-sm leading-6 text-app-text outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 disabled:opacity-60" dir="rtl" />
                        </label>
                        <div className="block text-xs font-bold text-app-muted">
                          فونت فارسی
                          {selectedFontOption ? (
                            <div className="mt-2 rounded-md border border-blue-100 bg-blue-50/70 p-3 shadow-hairline">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-black text-app-primary">پیش‌نمایش زنده</span>
                                <span className="rounded bg-white px-2 py-1 text-[10px] font-black text-app-muted shadow-hairline">{selectedFontOption.label}</span>
                              </div>
                              <p className="mt-2 truncate text-2xl leading-9 text-app-text" style={fontPreviewStyle(selectedFontOption.value, selectedLayer.fontWeight)}>
                                {fontSampleText}
                              </p>
                            </div>
                          ) : null}
                          <div className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-md border border-app-border bg-white p-1 shadow-hairline" role="radiogroup" aria-label="فونت فارسی">
                            {fontOptions.map((font) => {
                              const active = selectedLayer.fontFamily === font.value;
                              return (
                                <button
                                  key={font.value}
                                  type="button"
                                  disabled={selectedLayer.locked}
                                  onClick={() => updateSelectedLayer({ fontFamily: font.value })}
                                  className={`app-interactive flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-2 text-right disabled:cursor-not-allowed disabled:opacity-50 ${active ? "bg-blue-50 text-app-primary ring-1 ring-blue-200" : "text-app-text hover:bg-app-surfaceMuted"}`}
                                  role="radio"
                                  aria-checked={active}
                                >
                                  <span className="shrink-0 text-[11px] font-black">{font.label}</span>
                                  <span className="min-w-0 flex-1 truncate text-left text-lg leading-6 text-app-text" style={fontPreviewStyle(font.value, font.value.includes("Bold") ? 700 : selectedLayer.fontWeight)}>
                                    {fontSampleText}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <label className="block text-xs font-bold text-app-muted">
                          وزن فونت
                          <select value={selectedLayer.fontWeight} disabled={selectedLayer.locked} onChange={(event) => updateSelectedLayer({ fontWeight: Number(event.target.value) })} className="mt-2 w-full rounded-md border border-app-border bg-white px-3 py-2 text-sm text-app-text outline-none focus:border-blue-300 disabled:opacity-60">
                            <option value={400}>معمولی</option>
                            <option value={700}>بولد</option>
                            <option value={800}>سنگین</option>
                            <option value={900}>تبلیغاتی</option>
                          </select>
                        </label>
                      </>
                    ) : (
                      <div className="rounded-md bg-app-surfaceMuted p-3 text-center text-4xl shadow-hairline">{selectedLayer.value}</div>
                    )}

                    <label className="block text-xs font-bold text-app-muted">
                      شفافیت · {selectedLayer.opacity}%
                      <input type="range" min="10" max="100" value={selectedLayer.opacity} disabled={selectedLayer.locked} onChange={(event) => updateSelectedLayer({ opacity: Number(event.target.value) })} className="mt-2 w-full accent-blue-600 disabled:opacity-60" />
                    </label>
                    <label className="block text-xs font-bold text-app-muted">
                      اندازه · {selectedLayer.fontSize}px
                      <input type="range" min="20" max="180" value={selectedLayer.fontSize} disabled={selectedLayer.locked} onChange={(event) => updateSelectedLayer({ fontSize: Number(event.target.value) })} className="mt-2 w-full accent-blue-600 disabled:opacity-60" />
                    </label>
                    {selectedLayer.type === "text" ? (
                      <>
                        <label className="block text-xs font-bold text-app-muted">
                          عرض جعبه متن · {selectedLayer.boxWidth}px
                          <input type="range" min="160" max={Math.max(320, canvasSize.width)} value={selectedLayer.boxWidth} disabled={selectedLayer.locked} onChange={(event) => updateSelectedLayer({ boxWidth: Number(event.target.value) })} className="mt-2 w-full accent-blue-600 disabled:opacity-60" />
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <label className="block text-xs font-bold text-app-muted">
                            فاصله خطوط · {selectedLayer.lineHeight.toFixed(2)}
                            <input type="range" min="0.9" max="1.8" step="0.05" value={selectedLayer.lineHeight} disabled={selectedLayer.locked} onChange={(event) => updateSelectedLayer({ lineHeight: Number(event.target.value) })} className="mt-2 w-full accent-blue-600 disabled:opacity-60" />
                          </label>
                          <label className="block text-xs font-bold text-app-muted">
                            فاصله حروف · {selectedLayer.letterSpacing}px
                            <input type="range" min="-2" max="8" value={selectedLayer.letterSpacing} disabled={selectedLayer.locked} onChange={(event) => updateSelectedLayer({ letterSpacing: Number(event.target.value) })} className="mt-2 w-full accent-blue-600 disabled:opacity-60" />
                          </label>
                        </div>
                      </>
                    ) : null}

                    <div className="grid grid-cols-2 gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={duplicateSelectedLayer}>
                        <Copy className="ml-1.5 h-4 w-4" aria-hidden="true" />
                        تکثیر
                      </Button>
                      <div className="flex items-center justify-center rounded-md bg-app-surfaceMuted px-2 text-xs font-black text-app-muted shadow-hairline">
                        {Math.round(selectedLayer.rotation)}°
                      </div>
                    </div>

                    {selectedLayer.type === "text" ? (
                      <div>
                        <p className="text-xs font-bold text-app-muted">رنگ متن</p>
                        <div className="mt-2 grid grid-cols-4 gap-2">
                          {colorSwatches.map((color) => (
                            <button key={color} type="button" disabled={selectedLayer.locked} onClick={() => updateSelectedLayer({ color })} className={`aspect-square rounded-md border shadow-hairline disabled:opacity-50 ${selectedLayer.color === color ? "ring-2 ring-app-primary ring-offset-2" : "border-app-border"}`} style={{ backgroundColor: color }} aria-label={`انتخاب رنگ ${color}`} title={color} />
                          ))}
                        </div>
                        <label className="mt-3 flex items-center justify-between gap-3 rounded-md bg-app-surfaceMuted px-3 py-2 text-xs font-bold text-app-muted shadow-hairline">
                          رنگ دلخواه
                          <input type="color" value={selectedLayer.color} disabled={selectedLayer.locked} onChange={(event) => updateSelectedLayer({ color: event.target.value })} className="h-7 w-12 cursor-pointer rounded border-0 bg-transparent p-0 disabled:opacity-50" />
                        </label>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {([
                            { value: "right", icon: AlignRight, label: "راست‌چین" },
                            { value: "center", icon: AlignCenter, label: "وسط‌چین" },
                            { value: "left", icon: AlignLeft, label: "چپ‌چین" }
                          ] as const).map((option) => {
                            const Icon = option.icon;
                            return (
                              <button key={option.value} type="button" disabled={selectedLayer.locked} onClick={() => updateSelectedLayer({ align: option.value })} className={`app-interactive flex items-center justify-center rounded-md p-2 disabled:opacity-50 ${selectedLayer.align === option.value ? "bg-blue-50 text-app-primary ring-1 ring-blue-200" : "bg-app-surfaceMuted text-slate-500"}`} aria-label={option.label} title={option.label}>
                                <Icon className="h-4 w-4" aria-hidden="true" />
                              </button>
                            );
                          })}
                        </div>
                        <div className="mt-4 rounded-md border border-app-border bg-app-surfaceMuted p-3">
                          <p className="text-xs font-black text-app-text">برچسب و افکت متن</p>
                          <div className="mt-2 grid grid-cols-6 gap-1.5">
                            {labelSwatches.map((color) => (
                              <button key={color} type="button" disabled={selectedLayer.locked} onClick={() => updateSelectedLayer({ backgroundColor: color, backgroundOpacity: Math.max(selectedLayer.backgroundOpacity, 70) })} className={`aspect-square rounded-md border shadow-hairline disabled:opacity-50 ${selectedLayer.backgroundColor === color ? "ring-2 ring-app-primary ring-offset-2" : "border-app-border"}`} style={{ backgroundColor: color }} aria-label={`انتخاب پس‌زمینه ${color}`} title={color} />
                            ))}
                          </div>
                          <label className="mt-3 block text-xs font-bold text-app-muted">
                            شفافیت پس‌زمینه · {selectedLayer.backgroundOpacity}%
                            <input type="range" min="0" max="100" value={selectedLayer.backgroundOpacity} disabled={selectedLayer.locked} onChange={(event) => updateSelectedLayer({ backgroundOpacity: Number(event.target.value) })} className="mt-2 w-full accent-blue-600 disabled:opacity-60" />
                          </label>
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <label className="block text-xs font-bold text-app-muted">
                              فاصله داخلی · {selectedLayer.padding}px
                              <input type="range" min="0" max="44" value={selectedLayer.padding} disabled={selectedLayer.locked} onChange={(event) => updateSelectedLayer({ padding: Number(event.target.value) })} className="mt-2 w-full accent-blue-600 disabled:opacity-60" />
                            </label>
                            <label className="block text-xs font-bold text-app-muted">
                              گردی · {selectedLayer.radius}px
                              <input type="range" min="0" max="48" value={selectedLayer.radius} disabled={selectedLayer.locked} onChange={(event) => updateSelectedLayer({ radius: Number(event.target.value) })} className="mt-2 w-full accent-blue-600 disabled:opacity-60" />
                            </label>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <label className="block text-xs font-bold text-app-muted">
                              دورخط · {selectedLayer.outlineWidth}px
                              <input type="range" min="0" max="8" value={selectedLayer.outlineWidth} disabled={selectedLayer.locked} onChange={(event) => updateSelectedLayer({ outlineWidth: Number(event.target.value) })} className="mt-2 w-full accent-blue-600 disabled:opacity-60" />
                            </label>
                            <label className="flex items-end justify-between gap-2 text-xs font-bold text-app-muted">
                              رنگ دورخط
                              <input type="color" value={selectedLayer.outlineColor} disabled={selectedLayer.locked} onChange={(event) => updateSelectedLayer({ outlineColor: event.target.value })} className="h-8 w-12 cursor-pointer rounded border-0 bg-transparent p-0 disabled:opacity-50" />
                            </label>
                          </div>
                          <label className="mt-3 block text-xs font-bold text-app-muted">
                            سایه متن · {selectedLayer.shadowBlur}px
                            <input type="range" min="0" max="24" value={selectedLayer.shadowBlur} disabled={selectedLayer.locked} onChange={(event) => updateSelectedLayer({ shadowBlur: Number(event.target.value) })} className="mt-2 w-full accent-blue-600 disabled:opacity-60" />
                          </label>
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
              </section>
            </div>
          </aside>
        </div>
      </section>
    </div>
  ), document.body);
}
