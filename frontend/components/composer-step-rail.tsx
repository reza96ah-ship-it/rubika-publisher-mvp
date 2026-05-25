import { CheckCircle2, Circle, Dot, type LucideIcon } from "lucide-react";

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
  return (
    <section className="mb-6 rounded-2xl border border-app-border bg-app-surface p-4 shadow-soft">
      <div className="grid gap-3 md:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const StateIcon = step.state === "done" ? CheckCircle2 : step.state === "active" ? Dot : Circle;

          return (
            <div key={step.label} className={`rounded-xl border p-4 transition ${stateClasses[step.state]}`}>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm font-black">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {index + 1}. {step.label}
                </span>
                <StateIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="mt-2 text-xs leading-6 opacity-80">{step.helper}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
