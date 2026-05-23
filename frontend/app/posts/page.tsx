"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AuthGate } from "../../components/auth-gate";
import { AppShell } from "../../components/app-shell";
import { PageHeader } from "../../components/page-header";
import { StatusBadge } from "../../components/status-badge";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Post = {
  id: number;
  title: string;
  caption: string;
  hashtags: string;
  platform: string;
  status: string;
};

type Store = {
  default_hashtags: string;
  caption_footer: string;
};

type MediaAsset = {
  id: number;
  post_id: number | null;
  original_filename: string;
  content_type: string;
  size_bytes: number;
};

const emptyForm = {
  title: "",
  caption: "",
  hashtags: "",
  platform: "rubika"
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [store, setStore] = useState<Store | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedMediaId, setSelectedMediaId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const attachedMedia = useMemo(() => {
    if (!editingId) return selectedMediaId ? mediaAssets.find((asset) => String(asset.id) === selectedMediaId) : null;
    return mediaAssets.find((asset) => asset.post_id === editingId) ?? null;
  }, [editingId, mediaAssets, selectedMediaId]);

  const finalPreview = useMemo(() => {
    return [form.caption, form.caption ? store?.caption_footer : "", form.hashtags]
      .filter(Boolean)
      .join("\n\n");
  }, [form.caption, form.hashtags, store?.caption_footer]);

  function token() {
    return window.localStorage.getItem("rubika_publisher_access") ?? "";
  }

  async function loadData() {
    setLoading(true);
    const headers = { Authorization: `Bearer ${token()}` };
    const [postsResponse, storeResponse, mediaResponse] = await Promise.all([
      fetch(`${apiUrl}/posts`, { headers }),
      fetch(`${apiUrl}/stores/active`, { headers }),
      fetch(`${apiUrl}/media`, { headers })
    ]);

    if (postsResponse.ok) setPosts(await postsResponse.json());
    if (storeResponse.ok) setStore(await storeResponse.json());
    if (mediaResponse.ok) setMediaAssets(await mediaResponse.json());
    setLoading(false);
  }

  useEffect(() => {
    loadData().catch(() => {
      setError("خطا در دریافت اطلاعات پست‌ها");
      setLoading(false);
    });
  }, []);

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function useDefaults() {
    setForm((current) => ({
      ...current,
      hashtags: store?.default_hashtags || current.hashtags
    }));
  }

  function editPost(post: Post) {
    const currentAsset = mediaAssets.find((asset) => asset.post_id === post.id);
    setEditingId(post.id);
    setSelectedMediaId(currentAsset ? String(currentAsset.id) : "");
    setSelectedFile(null);
    setForm({ title: post.title, caption: post.caption, hashtags: post.hashtags, platform: post.platform });
    setMessage("");
    setError("");
  }

  function resetForm() {
    setEditingId(null);
    setSelectedMediaId("");
    setSelectedFile(null);
    setForm(emptyForm);
  }

  async function attachMedia(assetId: number, postId: number | null) {
    const response = await fetch(`${apiUrl}/media/${assetId}/attach`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`
      },
      body: JSON.stringify({ post_id: postId })
    });

    if (!response.ok) throw new Error("اتصال تصویر به پست ناموفق بود");
  }

  async function uploadSelectedFile() {
    if (!selectedFile) return null;

    const formData = new FormData();
    formData.append("file", selectedFile);
    const response = await fetch(`${apiUrl}/media`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token()}` },
      body: formData
    });

    if (!response.ok) throw new Error("آپلود تصویر ناموفق بود");
    return response.json() as Promise<MediaAsset>;
  }

  async function savePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${apiUrl}/posts${editingId ? `/${editingId}` : ""}`, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) throw new Error("ذخیره پست ناموفق بود");
      const savedPost = await response.json();

      const uploadedAsset = await uploadSelectedFile();
      if (uploadedAsset) {
        await attachMedia(uploadedAsset.id, savedPost.id);
      } else if (selectedMediaId) {
        await attachMedia(Number(selectedMediaId), savedPost.id);
      }

      setMessage(editingId ? "پست ویرایش شد" : "پست پیش‌نویس ایجاد شد");
      resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای ذخیره پست");
    } finally {
      setSaving(false);
    }
  }

  async function deletePost(id: number) {
    setMessage("");
    setError("");
    const response = await fetch(`${apiUrl}/posts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token()}` }
    });
    if (!response.ok) {
      setError("حذف پست ناموفق بود");
      return;
    }
    setMessage("پست حذف شد");
    await loadData();
  }

  return (
    <AuthGate>
      <AppShell>
        <PageHeader
          eyebrow="Phase 7.5 — Composer Media UX"
          title="پست‌ها"
          description="پست روبیکا را همراه تصویر، کپشن و هشتگ در یک صفحه بسازید. رسانه‌ها هنوز در کتابخانه جداگانه هم قابل مدیریت هستند."
        />

        <section className="grid gap-5 xl:grid-cols-5">
          <form onSubmit={savePost} className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-soft xl:col-span-3">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editingId ? "ویرایش پست" : "ایجاد پیش‌نویس"}</h2>
              {editingId ? <button type="button" onClick={resetForm} className="text-sm text-app-muted">لغو ویرایش</button> : null}
            </div>

            <div className="space-y-5">
              <label className="block text-sm font-medium">
                تصویر پست
                <div className="mt-2 grid gap-3 rounded-2xl border border-dashed border-app-border bg-slate-50 p-4 md:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs text-app-muted">آپلود تصویر جدید</p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) => {
                        setSelectedFile(event.target.files?.[0] ?? null);
                        if (event.target.files?.[0]) setSelectedMediaId("");
                      }}
                      className="w-full text-sm"
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-xs text-app-muted">یا انتخاب از کتابخانه</p>
                    <select
                      value={selectedMediaId}
                      onChange={(event) => {
                        setSelectedMediaId(event.target.value);
                        if (event.target.value) setSelectedFile(null);
                      }}
                      className="w-full rounded-xl border border-app-border bg-white px-3 py-2 text-sm"
                    >
                      <option value="">بدون تصویر</option>
                      {mediaAssets.map((asset) => (
                        <option key={asset.id} value={asset.id}>{asset.original_filename}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </label>

              <label className="block text-sm font-medium">
                عنوان پست
                <input
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  className="mt-2 w-full rounded-xl border border-app-border px-4 py-3 text-sm outline-none ring-app-primary focus:ring-2"
                  required
                />
              </label>

              <label className="block text-sm font-medium">
                کپشن
                <textarea
                  value={form.caption}
                  onChange={(event) => updateField("caption", event.target.value)}
                  className="mt-2 min-h-40 w-full rounded-xl border border-app-border px-4 py-3 text-sm leading-7 outline-none ring-app-primary focus:ring-2"
                />
              </label>

              <label className="block text-sm font-medium">
                هشتگ‌ها
                <textarea
                  value={form.hashtags}
                  onChange={(event) => updateField("hashtags", event.target.value)}
                  className="mt-2 min-h-24 w-full rounded-xl border border-app-border px-4 py-3 text-sm leading-7 outline-none ring-app-primary focus:ring-2"
                  placeholder="#روبیکا #فروشگاه"
                />
              </label>

              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={useDefaults} className="rounded-xl border border-app-border bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  استفاده از هشتگ پیش‌فرض
                </button>
                <button type="submit" disabled={saving} className="rounded-xl bg-app-primary px-6 py-3 text-sm font-semibold text-white hover:bg-app-primaryHover disabled:opacity-60">
                  {saving ? "در حال ذخیره..." : editingId ? "ذخیره تغییرات" : "ذخیره پیش‌نویس"}
                </button>
              </div>

              {message ? <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
              {error ? <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
            </div>
          </form>

          <aside className="space-y-5 xl:col-span-2">
            <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm">
              <h2 className="text-lg font-bold">پیش‌نمایش روبیکا</h2>
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-app-border">
                <div className="mb-3 rounded-xl border border-dashed border-app-border bg-white p-4 text-sm text-app-muted">
                  {selectedFile ? selectedFile.name : attachedMedia ? attachedMedia.original_filename : "تصویری انتخاب نشده است"}
                </div>
                <div className="min-h-40 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {finalPreview || "متن نهایی پست اینجا نمایش داده می‌شود."}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm">
              <h2 className="text-lg font-bold">پست‌های پیش‌نویس</h2>
              <div className="mt-4 space-y-3">
                {loading ? <p className="text-sm text-app-muted">در حال دریافت...</p> : null}
                {!loading && posts.length === 0 ? <p className="text-sm text-app-muted">هنوز پستی ایجاد نشده است.</p> : null}
                {posts.map((post) => {
                  const media = mediaAssets.find((asset) => asset.post_id === post.id);
                  return (
                    <div key={post.id} className="rounded-xl border border-app-border bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold">{post.title}</p>
                          <p className="mt-1 line-clamp-2 text-xs leading-6 text-app-muted">{post.caption || "بدون کپشن"}</p>
                          <p className="mt-1 text-xs text-app-muted">{media ? `تصویر: ${media.original_filename}` : "بدون تصویر"}</p>
                        </div>
                        <StatusBadge status={post.status} />
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button onClick={() => editPost(post)} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">ویرایش</button>
                        <button onClick={() => deletePost(post.id)} className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">حذف</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </section>
      </AppShell>
    </AuthGate>
  );
}
