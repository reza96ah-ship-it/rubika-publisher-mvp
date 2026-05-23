"use client";

import { FormEvent, useEffect, useState } from "react";
import { AuthGate } from "../../components/auth-gate";
import { AppShell } from "../../components/app-shell";
import { PageHeader } from "../../components/page-header";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type MediaAsset = {
  id: number;
  post_id: number | null;
  original_filename: string;
  content_type: string;
  size_bytes: number;
};

export default function MediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function token() {
    return window.localStorage.getItem("rubika_publisher_access") ?? "";
  }

  async function loadMedia() {
    setLoading(true);
    const response = await fetch(`${apiUrl}/media`, {
      headers: { Authorization: `Bearer ${token()}` }
    });
    if (response.ok) setAssets(await response.json());
    setLoading(false);
  }

  useEffect(() => {
    loadMedia().catch(() => {
      setError("خطا در دریافت رسانه‌ها");
      setLoading(false);
    });
  }, []);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;
    setUploading(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${apiUrl}/media`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
        body: formData
      });
      if (!response.ok) throw new Error("آپلود تصویر ناموفق بود");
      setFile(null);
      setMessage("تصویر آپلود شد");
      await loadMedia();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای آپلود تصویر");
    } finally {
      setUploading(false);
    }
  }

  function formatSize(size: number) {
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  }

  return (
    <AuthGate>
      <AppShell>
        <PageHeader
          eyebrow="Phase 07 — Media Library"
          title="رسانه‌ها"
          description="تصاویر محصول را آپلود و برای اتصال به پست‌های بعدی آماده کنید."
        />

        <section className="grid gap-5 xl:grid-cols-4">
          <form onSubmit={upload} className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-soft xl:col-span-1">
            <h2 className="text-lg font-bold">آپلود تصویر</h2>
            <p className="mt-2 text-sm leading-7 text-app-muted">فرمت‌های مجاز: JPG، PNG، WEBP تا ۸ مگابایت.</p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="mt-5 w-full rounded-xl border border-dashed border-app-border bg-slate-50 p-4 text-sm"
            />
            <button
              type="submit"
              disabled={!file || uploading}
              className="mt-5 w-full rounded-xl bg-app-primary px-5 py-3 text-sm font-semibold text-white hover:bg-app-primaryHover disabled:opacity-60"
            >
              {uploading ? "در حال آپلود..." : "آپلود تصویر"}
            </button>
            {message ? <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
            {error ? <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          </form>

          <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-soft xl:col-span-3">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">کتابخانه تصاویر</h2>
              <span className="text-sm text-app-muted">{assets.length} فایل</span>
            </div>

            {loading ? <p className="text-sm text-app-muted">در حال دریافت...</p> : null}
            {!loading && assets.length === 0 ? <p className="text-sm text-app-muted">هنوز تصویری آپلود نشده است.</p> : null}

            <div className="space-y-3">
              {assets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between rounded-xl border border-app-border bg-white p-4">
                  <div>
                    <p className="font-bold">{asset.original_filename}</p>
                    <p className="mt-1 text-xs text-app-muted">{asset.content_type} · {formatSize(asset.size_bytes)}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-app-muted">
                    {asset.post_id ? `پست ${asset.post_id}` : "بدون اتصال"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AppShell>
    </AuthGate>
  );
}
