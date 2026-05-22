const statusMap: Record<string, { label: string; className: string }> = {
  draft: {
    label: "پیش‌نویس",
    className: "bg-slate-100 text-slate-700 ring-slate-200"
  },
  ready: {
    label: "آماده زمان‌بندی",
    className: "bg-violet-50 text-violet-700 ring-violet-200"
  },
  scheduled: {
    label: "زمان‌بندی‌شده",
    className: "bg-amber-50 text-amber-700 ring-amber-200"
  },
  publishing: {
    label: "در حال انتشار",
    className: "bg-sky-50 text-sky-700 ring-sky-200"
  },
  published: {
    label: "منتشرشده",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200"
  },
  failed: {
    label: "ناموفق",
    className: "bg-rose-50 text-rose-700 ring-rose-200"
  },
  cancelled: {
    label: "لغوشده",
    className: "bg-zinc-100 text-zinc-700 ring-zinc-200"
  }
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusMap[status] ?? statusMap.draft;

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${config.className}`}>
      {config.label}
    </span>
  );
}
