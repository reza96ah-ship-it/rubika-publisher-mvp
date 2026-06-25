from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def patch_node_test() -> None:
    path = ROOT / "frontend" / "lib" / "dashboard.test.ts"
    text = path.read_text(encoding="utf-8")
    old = '''describe("loadDashboardSnapshot", () => {
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
    new = '''describe("loadDashboardSnapshot", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("treats a missing active store as an empty onboarding state", async () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: vi.fn().mockReturnValue("test-session")
      }
    });
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
    if old in text:
        path.write_text(text.replace(old, new, 1), encoding="utf-8")
    elif new not in text:
        raise RuntimeError("Unexpected Dashboard loader test structure")


def remove_obsolete_capture_scripts() -> None:
    for relative in (
        ".github/scripts/capture-dashboard-review.cjs",
        ".github/scripts/render-dashboard-review.cjs",
    ):
        (ROOT / relative).unlink(missing_ok=True)


def main() -> None:
    patch_node_test()
    remove_obsolete_capture_scripts()
    print("Dashboard acceptance follow-up applied.")


if __name__ == "__main__":
    main()
