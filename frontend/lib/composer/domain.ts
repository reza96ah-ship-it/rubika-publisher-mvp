import {
  channelIsReady,
  findChannelAccount,
  type ChannelAccount
} from "../channel-accounts";
import {
  normalizeChannels,
  type PublishingChannel
} from "../channels";
import {
  approvalBlocksPublishing,
  type Post
} from "../posts";

export const composerTimezone = "Asia/Tehran";
export const composerDraftStorageKey = "rubika_publisher_compose_draft";

export type ComposerForm = {
  title: string;
  caption: string;
  hashtags: string;
  platform: string;
  timezone: string;
  campaign_id: number | null;
  campaign: string;
  internal_note: string;
  scheduled_at: string | null;
};

export type SaveAction = "draft" | "ready" | "schedule";
export type AutosaveState = "idle" | "dirty" | "saved" | "restored";
export type StudioPanel = "preview" | "schedule" | "review";
export type WorkspaceMode = "content" | "media" | "workflow";

export type ComposerImageEditSource = {
  imageUrl: string;
  filename: string;
  folder: string;
  tags: string;
};

export type MediaAsset = {
  id: number;
  post_id: number | null;
  original_filename: string;
  content_type: string;
  size_bytes: number;
  folder: string;
  tags: string;
};

export type ComposerDraftSnapshot = {
  form: ComposerForm;
  selectedMediaId: string;
  savedAt: string;
};

export type ComposerReadiness = {
  selectedChannels: PublishingChannel[];
  selectedReadyChannels: PublishingChannel[];
  hasTitle: boolean;
  hasPostBody: boolean;
  hasSchedule: boolean;
  hasReadyPublishingChannel: boolean;
  canMoveToReady: boolean;
  reviewBlocksSchedule: boolean;
  canSaveDraft: boolean;
  canMarkReady: boolean;
  canSchedule: boolean;
};

export const emptyComposerForm: ComposerForm = {
  title: "",
  caption: "",
  hashtags: "",
  platform: "rubika",
  timezone: composerTimezone,
  campaign_id: null,
  campaign: "",
  internal_note: "",
  scheduled_at: null
};

export function parseComposerDraft(raw: string | null): ComposerDraftSnapshot | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<ComposerDraftSnapshot>;
    if (!parsed.form || typeof parsed.form !== "object") return null;
    if (typeof parsed.savedAt !== "string") return null;

    return {
      form: {
        ...emptyComposerForm,
        ...parsed.form,
        campaign_id: parsed.form.campaign_id ?? null,
        scheduled_at: parsed.form.scheduled_at ?? null
      },
      selectedMediaId: typeof parsed.selectedMediaId === "string" ? parsed.selectedMediaId : "",
      savedAt: parsed.savedAt
    };
  } catch {
    return null;
  }
}

export function serializeComposerDraft(snapshot: ComposerDraftSnapshot) {
  return JSON.stringify(snapshot);
}

export function hasComposerDraftContent(form: ComposerForm, selectedMediaId: string) {
  return Boolean(
    form.title.trim()
    || form.caption.trim()
    || form.hashtags.trim()
    || form.campaign_id
    || form.campaign.trim()
    || form.internal_note.trim()
    || form.scheduled_at
    || selectedMediaId
  );
}

export function deriveComposerReadiness(input: {
  form: ComposerForm;
  channelAccounts: ChannelAccount[];
  editingPost?: Post | null;
  hasMedia: boolean;
}): ComposerReadiness {
  const { form, channelAccounts, editingPost, hasMedia } = input;
  const selectedChannels = normalizeChannels(form.platform);
  const selectedReadyChannels = selectedChannels.filter((channel) =>
    channelIsReady(findChannelAccount(channelAccounts, channel))
  );
  const hasTitle = Boolean(form.title.trim());
  const hasPostBody = Boolean(form.caption.trim() || hasMedia);
  const hasSchedule = Boolean(form.scheduled_at);
  const hasReadyPublishingChannel = selectedReadyChannels.length > 0;
  const canMoveToReady = !editingPost
    || ["draft", "failed", "cancelled"].includes(editingPost.status);
  const reviewBlocksSchedule = editingPost
    ? approvalBlocksPublishing(editingPost)
    : false;
  const canSaveDraft = hasTitle;
  const canMarkReady = hasTitle && hasPostBody && canMoveToReady;
  const canSchedule = canMarkReady
    && hasSchedule
    && hasReadyPublishingChannel
    && !reviewBlocksSchedule;

  return {
    selectedChannels,
    selectedReadyChannels,
    hasTitle,
    hasPostBody,
    hasSchedule,
    hasReadyPublishingChannel,
    canMoveToReady,
    reviewBlocksSchedule,
    canSaveDraft,
    canMarkReady,
    canSchedule
  };
}

export function getComposerValidationMessage(input: {
  action: SaveAction;
  readiness: ComposerReadiness;
  instagramSelected: boolean;
  instagramReady: boolean;
}) {
  const { action, readiness, instagramSelected, instagramReady } = input;

  if (!readiness.canSaveDraft) {
    return "برای ذخیره پست، عنوان داخلی را وارد کنید.";
  }

  if (action === "ready" && !readiness.canMarkReady) {
    return "برای آماده‌سازی، کپشن یا تصویر پست را کامل کنید.";
  }

  if (action !== "schedule" || readiness.canSchedule) return "";

  if (!readiness.hasReadyPublishingChannel) {
    return "برای زمان‌بندی، حداقل یک کانال آماده در مرکز کانال‌ها لازم است.";
  }
  if (instagramSelected && !instagramReady) {
    return "اینستاگرام هنوز آماده نیست؛ حالت دستی یا Meta OAuth را از مرکز کانال‌ها کامل کنید.";
  }
  if (readiness.reviewBlocksSchedule) {
    return "این پست برای زمان‌بندی باید تایید بازبینی داشته باشد.";
  }
  if (!readiness.hasSchedule) {
    return "برای زمان‌بندی، زمان انتشار را انتخاب کنید.";
  }

  return "برای زمان‌بندی، ابتدا مرکز کانال‌ها را کامل کنید.";
}
