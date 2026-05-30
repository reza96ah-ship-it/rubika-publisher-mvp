"use client";

import {
  BadgeCheck,
  Building2,
  CalendarClock,
  Hash,
  MessageSquareText,
  Phone,
  Save,
  Store as StoreIcon,
  Undo2
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AppShell } from "../../components/app-shell";
import { AuthGate } from "../../components/auth-gate";
import { Button } from "../../components/ui/button";
import { Field, Input, Textarea } from "../../components/ui/form";
import { Tag } from "../../components/ui/tag";
import { MetricTile, NoticeBanner, StatusToken, WorkspaceHero, WorkspacePage, WorkspacePanel } from "../../components/workspace-ui";
import { apiUrl, authHeaders } from "../../lib/posts";

const emptyStore = {
  name: "",
  category: "",
  phone: "",
  description: "",
  default_hashtags: "",
  caption_footer: "",
  timezone: "Asia/Tehran"
};

type StoreForm = typeof emptyStore;

type ReadinessItem = {
  label: string;
  detail: string;
  done: boolean;
  required?: boolean;
};

function trim(value: string) {
  return value.trim();
}

function normalizeStore(data: Partial<StoreForm> = {}): StoreForm {
  return {
    name: data.name ?? "",
    category: data.category ?? "",
    phone: data.phone ?? "",
    description: data.description ?? "",
    default_hashtags: data.default_hashtags ?? "",
    caption_footer: data.caption_footer ?? "",
    timezone: data.timezone ?? "Asia/Tehran"
  };
}

function buildReadiness(form: StoreForm): ReadinessItem[] {
  return [
    {
      label: "نام فروشگاه",
      detail: "در هدر workspace و متن‌های آماده‌سازی استفاده می‌شود.",
      done: Boolean(trim(form.name)),
      required: true
    },
    {
      label: "دسته‌بندی فعالیت",
      detail: "به تولید کپشن و کمپین‌های منظم‌تر کمک می‌کند.",
      done: Boolean(trim(form.category))
    },
    {
      label: "منطقه زمانی",
      detail: "زمان‌بندی انتشار با این مقدار هماهنگ می‌شود.",
      done: Boolean(trim(form.timezone)),
      required: true
    },
    {
      label: "هشتگ‌های پیش‌فرض",
      detail: "برای شروع سریع‌تر composer و استانداردسازی خروجی.",
      done: Boolean(trim(form.default_hashtags))
    },
    {
      label: "متن پایانی کپشن",
      detail: "CTA ثابت فروشگاه را به کپشن‌های آماده اضافه می‌کند.",
      done: Boolean(trim(form.caption_footer))
    }
  ];
}

function readinessScore(items: ReadinessItem[]) {
  if (items.length === 0) return 0;
  return Math.round((items.filter((item) => item.done).length / items.length) * 100);
}

function defaultCount(form: StoreForm) {
  return [form.default_hashtags, form.caption_footer, form.description].filter((value) => Boolean(trim(value))).length;
}

function previewCaption(form: StoreForm) {
  const pieces = [
    form.description || "توضیحات کوتاه فروشگاه اینجا نمایش داده می‌شود.",
    form.caption_footer,
    form.default_hashtags || "#فروشگاه #خرید_آنلاین"
  ].filter(Boolean);
  return pieces.join("\n\n");
}

function ReadinessRow({ item }: { item: ReadinessItem }) {
  const Icon = item.done ? BadgeCheck : CalendarClock;
  return (
    <div className="flex items-start gap-3 border-b border-app-border py-3 first:pt-0 last:border-0 last:pb-0">
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${item.done ? "text-emerald-700" : item.required ? "text-amber-700" : "text-slate-400"}`} aria-hidden="true" />
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-bold text-app-text">{item.label}</p>
          {item.required ? <Tag tone="warning">ضروری</Tag> : null}
        </div>
        <p className="mt-1 text-xs leading-6 text-app-muted">{item.detail}</p>
      </div>
    </div>
  );
}

export default function StorePage() {
  const [form, setForm] = useState<StoreForm>(emptyStore);
  const [savedForm, setSavedForm] = useState<StoreForm>(emptyStore);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStore() {
      const response = await fetch(`${apiUrl}/stores/active`, { headers: authHeaders() });

      if (!response.ok) throw new Error("خطا در دریافت اطلاعات فروشگاه");

      const data = await response.json();
      if (data) {
        const nextForm = normalizeStore(data);
        setForm(nextForm);
        setSavedForm(nextForm);
      }

      setLoading(false);
    }

    loadStore().catch(() => {
      setError("خطا در دریافت اطلاعات فروشگاه");
      setLoading(false);
    });
  }, []);

  const readinessItems = useMemo(() => buildReadiness(form), [form]);
  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(savedForm), [form, savedForm]);
  const score = readinessScore(readinessItems);
  const requiredReady = readinessItems.filter((item) => item.required).every((item) => item.done);

  function updateField(field: keyof StoreForm, value: string) {
    setMessage("");
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetChanges() {
    setForm(savedForm);
    setMessage("");
    setError("");
  }

  async function saveStore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);

    try {
      const response = await fetch(`${apiUrl}/stores/active`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders()
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error("ذخیره پروفایل فروشگاه ناموفق بود");
      }

      const data = await response.json();
      const nextForm = normalizeStore(data);
      setForm(nextForm);
      setSavedForm(nextForm);
      setMessage("پروفایل فروشگاه ذخیره شد");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای ذخیره اطلاعات");
    } finally {
      setSaving(false);
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
          <WorkspaceHero
            eyebrow="Brand Setup"
            title="پروفایل فروشگاه"
            description="هویت فروشگاه، متن‌های ثابت و تنظیمات پیش‌فرض را برای تولید محتوای سریع و منظم آماده کنید."
            meta={(
              <>
                <StatusToken tone={requiredReady ? "success" : "warning"}>{requiredReady ? "حداقل آماده" : "نیازمند تکمیل"}</StatusToken>
                <StatusToken tone="primary">{score}% آمادگی</StatusToken>
                <StatusToken tone={defaultCount(form) >= 2 ? "success" : "neutral"}>{defaultCount(form)}/3 تنظیم متن</StatusToken>
                <StatusToken tone={dirty ? "warning" : "success"}>{dirty ? "تغییرات ذخیره نشده" : "ذخیره شده"}</StatusToken>
              </>
            )}
            aside={(
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black text-app-primary">آمادگی پروفایل</p>
                    <p className="mt-2 text-lg font-black text-app-text">{score}% آماده</p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-md border border-blue-200 bg-white text-app-primary">
                    <StoreIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                  <div className={`h-full rounded-full ${requiredReady ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${score}%` }} />
                </div>
              </div>
            )}
          />

          <section className="grid gap-3 md:grid-cols-3">
            <MetricTile label="آمادگی پروفایل" value={`${score}%`} hint="نام و منطقه زمانی پایه‌های ضروری‌اند" tone={requiredReady ? "success" : "warning"} icon={<StoreIcon className="h-4 w-4" />} />
            <MetricTile label="تنظیمات متن" value={`${defaultCount(form)}/3`} hint="توضیح، هشتگ و CTA برای کپشن‌های سریع" tone="primary" icon={<MessageSquareText className="h-4 w-4" />} />
            <MetricTile label="وضعیت ویرایش" value={dirty ? "ذخیره نشده" : "به‌روز"} hint={dirty ? "تغییرات را ذخیره کنید یا به آخرین نسخه برگردانید" : "آخرین تغییرات پروفایل ثبت شده است"} tone={dirty ? "warning" : "success"} icon={<Save className="h-4 w-4" />} />
          </section>

          {message ? <NoticeBanner tone="success">{message}</NoticeBanner> : null}
          {error ? <NoticeBanner tone="alert">{error}</NoticeBanner> : null}

          {loading ? (
            <WorkspacePanel title="پروفایل فروشگاه">
              <p className="text-sm text-app-muted">در حال دریافت اطلاعات...</p>
            </WorkspacePanel>
          ) : (
            <form onSubmit={saveStore}>
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div className="space-y-4">
                  <WorkspacePanel title="هویت فروشگاه" description="اطلاعات پایه برند و تنظیمات عملیاتی workspace را مدیریت کنید.">
                    <div className="grid gap-5 lg:grid-cols-2">
                  <Field label="نام فروشگاه" required>
                    <Input value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
                  </Field>

                  <Field label="دسته‌بندی فعالیت" hint="مثلاً پوشاک، کافه، آرایشی یا خدمات محلی.">
                    <Input value={form.category} onChange={(event) => updateField("category", event.target.value)} placeholder="مثلاً پوشاک، کافه، آرایشی" />
                  </Field>

                  <Field label="شماره تماس">
                    <Input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} className="text-left" dir="ltr" />
                  </Field>

                  <Field label="منطقه زمانی" required hint="برای ایران همین مقدار مناسب است.">
                    <Input value={form.timezone} onChange={(event) => updateField("timezone", event.target.value)} className="text-left" dir="ltr" required />
                  </Field>
                    </div>
                  </WorkspacePanel>

                  <WorkspacePanel title="پیش‌فرض‌های انتشار" description="متن‌های تکرارشونده را یک‌بار تنظیم کنید تا composer شروع سریع‌تری داشته باشد.">
                    <div className="grid gap-5 lg:grid-cols-2">
                  <Field label="توضیحات کوتاه فروشگاه" hint="یک توضیح کوتاه که شخصیت برند و پیشنهاد اصلی را مشخص کند.">
                    <Textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} />
                  </Field>

                  <Field label="هشتگ‌های پیش‌فرض" hint="در هر خط یا با فاصله بنویسید.">
                    <Textarea value={form.default_hashtags} onChange={(event) => updateField("default_hashtags", event.target.value)} placeholder="#فروشگاه #خرید_آنلاین" />
                  </Field>

                  <Field label="متن پایانی کپشن" hint="دعوت به اقدام ثابت مثل سفارش، تماس یا مراجعه حضوری.">
                    <Textarea value={form.caption_footer} onChange={(event) => updateField("caption_footer", event.target.value)} placeholder="برای سفارش پیام بدهید." />
                  </Field>

                      <div className="lg:col-span-2">
                        <NoticeBanner>
                          composer از این اطلاعات برای شروع سریع‌تر کپشن‌ها استفاده می‌کند.
                        </NoticeBanner>
                      </div>
                    </div>
                  </WorkspacePanel>

                  <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-md border border-app-border bg-white/95 p-3 shadow-lg shadow-slate-200/60 backdrop-blur md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-black text-app-text">{dirty ? "تغییرات آماده ذخیره است" : "پروفایل فروشگاه به‌روز است"}</p>
                      <p className="mt-1 text-xs text-app-muted">{dirty ? "برای استفاده در composer، نسخه جدید را ثبت کنید." : "هر تغییر جدید در این نوار مشخص می‌شود."}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="secondary" onClick={resetChanges} disabled={!dirty || saving}>
                        <Undo2 className="ml-2 h-4 w-4" aria-hidden="true" />
                        بازگردانی
                      </Button>
                      <Button type="submit" disabled={!dirty || saving}>
                        <Save className="ml-2 h-4 w-4" aria-hidden="true" />
                        {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
                      </Button>
                    </div>
                  </div>
                </div>

                <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
              <WorkspacePanel title="چک‌لیست آماده‌سازی" description="برای یک workspace قابل اتکا، این موارد را کامل نگه دارید.">
                <div className="space-y-0">
                  {readinessItems.map((item) => <ReadinessRow key={item.label} item={item} />)}
                </div>
              </WorkspacePanel>

              <WorkspacePanel title="پیش‌نمایش کپشن پایه" description="خروجی پایه‌ای که در کپشن‌ها تکرار می‌شود.">
                <div className="rounded-md border border-app-border bg-slate-50 p-4">
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-app-muted">
                    <Building2 className="h-4 w-4" aria-hidden="true" />
                    <span>{form.name || "نام فروشگاه"}</span>
                    {form.category ? (
                      <>
                        <span>·</span>
                        <span>{form.category}</span>
                      </>
                    ) : null}
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{previewCaption(form)}</p>
                </div>
                <div className="mt-4 grid gap-3 text-xs text-app-muted">
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    {form.phone || "شماره تماس ثبت نشده"}
                  </p>
                  <p className="flex items-center gap-2">
                    <Hash className="h-4 w-4" aria-hidden="true" />
                    {form.default_hashtags ? "هشتگ پیش‌فرض آماده است" : "هشتگ پیش‌فرض هنوز خالی است"}
                  </p>
                </div>
              </WorkspacePanel>

              <WorkspacePanel title="مرحله بعدی" description="بعد از هویت فروشگاه، اتصال روبیکا را تست کنید.">
                <Button href="/rubika" className="w-full">باز کردن اتصال روبیکا</Button>
              </WorkspacePanel>
                </aside>
              </div>
            </form>
          )}
        </WorkspacePage>
      </AppShell>
    </AuthGate>
  );
}
