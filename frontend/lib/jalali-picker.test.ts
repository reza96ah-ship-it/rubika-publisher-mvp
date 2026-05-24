import { afterEach, describe, expect, it, vi } from "vitest";

import { getJalaliPickerParts, jalaliPickerPartsToIso, type JalaliPickerParts } from "./jalali-picker";

const tehranTimeZone = "Asia/Tehran";
const tehranLaunchSlot: JalaliPickerParts = {
  year: 1404,
  month: 10,
  day: 20,
  hour: 9,
  minute: 15
};

describe("Jalali picker timezone conversion", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("converts a Tehran Jalali wall time to a UTC ISO timestamp", () => {
    expect(jalaliPickerPartsToIso(tehranLaunchSlot, tehranTimeZone)).toBe("2026-01-10T05:45:00.000Z");
  });

  it("displays UTC timestamps as Tehran Jalali wall time", () => {
    expect(getJalaliPickerParts("2026-01-10T05:45:00.000Z", tehranTimeZone)).toEqual(tehranLaunchSlot);
  });

  it("keeps the default Tehran conversion stable when the host timezone differs", () => {
    vi.stubEnv("TZ", "America/Los_Angeles");

    expect(jalaliPickerPartsToIso(tehranLaunchSlot)).toBe("2026-01-10T05:45:00.000Z");
    expect(getJalaliPickerParts("2026-01-10T05:45:00.000Z")).toEqual(tehranLaunchSlot);
  });
});
