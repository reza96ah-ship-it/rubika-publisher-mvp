"use client";

import Link from "next/link";
import { ArrowLeft, CalendarClock, CheckCircle2, Circle, PenLine, Plug, Store } from "lucide-react";
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

  return (
    <section className="rounded-md border border-app-border bg-white">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="border-b border-app-border px-4 py-4 lg:border-b-0 lg:border-l">
          <div className="flex flex-wrap items-center gap-2">
            <StatusToken tone={isReady ? "success" : "warning"}>{isReady ? "آماده عملیات" : "نیازمند تکمیل"}</StatusToken>
            <StatusToken tone="primary">{completedCount} از {steps.length}</StatusToken>
          </div>
          <h2 className="mt-3 text-xl font-black text-app-text">
            {isReady ? "فضای کاری برای انتشار منظم آماده است" : "قدم‌های اصلی قبل از انتشار را کامل کنید"}
          </h2>
          <p className="mt-2 text-sm leading-7 text-app-muted">
            {isReady
              ? "پروفایل، اتصال روبیکا، محتوا و زمان‌بندی فعال هستند. حالا تمرکز اصلی روی کیفیت پست‌ها و پایش نتیجه انتشار است."
              : `قدم بعدی پیشنهادی: ${nextStep.label}`}
          </p>
        </div>

        <div className="bg-blue-50/70 p-4">
          <div className="flex items-center justify-between text-xs font-black text-app-muted">
            <span>آمادگی انتشار</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
            <div className={`h-full rounded-full ${isReady ? "bg-emerald-500" : "bg-amber-500"} transition-all`} style={{ width: `${progress}%` }} />
          </div>
          <Button href={isReady ? "/compose" : nextStep.href} size="sm" className="mt-4 w-full">
            {isReady ? "ایجاد پست جدید" : "ادامه آماده‌سازی"}
          </Button>
        </div>
      </div>

      <div className="grid gap-0 divide-y divide-app-border lg:grid-cols-4 lg:divide-x lg:divide-x-reverse lg:divide-y-0">
        {steps.map((step) => {
          const Icon = stepIcons[step.key];
          const StateIcon = step.done ? CheckCircle2 : Circle;
          return (
            <Link
              key={step.key}
              href={step.href}
              className={`group p-4 transition ${
                step.done
                  ? "bg-emerald-50/50 hover:bg-emerald-50"
                  : "bg-white hover:bg-blue-50/50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className={`rounded-md border p-2 ${step.done ? "border-emerald-100 bg-white text-emerald-700" : "border-blue-100 bg-blue-50 text-app-primary"}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                {step.done ? <StateIcon className="h-5 w-5 text-emerald-600" aria-hidden="true" /> : <ArrowLeft className="h-4 w-4 text-app-primary opacity-0 transition group-hover:opacity-100" aria-hidden="true" />}
              </div>
              <p className="mt-3 font-black text-app-text">{step.label}</p>
              <p className="mt-1 text-xs leading-6 text-app-muted">{loading ? "در حال بررسی..." : step.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
