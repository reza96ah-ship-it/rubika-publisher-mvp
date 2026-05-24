"use client";

import Link from "next/link";
import { CalendarClock, CheckCircle2, Circle, PenLine, Plug, Store } from "lucide-react";
import { Post } from "../lib/posts";
import {
  buildReadinessSteps,
  nextReadinessStep,
  ReadinessStep,
  RubikaSettings,
  StoreProfile
} from "../lib/workspace";
import { Button } from "./ui/button";

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
    <section className="mb-6 rounded-2xl border border-app-border bg-app-surface p-5 shadow-soft">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-app-primary">مسیر آماده‌سازی انتشار</p>
          <h2 className="mt-1 text-xl font-black text-app-text">
            {isReady ? "فضای کاری برای انتشار منظم آماده است" : "قدم‌های اصلی قبل از انتشار را کامل کنید"}
          </h2>
          <p className="mt-2 text-sm leading-7 text-app-muted">
            {isReady
              ? "پروفایل، اتصال روبیکا، محتوا و زمان‌بندی فعال هستند. حالا تمرکز اصلی روی کیفیت پست‌ها و پایش نتیجه انتشار است."
              : `قدم بعدی پیشنهادی: ${nextStep.label}`}
          </p>
        </div>

        <div className="min-w-44">
          <div className="flex items-center justify-between text-xs font-semibold text-app-muted">
            <span>{completedCount} از {steps.length} کامل</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-app-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <Button href={isReady ? "/compose" : nextStep.href} size="sm" className="mt-4 w-full">
            {isReady ? "ایجاد پست جدید" : "ادامه آماده‌سازی"}
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step) => {
          const Icon = stepIcons[step.key];
          const StateIcon = step.done ? CheckCircle2 : Circle;
          return (
            <Link
              key={step.key}
              href={step.href}
              className={`group rounded-xl border p-4 transition ${
                step.done
                  ? "border-emerald-100 bg-emerald-50/60 hover:bg-emerald-50"
                  : "border-app-border bg-white hover:border-blue-200 hover:bg-blue-50/50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className={`rounded-xl p-2 ${step.done ? "bg-white text-emerald-700" : "bg-slate-50 text-app-primary"}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <StateIcon className={`h-5 w-5 ${step.done ? "text-emerald-600" : "text-slate-300"}`} aria-hidden="true" />
              </div>
              <p className="mt-3 font-bold text-app-text">{step.label}</p>
              <p className="mt-1 text-xs leading-6 text-app-muted">{loading ? "در حال بررسی..." : step.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
