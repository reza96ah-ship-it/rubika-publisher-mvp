"use client";

import Link from "next/link";
import { ArrowLeft, CalendarClock, CheckCircle2, Circle, PenLine, Plug, ShieldCheck, Store } from "lucide-react";
import { Post } from "../lib/posts";
import {
  buildReadinessSteps,
  nextReadinessStep,
  ReadinessStep,
  RubikaSettings,
  StoreProfile
} from "../lib/workspace";
import { Button } from "./ui/button";
import { StatusToken } from "./workspace-ui";

type ReadinessJourneyProps = {
  store: StoreProfile | null;
  rubika: RubikaSettings | null;
  posts: Post[];
  loading?: boolean;
};

const stepIcons: Record<ReadinessStep["key"], typeof Store> = {
  store: Store,
  rubika: Plug,
  content: PenLine,
  schedule: CalendarClock
};

export function ReadinessJourney({ store, rubika, posts, loading = false }: ReadinessJourneyProps) {
  const steps = buildReadinessSteps({ store, rubika }, posts);
  const completedCount = steps.filter((step) => step.done).length;
  const progress = Math.round((completedCount / steps.length) * 100);
  const nextStep = nextReadinessStep(steps);
  const isReady = completedCount === steps.length;
  const workspaceCompleted = steps.slice(0, 2).filter((step) => step.done).length;
  const nextActionLabel = isReady ? "ایجاد پست جدید" : nextStep.label;
  const nextActionHref = isReady ? "/compose" : nextStep.href;

  return (
    <section className="rounded-md border border-app-border bg-white">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_280px_240px]">
        <div className="border-b border-app-border px-4 py-4 lg:border-b-0 lg:border-l">
          <div className="flex flex-wrap items-center gap-2">
            <StatusToken tone={isReady ? "success" : "warning"}>{isReady ? "آماده عملیات" : "نیازمند تکمیل"}</StatusToken>
            <StatusToken tone={workspaceCompleted === 2 ? "success" : "warning"}>{workspaceCompleted} از 2 تنظیم پایه</StatusToken>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 shrink-0 text-app-primary" aria-hidden="true" />
            <h2 className="text-lg font-black text-app-text">آمادگی فضای کاری</h2>
          </div>
          <p className="mt-2 text-sm leading-7 text-app-muted">
            {isReady
              ? "پروفایل، اتصال روبیکا، محتوا و زمان‌بندی فعال هستند. حالا تمرکز اصلی روی کیفیت پست‌ها و پایش نتیجه انتشار است."
              : "تنظیمات پایه و قدم‌های انتشار را در یک مسیر کوتاه و قابل پیگیری کامل کنید."}
          </p>
        </div>

        <div className="border-b border-app-border bg-blue-50/70 p-4 lg:border-b-0 lg:border-l">
          <div className="flex items-center justify-between text-xs font-black text-app-muted">
            <span>آمادگی انتشار</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
            <div className={`h-full rounded-full ${isReady ? "bg-emerald-500" : "bg-amber-500"} transition-all`} style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-3 text-xs leading-5 text-app-muted">{completedCount} از {steps.length} مرحله تکمیل شده است.</p>
        </div>

        <div className="bg-slate-50 p-4">
          <p className="text-xs font-black text-app-muted">{isReady ? "اقدام پیشنهادی" : "قدم بعدی"}</p>
          <p className="mt-2 truncate text-sm font-black text-app-text">{nextActionLabel}</p>
          <Button href={nextActionHref} size="sm" className="mt-3 w-full">
            {isReady ? "ایجاد پست" : "ادامه مسیر"}
          </Button>
        </div>
      </div>

      <div className="grid gap-0 border-t border-app-border divide-y divide-app-border md:grid-cols-2 md:divide-x md:divide-x-reverse xl:grid-cols-4 xl:divide-y-0">
        {steps.map((step, index) => {
          const Icon = stepIcons[step.key];
          const StateIcon = step.done ? CheckCircle2 : Circle;
          return (
            <Link
              key={step.key}
              href={step.href}
              className={`group flex min-h-36 flex-col justify-between p-4 transition ${
                step.done
                  ? "bg-emerald-50/50 hover:bg-emerald-50"
                  : "bg-white hover:bg-blue-50/50"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className={`rounded-md border p-2 ${step.done ? "border-emerald-100 bg-white text-emerald-700" : "border-blue-100 bg-blue-50 text-app-primary"}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  {step.done ? <StateIcon className="h-5 w-5 text-emerald-600" aria-hidden="true" /> : <ArrowLeft className="h-4 w-4 text-app-primary opacity-0 transition group-hover:opacity-100" aria-hidden="true" />}
                </div>
                <p className="mt-3 font-black text-app-text">{step.label}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-6 text-app-muted">{loading ? "در حال بررسی..." : step.description}</p>
              </div>
              <p className="mt-3 text-[11px] font-bold text-app-muted">مرحله {index + 1} از {steps.length}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
