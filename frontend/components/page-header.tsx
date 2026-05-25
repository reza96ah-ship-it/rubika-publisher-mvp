import Link from "next/link";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
};

export function PageHeader({ eyebrow, title, description, actionLabel, actionHref }: PageHeaderProps) {
  return (
    <header className="mb-5 flex flex-col justify-between gap-4 border-b border-app-border pb-5 lg:flex-row lg:items-center">
      <div>
        {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.08em] text-app-primary">{eyebrow}</p> : null}
        <h1 className="mt-1 text-2xl font-black tracking-tight text-app-text">{title}</h1>
        {description ? <p className="mt-1.5 max-w-3xl text-sm leading-6 text-app-muted">{description}</p> : null}
      </div>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="inline-flex w-full items-center justify-center rounded-lg border border-app-primary bg-app-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:border-app-primaryHover hover:bg-app-primaryHover lg:w-auto"
        >
          {actionLabel}
        </Link>
      ) : actionLabel ? (
        <button className="w-full rounded-lg border border-app-primary bg-app-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:border-app-primaryHover hover:bg-app-primaryHover lg:w-auto">
          {actionLabel}
        </button>
      ) : null}
    </header>
  );
}
