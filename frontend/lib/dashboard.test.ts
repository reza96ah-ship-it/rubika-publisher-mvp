import { describe, expect, it } from "vitest";
import type { Campaign } from "./campaigns";
import {
  deriveDashboardModel,
  type ChannelAccount,
  type DashboardSnapshot,
  type PublishAttempt
} from "./dashboard";
import { emptyOperationalNotifications, type OperationalNotification } from "./notifications";
import type { Post } from "./posts";

const now = new Date("2026-06-25T12:00:00.000Z");

function post(overrides: Partial<Post> = {}): Post {
  return {
    id: 1,
    store_id: 1,
    title: "پست نمونه",
    caption: "",
    hashtags: "",
    platform: "rubika",
    status: "draft",
    timezone: "Asia/Tehran",
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
    created_at: "2026-06-20T08:00:00.000Z",
    updated_at: "2026-06-20T08:00:00.000Z",
    ...overrides
  };
}

function attempt(overrides: Partial<PublishAttempt> = {}): PublishAttempt {
  return {
    id: 1,
    post_id: 1,
    post_title: "پست نمونه",
    post_platform: "rubika",
    channel: "rubika",
    action: "scheduled",
    status: "success",
    request_payload: "{}",
    response_payload: "{}",
    error: "",
    started_at: "2026-06-24T08:00:00.000Z",
    finished_at: "2026-06-24T08:01:00.000Z",
    created_at: "2026-06-24T08:00:00.000Z",
    ...overrides
  };
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
    capabilities: ["publish"],
    limitations: [],
    last_error: "",
    last_test_at: "2026-06-25T08:00:00.000Z",
    is_active: true,
    created_at: "2026-06-01T08:00:00.000Z",
    updated_at: "2026-06-25T08:00:00.000Z",
    ...overrides
  };
}

function campaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: 1,
    store_id: 1,
    name: "کمپین فعال",
    goal: "افزایش آگاهی",
    status: "active",
    color: "#0F766E",
    owner: "تیم محتوا",
    starts_at: "2026-06-01T00:00:00.000Z",
    ends_at: "2026-06-30T00:00:00.000Z",
    notes: "",
    post_count: 4,
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-20T00:00:00.000Z",
    ...overrides
  };
}

function notification(overrides: Partial<OperationalNotification> = {}): OperationalNotification {
  return {
    id: "notice-1",
    category: "publishing",
    severity: "warning",
    title: "هشدار نمونه",
    description: "نیازمند بررسی",
    recovery_hint: "صف را بررسی کنید",
    action_label: "رسیدگی",
    action_href: "/queue",
    post_id: 1,
    created_at: "2026-06-25T09:00:00.000Z",
    action_required: true,
    ...overrides
  };
}

function snapshot(overrides: Partial<DashboardSnapshot> = {}): DashboardSnapshot {
  return {
    posts: [],
    attempts: [],
    channels: {
      accounts: [],
      summary: { total: 0, ready: 0, action_required: 0, channels: [] }
    },
    campaigns: [],
    workspace: { store: null, rubika: null },
    notifications: emptyOperationalNotifications,
    errors: {},
    ...overrides
  };
}

describe("deriveDashboardModel", () => {
  it("selects only the nearest future scheduled post", () => {
    const model = deriveDashboardModel(snapshot({
      posts: [
        post({ id: 1, status: "scheduled", scheduled_at: "2026-06-25T10:00:00.000Z" }),
        post({ id: 2, title: "بعدی", status: "scheduled", scheduled_at: "2026-06-25T14:00:00.000Z" }),
        post({ id: 3, status: "scheduled", scheduled_at: "2026-06-26T08:00:00.000Z" })
      ]
    }), new Set(), now);

    expect(model.nextScheduledPost?.id).toBe(2);
    expect(model.scheduledToday).toBe(1);
    expect(model.primaryAction.href).toBe("/compose?postId=2");
  });

  it("uses real attempt outcomes and the latest attempt per post", () => {
    const model = deriveDashboardModel(snapshot({
      posts: [post({ id: 7, status: "published", published_at: "2026-06-24T10:00:00.000Z" })],
      attempts: [
        attempt({ id: 1, post_id: 7, status: "success", created_at: "2026-06-23T08:00:00.000Z" }),
        attempt({ id: 2, post_id: 7, status: "failed", created_at: "2026-06-24T08:00:00.000Z", finished_at: "2026-06-24T08:01:00.000Z" }),
        attempt({ id: 3, post_id: 8, status: "success", created_at: "2026-06-24T09:00:00.000Z" })
      ]
    }), new Set(), now);

    expect(model.attempts.successful7d).toBe(2);
    expect(model.attempts.failed7d).toBe(1);
    expect(model.attempts.successRate).toBe(67);
    expect(model.failedPosts).toBe(1);
    expect(model.actions[0]?.id).toBe("publishing-failures");
  });

  it("combines approval, channel, and unread notification backlogs", () => {
    const notice = notification({ severity: "critical" });
    const model = deriveDashboardModel(snapshot({
      posts: [
        post({ id: 1, approval_status: "pending" }),
        post({ id: 2, approval_status: "changes_requested" }),
        post({ id: 3, approval_status: "rejected" })
      ],
      channels: {
        accounts: [channel(), channel({ id: 2, channel: "instagram", status: "oauth_required", mode: "disconnected" })],
        summary: { total: 2, ready: 1, action_required: 1, channels: ["rubika", "instagram"] }
      },
      notifications: {
        notifications: [notice],
        summary: { total: 1, action_required: 1, critical: 1, warning: 0, info: 0 }
      }
    }), new Set(), now);

    expect(model.approvals.total).toBe(3);
    expect(model.channelSummary).toEqual({ total: 2, ready: 1, actionRequired: 1 });
    expect(model.unreadActionNotifications).toBe(1);
    expect(model.actionBacklog).toBe(5);
    expect(model.primaryAction.id).toBe("notification:notice-1");
    expect(model.tone).toBe("alert");
  });

  it("compares published throughput across rolling seven-day windows", () => {
    const model = deriveDashboardModel(snapshot({
      posts: [
        post({ id: 1, status: "published", published_at: "2026-06-24T10:00:00.000Z" }),
        post({ id: 2, status: "published", published_at: "2026-06-20T10:00:00.000Z" }),
        post({ id: 3, status: "published", published_at: "2026-06-16T10:00:00.000Z" })
      ],
      campaigns: [campaign()]
    }), new Set(), now);

    expect(model.throughput).toEqual({ published7d: 2, publishedPrevious7d: 1, delta: 1 });
    expect(model.campaigns[0]?.name).toBe("کمپین فعال");
  });

  it("exposes partial source failures without discarding available data", () => {
    const model = deriveDashboardModel(snapshot({
      posts: [post({ id: 1 })],
      errors: { attempts: "ثبت تلاش‌ها در دسترس نیست", channels: "کانال‌ها در دسترس نیست" }
    }), new Set(), now);

    expect(model.degradedSources).toEqual(["attempts", "channels"]);
    expect(model.isOperationallyEmpty).toBe(false);
    expect(model.tone).toBe("warning");
  });
});
