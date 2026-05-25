import { CalendarCheck, CheckCircle2, RotateCcw, Save, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

type ComposerActionFooterProps = {
  savingAction: "draft" | "ready" | "schedule" | null;
  canSaveDraft: boolean;
  canMarkReady: boolean;
  canSchedule: boolean;
  hasSchedule?: boolean;
  isEditing?: boolean;
  onUseDefaults: () => void;
  onCancel: () => void;
  onSaveDraft: () => void;
  onMarkReady: () => void;
  onSchedule: () => void;
};

export function ComposerActionFooter({
  savingAction,
  canSaveDraft,
  canMarkReady,
  canSchedule,
  hasSchedule = false,
  isEditing = false,
  onUseDefaults,
  onCancel,
  onSaveDraft,
  onMarkReady,
  onSchedule
}: ComposerActionFooterProps) {
  const saving = Boolean(savingAction);

  return (
    <div className="sticky bottom-4 z-10 mt-5 rounded-md border border-blue-100 bg-white/95 p-2 shadow-[0_18px_45px_rgba(37,99,235,0.12)] backdrop-blur">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
        <div className="flex min-w-0 items-start gap-3 rounded bg-blue-50/70 px-3 py-2.5">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded border border-blue-100 bg-white text-app-primary">
            <CalendarCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-black text-app-text">مرکز فرمان انتشار</p>
            <p className="mt-1 text-xs leading-6 text-app-muted">
            {hasSchedule ? "زمان انتشار انتخاب شده؛ می‌توانید پست را مستقیم وارد صف زمان‌بندی کنید." : "برای انتشار خودکار، ابتدا زمان انتشار را انتخاب کنید."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 xl:justify-end">
          <Button type="button" variant="secondary" size="sm" onClick={onUseDefaults} disabled={saving}>
            <Sparkles className="ml-2 h-4 w-4" aria-hidden="true" />
            پیش‌فرض فروشگاه
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
            <RotateCcw className="ml-2 h-4 w-4" aria-hidden="true" />
            بازنشانی
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={onSaveDraft} disabled={saving || !canSaveDraft}>
            <Save className="ml-2 h-4 w-4" aria-hidden="true" />
            {savingAction === "draft" ? "در حال ذخیره..." : isEditing ? "ذخیره تغییرات" : "ذخیره پیش‌نویس"}
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={onMarkReady} disabled={saving || !canMarkReady}>
            <CheckCircle2 className="ml-2 h-4 w-4" aria-hidden="true" />
            {savingAction === "ready" ? "در حال آماده‌سازی..." : "آماده برای زمان‌بندی"}
          </Button>
          <Button type="button" size="sm" onClick={onSchedule} disabled={saving || !canSchedule}>
            <CalendarCheck className="ml-2 h-4 w-4" aria-hidden="true" />
            {savingAction === "schedule" ? "در حال زمان‌بندی..." : "زمان‌بندی پست"}
          </Button>
        </div>
      </div>
    </div>
  );
}
