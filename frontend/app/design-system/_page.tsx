"use client";

import { useState } from "react";
import {
  ArrowUpLeft,
  BellRing,
  CalendarClock,
  CheckCircle2,
  Circle,
  FileText,
  Filter,
  Layers3,
  PanelTop,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Wand2
} from "lucide-react";
import { AmbientMesh } from "../../components/liquid-glass/ambient-mesh";
import {
  NButton,
  NEmptyState,
  NField,
  NIconButton,
  NInput,
  NNotice,
  NPage,
  NPageHeader,
  NRow,
  NSection,
  NSelect,
  NSurface,
  NStatusPill,
  NTag,
  NTabs,
  NTextarea
} from "../../components/nashrino-ui";

const tabs = [
  { label: "همه", value: "all", count: 24 },
  { label: "آماده انتشار", value: "ready", count: 8 },
  { label: "نیازمند رسیدگی", value: "attention", count: 3 },
  { label: "منتشر شده", value: "published", count: 13 }
];

const radiusSamples = [
  { label: "تراشه", className: "n-radius-chip" },
  { label: "کنترل", className: "n-radius-control" },
  { label: "فیلد", className: "n-radius-field" },
  { label: "کارت", className: "n-radius-card" },
  { label: "پنل", className: "n-radius-panel" },
  { label: "پوسته", className: "n-radius-shell" }
];

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState("all");

  return (
        <NPage>
          <NPageHeader
            eyebrow="V-3 Material Bridge"
            title="سیستم طراحی نشرینو"
            description="آزمایشگاه اجرایی برای مواد شیشه‌ای کنترل‌شده، هندسه، رنگ، فرم، داده و رفتار تعاملی. صفحات محصول فقط بعد از تثبیت قطعه مشترک در این مرجع بازسازی می‌شوند."
            meta={<NStatusPill tone="success">پل توکن فعال</NStatusPill>}
            action={<NButton href="/compose" icon={Plus}>ساخت پست</NButton>}
          />

          <section className="relative isolate overflow-hidden rounded-shell border border-app-border bg-app-background p-3 shadow-soft sm:p-5">
            <AmbientMesh fixed={false} className="-z-10" />
            <div className="relative z-10">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                <div>
                  <p className="app-section-kicker text-[10px] font-black">Material hierarchy</p>
                  <h2 className="mt-1 text-lg font-black text-app-text">سه سطح ماده برای یک محصول عملیاتی</h2>
                  <p className="mt-1 max-w-3xl text-xs leading-6 text-app-muted sm:text-sm">
                    شیشه برای نمایش عمق و موقعیت استفاده می‌شود؛ ویرایشگرها، جدول‌های پرتراکم و فهرست‌های طولانی روی سطح جامد باقی می‌مانند.
                  </p>
                </div>
                <NStatusPill tone="info">RTL · موبایل · کنتراست بالا</NStatusPill>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                <MaterialCard
                  icon={Layers3}
                  title="پنل عملیاتی"
                  detail="برای داشبورد، تقویم، کارت و محفظه داده با تاری محدود."
                  className="n-liquid-panel"
                />
                <MaterialCard
                  icon={PanelTop}
                  title="شیشه شناور"
                  detail="برای ناوبری، نوار فرمان، کشو، پاپ‌اور و کنترل ثابت."
                  className="n-liquid-floating"
                />
                <MaterialCard
                  icon={ShieldCheck}
                  title="سطح جامد"
                  detail="برای فرم بلند، ویرایشگر، نمودار و فهرست پرتراکم."
                  className="n-liquid-solid"
                />
              </div>
            </div>
          </section>

          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-3">
              <NSection title="رنگ، هندسه و عمق" description="هندسه باید سلسله‌مراتب داشته باشد؛ شعاع بزرگ فقط برای پوسته و پنل اصلی استفاده می‌شود.">
                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <p className="text-xs font-black text-app-text">رنگ‌های پایه</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <ColorToken label="تأکید" value="var(--n-liquid-accent)" />
                      <ColorToken label="تأکید نرم" value="var(--n-liquid-accent-soft)" />
                      <ColorToken label="موفق" value="rgb(var(--n-color-success))" />
                      <ColorToken label="هشدار" value="rgb(var(--n-color-warning))" />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-black text-app-text">مقیاس شعاع</p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {radiusSamples.map((sample) => (
                        <div
                          key={sample.label}
                          className={`${sample.className} flex min-h-16 items-center justify-center border border-app-border bg-app-surfaceMuted px-2 text-center text-[11px] font-black text-app-muted`}
                        >
                          {sample.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </NSection>

              <NSection title="اقدام‌ها" description="دکمه‌ها باید اندازه ثابت، فوکوس واضح، حالت غیرفعال و حالت بارگذاری داشته باشند.">
                <div className="flex flex-wrap items-center gap-2">
                  <NButton icon={Plus}>اقدام اصلی</NButton>
                  <NButton variant="secondary" icon={Filter}>فیلتر</NButton>
                  <NButton variant="quiet" trailingIcon={ArrowUpLeft}>مشاهده جزئیات</NButton>
                  <NButton variant="danger">حذف</NButton>
                  <NButton loading>در حال ذخیره</NButton>
                  <NIconButton label="جست‌وجو" icon={Search} />
                  <NIconButton label="اعلان‌ها" icon={BellRing} badge="2" />
                </div>
              </NSection>

              <NSection title="فرم‌ها" description="فرم‌ها روی سطح جامد، کم‌ارتفاع، خوانا و مناسب لمس موبایل باقی می‌مانند.">
                <div className="grid gap-3 lg:grid-cols-3">
                  <NField label="عنوان محتوا" hint="حداکثر ۸۰ کاراکتر برای کارت‌های فهرست." required>
                    <NInput icon={FileText} placeholder="مثلا معرفی محصول جدید" />
                  </NField>
                  <NField label="وضعیت انتشار">
                    <NSelect defaultValue="ready">
                      <option value="draft">پیش‌نویس</option>
                      <option value="ready">آماده انتشار</option>
                      <option value="scheduled">زمان‌بندی شده</option>
                    </NSelect>
                  </NField>
                  <NField label="کلید جست‌وجو" error="این مقدار در نمای عمومی تکراری است.">
                    <NInput state="error" icon={Search} placeholder="نام کمپین یا محصول" />
                  </NField>
                </div>
                <div className="mt-3">
                  <NField label="کپشن">
                    <NTextarea placeholder="متن پست را کوتاه، روشن و قابل اسکن بنویسید." />
                  </NField>
                </div>
              </NSection>

              <NSection title="تب‌ها و برچسب‌ها" description="فیلترهای تکراری باید به تب، برچسب و نمای ذخیره‌شده استاندارد تبدیل شوند.">
                <div className="space-y-3">
                  <NTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                  <div className="flex flex-wrap gap-2">
                    <NTag>خنثی</NTag>
                    <NTag tone="primary">کمپین</NTag>
                    <NTag tone="success">آماده</NTag>
                    <NTag tone="warning">بازبینی</NTag>
                    <NTag tone="alert">خطا</NTag>
                    <NTag tone="info" onRemove={() => undefined}>کانال</NTag>
                  </div>
                </div>
              </NSection>

              <NSection title="ردیف‌های داده" description="محتوا، صف، لاگ و کمپین باید از یک زبان ردیف و اکشن استفاده کنند.">
                <div className="space-y-2">
                  <NRow
                    title="پست معرفی محصول"
                    detail="روبیکا و اینستاگرام · امروز ۱۸:۳۰"
                    icon={CalendarClock}
                    meta={<NStatusPill tone="success">آماده</NStatusPill>}
                    action={<NButton variant="secondary" size="sm">بازبینی</NButton>}
                    selected
                  />
                  <NRow
                    title="کمپین فروش تابستان"
                    detail="۳ محتوا در برنامه · یک هشدار زمان‌بندی"
                    icon={Sparkles}
                    tone="warning"
                    meta={<NStatusPill tone="warning">نیازمند بررسی</NStatusPill>}
                    action={<NIconButton label="تنظیمات" icon={Settings2} size="sm" />}
                  />
                  <NEmptyState title="ردیفی برای این نما نیست" detail="با تغییر فیلتر یا ساخت محتوا، این بخش پر می‌شود." icon={CheckCircle2} />
                </div>
              </NSection>
            </div>

            <aside className="space-y-3 xl:self-start">
              <div className="n-liquid-floating n-radius-panel border p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="nashrino-token-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-control border">
                    <Wand2 className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-base font-black text-app-text">قانون V-3</h2>
                    <p className="mt-2 text-sm leading-7 text-app-muted">
                      ماده شیشه‌ای فقط برای عمق و کنترل شناور است؛ داده پرتراکم باید خوانا و کم‌هزینه باقی بماند.
                    </p>
                  </div>
                </div>
              </div>

              <NSurface variant="tonal">
                <div className="space-y-2">
                  <p className="text-sm font-black text-app-text">حالت‌های پایه</p>
                  <div className="grid grid-cols-2 gap-2">
                    <NStatusPill tone="neutral">پیش‌فرض</NStatusPill>
                    <NStatusPill tone="primary">فعال</NStatusPill>
                    <NStatusPill tone="success">موفق</NStatusPill>
                    <NStatusPill tone="warning">هشدار</NStatusPill>
                    <NStatusPill tone="alert">خطا</NStatusPill>
                    <NStatusPill tone="info">اطلاع</NStatusPill>
                  </div>
                </div>
              </NSurface>

              <NNotice tone="info" title="دسترسی‌پذیری محفوظ است">
                حالت کنتراست بالا تاری و مش پس‌زمینه را غیرفعال می‌کند. در موبایل نیز تاری پنل‌های بزرگ کاهش می‌یابد.
              </NNotice>

              <NNotice tone="warning" title="مرحله بعد">
                این پل هنوز پوسته صفحات را تغییر نمی‌دهد. AppShell V2 پس از تثبیت این توکن‌ها اجرا می‌شود.
              </NNotice>
            </aside>
          </div>
        </NPage>
  );
}

function MaterialCard({
  icon: Icon,
  title,
  detail,
  className
}: {
  icon: typeof Layers3;
  title: string;
  detail: string;
  className: string;
}) {
  return (
    <article className={`${className} n-radius-panel min-h-40 border p-4`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-control border border-app-border bg-app-surface/70 text-app-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-sm font-black text-app-text">{title}</h3>
      <p className="mt-2 text-xs leading-6 text-app-muted">{detail}</p>
    </article>
  );
}

function ColorToken({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-app-border bg-app-surface p-2 shadow-hairline">
      <span
        className="block h-12 rounded-control border border-app-border"
        style={{ background: value }}
      />
      <span className="mt-2 block text-[11px] font-black text-app-muted">{label}</span>
    </div>
  );
}
