"use client";

import { CheckCircle2, Circle, CircleAlert, Clock3, FileUp, MessageSquareText, UploadCloud } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthGate } from "../../components/auth-gate";
import { AppShell } from "../../components/app-shell";
import { DataRow, DataTable, DataToolbar, FilterChip } from "../../components/data-view";
import { PageHeader } from "../../components/page-header";
import { StatusBadge } from "../../components/status-badge";
import { SectionCard } from "../../components/ui/card";
import { Tag } from "../../components/ui/tag";
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

type ParsedPayload = Record<string, unknown> | null;
type LogMode = "all" | "text" | "media";
type TimelineStageState = "done" | "failed" | "active" | "pending";
type TimelineStage = {
  label: string;
  detail: string;
  state: TimelineStageState;
};

const statusFilters = [
  ["all", "همه"],
  ["started", "شروع‌شده"],
  ["success", "موفق"],
  ["failed", "ناموفق"]
];

const modeFilters: Array<{ label: string; value: LogMode }> = [
  { label: "همه نوع‌ها", value: "all" },
  { label: "متنی", value: "text" },
  { label: "رسانه‌ای", value: "media" }
];
const logsHeaderGrid = "grid-cols-[minmax(0,1.2fr)_160px_190px_130px]";
const logsRowGrid = "lg:grid-cols-[minmax(0,1.2fr)_160px_190px_130px]";

function attemptTone(status: string) {
  if (status === "success") return "published";
  if (status === "failed") return "failed";
  if (status === "started") return "publishing";
  return "draft";
}

function parsePayload(value: string): ParsedPayload {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

function prettyPayload(value: string) {
  const parsed = parsePayload(value);
  if (parsed) return JSON.stringify(parsed, null, 2);
  if (!value) return "—";
  return value;
}

function payloadText(payload: ParsedPayload, key: string) {
  const value = payload?.[key];
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function payloadNumber(payload: ParsedPayload, key: string) {
  const value = payload?.[key];
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) return Number(value);
  return 0;
}

function attemptMode(requestPayload: ParsedPayload): Exclude<LogMode, "all"> {
  if (requestPayload?.mode === "media" || requestPayload?.media_asset_id) return "media";
  return "text";
}

function formatBytes(value: number) {
  if (!value) return "—";
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function finalStageState(status: string): TimelineStageState {
  if (status === "success") return "done";
  if (status === "failed") return "failed";
  if (status === "started") return "active";
  return "pending";
}

function buildTimeline(attempt: PublishAttempt, requestPayload: ParsedPayload, responsePayload: ParsedPayload): TimelineStage[] {
  const mode = attemptMode(requestPayload);
  const responseHas = (key: string) => Boolean(responsePayload?.[key]);
  const statusState = finalStageState(attempt.status);

  const stages: TimelineStage[] = [
    {
      label: "شروع تلاش",
      detail: `Worker این تلاش را در ${formatDateTime(attempt.started_at || attempt.created_at)} ثبت کرد.`,
      state: attempt.status === "started" ? "active" : "done"
    }
  ];

  if (mode === "media") {
    const filename = payloadText(requestPayload, "filename") || "رسانه پیوست‌شده";
    const contentType = payloadText(requestPayload, "content_type") || "نوع نامشخص";
    const sizeBytes = payloadNumber(requestPayload, "size_bytes");

    stages.push(
      {
        label: "انتخاب رسانه",
        detail: `${filename} · ${contentType} · ${formatBytes(sizeBytes)}`,
        state: "done"
      },
      {
        label: "درخواست آدرس آپلود",
        detail: responseHas("upload_request") ? "Rubika آدرس آپلود را برگرداند." : "در انتظار پاسخ requestSendFile یا ثبت خطا.",
        state: responseHas("upload_request") ? "done" : attempt.status === "failed" ? "pending" : "active"
      },
      {
        label: "آپلود فایل",
        detail: responseHas("upload") ? `فایل آپلود شد${payloadText(responsePayload, "file_id") ? ` · file_id: ${payloadText(responsePayload, "file_id")}` : ""}` : "آپلود هنوز در payload موفق ثبت نشده است.",
        state: responseHas("upload") ? "done" : attempt.status === "failed" ? "pending" : "active"
      },
      {
        label: "ارسال فایل",
        detail: responseHas("send") ? "sendFile با پاسخ موفق ثبت شد." : "ارسال نهایی فایل هنوز کامل نشده است.",
        state: responseHas("send") ? "done" : attempt.status === "failed" ? "pending" : "active"
      }
    );
  } else {
    const textLength = payloadText(requestPayload, "text").length;
    stages.push({
      label: "ارسال پیام متنی",
      detail: textLength ? `${textLength} کاراکتر برای Rubika آماده شد.` : "متن از کپشن، هشتگ یا عنوان پست ساخته شد.",
      state: attempt.status === "success" ? "done" : attempt.status === "failed" ? "failed" : "active"
    });
  }

  stages.push({
    label: "نتیجه نهایی",
    detail: attempt.status === "success"
      ? "پست منتشر شد و نتیجه در پایگاه داده ذخیره شد."
      : attempt.status === "failed"
        ? attempt.error || "انتشار ناموفق شد."
        : "تلاش هنوز پایان ثبت‌شده ندارد.",
    state: statusState
  });

  return stages;
}

function stageClasses(state: TimelineStageState) {
  if (state === "done") return "border-emerald-100 bg-emerald-50 text-emerald-700";
  if (state === "failed") return "border-rose-100 bg-rose-50 text-rose-700";
  if (state === "active") return "border-sky-100 bg-sky-50 text-sky-700";
  return "border-slate-200 bg-slate-50 text-slate-500";
}

function StageIcon({ state }: { state: TimelineStageState }) {
  if (state === "done") return <CheckCircle2 className="h-5 w-5" aria-hidden="true" />;
  if (state === "failed") return <CircleAlert className="h-5 w-5" aria-hidden="true" />;
  if (state === "active") return <Clock3 className="h-5 w-5" aria-hidden="true" />;
  return <Circle className="h-5 w-5" aria-hidden="true" />;
}

function actionLabel(action: string) {
  if (action === "scheduled") return "زمان‌بندی‌شده";
  if (action === "manual") return "دستی";
  if (action === "retry") return "تلاش مجدد";
  return action || "نامشخص";
}

export default function LogsPage() {
  const [attempts, setAttempts] = useState<PublishAttempt[]>([]);
  const [status, setStatus] = useState("all");
  const [modeFilter, setModeFilter] = useState<LogMode>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAttempts = useCallback(async (nextStatus: string) => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (nextStatus !== "all") params.set("status", nextStatus);
    const response = await fetch(`${apiUrl}/publish-attempts?${params.toString()}`, { headers: authHeaders() });
    if (!response.ok) throw new Error("دریافت لاگ انتشار ناموفق بود");
    setAttempts(await response.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAttempts("all").catch((err) => {
      setError(err instanceof Error ? err.message : "خطا در دریافت لاگ انتشار");
      setLoading(false);
    });
  }, [loadAttempts]);

  async function applyStatus(nextStatus: string) {
    setStatus(nextStatus);
    await loadAttempts(nextStatus);
  }

  const preparedAttempts = useMemo(() => {
    return attempts.map((attempt) => {
      const requestPayload = parsePayload(attempt.request_payload);
      const responsePayload = parsePayload(attempt.response_payload);
      const mode = attemptMode(requestPayload);
      return {
        attempt,
        requestPayload,
        responsePayload,
        mode,
        timeline: buildTimeline(attempt, requestPayload, responsePayload)
      };
    });
  }, [attempts]);

  const visibleAttempts = useMemo(() => {
    if (modeFilter === "all") return preparedAttempts;
    return preparedAttempts.filter((item) => item.mode === modeFilter);
  }, [modeFilter, preparedAttempts]);

  const summary = useMemo(() => {
    return {
      total: preparedAttempts.length,
      success: preparedAttempts.filter((item) => item.attempt.status === "success").length,
      failed: preparedAttempts.filter((item) => item.attempt.status === "failed").length,
      media: preparedAttempts.filter((item) => item.mode === "media").length
    };
  }, [preparedAttempts]);

  return (
    <AuthGate>
      <AppShell>
        <PageHeader
          eyebrow="ردیابی انتشار"
          title="لاگ انتشار"
          description="هر تلاش انتشار را به‌صورت مرحله‌ای ببینید: شروع، آماده‌سازی متن یا رسانه، آپلود، ارسال و نتیجه نهایی."
          actionLabel="صف انتشار"
          actionHref="/queue"
        />

        <section className="mb-5 grid gap-4 lg:grid-cols-4">
          <SectionCard title="کل تلاش‌ها" description="در فیلتر وضعیت فعلی.">
            <p className="text-2xl font-black text-app-text">{summary.total}</p>
            <p className="mt-2 text-sm text-app-muted">تلاش ثبت‌شده</p>
          </SectionCard>
          <SectionCard title="موفق" description="انتشار کامل‌شده.">
            <p className="text-2xl font-black text-emerald-700">{summary.success}</p>
            <p className="mt-2 text-sm text-app-muted">تلاش موفق</p>
          </SectionCard>
          <SectionCard title="ناموفق" description="نیازمند بررسی.">
            <p className={`text-2xl font-black ${summary.failed > 0 ? "text-rose-700" : "text-app-text"}`}>{summary.failed}</p>
            <p className="mt-2 text-sm text-app-muted">تلاش دارای خطا</p>
          </SectionCard>
          <SectionCard title="رسانه‌ای" description="دارای آپلود فایل.">
            <p className="text-2xl font-black text-app-text">{summary.media}</p>
            <p className="mt-2 text-sm text-app-muted">تلاش با تصویر یا فایل</p>
          </SectionCard>
        </section>

        <SectionCard title="فیلتر لاگ‌ها" description="وضعیت یا نوع تلاش را برای بررسی سریع‌تر محدود کنید.">
          <DataToolbar
            meta={(
              <>
                <span>{visibleAttempts.length} نتیجه</span>
                <span>{summary.total} کل تلاش</span>
              </>
            )}
          >
            <div className="flex flex-wrap gap-2">
              {statusFilters.map(([value, label]) => (
                <FilterChip
                  key={value}
                  active={status === value}
                  onClick={() => applyStatus(value)}
                >
                  {label}
                </FilterChip>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {modeFilters.map((filter) => (
                <FilterChip
                  key={filter.value}
                  active={modeFilter === filter.value}
                  count={filter.value === "all" ? preparedAttempts.length : preparedAttempts.filter((item) => item.mode === filter.value).length}
                  onClick={() => setModeFilter(filter.value)}
                >
                  {filter.label}
                </FilterChip>
              ))}
            </div>
          </DataToolbar>
        </SectionCard>

        {error ? <div className="mt-5 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <SectionCard title="تلاش‌های انتشار" description="آخرین ۱۰۰ تلاش انتشار از جدیدترین به قدیمی‌ترین." className="mt-5">
          <DataTable
            columns={["تلاش", "وضعیت", "زمان", "Payload"]}
            gridClassName={logsHeaderGrid}
            loading={loading}
            empty={visibleAttempts.length === 0 ? <p className="p-5 text-sm text-app-muted">برای این فیلتر لاگی ثبت نشده است.</p> : null}
          >
            {visibleAttempts.map(({ attempt, requestPayload, responsePayload, mode, timeline }) => (
              <DataRow key={attempt.id} gridClassName={logsRowGrid}>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-bold text-app-text">{attempt.post_title}</h2>
                  <p className="mt-1 text-xs text-app-muted">Post #{attempt.post_id}</p>
                  {attempt.error ? <p className="mt-3 rounded-lg bg-rose-50 p-3 text-xs leading-6 text-rose-700">{attempt.error}</p> : null}
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:block lg:space-y-2">
                      <StatusBadge status={attemptTone(attempt.status)} />
                      <Tag tone={mode === "media" ? "primary" : "neutral"}>
                        {mode === "media" ? (
                          <FileUp className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <MessageSquareText className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        {mode === "media" ? "رسانه‌ای" : "متنی"}
                      </Tag>
                  <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{actionLabel(attempt.action)}</span>
                </div>

                <div className="text-xs leading-6 text-app-muted">
                  <p>شروع: {formatDateTime(attempt.started_at || attempt.created_at)}</p>
                  <p>پایان: {formatDateTime(attempt.finished_at)}</p>
                </div>

                <details className="rounded-lg bg-slate-50 p-3 text-xs text-app-muted ring-1 ring-app-border">
                  <summary className="cursor-pointer font-semibold text-app-text">
                    <UploadCloud className="ml-1.5 inline h-4 w-4 align-middle" aria-hidden="true" />
                    Payload
                  </summary>
                  <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words leading-6">Request: {prettyPayload(attempt.request_payload)}{"\n\n"}Response: {prettyPayload(attempt.response_payload)}</pre>
                </details>

                <div className="lg:col-span-4">
                    <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
                      {timeline.map((stage, index) => (
                        <div key={`${attempt.id}-${stage.label}`} className={`rounded-lg border p-3 ${stageClasses(stage.state)}`}>
                          <div className="flex items-center gap-2">
                            <StageIcon state={stage.state} />
                            <p className="text-sm font-black">{index + 1}. {stage.label}</p>
                          </div>
                          <p className="mt-2 text-xs leading-6 opacity-90">{stage.detail}</p>
                        </div>
                      ))}
                    </div>

                    {mode === "media" ? (
                      <div className="mt-4 grid gap-3 rounded-lg bg-slate-50 p-3 text-xs text-app-muted ring-1 ring-app-border md:grid-cols-3">
                        <div>
                          <p className="font-semibold text-app-text">رسانه</p>
                          <p className="mt-1 truncate">{payloadText(requestPayload, "filename") || "—"}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-app-text">نوع فایل</p>
                          <p className="mt-1">{payloadText(requestPayload, "file_type") || payloadText(requestPayload, "content_type") || "—"}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-app-text">شناسه فایل</p>
                          <p className="mt-1 truncate">{payloadText(responsePayload, "file_id") || "—"}</p>
                        </div>
                      </div>
                    ) : null}
                </div>
              </DataRow>
            ))}
          </DataTable>
        </SectionCard>
      </AppShell>
    </AuthGate>
  );
}
