"use client";

import {
  AlertTriangle,
  BadgeCheck,
  Clock3,
  PlugZap,
  RadioTower,
  RefreshCw,
  Save,
  Send,
  ShieldCheck,
  Undo2
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AppShell } from "../../components/app-shell";
import { AuthGate } from "../../components/auth-gate";
import { Button } from "../../components/ui/button";
import { Field, Input } from "../../components/ui/form";
import { DetailGrid, NoticeBanner, StatusToken, WorkspacePage, WorkspacePanel } from "../../components/workspace-ui";
import { apiUrl, authHeaders } from "../../lib/posts";

type DiagnosticItem = {
  label: string;
  detail: string;
  done: boolean;
  tone?: "success" | "warning" | "alert";
};

function statusLabel(status: string, dirty = false) {
  if (dirty) return "تغییرات ذخیره نشده";
  if (status === "connected") return "اتصال تایید شده";
  if (status === "failed") return "اتصال خطا دارد";
  if (status === "missing_settings") return "تنظیمات ناقص است";
  return "نیازمند تست اتصال";
}

function statusTone(status: string, dirty = false): "success" | "warning" | "alert" | "neutral" {
  if (dirty) return "warning";
  if (status === "connected") return "success";
  if (status === "failed" || status === "missing_settings") return "alert";
  return "warning";
}

function formatLastTest(value: string) {
  if (!value) return "هنوز اجرا نشده";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "زمان نامعتبر";
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function buildDiagnostics(maskedToken: string, chatId: string, status: string, dirty: boolean): DiagnosticItem[] {
  return [
    {
      label: "توکن ربات",
      detail: maskedToken ? "توکن امن ذخیره شده است." : "برای انتشار خودکار باید توکن ربات را ذخیره کنید.",
      done: Boolean(maskedToken),
      tone: maskedToken ? "success" : "warning"
    },
    {
      label: "مقصد انتشار",
      detail: chatId ? "شناسه مقصد ثبت شده است." : "شناسه کانال یا گفت‌وگوی مقصد را وارد کنید.",
      done: Boolean(chatId.trim()),
      tone: chatId ? "success" : "warning"
    },
    {
      label: "تست اتصال",
      detail: dirty ? "ابتدا تغییرات را ذخیره کنید، سپس تست اتصال را اجرا کنید." : status === "connected" ? "Rubika API با این تنظیمات پاسخ موفق داده است." : "بعد از ذخیره، تست اتصال را اجرا کنید.",
      done: status === "connected" && !dirty,
      tone: status === "failed" ? "alert" : status === "connected" ? "success" : "warning"
    }
  ];
}

function DiagnosticRow({ item }: { item: DiagnosticItem }) {
  const Icon = item.done ? BadgeCheck : item.tone === "alert" ? AlertTriangle : RadioTower;
  const color = item.done ? "text-emerald-700" : item.tone === "alert" ? "text-rose-700" : "text-amber-700";
  return (
    <div className="flex items-start gap-3 border-b border-app-border py-3 first:pt-0 last:border-0 last:pb-0">
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${color}`} aria-hidden="true" />
      <div>
        <p className="text-sm font-bold text-app-text">{item.label}</p>
        <p className="mt-1 text-xs leading-6 text-app-muted">{item.detail}</p>
      </div>
    </div>
  );
}

export default function RubikaPage() {
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [savedChatId, setSavedChatId] = useState("");
  const [maskedToken, setMaskedToken] = useState("");
  const [botName, setBotName] = useState("");
  const [status, setStatus] = useState("not_tested");
  const [lastError, setLastError] = useState("");
  const [lastTestAt, setLastTestAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      const response = await fetch(`${apiUrl}/rubika/settings`, { headers: authHeaders() });

      if (!response.ok) throw new Error("خطا در دریافت تنظیمات روبیکا");

      const data = await response.json();
      if (data) {
        setChatId(data.chat_id ?? "");
        setSavedChatId(data.chat_id ?? "");
        setMaskedToken(data.bot_token_masked ?? "");
        setBotName(data.bot_name ?? "");
        setStatus(data.status ?? "not_tested");
        setLastError(data.last_error ?? "");
        setLastTestAt(data.last_test_at ?? "");
      }
      setLoading(false);
    }

    loadSettings().catch(() => {
      setError("خطا در دریافت تنظیمات روبیکا");
      setLoading(false);
    });
  }, []);

  const dirty = useMemo(() => Boolean(botToken.trim()) || chatId !== savedChatId, [botToken, chatId, savedChatId]);
  const diagnostics = useMemo(() => buildDiagnostics(maskedToken, chatId, status, dirty), [chatId, dirty, maskedToken, status]);
  const readyCount = diagnostics.filter((item) => item.done).length;
  const hasSavedToken = Boolean(maskedToken);
  const canSave = Boolean(chatId.trim()) && (Boolean(botToken.trim()) || hasSavedToken);
  const canTest = Boolean(maskedToken) && Boolean(savedChatId.trim()) && !dirty && !testing && !saving;

  function resetChanges() {
    setBotToken("");
    setChatId(savedChatId);
    setMessage("");
    setError("");
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!canSave) {
      setError("توکن ربات و شناسه مقصد برای ذخیره لازم است");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${apiUrl}/rubika/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders()
        },
        body: JSON.stringify({ bot_token: botToken.trim(), chat_id: chatId.trim() })
      });

      if (!response.ok) throw new Error("ذخیره تنظیمات روبیکا ناموفق بود");
      const data = await response.json();
      setChatId(data.chat_id ?? "");
      setSavedChatId(data.chat_id ?? "");
      setMaskedToken(data.bot_token_masked ?? "");
      setStatus(data.status ?? "not_tested");
      setLastError(data.last_error ?? "");
      setLastTestAt(data.last_test_at ?? "");
      setMessage(botToken.trim() ? "تنظیمات روبیکا ذخیره شد؛ حالا تست اتصال را اجرا کنید" : "مقصد ذخیره شد و توکن قبلی حفظ شد");
      setBotToken("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای ذخیره تنظیمات");
    } finally {
      setSaving(false);
    }
  }

  async function testConnection() {
    setMessage("");
    setError("");
    setTesting(true);

    try {
      const response = await fetch(`${apiUrl}/rubika/test`, {
        method: "POST",
        headers: authHeaders()
      });

      const data = await response.json();
      setStatus(data.status ?? "failed");
      setBotName(data.bot_name ?? "");
      setLastError(data.error ?? "");
      setLastTestAt(data.last_test_at ?? "");
      if (data.ok) setMessage("اتصال روبیکا موفق بود");
      else setError(data.error || "تست اتصال ناموفق بود");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای تست اتصال");
    } finally {
      setTesting(false);
    }
  }

  useEffect(() => {
    function warnAboutUnsavedChanges(event: BeforeUnloadEvent) {
      if (!dirty) return;
      event.preventDefault();
    }

    window.addEventListener("beforeunload", warnAboutUnsavedChanges);
    return () => window.removeEventListener("beforeunload", warnAboutUnsavedChanges);
  }, [dirty]);

  return (
    <AuthGate>
      <AppShell>
        <WorkspacePage className="space-y-4">
          <section className="rounded-md border border-app-border bg-white px-4 py-3">
            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
              <div>
                <p className="text-[10px] font-black text-app-primary">تنظیمات کانال</p>
                <h1 className="mt-1 text-xl font-black text-app-text">اتصال روبیکا</h1>
                <p className="mt-1 text-xs leading-5 text-app-muted">اعتبارنامه، مقصد و تست عملیاتی انتشار را از یک صفحه کنترل کنید.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusToken tone={statusTone(status, dirty)}>{statusLabel(status, dirty)}</StatusToken>
                <StatusToken tone={readyCount === 3 ? "success" : "warning"}>{readyCount}/3 آماده</StatusToken>
                {botName ? <StatusToken tone="primary">{botName}</StatusToken> : null}
              </div>
            </div>
          </section>

          <section className="grid overflow-hidden rounded-md border border-app-border bg-white sm:grid-cols-3">
            {[
              { label: "وضعیت اتصال", value: statusLabel(status, dirty), detail: dirty ? "بعد از ذخیره دوباره تست کنید" : "آخرین نتیجه تست عملیاتی", icon: PlugZap, tone: status === "connected" && !dirty ? "text-emerald-700" : status === "failed" ? "text-rose-700" : "text-amber-700" },
              { label: "تشخیص آماده‌سازی", value: `${readyCount}/3`, detail: "توکن، مقصد و تست اتصال", icon: ShieldCheck, tone: readyCount === 3 ? "text-emerald-700" : "text-amber-700" },
              { label: "آخرین تست", value: formatLastTest(lastTestAt), detail: botName || "نام ربات بعد از تست موفق", icon: Clock3, tone: status === "connected" ? "text-emerald-700" : "text-slate-500" }
            ].map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="flex min-w-0 items-start gap-3 border-b border-app-border p-3 sm:border-b-0 sm:border-l sm:last:border-l-0">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-50 ${metric.tone}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black text-app-muted">{metric.label}</p>
                    <p className="mt-0.5 truncate text-base font-black text-app-text">{metric.value}</p>
                    <p className="truncate text-[11px] text-app-muted">{metric.detail}</p>
                  </div>
                </div>
              );
            })}
          </section>

          {message ? <NoticeBanner tone="success">{message}</NoticeBanner> : null}
          {error ? <NoticeBanner tone="alert">{error}</NoticeBanner> : null}

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
            <WorkspacePanel title="اعتبارنامه و مقصد انتشار" description="توکن فقط هنگام جایگزینی لازم است. برای حفظ توکن ذخیره‌شده، فیلد آن را خالی بگذارید.">
              {loading ? (
                <p className="text-sm text-app-muted">در حال دریافت تنظیمات...</p>
              ) : (
                <form onSubmit={saveSettings} className="space-y-5">
                  <Field
                    label="توکن ربات روبیکا"
                    required={!hasSavedToken}
                    hint={hasSavedToken ? "برای حفظ توکن فعلی این فیلد را خالی بگذارید؛ برای جایگزینی، توکن جدید را وارد کنید." : "توکن ربات برای انتشار خودکار ضروری است."}
                  >
                    <Input
                      value={botToken}
                      onChange={(event) => setBotToken(event.target.value)}
                      className="text-left"
                      dir="ltr"
                      placeholder={maskedToken || "توکن ربات را وارد کنید"}
                      required={!hasSavedToken}
                    />
                  </Field>

                  <Field label="Chat ID / Channel ID" required hint="شناسه کانال یا گفت‌وگوی مقصد که پست‌ها در آن منتشر می‌شوند.">
                    <Input
                      value={chatId}
                      onChange={(event) => setChatId(event.target.value)}
                      className="text-left"
                      dir="ltr"
                      required
                    />
                  </Field>

                  <div className="grid gap-3 rounded-md border border-app-border bg-slate-50 p-4 text-sm text-app-muted md:grid-cols-2">
                    <div>
                      <p className="font-bold text-app-text">توکن ذخیره‌شده</p>
                      <p className="mt-1 break-all text-left font-mono text-xs" dir="ltr">{maskedToken || "هنوز ذخیره نشده"}</p>
                    </div>
                    <div>
                      <p className="font-bold text-app-text">رفتار ذخیره</p>
                      <p className="mt-1 text-xs leading-6">{botToken.trim() ? "توکن جدید جایگزین می‌شود." : hasSavedToken ? "توکن قبلی حفظ می‌شود." : "توکن لازم است."}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 rounded-md border border-app-border bg-white p-3 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-black text-app-text">{dirty ? "تغییرات آماده ذخیره است" : "تنظیمات اتصال به‌روز است"}</p>
                      <p className="mt-1 text-xs text-app-muted">{dirty ? "ذخیره کنید تا تست اتصال برای نسخه جدید فعال شود." : "برای اطمینان از سلامت کانال، تست عملیاتی را اجرا کنید."}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="secondary" onClick={resetChanges} disabled={!dirty || saving}>
                        <Undo2 className="ml-2 h-4 w-4" aria-hidden="true" />
                        بازگردانی
                      </Button>
                      <Button type="submit" disabled={saving || !canSave || !dirty}>
                        <Save className="ml-2 h-4 w-4" aria-hidden="true" />
                        {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </WorkspacePanel>

            <aside className="space-y-4">
              <WorkspacePanel title="وضعیت عملیاتی" description="قبل از زمان‌بندی جدی، تست اتصال باید موفق باشد.">
                <div className="space-y-0">
                  {diagnostics.map((item) => <DiagnosticRow key={item.label} item={item} />)}
                </div>
                {lastError ? (
                  <div className="mt-4">
                    <NoticeBanner tone="alert" title="آخرین خطا">
                      {lastError}
                    </NoticeBanner>
                  </div>
                ) : null}
              </WorkspacePanel>

              <WorkspacePanel title="تست عملیاتی" description="این تست با تنظیمات ذخیره‌شده، دسترسی ربات روبیکا را بررسی می‌کند.">
                <Button type="button" className="w-full" onClick={testConnection} disabled={!canTest}>
                  <RefreshCw className={`ml-2 h-4 w-4 ${testing ? "animate-spin" : ""}`} aria-hidden="true" />
                  {testing ? "در حال بررسی اتصال..." : "اجرای تست اتصال"}
                </Button>
                {dirty ? <p className="mt-3 text-xs leading-6 text-amber-700">برای اجرای تست، ابتدا تغییرات را ذخیره کنید.</p> : null}
              </WorkspacePanel>

              <WorkspacePanel title="جزئیات کانال" description="خلاصه‌ای از تنظیمات ذخیره‌شده و آخرین بررسی.">
                <DetailGrid
                  items={[
                    { label: "توکن", value: <span className="block break-all text-left font-mono text-xs" dir="ltr">{maskedToken || "ثبت نشده"}</span> },
                    { label: "مقصد ذخیره‌شده", value: <span className="block break-all text-left font-mono text-xs" dir="ltr">{savedChatId || "ثبت نشده"}</span> },
                    { label: "نام ربات", value: botName || "نامشخص" },
                    { label: "آخرین تست", value: formatLastTest(lastTestAt) }
                  ]}
                />
              </WorkspacePanel>

              <WorkspacePanel title="مسیر بعدی" description="بعد از تست موفق، انتشار دستی یا زمان‌بندی را شروع کنید.">
                <div className="grid gap-2">
                  <Button href="/compose">
                    <Send className="ml-2 h-4 w-4" aria-hidden="true" />
                    ایجاد پست
                  </Button>
                  <Button href="/queue" variant="secondary">بررسی صف انتشار</Button>
                  <Button href="/logs" variant="secondary">مشاهده لاگ اتصال و انتشار</Button>
                </div>
              </WorkspacePanel>
            </aside>
          </section>
        </WorkspacePage>
      </AppShell>
    </AuthGate>
  );
}
