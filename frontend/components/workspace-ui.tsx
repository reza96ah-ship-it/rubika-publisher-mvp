import type { ReactNode } from "react";

type WorkspacePageProps = {
  children: ReactNode;
  className?: string;
};

type WorkspaceHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

type WorkspaceToolbarProps = {
  children: ReactNode;
  meta?: ReactNode;
  className?: string;
};

type MetricTileProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "neutral" | "primary" | "success" | "warning" | "alert" | "info";
  icon?: ReactNode;
};

type InspectorPanelProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

type SegmentedControlProps<T extends string> = {
  options: Array<{ label: string; value: T; count?: number }>;
  value: T;
  onChange: (value: T) => void;
};

type StatusTokenTone = "neutral" | "primary" | "success" | "warning" | "alert" | "info" | "dark";

type StatusTokenProps = {
  tone?: StatusTokenTone;
  children: ReactNode;
  className?: string;
};

const metricToneClasses: Record<NonNullable<MetricTileProps["tone"]>, string> = {
  neutral: "text-slate-700",
  primary: "text-blue-700",
  success: "text-emerald-700",
  warning: "text-amber-700",
  alert: "text-rose-700",
  info: "text-sky-700"
};

const tokenToneClasses: Record<StatusTokenTone, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  primary: "border-blue-200 bg-blue-50 text-blue-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  alert: "border-rose-200 bg-rose-50 text-rose-700",
  info: "border-sky-200 bg-sky-50 text-sky-700",
  dark: "border-slate-900 bg-slate-950 text-white"
};

export function WorkspacePage({ children, className = "" }: WorkspacePageProps) {
  return <div className={`mx-auto w-full max-w-[1560px] space-y-5 ${className}`}>{children}</div>;
}

export function WorkspaceHeader({ eyebrow, title, description, action }: WorkspaceHeaderProps) {
  return (
    <header className="flex flex-col justify-between gap-4 border-b border-app-border pb-5 lg:flex-row lg:items-end">
      <div className="min-w-0">
        {eyebrow ? <p className="text-[11px] font-black uppercase tracking-[0.12em] text-app-primary">{eyebrow}</p> : null}
        <h1 className="mt-1 text-2xl font-black tracking-tight text-app-text">{title}</h1>
        {description ? <p className="mt-1.5 max-w-3xl text-sm leading-6 text-app-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export function WorkspaceToolbar({ children, meta, className = "" }: WorkspaceToolbarProps) {
  return (
    <div className={`flex flex-col gap-3 rounded-md border border-app-border bg-white px-3 py-2.5 lg:flex-row lg:items-center lg:justify-between ${className}`}>
      <div className="min-w-0">{children}</div>
      {meta ? <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-app-muted">{meta}</div> : null}
    </div>
  );
}

export function MetricTile({ label, value, hint, tone = "neutral", icon }: MetricTileProps) {
  return (
    <div className="rounded-md border border-app-border bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-app-muted">{label}</p>
          <p className={`mt-2 text-2xl font-black ${metricToneClasses[tone]}`}>{value}</p>
        </div>
        {icon ? <div className="rounded-md border border-app-border bg-slate-50 p-2 text-slate-600">{icon}</div> : null}
      </div>
      {hint ? <p className="mt-3 text-xs leading-5 text-app-muted">{hint}</p> : null}
    </div>
  );
}

export function MetricStrip({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

export function InspectorPanel({ title, description, children, footer }: InspectorPanelProps) {
  return (
    <aside className="rounded-md border border-app-border bg-white">
      <div className="border-b border-app-border px-4 py-3">
        <h2 className="text-sm font-black text-app-text">{title}</h2>
        {description ? <p className="mt-1 text-xs leading-5 text-app-muted">{description}</p> : null}
      </div>
      <div className="p-4">{children}</div>
      {footer ? <div className="border-t border-app-border bg-slate-50 p-3">{footer}</div> : null}
    </aside>
  );
}

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <div className="inline-flex rounded-md border border-app-border bg-slate-50 p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`inline-flex items-center gap-1 rounded px-3 py-1.5 text-xs font-bold transition ${
              active ? "bg-white text-app-primary shadow-sm ring-1 ring-app-border" : "text-slate-600 hover:text-app-text"
            }`}
          >
            {option.label}
            {typeof option.count === "number" ? (
              <span className={`rounded px-1.5 py-0.5 ${active ? "bg-blue-50 text-blue-700" : "bg-white text-slate-500"}`}>
                {option.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function StatusToken({ tone = "neutral", children, className = "" }: StatusTokenProps) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-1 text-[11px] font-black leading-none border ${tokenToneClasses[tone]} ${className}`}>
      {children}
    </span>
  );
}
