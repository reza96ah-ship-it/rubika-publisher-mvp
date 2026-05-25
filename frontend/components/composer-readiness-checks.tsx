import { CheckCircle2, CircleAlert, Clock3 } from "lucide-react";

type ReadinessItem = {
  label: string;
  detail: string;
  done: boolean;
  required?: boolean;
};

type ComposerReadinessChecksProps = {
  items: ReadinessItem[];
};

export function ComposerReadinessChecks({ items }: ComposerReadinessChecksProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const Icon = item.done ? CheckCircle2 : item.required ? CircleAlert : Clock3;
        const color = item.done ? "text-emerald-700" : item.required ? "text-amber-700" : "text-slate-500";

        return (
          <div key={item.label} className="flex items-start gap-3 border-b border-app-border py-3 first:pt-0 last:border-0 last:pb-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-app-border bg-slate-50">
              <Icon className={`h-4 w-4 ${color}`} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-black text-app-text">{item.label}</p>
              <p className="mt-1 text-xs leading-6 text-app-muted">{item.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
