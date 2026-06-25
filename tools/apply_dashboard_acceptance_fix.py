from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def replace_once(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    if old not in text:
        raise RuntimeError(f"Expected source block not found in {path.relative_to(ROOT)}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


def update_dashboard_loader() -> None:
    path = ROOT / "frontend" / "lib" / "dashboard.ts"
    old = '''export async function loadDashboardSnapshot(): Promise<DashboardSnapshot> {
  const [postsResult, attemptsResult, channelsResult, campaignsResult, storeResult, rubikaResult, notificationsResult] = await Promise.allSettled([
    fetchJson<Post[]>("/posts", "دریافت محتوای داشبورد ناموفق بود"),
    fetchJson<PublishAttempt[]>("/publish-attempts", "دریافت تلاش‌های انتشار ناموفق بود"),
    fetchJson<ChannelAccountList>("/channels/accounts", "دریافت وضعیت کانال‌ها ناموفق بود"),
    fetchJson<Campaign[]>("/campaigns?status=all", "دریافت کمپین‌ها ناموفق بود"),
    fetchJson<StoreProfile>("/stores/active", "دریافت فضای کاری ناموفق بود"),
    fetchJson<RubikaSettings>("/rubika/settings", "دریافت تنظیمات روبیکا ناموفق بود"),
    fetchJson<OperationalNotifications>("/notifications", "دریافت هشدارهای عملیاتی ناموفق بود")
  ]);

  const errors: Partial<Record<DashboardSource, string>> = {};
  const store = resultValue(storeResult, null as StoreProfile | null, "store", errors);
  const rubika = resultValue(rubikaResult, null as RubikaSettings | null, "rubika", errors);

  return {
    posts: resultValue(postsResult, [], "posts", errors),
    attempts: resultValue(attemptsResult, [], "attempts", errors),
    channels: resultValue(channelsResult, emptyChannels, "channels", errors),
    campaigns: resultValue(campaignsResult, [], "campaigns", errors),
    workspace: { store, rubika },
    notifications: resultValue(notificationsResult, emptyOperationalNotifications, "notifications", errors),
    errors
  };
}
'''
    new = '''export async function loadDashboardSnapshot(): Promise<DashboardSnapshot> {
  const errors: Partial<Record<DashboardSource, string>> = {};
  const [storeResult] = await Promise.allSettled([
    fetchJson<StoreProfile | null>("/stores/active", "دریافت فضای کاری ناموفق بود")
  ]);
  const store = resultValue(storeResult, null, "store", errors);

  if (!store) {
    return {
      posts: [],
      attempts: [],
      channels: emptyChannels,
      campaigns: [],
      workspace: { store: null, rubika: null },
      notifications: emptyOperationalNotifications,
      errors
    };
  }

  const [postsResult, attemptsResult, channelsResult, campaignsResult, rubikaResult, notificationsResult] = await Promise.allSettled([
    fetchJson<Post[]>("/posts", "دریافت محتوای داشبورد ناموفق بود"),
    fetchJson<PublishAttempt[]>("/publish-attempts", "دریافت تلاش‌های انتشار ناموفق بود"),
    fetchJson<ChannelAccountList>("/channels/accounts", "دریافت وضعیت کانال‌ها ناموفق بود"),
    fetchJson<Campaign[]>("/campaigns?status=all", "دریافت کمپین‌ها ناموفق بود"),
    fetchJson<RubikaSettings | null>("/rubika/settings", "دریافت تنظیمات روبیکا ناموفق بود"),
    fetchJson<OperationalNotifications>("/notifications", "دریافت هشدارهای عملیاتی ناموفق بود")
  ]);
  const rubika = resultValue(rubikaResult, null, "rubika", errors);

  return {
    posts: resultValue(postsResult, [], "posts", errors),
    attempts: resultValue(attemptsResult, [], "attempts", errors),
    channels: resultValue(channelsResult, emptyChannels, "channels", errors),
    campaigns: resultValue(campaignsResult, [], "campaigns", errors),
    workspace: { store, rubika },
    notifications: resultValue(notificationsResult, emptyOperationalNotifications, "notifications", errors),
    errors
  };
}
'''
    replace_once(path, old, new)


def update_mobile_metrics() -> None:
    path = ROOT / "frontend" / "components" / "dashboard" / "dashboard-v2.tsx"
    replace_once(
        path,
        'className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="شاخص‌های اصلی داشبورد"',
        'className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="شاخص‌های اصلی داشبورد"',
    )


def update_tests() -> None:
    path = ROOT / "frontend" / "lib" / "dashboard.test.ts"
    text = path.read_text(encoding="utf-8")
    text = text.replace(
        'import { describe, expect, it } from "vitest";',
        'import { afterEach, describe, expect, it, vi } from "vitest";',
        1,
    )
    text = text.replace(
        '  deriveDashboardModel,\n',
        '  deriveDashboardModel,\n  loadDashboardSnapshot,\n',
        1,
    )
    addition = '''

describe("loadDashboardSnapshot", () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("treats a missing active store as an empty onboarding state", async () => {
    window.localStorage.setItem("rubika_publisher_access", "test-session");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => null
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await loadDashboardSnapshot();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.workspace).toEqual({ store: null, rubika: null });
    expect(result.posts).toEqual([]);
    expect(result.channels.accounts).toEqual([]);
    expect(result.errors).toEqual({});
  });
});
'''
    if 'describe("loadDashboardSnapshot"' in text:
        raise RuntimeError("Dashboard loader tests already exist")
    path.write_text(text.rstrip() + addition, encoding="utf-8")


def remove_obsolete_capture_scripts() -> None:
    for relative in (
        ".github/scripts/capture-dashboard-review.cjs",
        ".github/scripts/render-dashboard-review.cjs",
    ):
        (ROOT / relative).unlink(missing_ok=True)


def main() -> None:
    update_dashboard_loader()
    update_mobile_metrics()
    update_tests()
    remove_obsolete_capture_scripts()
    print("Dashboard acceptance source fixes applied.")


if __name__ == "__main__":
    main()
