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
    <div className="sticky bottom-0 z-10 mt-6 rounded-2xl border border-app-border bg-app-surface/95 p-4 shadow-soft backdrop-blur">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-bold text-app-text">اقدام‌های پست</p>
          <p className="mt-1 text-xs leading-6 text-app-muted">
            {hasSchedule ? "زمان انتشار انتخاب شده؛ می‌توانید پست را مستقیم وارد صف زمان‌بندی کنید." : "برای انتشار خودکار، ابتدا زمان انتشار را انتخاب کنید."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={onUseDefaults} disabled={saving}>
            <Sparkles className="ml-2 h-4 w-4" aria-hidden="true" />
            پیش‌فرض فروشگاه
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
            <RotateCcw className="ml-2 h-4 w-4" aria-hidden="true" />
            بازنشانی
          </Button>
          <Button type="button" variant="secondary" onClick={onSaveDraft} disabled={saving || !canSaveDraft}>
            <Save className="ml-2 h-4 w-4" aria-hidden="true" />
            {savingAction === "draft" ? "در حال ذخیره..." : isEditing ? "ذخیره تغییرات" : "ذخیره پیش‌نویس"}
          </Button>
          <Button type="button" variant="secondary" onClick={onMarkReady} disabled={saving || !canMarkReady}>
            <CheckCircle2 className="ml-2 h-4 w-4" aria-hidden="true" />
            {savingAction === "ready" ? "در حال آماده‌سازی..." : "آماده برای زمان‌بندی"}
          </Button>
          <Button type="button" onClick={onSchedule} disabled={saving || !canSchedule}>
            <CalendarCheck className="ml-2 h-4 w-4" aria-hidden="true" />
            {savingAction === "schedule" ? "در حال زمان‌بندی..." : "زمان‌بندی پست"}
          </Button>
        </div>
      </div>
    </div>
  );
}
