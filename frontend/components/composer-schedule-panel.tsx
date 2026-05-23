"use client";

import { useMemo, useState } from "react";
import {
  getJalaliMonthLength,
  getJalaliMonthStartOffset,
  getJalaliPickerParts,
  jalaliMonthNames,
  jalaliPickerPartsToIso,
  persianWeekdays,
  type JalaliPickerParts
} from "../lib/jalali-picker";
import { Button } from "./ui/button";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatSchedule(parts: JalaliPickerParts | null) {
  if (!parts) return "انتخاب نشده";
  return `${parts.day} ${jalaliMonthNames[parts.month - 1]} ${parts.year}، ساعت ${pad(parts.hour)}:${pad(parts.minute)}`;
}

type ComposerSchedulePanelProps = {
  scheduledAt: string | null;
  timezone: string;
  onChange: (value: string | null) => void;
};

export function ComposerSchedulePanel({ scheduledAt, timezone, onChange }: ComposerSchedulePanelProps) {
  const [draft, setDraft] = useState<JalaliPickerParts>(() => getJalaliPickerParts(scheduledAt));
  const hasSchedule = Boolean(scheduledAt);
  const selectedParts = hasSchedule ? getJalaliPickerParts(scheduledAt) : null;

  const monthLength = getJalaliMonthLength(draft.year, draft.month);
  const startOffset = getJalaliMonthStartOffset(draft.year, draft.month);

  const dayCells = useMemo(() => {
    return [
      ...Array.from({ length: startOffset }, (_, index) => ({ key: `empty-${index}`, day: null })),
      ...Array.from({ length: monthLength }, (_, index) => ({ key: `day-${index + 1}`, day: index + 1 }))
    ];
  }, [monthLength, startOffset]);

  function emit(next: JalaliPickerParts) {
    setDraft(next);
    const iso = jalaliPickerPartsToIso(next);
    if (iso) onChange(iso);
  }

  function moveMonth(delta: number) {
    const absoluteMonth = draft.month + delta;
    const nextYear = draft.year + Math.floor((absoluteMonth - 1) / 12);
    const nextMonth = ((absoluteMonth - 1 + 240) % 12) + 1;
    const nextLength = getJalaliMonthLength(nextYear, nextMonth);
    setDraft({ ...draft, year: nextYear, month: nextMonth, day: Math.min(draft.day, nextLength) });
  }

  function selectDay(day: number) {
    emit({ ...draft, day });
  }

  function changeTime(field: "hour" | "minute", value: string) {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    emit({ ...draft, [field]: parsed });
  }

  function clearSchedule() {
    onChange(null);
    setDraft(getJalaliPickerParts(null));
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="rounded-2xl border border-app-border bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={() => moveMonth(-1)}>
            ماه قبل
          </Button>
          <div className="text-center">
            <p className="text-base font-black text-app-text">
              {jalaliMonthNames[draft.month - 1]} {draft.year}
            </p>
            <p className="mt-1 text-xs text-app-muted">تقویم شمسی · {timezone}</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => moveMonth(1)}>
            ماه بعد
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-app-muted">
          {persianWeekdays.map((weekday) => (
            <span key={weekday}>{weekday}</span>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-1">
          {dayCells.map((cell) => {
            if (!cell.day) return <div key={cell.key} className="h-10" />;

            const selected =
              selectedParts?.year === draft.year &&
              selectedParts.month === draft.month &&
              selectedParts.day === cell.day;

            return (
              <button
                key={cell.key}
                type="button"
                onClick={() => selectDay(cell.day as number)}
                className={`h-10 rounded-xl text-sm font-semibold transition ${
                  selected
                    ? "bg-app-primary text-white shadow-sm"
                    : "bg-slate-50 text-slate-700 hover:bg-violet-50 hover:text-app-primary"
                }`}
              >
                {cell.day}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className="text-sm font-semibold text-app-text">
          ساعت
          <select
            value={draft.hour}
            onChange={(event) => changeTime("hour", event.target.value)}
            className="mt-2 w-full rounded-xl border border-app-border bg-white px-3 py-2 text-sm outline-none ring-app-primary focus:ring-2"
          >
            {Array.from({ length: 24 }, (_, hour) => (
              <option key={hour} value={hour}>
                {pad(hour)}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-semibold text-app-text">
          دقیقه
          <select
            value={draft.minute}
            onChange={(event) => changeTime("minute", event.target.value)}
            className="mt-2 w-full rounded-xl border border-app-border bg-white px-3 py-2 text-sm outline-none ring-app-primary focus:ring-2"
          >
            {Array.from({ length: 12 }, (_, index) => index * 5).map((minute) => (
              <option key={minute} value={minute}>
                {pad(minute)}
              </option>
            ))}
          </select>
        </label>

        <Button type="button" variant="ghost" onClick={clearSchedule}>
          حذف زمان‌بندی
        </Button>
      </div>

      <div className="rounded-xl bg-slate-50 p-4 text-sm leading-7 text-app-muted ring-1 ring-app-border">
        <p>
          <span className="font-semibold text-app-text">وضعیت:</span>{" "}
          {hasSchedule ? "با ذخیره فرم، پست زمان‌بندی می‌شود." : "فعلاً به عنوان پیش‌نویس ذخیره می‌شود."}
        </p>
        <p>
          <span className="font-semibold text-app-text">زمان انتخاب‌شده:</span> {formatSchedule(selectedParts)}
        </p>
      </div>
    </div>
  );
}
