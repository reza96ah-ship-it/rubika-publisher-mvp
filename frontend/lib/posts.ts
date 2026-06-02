export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type PostStatus = "draft" | "ready" | "scheduled" | "publishing" | "published" | "failed" | "cancelled";

export type Post = {
  id: number;
  store_id: number;
  title: string;
  caption: string;
  hashtags: string;
  platform: string;
  status: PostStatus | string;
  timezone: string;
  campaign_id: number | null;
  campaign: string;
  internal_note: string;
  scheduled_at: string | null;
  ready_at: string | null;
  published_at: string | null;
  failed_at: string | null;
  rubika_message_id: string;
  last_error: string;
  attempt_count: number;
  created_at: string;
  updated_at: string;
};

export type PostStats = {
  total: number;
  draft: number;
  ready: number;
  scheduled: number;
  publishing: number;
  published: number;
  failed: number;
  cancelled: number;
};

export const workflowTabs: Array<{ label: string; value: "all" | PostStatus }> = [
  { label: "همه", value: "all" },
  { label: "پیش‌نویس", value: "draft" },
  { label: "آماده", value: "ready" },
  { label: "زمان‌بندی‌شده", value: "scheduled" },
  { label: "در حال انتشار", value: "publishing" },
  { label: "منتشرشده", value: "published" },
  { label: "ناموفق", value: "failed" },
  { label: "لغوشده", value: "cancelled" }
];

export function token() {
  return window.localStorage.getItem("rubika_publisher_access") ?? "";
}

export function authHeaders() {
  return { Authorization: `Bearer ${token()}` };
}

export function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function toDatetimeLocalValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function fromDatetimeLocalValue(value: string) {
  if (!value) return null;
  return new Date(value).toISOString();
}

export function postFinalText(post: Pick<Post, "caption" | "hashtags">) {
  return [post.caption, post.hashtags].filter(Boolean).join("\n\n");
}

export async function readApiError(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { detail?: unknown };
    if (typeof payload.detail === "string" && payload.detail.trim()) return payload.detail;
  } catch {
    // Fall back to the user-facing operation message when the API has no JSON detail.
  }
  return fallback;
}

export function recoveryGuidance(error?: string | null) {
  const normalized = error?.toLowerCase() ?? "";
  if (!normalized) return "";
  if (normalized.includes("rubika") || normalized.includes("connection") || normalized.includes("account")) {
    return "اتصال روبیکا را در تنظیمات دوباره آزمایش کنید، سپس تلاش مجدد را اجرا کنید.";
  }
  if (normalized.includes("media") || normalized.includes("file") || normalized.includes("upload")) {
    return "رسانه پیوست‌شده را در کتابخانه بررسی کنید. اگر فایل حذف شده است، آن را دوباره بارگذاری و متصل کنید.";
  }
  if (normalized.includes("timeout") || normalized.includes("timed out") || normalized.includes("worker")) {
    return "پس از بررسی سلامت worker، پست را دوباره وارد صف کنید. زمان انتشار به زمان فعلی منتقل می‌شود.";
  }
  return "جزئیات خطا را بررسی کنید. پس از اصلاح علت، پست را دوباره وارد صف انتشار کنید.";
}
