import { CheckCircle2, Circle, type LucideIcon } from "lucide-react";

export type ComposerStep = {
  label: string;
  helper: string;
  icon: LucideIcon;
  state: "done" | "active" | "pending";
};

const stateClasses: Record<ComposerStep["state"], string> = {
  done: "border-emerald-200 bg-emerald-50 text-emerald-800",
  active: "border-blue-200 bg-blue-50 text-blue-800",
  pending: "border-app-border bg-white text-slate-600"
};

export function ComposerStepRail({ steps }: { steps: ComposerStep[] }) {
  const completed = steps.filter((step) => step.state === "done").length;

  return (
    <section className="rounded-md border border-app-border bg-white">
      <div className="flex items-center justify-between border-b border-app-border px-3 py-3">
        <p className="text-sm font-black text-app-text">مسیر تولید</p>
        <span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-black text-slate-600">{completed}/{steps.length}</span>
      </div>
      <div className="divide-y divide-app-border">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const StateIcon = step.state === "done" ? CheckCircle2 : Circle;

          return (
            <div key={step.label} className={`p-3 transition ${stateClasses[step.state]}`}>
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-current/15 bg-white/60 text-xs font-black">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex min-w-0 items-center gap-2 text-sm font-black">
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{step.label}</span>
                    </span>
                    {step.state === "active" ? (
                      <span className="h-5 w-5 shrink-0 animate-pulse rounded-full bg-emerald-500 ring-4 ring-emerald-100" aria-label="مرحله فعال" />
                    ) : (
                      <StateIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-5 opacity-80">{step.helper}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
