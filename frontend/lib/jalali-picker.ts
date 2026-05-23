export type JalaliPickerParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

export const jalaliMonthNames = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
export const persianWeekdays = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

function numberPart(parts: Intl.DateTimeFormatPart[], type: string) {
  return Number(parts.find((part) => part.type === type)?.value ?? 0);
}

function safeDate(value?: string | null) {
  if (!value) return new Date();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function jalaliOnlyParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US-u-ca-persian-nu-latn", {
    calendar: "persian",
    numberingSystem: "latn",
    year: "numeric",
    month: "numeric",
    day: "numeric"
  }).formatToParts(date);

  return {
    year: numberPart(parts, "year"),
    month: numberPart(parts, "month"),
    day: numberPart(parts, "day")
  };
}

export function getJalaliPickerParts(value?: string | null): JalaliPickerParts {
  const date = safeDate(value);
  const parts = new Intl.DateTimeFormat("en-US-u-ca-persian-nu-latn", {
    calendar: "persian",
    numberingSystem: "latn",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(date);

  return {
    year: numberPart(parts, "year"),
    month: numberPart(parts, "month"),
    day: numberPart(parts, "day"),
    hour: numberPart(parts, "hour"),
    minute: numberPart(parts, "minute")
  };
}

function jalaliDateToGregorianUtc(year: number, month: number, day: number) {
  const searchStart = new Date(Date.UTC(year + 621, 2, 1, 12, 0, 0));

  for (let offset = -20; offset <= 380; offset += 1) {
    const candidate = new Date(searchStart.getTime() + offset * 86400000);
    const parts = jalaliOnlyParts(candidate);
    if (parts.year === year && parts.month === month && parts.day === day) return candidate;
  }

  return null;
}

export function jalaliPickerPartsToIso(parts: JalaliPickerParts) {
  const gregorian = jalaliDateToGregorianUtc(parts.year, parts.month, parts.day);
  if (!gregorian) return null;

  return new Date(
    gregorian.getUTCFullYear(),
    gregorian.getUTCMonth(),
    gregorian.getUTCDate(),
    parts.hour,
    parts.minute,
    0,
    0
  ).toISOString();
}

export function getJalaliMonthLength(year: number, month: number) {
  for (let day = 31; day >= 29; day -= 1) {
    if (jalaliDateToGregorianUtc(year, month, day)) return day;
  }
  return 29;
}

export function getJalaliMonthStartOffset(year: number, month: number) {
  const firstDay = jalaliDateToGregorianUtc(year, month, 1);
  if (!firstDay) return 0;
  const local = new Date(firstDay.getUTCFullYear(), firstDay.getUTCMonth(), firstDay.getUTCDate());
  return (local.getDay() + 1) % 7;
}
