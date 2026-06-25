import { describe, expect, it } from "vitest";
import type { ChannelAccount } from "../channel-accounts";
import type { Post } from "../posts";
import {
  composerTimezone,
  deriveComposerReadiness,
  emptyComposerForm,
  getComposerValidationMessage,
  hasComposerDraftContent,
  parseComposerDraft,
  serializeComposerDraft,
  type ComposerForm
} from "./domain";

function form(overrides: Partial<ComposerForm> = {}): ComposerForm {
  return { ...emptyComposerForm, ...overrides };
}

function channel(overrides: Partial<ChannelAccount> = {}): ChannelAccount {
  return {
    id: 1,
    store_id: 1,
    channel: "rubika",
    display_name: "روبیکا",
    external_account_id: "channel-1",
    mode: "rubika_bot_api",
    status: "ready",
    capabilities: ["auto_publish"],
    limitations: [],
    last_error: "",
    last_test_at: "2026-06-25T08:00:00.000Z",
    is_active: true,
    created_at: "2026-06-01T08:00:00.000Z",
    updated_at: "2026-06-25T08:00:00.000Z",
    ...overrides
  };
}

function post(overrides: Partial<Post> = {}): Post {
  return {
    id: 1,
    store_id: 1,
    title: "پست نمونه",
    caption: "متن نمونه",
    hashtags: "",
    platform: "rubika",
    status: "draft",
    timezone: composerTimezone,
    campaign_id: null,
    campaign: "",
    internal_note: "",
    scheduled_at: null,
    ready_at: null,
    published_at: null,
    failed_at: null,
    approval_status: "not_required",
    approval_note: "",
    submitted_at: null,
    reviewed_at: null,
    reviewed_by: "",
    rubika_message_id: "",
    last_error: "",
    attempt_count: 0,
    created_at: "2026-06-01T08:00:00.000Z",
    updated_at: "2026-06-01T08:00:00.000Z",
    ...overrides
  };
}

describe("Composer domain", () => {
  it("requires a title before any save action", () => {
    const readiness = deriveComposerReadiness({
      form: form({ caption: "متن" }),
      channelAccounts: [channel()],
      hasMedia: false
    });

    expect(readiness.canSaveDraft).toBe(false);
    expect(readiness.canMarkReady).toBe(false);
    expect(getComposerValidationMessage({
      action: "draft",
      readiness,
      instagramSelected: false,
      instagramReady: false
    })).toBe("برای ذخیره پست، عنوان داخلی را وارد کنید.");
  });

  it("allows ready state with a title and either text or media", () => {
    const textReadiness = deriveComposerReadiness({
      form: form({ title: "عنوان", caption: "متن" }),
      channelAccounts: [],
      hasMedia: false
    });
    const mediaReadiness = deriveComposerReadiness({
      form: form({ title: "عنوان" }),
      channelAccounts: [],
      hasMedia: true
    });

    expect(textReadiness.canMarkReady).toBe(true);
    expect(mediaReadiness.canMarkReady).toBe(true);
  });

  it("requires schedule time, a ready channel, and approval clearance", () => {
    const ready = deriveComposerReadiness({
      form: form({
        title: "عنوان",
        caption: "متن",
        scheduled_at: "2026-06-26T10:00:00.000Z"
      }),
      channelAccounts: [channel()],
      hasMedia: false
    });
    const blocked = deriveComposerReadiness({
      form: form({
        title: "عنوان",
        caption: "متن",
        scheduled_at: "2026-06-26T10:00:00.000Z"
      }),
      channelAccounts: [channel()],
      editingPost: post({ approval_status: "pending" }),
      hasMedia: false
    });

    expect(ready.canSchedule).toBe(true);
    expect(blocked.reviewBlocksSchedule).toBe(true);
    expect(blocked.canSchedule).toBe(false);
  });

  it("reports missing channel readiness before missing schedule time", () => {
    const readiness = deriveComposerReadiness({
      form: form({ title: "عنوان", caption: "متن" }),
      channelAccounts: [],
      hasMedia: false
    });

    expect(getComposerValidationMessage({
      action: "schedule",
      readiness,
      instagramSelected: false,
      instagramReady: false
    })).toBe("برای زمان‌بندی، حداقل یک کانال آماده در مرکز کانال‌ها لازم است.");
  });

  it("round-trips valid local drafts and rejects invalid JSON", () => {
    const snapshot = {
      form: form({ title: "پیش‌نویس", campaign_id: 7 }),
      selectedMediaId: "12",
      savedAt: "2026-06-25T10:00:00.000Z"
    };

    expect(parseComposerDraft(serializeComposerDraft(snapshot))).toEqual(snapshot);
    expect(parseComposerDraft("not-json")).toBeNull();
  });

  it("detects meaningful unsaved local content", () => {
    expect(hasComposerDraftContent(form(), "")).toBe(false);
    expect(hasComposerDraftContent(form({ internal_note: "یادداشت" }), "")).toBe(true);
    expect(hasComposerDraftContent(form(), "9")).toBe(true);
  });
});
