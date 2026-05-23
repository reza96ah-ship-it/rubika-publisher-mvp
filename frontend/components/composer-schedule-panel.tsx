import { Button } from "./ui/button";
import { Field, Input } from "./ui/form";

function toDatetimeLocalValue(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function fromDatetimeLocalValue(value: string) {
  if (!value) return null;
  return new Date(value).toISOString();
}

function formatSchedule(value: string | null) {
  if (!value) return "انتخاب نشده";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "انتخاب نشده";
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

type ComposerSchedulePanelProps = {
  scheduledAt: string | null;
  timezone: string;
  onChange: (value: string | null) => void;
};

export function ComposerSchedulePanel({ scheduledAt, timezone, onChange }: ComposerSchedulePanelProps) {
  const hasSchedule = Boolean(scheduledAt);

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
      <Field label="زمان انتشار" hint={`منطقه زمانی: ${timezone}`}>
        <Input
          type="datetime-local"
          value={toDatetimeLocalValue(scheduledAt)}
          onChange={(event) => onChange(fromDatetimeLocalValue(event.target.value))}
        />
      </Field>
      <Button type="button" variant="ghost" onClick={() => onChange(null)}>
        حذف زمان‌بندی
      </Button>
      <div className="md:col-span-2 rounded-xl bg-slate-50 p-4 text-sm leading-7 text-app-muted ring-1 ring-app-border">
        <p><span className="font-semibold text-app-text">وضعیت:</span> {hasSchedule ? "با ذخیره فرم، پست زمان‌بندی می‌شود." : "فعلاً به عنوان پیش‌نویس ذخیره می‌شود."}</p>
        <p><span className="font-semibold text-app-text">زمان انتخاب‌شده:</span> {formatSchedule(scheduledAt)}</p>
      </div>
    </div>
  );
}
