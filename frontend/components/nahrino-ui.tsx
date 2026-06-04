import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type Tone = "neutral" | "primary" | "success" | "warning" | "alert" | "info";
type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type NPageProps = {
  children: ReactNode;
  className?: string;
};

type NButtonSharedProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type NButtonAsButtonProps = NButtonSharedProps & ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: never;
};

type NButtonAsLinkProps = NButtonSharedProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  disabled?: boolean;
};

type NButtonProps = NButtonAsButtonProps | NButtonAsLinkProps;

type NStatusPillProps = {
  children: ReactNode;
  tone?: Tone;
  className?: string;
};

type NSectionProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

type NActionTileProps = {
  label: string;
  value: ReactNode;
  detail?: string;
  icon: LucideIcon;
  tone?: Tone;
  href?: string;
  compact?: boolean;
};

type NMetricTileProps = {
  label: string;
  value: ReactNode;
  detail?: string;
  icon?: LucideIcon;
  tone?: Tone;
  href?: string;
};

type NListItemProps = {
  title: string;
  detail?: string;
  icon: LucideIcon;
  tone?: Tone;
  href?: string;
  meta?: ReactNode;
};

type NEmptyStateProps = {
  title: string;
  detail?: string;
  icon: LucideIcon;
};

type NDonutChartProps = {
  items: Array<{ label: string; value: number; color: string }>;
  total: number;
  label?: string;
};

type NTrendBarsProps = {
  values: number[];
  labels?: string[];
};

type NNoticeProps = {
  children: ReactNode;
  title?: string;
  tone?: Exclude<Tone, "neutral" | "primary">;
};

const toneSurfaceClasses: Record<Tone, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  primary: "border-teal-200 bg-teal-50 text-teal-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  alert: "border-rose-200 bg-rose-50 text-rose-800",
  info: "border-sky-200 bg-sky-50 text-sky-800"
};

const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary: "border-[#102a2a] bg-[#102a2a] text-white shadow-[0_10px_22px_rgba(16,42,42,0.18)] hover:bg-[#173836]",
  secondary: "border-slate-200 bg-white text-slate-700 shadow-hairline hover:bg-[#fbfaf7] hover:text-[#102a2a]",
  quiet: "border-transparent bg-transparent text-slate-600 hover:bg-white/80 hover:text-[#102a2a]",
  danger: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
};

const buttonSizeClasses: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-3.5 py-2 text-sm",
  lg: "px-4 py-2.5 text-sm"
};

export function NPage({ children, className = "" }: NPageProps) {
  return <div className={`mx-auto w-full max-w-[1440px] space-y-3 sm:space-y-4 ${className}`}>{children}</div>;
}

export function NButton(props: NButtonProps) {
  const { children, className = "", variant = "primary", size = "md" } = props;
  const classes = [
    "app-interactive inline-flex items-center justify-center rounded-md border font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-100 disabled:pointer-events-none disabled:opacity-60",
    buttonVariantClasses[variant],
    buttonSizeClasses[size],
    className
  ].join(" ");

  if ("href" in props && props.href) {
    const { href, disabled, children: _children, className: _className, variant: _variant, size: _size, ...linkProps } = props;
    return (
      <Link href={href} className={classes} aria-disabled={disabled || linkProps["aria-disabled"]} tabIndex={disabled ? -1 : linkProps.tabIndex} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { children: _children, className: _className, variant: _variant, size: _size, type, ...buttonProps } = props as NButtonAsButtonProps;
  return (
    <button type={type ?? "button"} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}

export function NStatusPill({ children, tone = "neutral", className = "" }: NStatusPillProps) {
  return (
    <span className={`inline-flex min-h-6 items-center justify-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-black ${toneSurfaceClasses[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function NNotice({ children, title, tone = "info" }: NNoticeProps) {
  return (
    <div className={`rounded-md border px-3 py-2.5 text-xs leading-5 sm:text-sm sm:leading-6 ${toneSurfaceClasses[tone]}`}>
      {title ? <p className="font-black">{title}</p> : null}
      <div className={title ? "mt-1" : ""}>{children}</div>
    </div>
  );
}

export function NSection({ title, description, action, children, className = "", bodyClassName = "mt-4" }: NSectionProps) {
  return (
    <section className={`nahrino-card rounded-xl p-3 sm:p-4 ${className}`}>
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <h2 className="text-sm font-black text-app-text">{title}</h2>
          {description ? <p className="mt-1 text-xs leading-5 text-app-muted">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function NActionTile({ label, value, detail, icon: Icon, tone = "primary", href, compact = true }: NActionTileProps) {
  const content = (
    <article className={`${compact ? "min-h-[76px] p-2.5 sm:min-h-[92px] sm:p-3" : "min-h-[132px] p-4"} nahrino-card rounded-lg`}>
      <div className="flex h-full flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold text-app-muted">{label}</p>
            <p className={`mt-2 font-black leading-6 text-app-text ${compact ? "line-clamp-1 text-sm" : "line-clamp-2 text-base"}`}>{value}</p>
          </div>
          <span className={`flex ${compact ? "h-8 w-8" : "h-9 w-9"} shrink-0 items-center justify-center rounded-md border ${toneSurfaceClasses[tone]}`}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        {detail ? <p className={`${compact ? "hidden sm:line-clamp-2 sm:block" : "line-clamp-2"} text-xs leading-5 text-app-muted`}>{detail}</p> : null}
      </div>
    </article>
  );

  return href ? <Link href={href} className="app-interactive block rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-100">{content}</Link> : content;
}

export function NMetricTile({ label, value, detail, icon: Icon, tone = "primary", href }: NMetricTileProps) {
  const content = (
    <article className="app-row nahrino-card min-h-[76px] rounded-lg p-2.5 sm:min-h-[88px] sm:p-3">
      <div className="flex h-full items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0">
          <p className="line-clamp-1 text-[10px] font-bold text-app-muted sm:text-xs">{label}</p>
          <p className="mt-1 text-lg font-black text-app-text sm:text-xl">{value}</p>
          {detail ? <p className="mt-1 hidden truncate text-[11px] font-bold text-app-muted sm:block">{detail}</p> : null}
        </div>
        {Icon ? (
          <span className={`hidden h-8 w-8 shrink-0 items-center justify-center rounded-md border sm:flex ${toneSurfaceClasses[tone]}`}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>
    </article>
  );

  return href ? <Link href={href} className="app-interactive block rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-100">{content}</Link> : content;
}

export function NListItem({ title, detail, icon: Icon, tone = "primary", href, meta }: NListItemProps) {
  const content = (
    <article className="app-row nahrino-card-muted flex min-h-[58px] items-center gap-2 rounded-md px-2.5 py-2">
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${toneSurfaceClasses[tone]}`}>
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[11px] font-black text-app-text">{title}</span>
        {detail ? <span className="mt-0.5 block truncate text-[10px] font-bold text-app-muted">{detail}</span> : null}
      </span>
      {meta ? <span className="max-w-[96px] shrink-0 truncate text-[10px]">{meta}</span> : null}
    </article>
  );

  return href ? <Link href={href} className="block rounded-md focus:outline-none focus:ring-2 focus:ring-teal-100">{content}</Link> : content;
}

export function NEmptyState({ title, detail, icon: Icon }: NEmptyStateProps) {
  return (
    <div className="flex min-h-[58px] items-center gap-2 rounded-md border border-dashed border-app-border bg-[#faf9f5] px-2.5 py-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[11px] font-black text-app-text">{title}</span>
        {detail ? <span className="mt-0.5 block truncate text-[10px] leading-5 text-app-muted">{detail}</span> : null}
      </span>
    </div>
  );
}

export function NDonutChart({ items, total, label = "کل" }: NDonutChartProps) {
  let cursor = 0;
  const background = total
    ? items
      .filter((item) => item.value > 0)
      .map((item) => {
        const start = cursor;
        const size = (item.value / total) * 360;
        cursor += size;
        return `${item.color} ${start}deg ${cursor}deg`;
      })
      .join(", ")
    : "#E2E8F0 0deg 360deg";

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative h-32 w-32 rounded-full shadow-hairline sm:h-40 sm:w-40" style={{ background: `conic-gradient(${background})` } as CSSProperties}>
        <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white shadow-inner sm:inset-5">
          <span className="text-xl font-black text-app-text sm:text-2xl">{total}</span>
          <span className="mt-1 text-[10px] font-bold text-app-muted">{label}</span>
        </div>
      </div>
      <div className="grid w-full grid-cols-3 gap-1.5 text-[10px] sm:grid-cols-2 sm:gap-2 sm:text-xs">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-1.5 rounded-md bg-[#faf9f5] px-2 py-1.5 sm:gap-2 sm:px-2.5 sm:py-2">
            <span className="flex min-w-0 items-center gap-2 font-bold text-app-muted">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
            <span className="font-black text-app-text">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NTrendBars({ values, labels }: NTrendBarsProps) {
  const max = Math.max(...values, 1);

  return (
    <div className="flex h-28 items-end gap-1.5 rounded-lg bg-[#faf9f5] px-3 py-3">
      {values.map((value, index) => (
        <div key={index} className="flex min-w-0 flex-1 flex-col items-center gap-1">
          <span
            className="w-full rounded-t-md bg-[#0b7771] shadow-[0_6px_14px_rgba(11,119,113,0.12)] transition-all"
            style={{ height: `${Math.max(10, (value / max) * 88)}px` }}
            aria-label={`${value} items`}
          />
          <span className="text-[9px] font-bold text-slate-400">{labels?.[index] || index + 1}</span>
        </div>
      ))}
    </div>
  );
}
