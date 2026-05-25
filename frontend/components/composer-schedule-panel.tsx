"use client";

import { useMemo, useState } from "react";
import { getJalaliMonthLength, getJalaliMonthStartOffset, getJalaliPickerParts, jalaliMonthNames, jalaliPickerPartsToIso, persianWeekdays, type JalaliPickerParts } from "../lib/jalali-picker";
import { Button } from "./ui/button";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatSchedule(parts: JalaliPickerParts | null) {
  if (!parts) return "انتخاب نشده";
  return `${parts.day} ${jalaliMonthNames[parts.month - 1]} ${parts.year}، ساعت ${pad(parts.hour)}:${pad(parts.minute)}`;
}

function sameDay(parts: JalaliPickerParts | null, year: number, month: number, day: number) {
  return Boolean(parts && parts.year === year && parts.month === month && parts.day === day);
}

type ComposerSchedulePanelProps = {
  scheduledAt: string | null;
  timezone: string;
  onChange: (value: string | null) => void;
};

export function ComposerSchedulePanel({ scheduledAt, timezone, onChange }: ComposerSchedulePanelProps) {
  const scheduleTimezone = timezone || "Asia/Tehran";
  const [draft, setDraft] = useState<JalaliPickerParts>(() => getJalaliPickerParts(scheduledAt, scheduleTimezone));
  const hasSchedule = Boolean(scheduledAt);
  const selectedParts = hasSchedule ? getJalaliPickerParts(scheduledAt, scheduleTimezone) : null;
  const todayParts = getJalaliPickerParts(null, scheduleTimezone);
  const monthLength = getJalaliMonthLength(draft.year, draft.month);
  const startOffset = getJalaliMonthStartOffset(draft.year, draft.month);
  const dayCells = useMemo(() => [...Array.from({ length: startOffset }, () => null), ...Array.from({ length: monthLength }, (_, index) => index + 1)], [monthLength, startOffset]);

  function emit(next: JalaliPickerParts) {
    setDraft(next);
    const iso = jalaliPickerPartsToIso(next, scheduleTimezone);
    if (iso) onChange(iso);
  }

  function moveMonth(delta: number) {
    const absoluteMonth = draft.month + delta;
    const nextYear = draft.year + Math.floor((absoluteMonth - 1) / 12);
    const nextMonth = ((absoluteMonth - 1 + 240) % 12) + 1;
    const nextLength = getJalaliMonthLength(nextYear, nextMonth);
    setDraft({ ...draft, year: nextYear, month: nextMonth, day: Math.min(draft.day, nextLength) });
  }

  function changeTime(field: "hour" | "minute", value: string) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) emit({ ...draft, [field]: parsed });
  }

  function clearSchedule() {
    onChange(null);
    setDraft(getJalaliPickerParts(null, scheduleTimezone));
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="rounded-md border border-app-border bg-white p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={() => moveMonth(-1)}>ماه قبل</Button>
          <div className="text-center">
            <p className="text-sm font-black text-app-text">{jalaliMonthNames[draft.month - 1]} {draft.year}</p>
            <p className="mt-1 text-xs text-app-muted">تقویم شمسی · {scheduleTimezone}</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => moveMonth(1)}>ماه بعد</Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => emit(todayParts)}>امروز</Button>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-app-muted">
          {persianWeekdays.map((weekday) => <span key={weekday}>{weekday}</span>)}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {dayCells.map((day, index) => {
            if (!day) return <div key={`empty-${index}`} className="h-12" />;
            const selected = sameDay(selectedParts, draft.year, draft.month, day);
            const today = sameDay(todayParts, draft.year, draft.month, day);
            const classes = selected ? "bg-app-primary text-white shadow-sm" : today ? "bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200" : "bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-app-primary";
            return (
              <button key={day} type="button" onClick={() => emit({ ...draft, day })} className={`relative h-11 rounded text-sm font-semibold transition ${classes}`}>
                <span>{day}</span>
                {today ? <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] ${selected ? "text-white" : "text-emerald-700"}`}>امروز</span> : null}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className="text-sm font-semibold text-app-text">ساعت<select value={draft.hour} onChange={(event) => changeTime("hour", event.target.value)} className="mt-2 w-full rounded-md border border-app-border bg-white px-3 py-2 text-sm outline-none ring-app-primary focus:ring-2">{Array.from({ length: 24 }, (_, hour) => <option key={hour} value={hour}>{pad(hour)}</option>)}</select></label>
        <label className="text-sm font-semibold text-app-text">دقیقه<select value={draft.minute} onChange={(event) => changeTime("minute", event.target.value)} className="mt-2 w-full rounded-md border border-app-border bg-white px-3 py-2 text-sm outline-none ring-app-primary focus:ring-2">{Array.from({ length: 12 }, (_, index) => index * 5).map((minute) => <option key={minute} value={minute}>{pad(minute)}</option>)}</select></label>
        <Button type="button" variant="ghost" onClick={clearSchedule}>حذف زمان‌بندی</Button>
      </div>
      <div className="rounded-md bg-slate-50 p-3 text-sm leading-7 text-app-muted ring-1 ring-app-border">
        <p><span className="font-semibold text-app-text">وضعیت:</span> {hasSchedule ? "با ذخیره فرم، پست زمان‌بندی می‌شود." : "فعلاً به عنوان پیش‌نویس ذخیره می‌شود."}</p>
        <p><span className="font-semibold text-app-text">زمان انتخاب‌شده:</span> {formatSchedule(selectedParts)}</p>
      </div>
    </div>
  );
}
