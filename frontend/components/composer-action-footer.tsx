import { Button } from "./ui/button";

type ComposerActionFooterProps = {
  saving: boolean;
  disabled?: boolean;
  hasSchedule?: boolean;
  onUseDefaults: () => void;
  onCancel: () => void;
};

export function ComposerActionFooter({ saving, disabled, hasSchedule = false, onUseDefaults, onCancel }: ComposerActionFooterProps) {
  return (
    <div className="sticky bottom-0 z-10 mt-6 rounded-2xl border border-app-border bg-app-surface/95 p-4 shadow-soft backdrop-blur">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-bold text-app-text">اقدام‌های پست</p>
          <p className="mt-1 text-xs leading-6 text-app-muted">
            {hasSchedule ? "با ذخیره فرم، پست ذخیره و وارد وضعیت زمان‌بندی‌شده می‌شود." : "بدون انتخاب زمان انتشار، پست به عنوان پیش‌نویس ذخیره می‌شود."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={onUseDefaults}>استفاده از پیش‌فرض فروشگاه</Button>
          <Button type="button" variant="ghost" onClick={onCancel}>لغو</Button>
          <Button type="button" variant="secondary" disabled>انتشار آزمایشی</Button>
          <Button type="submit" disabled={saving || disabled}>{saving ? "در حال ذخیره..." : hasSchedule ? "ذخیره و زمان‌بندی" : "ذخیره پیش‌نویس"}</Button>
        </div>
      </div>
    </div>
  );
}
