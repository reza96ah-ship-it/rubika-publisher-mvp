"use client";

import {
  AlertTriangle,
  BadgeCheck,
  Bot,
  KeyRound,
  PlugZap,
  RadioTower,
  RefreshCw,
  Send,
  ShieldCheck
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AppShell } from "../../components/app-shell";
import { AuthGate } from "../../components/auth-gate";
import { Button } from "../../components/ui/button";
import { Field, Input } from "../../components/ui/form";
import { MetricTile, NoticeBanner, StatusToken, WorkspaceHero, WorkspacePage, WorkspacePanel } from "../../components/workspace-ui";
import { apiUrl, authHeaders } from "../../lib/posts";

type DiagnosticItem = {
  label: string;
  detail: string;
  done: boolean;
  tone?: "success" | "warning" | "alert";
};

function statusLabel(status: string) {
  if (status === "connected") return "اتصال تایید شده";
  if (status === "failed") return "اتصال خطا دارد";
  if (status === "missing_settings") return "تنظیمات ناقص است";
  return "نیازمند تست اتصال";
}

function statusTone(status: string): "success" | "warning" | "alert" | "neutral" {
  if (status === "connected") return "success";
  if (status === "failed" || status === "missing_settings") return "alert";
  return "warning";
}

function buildDiagnostics(maskedToken: string, chatId: string, status: string): DiagnosticItem[] {
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
      detail: status === "connected" ? "Rubika API با این تنظیمات پاسخ موفق داده است." : "بعد از ذخیره، تست اتصال را اجرا کنید.",
      done: status === "connected",
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
  const [maskedToken, setMaskedToken] = useState("");
  const [botName, setBotName] = useState("");
  const [status, setStatus] = useState("not_tested");
  const [lastError, setLastError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      const response = await fetch(`${apiUrl}/rubika/settings`, { headers: authHeaders() });

      if (response.ok) {
        const data = await response.json();
        if (data) {
          setChatId(data.chat_id ?? "");
          setMaskedToken(data.bot_token_masked ?? "");
          setBotName(data.bot_name ?? "");
          setStatus(data.status ?? "not_tested");
          setLastError(data.last_error ?? "");
        }
      }
      setLoading(false);
    }

    loadSettings().catch(() => {
      setError("خطا در دریافت تنظیمات روبیکا");
      setLoading(false);
    });
  }, []);

  const diagnostics = useMemo(() => buildDiagnostics(maskedToken, chatId, status), [chatId, maskedToken, status]);
  const readyCount = diagnostics.filter((item) => item.done).length;
  const hasSavedToken = Boolean(maskedToken);
  const canSave = Boolean(chatId.trim()) && (Boolean(botToken.trim()) || hasSavedToken);
  const canTest = Boolean(maskedToken) && Boolean(chatId.trim()) && !testing;

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
      setMaskedToken(data.bot_token_masked ?? "");
      setStatus(data.status ?? "not_tested");
      setLastError(data.last_error ?? "");
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
      if (data.ok) setMessage("اتصال روبیکا موفق بود");
      else setError(data.error || "تست اتصال ناموفق بود");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای تست اتصال");
    } finally {
      setTesting(false);
    }
  }

  return (
    <AuthGate>
      <AppShell>
        <WorkspacePage className="space-y-4">
          <WorkspaceHero
            eyebrow="Channel Setup"
            title="اتصال روبیکا"
            description="اتصال ربات، مقصد انتشار و تست عملیاتی را از یک صفحه کنترل کنید تا صف انتشار با اطمینان کار کند."
            actions={<Button href="/compose">بازگشت به استودیو تولید</Button>}
            meta={(
              <>
                <StatusToken tone={statusTone(status)}>{statusLabel(status)}</StatusToken>
                <StatusToken tone={readyCount === 3 ? "success" : "warning"}>{readyCount}/3 آماده</StatusToken>
                {botName ? <StatusToken tone="primary">{botName}</StatusToken> : null}
              </>
            )}
            aside={(
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black text-app-primary">وضعیت اتصال</p>
                    <p className="mt-2 text-lg font-black text-app-text">{statusLabel(status)}</p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-md border border-blue-200 bg-white text-app-primary">
                    <PlugZap className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {diagnostics.map((item) => (
                    <span key={item.label} className={`h-2 rounded-full ${item.done ? "bg-emerald-500" : item.tone === "alert" ? "bg-rose-500" : "bg-amber-400"}`} />
                  ))}
                </div>
              </div>
            )}
          />

          <section className="grid gap-3 md:grid-cols-3">
            <MetricTile label="وضعیت اتصال" value={statusLabel(status)} hint="آخرین نتیجه تست عملیاتی روبیکا" tone={status === "connected" ? "success" : status === "failed" ? "alert" : "warning"} icon={<PlugZap className="h-4 w-4" />} />
            <MetricTile label="تشخیص آماده‌سازی" value={`${readyCount}/3`} hint="توکن، مقصد و تست اتصال" tone={readyCount === 3 ? "success" : "warning"} icon={<ShieldCheck className="h-4 w-4" />} />
            <MetricTile label="ربات فعال" value={botName || "ثبت نشده"} hint={chatId || "مقصد انتشار هنوز مشخص نیست"} tone="neutral" icon={<Bot className="h-4 w-4" />} />
          </section>

          {message ? <NoticeBanner tone="success">{message}</NoticeBanner> : null}
          {error ? <NoticeBanner tone="alert">{error}</NoticeBanner> : null}

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
            <WorkspacePanel title="تنظیمات اتصال" description="توکن فقط هنگام جایگزینی لازم است. اگر توکن ذخیره شده دارید، تغییر مقصد بدون وارد کردن توکن جدید انجام می‌شود.">
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

                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" disabled={saving || !canSave}>
                      <KeyRound className="ml-2 h-4 w-4" aria-hidden="true" />
                      {saving ? "در حال ذخیره..." : "ذخیره تنظیمات"}
                    </Button>
                    <Button type="button" variant="secondary" onClick={testConnection} disabled={!canTest}>
                      <RefreshCw className="ml-2 h-4 w-4" aria-hidden="true" />
                      {testing ? "در حال تست..." : "تست اتصال"}
                    </Button>
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
