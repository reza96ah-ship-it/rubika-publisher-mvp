"use client";

import { useEffect, useState } from "react";
import { AuthGate } from "../../components/auth-gate";
import { AppShell } from "../../components/app-shell";
import { PageHeader } from "../../components/page-header";
import { StatusBadge } from "../../components/status-badge";
import { SectionCard } from "../../components/ui/card";
import { apiUrl, authHeaders, formatDateTime } from "../../lib/posts";

type PublishAttempt = {
  id: number;
  post_id: number;
  post_title: string;
  action: string;
  status: string;
  request_payload: string;
  response_payload: string;
  error: string;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
};

function attemptTone(status: string) {
  if (status === "success") return "published";
  if (status === "failed") return "failed";
  if (status === "started") return "publishing";
  return "draft";
}

function compactPayload(value: string) {
  if (!value) return "—";
  if (value.length <= 260) return value;
  return `${value.slice(0, 260)}...`;
}

export default function LogsPage() {
  const [attempts, setAttempts] = useState<PublishAttempt[]>([]);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAttempts(nextStatus = status) {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (nextStatus !== "all") params.set("status", nextStatus);
    const response = await fetch(`${apiUrl}/publish-attempts?${params.toString()}`, { headers: authHeaders() });
    if (!response.ok) throw new Error("دریافت لاگ انتشار ناموفق بود");
    setAttempts(await response.json());
    setLoading(false);
  }

  useEffect(() => {
    loadAttempts().catch((err) => {
      setError(err instanceof Error ? err.message : "خطا در دریافت لاگ انتشار");
      setLoading(false);
    });
  }, []);

  async function applyStatus(nextStatus: string) {
    setStatus(nextStatus);
    await loadAttempts(nextStatus);
  }

  return (
    <AuthGate>
      <AppShell>
        <PageHeader
          eyebrow="ردیابی انتشار"
          title="لاگ انتشار"
          description="هر تلاش worker برای انتشار پست در روبیکا، همراه با وضعیت، خطا، payload و زمان اجرا در اینجا ثبت می‌شود."
          actionLabel="صف انتشار"
          actionHref="/queue"
        />

        <SectionCard title="فیلتر لاگ‌ها" description="برای بررسی سریع خطاها یا انتشارهای موفق، وضعیت را محدود کنید.">
          <div className="flex flex-wrap gap-2">
            {[
              ["all", "همه"],
              ["started", "شروع‌شده"],
              ["success", "موفق"],
              ["failed", "ناموفق"]
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => applyStatus(value)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${status === value ? "bg-app-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </SectionCard>

        {error ? <div className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <SectionCard title="تلاش‌های انتشار" description="آخرین ۱۰۰ تلاش انتشار از جدیدترین به قدیمی‌ترین." className="mt-5">
          {loading ? <p className="text-sm text-app-muted">در حال دریافت...</p> : null}
          {!loading && attempts.length === 0 ? <p className="text-sm text-app-muted">هنوز لاگی ثبت نشده است.</p> : null}
          <div className="grid gap-3">
            {attempts.map((attempt) => (
              <article key={attempt.id} className="rounded-2xl border border-app-border bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={attemptTone(attempt.status)} />
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{attempt.action}</span>
                    </div>
                    <h2 className="mt-3 truncate text-base font-bold text-app-text">{attempt.post_title}</h2>
                    <p className="mt-1 text-xs text-app-muted">Post #{attempt.post_id} · شروع: {formatDateTime(attempt.started_at)} · پایان: {formatDateTime(attempt.finished_at)}</p>
                    {attempt.error ? <p className="mt-3 rounded-xl bg-rose-50 p-3 text-xs leading-6 text-rose-700">{attempt.error}</p> : null}
                    <details className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-app-muted ring-1 ring-app-border">
                      <summary className="cursor-pointer font-semibold text-app-text">Payload</summary>
                      <pre className="mt-3 whitespace-pre-wrap break-words leading-6">Request: {compactPayload(attempt.request_payload)}{"\n\n"}Response: {compactPayload(attempt.response_payload)}</pre>
                    </details>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>
      </AppShell>
    </AuthGate>
  );
}
