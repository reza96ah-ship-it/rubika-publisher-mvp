import { loadCampaigns, type Campaign } from "../campaigns";
import { loadChannelAccounts, type ChannelAccount } from "../channel-accounts";
import {
  apiUrl,
  authHeaders,
  type Post
} from "../posts";
import { loadWorkspaceOverview, type StoreProfile } from "../workspace";
import {
  composerTimezone,
  type ComposerForm,
  type MediaAsset
} from "./domain";

export type ComposerResources = {
  store: StoreProfile | null;
  channelAccounts: ChannelAccount[];
  campaigns: Campaign[];
  posts: Post[];
  mediaAssets: MediaAsset[];
  editingPost: Post | null;
};

async function request(path: string, init: RequestInit = {}) {
  return fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      ...authHeaders(),
      ...init.headers
    }
  });
}

async function fetchJson<T>(
  path: string,
  message: string,
  init: RequestInit = {}
): Promise<T> {
  const response = await request(path, init);
  if (!response.ok) throw new Error(message);
  return response.json() as Promise<T>;
}

async function fetchOptionalJson<T>(path: string, fallback: T): Promise<T> {
  const response = await request(path);
  if (!response.ok) return fallback;
  return response.json() as Promise<T>;
}

export async function loadComposerResources(
  editingPostId?: string | null
): Promise<ComposerResources> {
  const [overview, campaigns, channelData, mediaAssets, posts, editingPost] = await Promise.all([
    loadWorkspaceOverview(),
    loadCampaigns(),
    loadChannelAccounts(),
    fetchOptionalJson<MediaAsset[]>("/media", []),
    fetchOptionalJson<Post[]>("/posts", []),
    editingPostId
      ? fetchJson<Post>(`/posts/${editingPostId}`, "دریافت پست برای ویرایش ناموفق بود")
      : Promise.resolve(null)
  ]);

  return {
    store: overview.store,
    channelAccounts: channelData.accounts,
    campaigns,
    posts,
    mediaAssets,
    editingPost
  };
}

export async function loadComposerMediaFile(assetId: number) {
  const response = await request(`/media/${assetId}/file`);
  if (!response.ok) throw new Error("دریافت پیش‌نمایش رسانه ناموفق بود");
  return response.blob();
}

export async function uploadComposerMedia(input: {
  file: File;
  folder?: string;
  tags?: string;
  errorMessage?: string;
}) {
  const formData = new FormData();
  formData.append("file", input.file);
  if (input.folder !== undefined) formData.append("folder", input.folder);
  if (input.tags !== undefined) formData.append("tags", input.tags);

  const response = await request("/media", {
    method: "POST",
    body: formData
  });
  if (!response.ok) {
    const editedMedia = input.tags
      ?.split(",")
      .map((tag) => tag.trim())
      .includes("edited");
    throw new Error(
      input.errorMessage
      || (editedMedia ? "ذخیره نسخه ویرایش‌شده ناموفق بود" : "آپلود تصویر ناموفق بود")
    );
  }
  return response.json() as Promise<MediaAsset>;
}

export async function attachComposerMedia(assetId: number, postId: number | null) {
  await fetchJson<MediaAsset>(
    `/media/${assetId}/attach`,
    "اتصال تصویر به پست ناموفق بود",
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId })
    }
  );
}

export async function saveComposerPost(input: {
  form: ComposerForm;
  editingPostId?: string | null;
}) {
  return fetchJson<Post>(
    input.editingPostId ? `/posts/${input.editingPostId}` : "/posts",
    input.editingPostId ? "به‌روزرسانی پست ناموفق بود" : "ذخیره پیش‌نویس ناموفق بود",
    {
      method: input.editingPostId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input.form, timezone: composerTimezone })
    }
  );
}

export async function scheduleComposerPost(postId: number, scheduledAt: string) {
  return fetchJson<Post>(`/posts/${postId}/schedule`, "زمان‌بندی پست ناموفق بود", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      scheduled_at: scheduledAt,
      timezone: composerTimezone
    })
  });
}

export async function markComposerPostReady(postId: number) {
  return fetchJson<Post>(`/posts/${postId}/ready`, "آماده‌سازی پست ناموفق بود", {
    method: "POST"
  });
}

export async function changeComposerPostStatus(postId: number, status: string) {
  return fetchJson<Post>(`/posts/${postId}/status`, "تغییر وضعیت پست ناموفق بود", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
}
