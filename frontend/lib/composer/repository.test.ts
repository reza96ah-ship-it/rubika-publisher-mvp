import { beforeEach, describe, expect, it, vi } from "vitest";
import { emptyComposerForm } from "./domain";

const dependencies = vi.hoisted(() => ({
  loadWorkspaceOverview: vi.fn(),
  loadCampaigns: vi.fn(),
  loadChannelAccounts: vi.fn()
}));

vi.mock("../workspace", () => ({
  loadWorkspaceOverview: dependencies.loadWorkspaceOverview
}));

vi.mock("../campaigns", () => ({
  loadCampaigns: dependencies.loadCampaigns
}));

vi.mock("../channel-accounts", () => ({
  loadChannelAccounts: dependencies.loadChannelAccounts
}));

vi.mock("../posts", () => ({
  apiUrl: "http://api.test",
  authHeaders: () => ({ Authorization: "Bearer test-session" })
}));

import {
  loadComposerResources,
  saveComposerPost,
  uploadComposerMedia
} from "./repository";

function response(input: { ok: boolean; data?: unknown }) {
  return {
    ok: input.ok,
    json: vi.fn().mockResolvedValue(input.data)
  } as unknown as Response;
}

describe("Composer repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    dependencies.loadWorkspaceOverview.mockResolvedValue({ store: { id: 1, name: "فروشگاه" }, rubika: null });
    dependencies.loadCampaigns.mockResolvedValue([]);
    dependencies.loadChannelAccounts.mockResolvedValue({
      accounts: [],
      summary: { total: 0, ready: 0, action_required: 0, channels: [] }
    });
  });

  it("preserves empty-list fallbacks when media or post lists are unavailable", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ ok: false }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await loadComposerResources();

    expect(result.posts).toEqual([]);
    expect(result.mediaAssets).toEqual([]);
    expect(result.editingPost).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("keeps edited-post loading strict", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.endsWith("/posts/42")) return Promise.resolve(response({ ok: false }));
      return Promise.resolve(response({ ok: true, data: [] }));
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(loadComposerResources("42")).rejects.toThrow(
      "دریافت پست برای ویرایش ناموفق بود"
    );
  });

  it("uses POST for new drafts and sends the normalized Composer form", async () => {
    const savedPost = { id: 9, title: "پیش‌نویس" };
    const fetchMock = vi.fn().mockResolvedValue(response({ ok: true, data: savedPost }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await saveComposerPost({
      form: { ...emptyComposerForm, title: "پیش‌نویس" }
    });

    expect(result).toEqual(savedPost);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/posts",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-session",
          "Content-Type": "application/json"
        })
      })
    );
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(JSON.parse(String(init.body))).toEqual(
      expect.objectContaining({
        title: "پیش‌نویس",
        timezone: "Asia/Tehran"
      })
    );
  });

  it("preserves the edited-image save error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({ ok: false })));
    const file = new File(["image"], "edited.png", { type: "image/png" });

    await expect(uploadComposerMedia({
      file,
      tags: "composer, edited"
    })).rejects.toThrow("ذخیره نسخه ویرایش‌شده ناموفق بود");
  });
});
