"use client";

import { AlertTriangle, CheckCircle2, Circle, CircleAlert, Clock3, FileUp, ListChecks, MessageSquareText, Search, UploadCloud } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthGate } from "../../components/auth-gate";
import { AppShell } from "../../components/app-shell";
import { DataRow, DataSearchField, DataTable, DataToolbar, FilterChip } from "../../components/data-view";
import { StatusBadge } from "../../components/status-badge";
import { Button } from "../../components/ui/button";
import { DetailGrid, EmptyState, MetricStrip, MetricTile, NoticeBanner, StatusToken, WorkspaceHero, WorkspacePage, WorkspacePanel } from "../../components/workspace-ui";
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

type PreparedAttempt = {
  attempt: PublishAttempt;
  requestPayload: ParsedPayload;
  responsePayload: ParsedPayload;
  mode: Exclude<LogMode, "all">;
  timeline: TimelineStage[];
};

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

function attemptSearchText(item: PreparedAttempt) {
  const request = prettyPayload(item.attempt.request_payload);
  const response = prettyPayload(item.attempt.response_payload);
  return [
    item.attempt.post_title,
    item.attempt.post_id,
    item.attempt.action,
    item.attempt.status,
    item.attempt.error,
    item.mode,
    payloadText(item.requestPayload, "filename"),
    payloadText(item.requestPayload, "text"),
    payloadText(item.responsePayload, "file_id"),
    request,
    response
  ].join(" ").toLowerCase();
}

function modeLabel(mode: Exclude<LogMode, "all">) {
  return mode === "media" ? "رسانه‌ای" : "متنی";
}

export default function LogsPage() {
  const [attempts, setAttempts] = useState<PublishAttempt[]>([]);
  const [status, setStatus] = useState("all");
  const [modeFilter, setModeFilter] = useState<LogMode>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAttempts = useCallback(async (nextStatus: string) => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (nextStatus !== "all") params.set("status", nextStatus);
    const response = await fetch(`${apiUrl}/publish-attempts?${params.toString()}`, { headers: authHeaders() });
    if (!response.ok) throw new Error("دریافت لاگ انتشار ناموفق بود");
    const data = (await response.json()) as PublishAttempt[];
    setAttempts(data);
    setSelectedAttemptId((current) => current ?? data[0]?.id ?? null);
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
    try {
      await loadAttempts(nextStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در دریافت لاگ انتشار");
      setLoading(false);
    }
  }

  const preparedAttempts = useMemo<PreparedAttempt[]>(() => {
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
    const query = searchTerm.trim().toLowerCase();
    return preparedAttempts
      .filter((item) => modeFilter === "all" || item.mode === modeFilter)
      .filter((item) => !query || attemptSearchText(item).includes(query));
  }, [modeFilter, preparedAttempts, searchTerm]);

  const summary = useMemo(() => {
    return {
      total: preparedAttempts.length,
      success: preparedAttempts.filter((item) => item.attempt.status === "success").length,
      failed: preparedAttempts.filter((item) => item.attempt.status === "failed").length,
      media: preparedAttempts.filter((item) => item.mode === "media").length
    };
  }, [preparedAttempts]);
  const selectedAttempt = useMemo(() => {
    if (selectedAttemptId) {
      return preparedAttempts.find((item) => item.attempt.id === selectedAttemptId) ?? visibleAttempts[0] ?? null;
    }
    return visibleAttempts[0] ?? preparedAttempts[0] ?? null;
  }, [preparedAttempts, selectedAttemptId, visibleAttempts]);
  const successRate = summary.total ? Math.round((summary.success / summary.total) * 100) : 0;
  const latestAttempt = preparedAttempts[0]?.attempt ?? null;

  return (
    <AuthGate>
      <AppShell>
        <WorkspacePage>
          <WorkspaceHero
            eyebrow="Publishing Health"
            title="سلامت انتشار"
            description="هر تلاش انتشار را به‌صورت مرحله‌ای ببینید: شروع، آماده‌سازی متن یا رسانه، آپلود، ارسال و نتیجه نهایی."
            actions={(
              <>
                <Button href="/queue" size="sm">صف انتشار</Button>
                <Button href="/compose" variant="secondary" size="sm">استودیو تولید</Button>
              </>
            )}
            meta={(
              <>
                <StatusToken tone="primary">{summary.total} تلاش</StatusToken>
                <StatusToken tone={summary.failed ? "alert" : "success"}>{summary.failed ? `${summary.failed} ناموفق` : "بدون خطای فعال"}</StatusToken>
                <StatusToken tone="success">{successRate}% موفقیت</StatusToken>
              </>
            )}
            aside={(
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-app-primary">Delivery Monitor</p>
                    <h2 className="mt-2 text-lg font-black text-app-text">{summary.failed ? "نیازمند رسیدگی" : "پایدار"}</h2>
                    <p className="mt-1 text-xs leading-5 text-app-muted">آخرین تلاش‌ها، خطاها و payloadها برای عیب‌یابی انتشار.</p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-md border border-blue-200 bg-white text-app-primary">
                    <ListChecks className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded border border-blue-100 bg-white p-3">
                    <p className="font-black text-app-text">{latestAttempt ? formatDateTime(latestAttempt.created_at) : "—"}</p>
                    <p className="mt-1 text-app-muted">آخرین ثبت</p>
                  </div>
                  <div className="rounded border border-blue-100 bg-white p-3">
                    <p className="font-black text-app-text">{summary.media}</p>
                    <p className="mt-1 text-app-muted">رسانه‌ای</p>
                  </div>
                </div>
              </div>
            )}
          />

          <MetricStrip>
            <MetricTile label="کل تلاش‌ها" value={summary.total} hint="در فیلتر وضعیت فعلی" tone="primary" icon={<ListChecks className="h-4 w-4" aria-hidden="true" />} />
            <MetricTile label="موفق" value={summary.success} hint="انتشار کامل‌شده" tone="success" icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />} />
            <MetricTile label="ناموفق" value={summary.failed} hint="نیازمند بررسی و بازیابی" tone={summary.failed ? "alert" : "neutral"} icon={<AlertTriangle className="h-4 w-4" aria-hidden="true" />} />
            <MetricTile label="رسانه‌ای" value={summary.media} hint="تلاش دارای آپلود فایل" tone="info" icon={<FileUp className="h-4 w-4" aria-hidden="true" />} />
          </MetricStrip>

          {error ? <NoticeBanner tone="alert" title="نیاز به بررسی">{error}</NoticeBanner> : null}

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
            <div className="min-w-0 space-y-4">
              <WorkspacePanel
                title="مرکز پایش انتشار"
                description="وضعیت، نوع تلاش و متن payload را برای بررسی سریع‌تر محدود کنید."
              >
                <DataToolbar
                  meta={(
                    <>
                      <StatusToken tone="neutral">{visibleAttempts.length} نتیجه</StatusToken>
                      <StatusToken tone="neutral">{summary.total} کل تلاش</StatusToken>
                    </>
                  )}
                >
                  <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
                    <DataSearchField
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="جست‌وجوی عنوان، خطا، payload، file_id یا نوع تلاش"
                    />
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {statusFilters.map(([value, label]) => (
                          <FilterChip
                            key={value}
                            active={status === value}
                            onClick={() => void applyStatus(value)}
                          >
                            {label}
                          </FilterChip>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
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
                    </div>
                  </div>
                </DataToolbar>
              </WorkspacePanel>

              <WorkspacePanel title="تلاش‌های انتشار" description="آخرین ۱۰۰ تلاش انتشار از جدیدترین به قدیمی‌ترین." bodyClassName="p-4">
                <DataTable
                  columns={["تلاش", "وضعیت", "زمان", "عملیات"]}
                  gridClassName={logsHeaderGrid}
                  loading={loading}
                  empty={visibleAttempts.length === 0 ? (
                    <div className="p-4">
                      <EmptyState
                        icon={<Search className="h-5 w-5" aria-hidden="true" />}
                        title="برای این فیلتر لاگی ثبت نشده است"
                        description="فیلتر وضعیت، نوع تلاش یا عبارت جست‌وجو را تغییر دهید."
                      />
                    </div>
                  ) : null}
                >
                  {visibleAttempts.map(({ attempt, mode }) => {
                    const selected = selectedAttempt?.attempt.id === attempt.id;
                    return (
                      <DataRow key={attempt.id} gridClassName={logsRowGrid} selected={selected}>
                        <div className="min-w-0">
                          <h2 className="truncate text-base font-black text-app-text">{attempt.post_title}</h2>
                          <p className="mt-1 text-xs text-app-muted">Post #{attempt.post_id} · Attempt #{attempt.id}</p>
                          {attempt.error ? <p className="mt-3 rounded bg-rose-50 p-3 text-xs leading-6 text-rose-700">{attempt.error}</p> : null}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 lg:block lg:space-y-2">
                          <StatusBadge status={attemptTone(attempt.status)} />
                          <StatusToken tone={mode === "media" ? "primary" : "neutral"} className="gap-1">
                            {mode === "media" ? (
                              <FileUp className="h-3.5 w-3.5" aria-hidden="true" />
                            ) : (
                              <MessageSquareText className="h-3.5 w-3.5" aria-hidden="true" />
                            )}
                            {modeLabel(mode)}
                          </StatusToken>
                          <StatusToken tone="neutral">{actionLabel(attempt.action)}</StatusToken>
                        </div>

                        <div className="text-xs leading-6 text-app-muted">
                          <p>شروع: {formatDateTime(attempt.started_at || attempt.created_at)}</p>
                          <p>پایان: {formatDateTime(attempt.finished_at)}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 lg:justify-end">
                          <Button type="button" variant={selected ? "primary" : "secondary"} size="sm" onClick={() => setSelectedAttemptId(attempt.id)}>جزئیات</Button>
                          <Button href={`/compose?postId=${attempt.post_id}`} variant="secondary" size="sm">باز کردن پست</Button>
                        </div>
                      </DataRow>
                    );
                  })}
                </DataTable>
              </WorkspacePanel>
            </div>

            <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
              <WorkspacePanel
                title="بازرس تلاش"
                description="Timeline، payload و مسیر بازیابی تلاش انتخاب‌شده."
                action={selectedAttempt ? <StatusBadge status={attemptTone(selectedAttempt.attempt.status)} /> : null}
              >
                {selectedAttempt ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={attemptTone(selectedAttempt.attempt.status)} />
                        <StatusToken tone={selectedAttempt.mode === "media" ? "primary" : "neutral"}>{modeLabel(selectedAttempt.mode)}</StatusToken>
                        <StatusToken tone="neutral">{actionLabel(selectedAttempt.attempt.action)}</StatusToken>
                      </div>
                      <h3 className="mt-3 text-lg font-black text-app-text">{selectedAttempt.attempt.post_title}</h3>
                      <p className="mt-2 text-xs leading-6 text-app-muted">Post #{selectedAttempt.attempt.post_id} · Attempt #{selectedAttempt.attempt.id}</p>
                    </div>

                    <DetailGrid
                      items={[
                        { label: "شروع", value: formatDateTime(selectedAttempt.attempt.started_at || selectedAttempt.attempt.created_at), hint: "زمان ثبت تلاش" },
                        { label: "پایان", value: formatDateTime(selectedAttempt.attempt.finished_at), hint: "زمان پایان تلاش" },
                        { label: "نوع", value: modeLabel(selectedAttempt.mode), hint: "متنی یا رسانه‌ای" },
                        { label: "عملیات", value: actionLabel(selectedAttempt.attempt.action), hint: "منبع اجرای تلاش" }
                      ]}
                    />

                    <div className="space-y-2">
                      {selectedAttempt.timeline.map((stage, index) => (
                        <div key={`${selectedAttempt.attempt.id}-${stage.label}`} className={`rounded-md border p-3 ${stageClasses(stage.state)}`}>
                          <div className="flex items-center gap-2">
                            <StageIcon state={stage.state} />
                            <p className="text-sm font-black">{index + 1}. {stage.label}</p>
                          </div>
                          <p className="mt-2 text-xs leading-6 opacity-90">{stage.detail}</p>
                        </div>
                      ))}
                    </div>

                    {selectedAttempt.mode === "media" ? (
                      <DetailGrid
                        items={[
                          { label: "رسانه", value: payloadText(selectedAttempt.requestPayload, "filename") || "—", hint: "نام فایل" },
                          { label: "نوع فایل", value: payloadText(selectedAttempt.requestPayload, "file_type") || payloadText(selectedAttempt.requestPayload, "content_type") || "—", hint: "فرمت ارسال" },
                          { label: "حجم", value: formatBytes(payloadNumber(selectedAttempt.requestPayload, "size_bytes")), hint: "اندازه فایل" },
                          { label: "file_id", value: payloadText(selectedAttempt.responsePayload, "file_id") || "—", hint: "شناسه روبیکا" }
                        ]}
                      />
                    ) : null}

                    {selectedAttempt.attempt.error ? (
                      <NoticeBanner tone="alert" title="خطای ثبت‌شده">
                        {selectedAttempt.attempt.error}
                      </NoticeBanner>
                    ) : null}

                    <details className="rounded-md border border-app-border bg-slate-50 p-3 text-xs text-app-muted">
                      <summary className="cursor-pointer font-black text-app-text">
                        <UploadCloud className="ml-1.5 inline h-4 w-4 align-middle" aria-hidden="true" />
                        Payload کامل
                      </summary>
                      <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words leading-6">Request: {prettyPayload(selectedAttempt.attempt.request_payload)}{"\n\n"}Response: {prettyPayload(selectedAttempt.attempt.response_payload)}</pre>
                    </details>

                    <div className="grid gap-2">
                      <Button href={`/compose?postId=${selectedAttempt.attempt.post_id}`} variant="secondary">باز کردن پست</Button>
                      <Button href="/queue" variant="secondary">صف انتشار</Button>
                      <Button href="/rubika" variant="secondary">بررسی اتصال روبیکا</Button>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={<ListChecks className="h-5 w-5" aria-hidden="true" />}
                    title="تلاشی انتخاب نشده"
                    description="برای مشاهده timeline و payload، یک تلاش را از لیست انتخاب کنید."
                  />
                )}
              </WorkspacePanel>

              <WorkspacePanel title="خطاهای اخیر" description="آخرین تلاش‌های ناموفق برای بازیابی سریع.">
                {preparedAttempts.filter((item) => item.attempt.status === "failed").length === 0 ? (
                  <EmptyState
                    icon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />}
                    title="فعلاً خطای فعالی وجود ندارد"
                    description="انتشارها در وضعیت پایدار هستند."
                  />
                ) : null}
                <div className="space-y-2">
                  {preparedAttempts.filter((item) => item.attempt.status === "failed").slice(0, 5).map((item) => (
                    <button
                      key={item.attempt.id}
                      type="button"
                      onClick={() => setSelectedAttemptId(item.attempt.id)}
                      className="w-full rounded-md border border-app-border bg-white p-3 text-right transition hover:border-blue-200 hover:bg-blue-50"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={attemptTone(item.attempt.status)} />
                        <span className="text-xs text-app-muted">{formatDateTime(item.attempt.finished_at || item.attempt.created_at)}</span>
                      </div>
                      <p className="mt-2 truncate text-sm font-black text-app-text">{item.attempt.post_title}</p>
                      {item.attempt.error ? <p className="mt-1 line-clamp-2 text-xs leading-6 text-rose-600">{item.attempt.error}</p> : null}
                    </button>
                  ))}
                </div>
              </WorkspacePanel>
            </aside>
          </section>
        </WorkspacePage>
      </AppShell>
    </AuthGate>
  );
}
