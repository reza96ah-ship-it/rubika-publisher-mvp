import type { Campaign } from "./campaigns";
import type { OperationalNotification, OperationalNotifications } from "./notifications";
import { emptyOperationalNotifications } from "./notifications";
import { apiUrl, authHeaders, type Post } from "./posts";
import type { RubikaSettings, StoreProfile, WorkspaceOverview } from "./workspace";

export type PublishAttempt = {
  id: number;
  post_id: number;
  post_title: string;
  post_platform: string;
  channel: string;
  action: string;
  status: string;
  request_payload: string;
  response_payload: string;
  error: string;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
};

export type ChannelAccount = {
  id: number;
  store_id: number;
  channel: string;
  display_name: string;
  external_account_id: string;
  mode: string;
  status: string;
  capabilities: string[];
  limitations: string[];
  last_error: string;
  last_test_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ChannelAccountList = {
  accounts: ChannelAccount[];
  summary: {
    total: number;
    ready: number;
    action_required: number;
    channels: string[];
  };
};

export type DashboardSource =
  | "posts"
  | "attempts"
  | "channels"
  | "campaigns"
  | "store"
  | "rubika"
  | "notifications";

export type DashboardSnapshot = {
  posts: Post[];
  attempts: PublishAttempt[];
  channels: ChannelAccountList;
  campaigns: Campaign[];
  workspace: WorkspaceOverview;
  notifications: OperationalNotifications;
  errors: Partial<Record<DashboardSource, string>>;
};

export type DashboardActionTone = "neutral" | "primary" | "success" | "warning" | "alert" | "info";

export type DashboardAction = {
  id: string;
  title: string;
  detail: string;
  href: string;
  label: string;
  tone: DashboardActionTone;
  priority: number;
  recoveryHint?: string;
};

export type DashboardChannel = {
  id: number;
  channel: string;
  label: string;
  displayName: string;
  mode: string;
  status: string;
  statusLabel: string;
  tone: DashboardActionTone;
  lastTestAt: string | null;
  lastError: string;
  href: string;
};

export type DashboardCampaign = {
  id: number;
  name: string;
  goal: string;
  owner: string;
  postCount: number;
  endsAt: string | null;
  href: string;
};

export type DashboardModel = {
  nextScheduledPost: Post | null;
  scheduledToday: number;
  queue: {
    ready: number;
    scheduled: number;
    publishing: number;
    failed: number;
  };
  attempts: {
    total7d: number;
    successful7d: number;
    failed7d: number;
    active: number;
    successRate: number | null;
  };
  throughput: {
    published7d: number;
    publishedPrevious7d: number;
    delta: number;
  };
  channels: DashboardChannel[];
  channelSummary: {
    total: number;
    ready: number;
    actionRequired: number;
  };
  approvals: {
    pending: number;
    changesRequested: number;
    rejected: number;
    total: number;
  };
  failedPosts: number;
  unreadActionNotifications: number;
  actionBacklog: number;
  actions: DashboardAction[];
  primaryAction: DashboardAction;
  campaigns: DashboardCampaign[];
  alerts: OperationalNotification[];
  briefing: string;
  tone: DashboardActionTone;
  degradedSources: DashboardSource[];
  isOperationallyEmpty: boolean;
};

const emptyChannels: ChannelAccountList = {
  accounts: [],
  summary: { total: 0, ready: 0, action_required: 0, channels: [] }
};

async function fetchJson<T>(path: string, fallbackMessage: string): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, { headers: authHeaders() });
  if (!response.ok) throw new Error(fallbackMessage);
  return response.json() as Promise<T>;
}

function resultValue<T>(
  result: PromiseSettledResult<T>,
  fallback: T,
  source: DashboardSource,
  errors: Partial<Record<DashboardSource, string>>
) {
  if (result.status === "fulfilled") return result.value;
  errors[source] = result.reason instanceof Error ? result.reason.message : "دریافت داده ناموفق بود";
  return fallback;
}

export async function loadDashboardSnapshot(): Promise<DashboardSnapshot> {
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

function timestamp(value?: string | null) {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function sameLocalDay(first: Date, second: Date) {
  return first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate();
}

function channelLabel(channel: string) {
  if (channel === "rubika") return "روبیکا";
  if (channel === "instagram") return "اینستاگرام";
  return channel || "کانال";
}

function channelStatusLabel(status: string) {
  if (status === "ready") return "آماده";
  if (status === "test_expired") return "تست منقضی";
  if (status === "oauth_required") return "نیازمند اتصال";
  if (status === "not_configured") return "تنظیم نشده";
  if (status === "failed") return "خطا دارد";
  return status || "نامشخص";
}

function channelModeLabel(mode: string) {
  if (mode === "instagram_professional_api") return "Meta API";
  if (mode === "instagram_personal_manual") return "یادآوری دستی";
  if (mode === "rubika_bot_api") return "Rubika API";
  if (mode === "disconnected") return "بدون اتصال";
  return mode || "نامشخص";
}

function sourcePriority(notification: OperationalNotification) {
  if (notification.severity === "critical") return 100;
  if (notification.severity === "warning") return 80;
  return 50;
}

function latestAttemptByPost(attempts: PublishAttempt[]) {
  const latest = new Map<number, PublishAttempt>();
  [...attempts]
    .sort((first, second) => timestamp(second.created_at) - timestamp(first.created_at))
    .forEach((attempt) => {
      if (!latest.has(attempt.post_id)) latest.set(attempt.post_id, attempt);
    });
  return latest;
}

export function deriveDashboardModel(
  snapshot: DashboardSnapshot,
  readNotificationIds: Set<string> = new Set(),
  now = new Date()
): DashboardModel {
  const nowTime = now.getTime();
  const day = 24 * 60 * 60 * 1000;
  const currentWindowStart = nowTime - 7 * day;
  const previousWindowStart = nowTime - 14 * day;

  const scheduledPosts = snapshot.posts
    .filter((post) => post.status === "scheduled" && timestamp(post.scheduled_at) >= nowTime)
    .sort((first, second) => timestamp(first.scheduled_at) - timestamp(second.scheduled_at));
  const nextScheduledPost = scheduledPosts[0] ?? null;
  const scheduledToday = scheduledPosts.filter((post) => {
    const value = post.scheduled_at ? new Date(post.scheduled_at) : null;
    return value && !Number.isNaN(value.getTime()) ? sameLocalDay(value, now) : false;
  }).length;

  const queue = {
    ready: snapshot.posts.filter((post) => ["ready", "manual_ready"].includes(post.status)).length,
    scheduled: snapshot.posts.filter((post) => post.status === "scheduled").length,
    publishing: snapshot.posts.filter((post) => post.status === "publishing").length,
    failed: snapshot.posts.filter((post) => ["failed", "partially_published"].includes(post.status)).length
  };

  const recentAttempts = snapshot.attempts.filter((attempt) => {
    const value = timestamp(attempt.finished_at || attempt.started_at || attempt.created_at);
    return value >= currentWindowStart && value <= nowTime;
  });
  const successful7d = recentAttempts.filter((attempt) => attempt.status === "success").length;
  const failed7d = recentAttempts.filter((attempt) => attempt.status === "failed").length;
  const decidedAttempts = successful7d + failed7d;
  const latestAttempts = latestAttemptByPost(snapshot.attempts);
  const activeAttempts = [...latestAttempts.values()].filter((attempt) => attempt.status === "started").length;
  const latestFailedAttemptPosts = new Set(
    [...latestAttempts.values()].filter((attempt) => attempt.status === "failed").map((attempt) => attempt.post_id)
  );

  const published7d = snapshot.posts.filter((post) => {
    const value = timestamp(post.published_at);
    return value >= currentWindowStart && value <= nowTime;
  }).length;
  const publishedPrevious7d = snapshot.posts.filter((post) => {
    const value = timestamp(post.published_at);
    return value >= previousWindowStart && value < currentWindowStart;
  }).length;

  const channels = snapshot.channels.accounts.map<DashboardChannel>((account) => ({
    id: account.id,
    channel: account.channel,
    label: channelLabel(account.channel),
    displayName: account.display_name || channelLabel(account.channel),
    mode: channelModeLabel(account.mode),
    status: account.status,
    statusLabel: channelStatusLabel(account.status),
    tone: account.status === "ready" ? "success" : account.status === "failed" ? "alert" : "warning",
    lastTestAt: account.last_test_at,
    lastError: account.last_error,
    href: account.channel === "rubika" ? "/rubika" : account.channel === "instagram" ? "/instagram" : "/channels"
  }));
  const readyChannels = channels.filter((channel) => channel.status === "ready").length;
  const actionRequiredChannels = channels.filter((channel) => channel.status !== "ready").length;

  const pending = snapshot.posts.filter((post) => post.approval_status === "pending").length;
  const changesRequested = snapshot.posts.filter((post) => post.approval_status === "changes_requested").length;
  const rejected = snapshot.posts.filter((post) => post.approval_status === "rejected").length;
  const approvalTotal = pending + changesRequested + rejected;
  const failedPostIds = new Set(
    snapshot.posts.filter((post) => ["failed", "partially_published"].includes(post.status)).map((post) => post.id)
  );
  latestFailedAttemptPosts.forEach((postId) => failedPostIds.add(postId));

  const unreadNotifications = snapshot.notifications.notifications.filter(
    (notification) => notification.action_required && !readNotificationIds.has(notification.id)
  );

  const notificationActions: DashboardAction[] = unreadNotifications.map((notification) => ({
    id: `notification:${notification.id}`,
    title: notification.title,
    detail: notification.description,
    href: notification.action_href || "/inbox",
    label: notification.action_label || "رسیدگی",
    tone: notification.severity === "critical" ? "alert" : notification.severity === "warning" ? "warning" : "info",
    priority: sourcePriority(notification),
    recoveryHint: notification.recovery_hint
  }));

  const synthesizedActions: DashboardAction[] = [
    ...(failedPostIds.size
      ? [{
          id: "publishing-failures",
          title: "بازیابی انتشارهای ناموفق",
          detail: `${failedPostIds.size} پست با آخرین وضعیت یا تلاش ناموفق نیازمند بررسی است.`,
          href: "/queue",
          label: "باز کردن صف",
          tone: "alert" as const,
          priority: 95
        }]
      : []),
    ...(approvalTotal
      ? [{
          id: "approval-backlog",
          title: "تکمیل صف بازبینی",
          detail: `${approvalTotal} محتوا در انتظار تایید، اصلاح یا تصمیم نهایی است.`,
          href: "/content?approval=pending",
          label: "بازبینی محتوا",
          tone: "warning" as const,
          priority: 85
        }]
      : []),
    ...(actionRequiredChannels
      ? [{
          id: "channel-readiness",
          title: "رفع مشکل کانال‌ها",
          detail: `${actionRequiredChannels} کانال هنوز برای عملیات کامل آماده نیست.`,
          href: "/channels",
          label: "مرکز کانال‌ها",
          tone: "warning" as const,
          priority: 75
        }]
      : [])
  ];

  const actions = [...notificationActions, ...synthesizedActions]
    .sort((first, second) => second.priority - first.priority)
    .slice(0, 6);
  const primaryAction = actions[0] ?? (nextScheduledPost
    ? {
        id: "next-publication",
        title: "بازبینی انتشار بعدی",
        detail: nextScheduledPost.title || "پست زمان‌بندی‌شده آماده بررسی است.",
        href: `/compose?postId=${nextScheduledPost.id}`,
        label: "باز کردن پست",
        tone: "primary",
        priority: 40
      }
    : {
        id: "create-post",
        title: "ساخت محتوای بعدی",
        detail: "انتشار زمان‌بندی‌شده‌ای در برنامه نزدیک وجود ندارد.",
        href: "/compose",
        label: "ساخت پست",
        tone: "primary",
        priority: 20
      });

  const campaigns = snapshot.campaigns
    .filter((campaign) => campaign.status === "active")
    .sort((first, second) => {
      const firstEnd = timestamp(first.ends_at) || Number.MAX_SAFE_INTEGER;
      const secondEnd = timestamp(second.ends_at) || Number.MAX_SAFE_INTEGER;
      return firstEnd - secondEnd || second.post_count - first.post_count;
    })
    .slice(0, 3)
    .map<DashboardCampaign>((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      goal: campaign.goal,
      owner: campaign.owner,
      postCount: campaign.post_count,
      endsAt: campaign.ends_at,
      href: `/campaigns?campaign=${campaign.id}`
    }));

  const actionBacklog = failedPostIds.size + approvalTotal + actionRequiredChannels + unreadNotifications.length;
  const criticalAlerts = unreadNotifications.filter((notification) => notification.severity === "critical").length;
  const degradedSources = Object.keys(snapshot.errors) as DashboardSource[];
  const tone: DashboardActionTone = criticalAlerts || failedPostIds.size
    ? "alert"
    : actionBacklog || degradedSources.length
      ? "warning"
      : "success";
  const briefing = criticalAlerts
    ? `${criticalAlerts} هشدار بحرانی قبل از ادامه برنامه انتشار نیازمند رسیدگی است.`
    : failedPostIds.size
      ? `${failedPostIds.size} انتشار یا تلاش ناموفق در اولویت بازیابی است.`
      : approvalTotal
        ? `${approvalTotal} محتوا پشت گیت بازبینی مانده است.`
        : actionRequiredChannels
          ? `${actionRequiredChannels} کانال هنوز آماده عملیات کامل نیست.`
          : nextScheduledPost
            ? "انتشار بعدی مشخص است و مسیر عملیاتی بدون مانع بحرانی ادامه دارد."
            : "صف نزدیک خالی است؛ ساخت و زمان‌بندی محتوای بعدی بهترین اقدام است.";

  return {
    nextScheduledPost,
    scheduledToday,
    queue,
    attempts: {
      total7d: recentAttempts.length,
      successful7d,
      failed7d,
      active: activeAttempts,
      successRate: decidedAttempts ? Math.round((successful7d / decidedAttempts) * 100) : null
    },
    throughput: {
      published7d,
      publishedPrevious7d,
      delta: published7d - publishedPrevious7d
    },
    channels,
    channelSummary: {
      total: channels.length,
      ready: readyChannels,
      actionRequired: actionRequiredChannels
    },
    approvals: { pending, changesRequested, rejected, total: approvalTotal },
    failedPosts: failedPostIds.size,
    unreadActionNotifications: unreadNotifications.length,
    actionBacklog,
    actions,
    primaryAction,
    campaigns,
    alerts: unreadNotifications
      .sort((first, second) => sourcePriority(second) - sourcePriority(first) || timestamp(second.created_at) - timestamp(first.created_at))
      .slice(0, 4),
    briefing,
    tone,
    degradedSources,
    isOperationallyEmpty: snapshot.posts.length === 0
      && snapshot.attempts.length === 0
      && snapshot.campaigns.length === 0
      && snapshot.channels.accounts.length === 0
      && snapshot.notifications.notifications.length === 0
  };
}
