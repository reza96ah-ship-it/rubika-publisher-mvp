"use client";

import { BadgeCheck, CalendarDays, CheckCircle2, CircleDashed, Network, PenLine, Rocket, Store, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../../components/app-shell";
import { AuthGate } from "../../components/auth-gate";
import { LoadingPanel } from "../../components/loading-skeleton";
import { Button } from "../../components/ui/button";
import { NoticeBanner, StatusToken, WorkspacePage, WorkspacePanel } from "../../components/workspace-ui";
import { buildCampaignFilterOptions, loadCampaigns, type Campaign } from "../../lib/campaigns";
import { apiUrl, authHeaders, type Post } from "../../lib/posts";
import { isRubikaConnected, isStoreConfigured, loadWorkspaceOverview, type RubikaSettings, type StoreProfile } from "../../lib/workspace";

type SetupStep = {
  key: string;
  label: string;
  description: string;
  href: string;
  action: string;
  done: boolean;
  optional?: boolean;
  icon: typeof Store;
};

function hasScheduledPost(posts: Post[]) {
  return posts.some((post) => ["scheduled", "publishing", "published"].includes(post.status));
}

function StepCard({ step, active, index }: { step: SetupStep; active: boolean; index: number }) {
  const Icon = step.done ? BadgeCheck : step.icon;
  return (
    <article className={`app-interactive rounded-lg border p-3 shadow-hairline transition ${
      active ? "border-app-primary bg-blue-50/70" : step.done ? "border-teal-100 bg-teal-50/50" : "border-app-border bg-white"
    }`}>
      <div className="flex items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${
          step.done ? "bg-white text-teal-700" : active ? "bg-white text-app-primary" : "bg-app-surfaceMuted text-slate-500"
        }`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-black text-app-muted">{index + 1}</span>
            <h2 className="text-sm font-black text-app-text">{step.label}</h2>
            {step.optional ? <StatusToken tone="neutral">پیشنهادی</StatusToken> : null}
            {step.done ? <StatusToken tone="success">کامل</StatusToken> : active ? <StatusToken tone="warning">قدم فعلی</StatusToken> : <StatusToken tone="neutral">در انتظار</StatusToken>}
          </div>
          <p className="mt-2 text-xs leading-6 text-app-muted">{step.description}</p>
          <Button href={step.href} variant={active ? "primary" : "secondary"} size="sm" className="mt-3">
            {step.done ? "بازبینی" : step.action}
          </Button>
        </div>
      </div>
    </article>
  );
}

export default function OnboardingPage() {
  const [store, setStore] = useState<StoreProfile | null>(null);
  const [rubika, setRubika] = useState<RubikaSettings | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSetup() {
      setLoading(true);
      setError("");
      const [overview, postResponse, campaignData] = await Promise.all([
        loadWorkspaceOverview(),
        fetch(`${apiUrl}/posts`, { headers: authHeaders() }),
        loadCampaigns()
      ]);
      if (!postResponse.ok) throw new Error("دریافت وضعیت راه‌اندازی ناموفق بود");
      setStore(overview.store);
      setRubika(overview.rubika);
      setPosts(await postResponse.json());
      setCampaigns(campaignData);
      setLoading(false);
    }

    loadSetup().catch((err) => {
      setError(err instanceof Error ? err.message : "خطا در دریافت مسیر راه‌اندازی");
      setLoading(false);
    });
  }, []);

  const campaignOptions = useMemo(() => buildCampaignFilterOptions(posts, campaigns), [campaigns, posts]);
  const steps: SetupStep[] = [
    {
      key: "brand",
      label: "هویت برند",
      description: "نام، دسته‌بندی، رنگ، لحن، CTA و تصویر برند را آماده کنید تا همه خروجی‌ها یکدست باشند.",
      href: "/store",
      action: "تکمیل برند",
      done: isStoreConfigured(store),
      icon: Store
    },
    {
      key: "channels",
      label: "کانال‌های انتشار",
      description: "روبیکا و اینستاگرام را به عنوان کانال‌های مستقل با وضعیت، قابلیت و محدودیت روشن تنظیم کنید.",
      href: "/channels",
      action: "تنظیم کانال‌ها",
      done: isRubikaConnected(rubika),
      icon: Network
    },
    {
      key: "campaign",
      label: "کمپین یا هدف انتشار",
      description: "برای انتشار حرفه‌ای، محتوا را به هدف، کمپین، مالک و بازه زمانی وصل کنید.",
      href: "/campaigns",
      action: "ساخت کمپین",
      done: campaigns.length > 0 || campaignOptions.some((option) => option.value !== "none"),
      optional: true,
      icon: Target
    },
    {
      key: "content",
      label: "اولین محتوای چندکاناله",
      description: "ایده، کپشن، رسانه، هشتگ و پیش‌نمایش را در composer آماده کنید.",
      href: "/compose",
      action: "ساخت محتوا",
      done: posts.length > 0,
      icon: PenLine
    },
    {
      key: "schedule",
      label: "زمان‌بندی و کنترل نهایی",
      description: "پست را وارد پلنر کنید و قبل از انتشار، وضعیت کانال، رسانه و فاصله زمانی را بررسی کنید.",
      href: "/calendar",
      action: "باز کردن پلنر",
      done: hasScheduledPost(posts),
      icon: CalendarDays
    }
  ];

  const completedCount = steps.filter((step) => step.done).length;
  const progress = Math.round((completedCount / steps.length) * 100);
  const nextStep = steps.find((step) => !step.done && !step.optional) ?? steps.find((step) => !step.done) ?? steps[steps.length - 1];

  return (
    <AuthGate>
      <AppShell>
        <WorkspacePage className="space-y-4">
          <section className="app-studio-panel overflow-hidden rounded-lg">
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="px-4 py-5 lg:px-5">
                <p className="app-section-kicker text-[10px] font-black">Guided Setup</p>
                <h1 className="mt-2 text-2xl font-black text-app-text">مسیر راه‌اندازی SocialOps</h1>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-app-muted">
                  این مسیر، ماژول‌های پراکنده را به یک سفر ساده تبدیل می‌کند: برند، کانال، کمپین، محتوا و زمان‌بندی.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button href={nextStep.href}>
                    <Rocket className="ml-2 h-4 w-4" aria-hidden="true" />
                    {nextStep.action}
                  </Button>
                  <Button href="/compose" variant="secondary">رفتن به composer</Button>
                  <Button href="/calendar" variant="secondary">رفتن به پلنر</Button>
                </div>
              </div>
              <div className="app-studio-grid border-t border-app-border bg-teal-50/55 p-4 lg:border-r lg:border-t-0">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-app-primary shadow-hairline">
                    {progress === 100 ? <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> : <CircleDashed className="h-5 w-5" aria-hidden="true" />}
                  </span>
                  <StatusToken tone={progress === 100 ? "success" : "warning"}>{completedCount}/{steps.length} کامل</StatusToken>
                </div>
                <p className="mt-4 text-xs font-black text-app-muted">پیشرفت راه‌اندازی</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-app-primary transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-3 text-sm font-black text-app-text">{progress}% آماده برای انتشار حرفه‌ای</p>
                <p className="mt-1 text-xs leading-5 text-app-muted">قدم بعدی: {nextStep.label}</p>
              </div>
            </div>
          </section>

          {error ? <NoticeBanner tone="alert">{error}</NoticeBanner> : null}
          {loading ? <LoadingPanel /> : null}

          {!loading ? (
            <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="grid gap-3">
                {steps.map((step, index) => <StepCard key={step.key} step={step} active={step.key === nextStep.key} index={index} />)}
              </div>

              <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
                <WorkspacePanel title="مسیر پیشنهادی روز اول" description="برای جلوگیری از پیچیدگی، فقط این ترتیب را دنبال کنید.">
                  <ol className="space-y-3 text-sm leading-7 text-app-muted">
                    <li><strong className="text-app-text">1.</strong> برند را کامل کنید تا UI و خروجی‌ها هویت واقعی داشته باشند.</li>
                    <li><strong className="text-app-text">2.</strong> کانال‌ها را بررسی کنید و محدودیت اینستاگرام معمولی را شفاف نگه دارید.</li>
                    <li><strong className="text-app-text">3.</strong> یک کمپین ساده بسازید یا مستقیم اولین پست را آماده کنید.</li>
                    <li><strong className="text-app-text">4.</strong> پست را زمان‌بندی کنید و از Calendar وضعیت نهایی را ببینید.</li>
                  </ol>
                </WorkspacePanel>

                <WorkspacePanel title="وضعیت فعلی" description="خلاصه‌ای از داده‌هایی که مسیر راه‌اندازی از آن استفاده می‌کند.">
                  <div className="grid gap-2">
                    <StatusToken tone={isStoreConfigured(store) ? "success" : "warning"}>برند: {isStoreConfigured(store) ? "آماده" : "ناقص"}</StatusToken>
                    <StatusToken tone={isRubikaConnected(rubika) ? "success" : "warning"}>کانال اصلی: {isRubikaConnected(rubika) ? "آماده" : "نیازمند بررسی"}</StatusToken>
                    <StatusToken tone={campaigns.length ? "success" : "neutral"}>کمپین‌ها: {campaigns.length}</StatusToken>
                    <StatusToken tone={posts.length ? "success" : "warning"}>محتوا: {posts.length}</StatusToken>
                    <StatusToken tone={hasScheduledPost(posts) ? "success" : "warning"}>زمان‌بندی: {hasScheduledPost(posts) ? "فعال" : "خالی"}</StatusToken>
                  </div>
                </WorkspacePanel>
              </aside>
            </section>
          ) : null}
        </WorkspacePage>
      </AppShell>
    </AuthGate>
  );
}
