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
import { PageHeader } from "../../components/page-header";
import { Button } from "../../components/ui/button";
import { SectionCard, SurfaceCard } from "../../components/ui/card";
import { Field, Input } from "../../components/ui/form";
import { Tag } from "../../components/ui/tag";
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
        <PageHeader
          eyebrow="کانال انتشار"
          title="اتصال روبیکا"
          description="اتصال ربات، مقصد انتشار و تست عملیاتی را از یک صفحه کنترل کنید تا صف انتشار با اطمینان کار کند."
          actionLabel="بازگشت به کمپوزر"
          actionHref="/compose"
        />

        <div className="grid gap-4 md:grid-cols-3">
          <SurfaceCard>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-app-muted">وضعیت اتصال</p>
                <p className="mt-3 text-xl font-black text-app-text">{statusLabel(status)}</p>
              </div>
              <div className={`rounded-xl p-3 ring-1 ${status === "connected" ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : status === "failed" ? "bg-rose-50 text-rose-700 ring-rose-100" : "bg-amber-50 text-amber-700 ring-amber-100"}`}>
                <PlugZap className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
            <div className="mt-4">
              <Tag tone={statusTone(status)}>{statusLabel(status)}</Tag>
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-app-muted">تشخیص آماده‌سازی</p>
                <p className="mt-3 text-3xl font-black text-app-text">{readyCount}/3</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 text-blue-700 ring-1 ring-blue-100">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
            <p className="mt-4 text-xs leading-6 text-app-muted">توکن، مقصد و تست اتصال باید کامل باشند.</p>
          </SurfaceCard>

          <SurfaceCard>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-app-muted">ربات فعال</p>
                <p className="mt-3 text-xl font-black text-app-text">{botName || "ثبت نشده"}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-slate-700 ring-1 ring-slate-100">
                <Bot className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
            <p className="mt-4 break-all text-left font-mono text-xs text-app-muted" dir="ltr">{chatId || "No destination"}</p>
          </SurfaceCard>
        </div>

        {message ? <div className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
        {error ? <div className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <SectionCard title="تنظیمات اتصال" description="توکن فقط هنگام جایگزینی لازم است. اگر توکن ذخیره شده دارید، تغییر مقصد بدون وارد کردن توکن جدید انجام می‌شود.">
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

                <div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm text-app-muted ring-1 ring-app-border md:grid-cols-2">
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
          </SectionCard>

          <aside className="space-y-5">
            <SectionCard title="وضعیت عملیاتی" description="قبل از زمان‌بندی جدی، تست اتصال باید موفق باشد.">
              <div className="space-y-0">
                {diagnostics.map((item) => <DiagnosticRow key={item.label} item={item} />)}
              </div>
              {lastError ? (
                <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs leading-6 text-rose-700 ring-1 ring-rose-100">
                  <p className="font-bold">آخرین خطا</p>
                  <p className="mt-1">{lastError}</p>
                </div>
              ) : null}
            </SectionCard>

            <SectionCard title="مسیر بعدی" description="بعد از تست موفق، انتشار دستی یا زمان‌بندی را شروع کنید.">
              <div className="grid gap-2">
                <Button href="/compose">
                  <Send className="ml-2 h-4 w-4" aria-hidden="true" />
                  ایجاد پست
                </Button>
                <Button href="/queue" variant="secondary">بررسی صف انتشار</Button>
                <Button href="/logs" variant="secondary">مشاهده لاگ اتصال و انتشار</Button>
              </div>
            </SectionCard>
          </aside>
        </section>
      </AppShell>
    </AuthGate>
  );
}
