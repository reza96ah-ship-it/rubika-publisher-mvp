import { Search } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";

type DataToolbarProps = {
  children?: ReactNode;
  meta?: ReactNode;
};

type FilterChipProps = {
  active?: boolean;
  children: ReactNode;
  count?: number;
  onClick?: () => void;
};

type DataTableProps = {
  columns: string[];
  gridClassName: string;
  children: ReactNode;
  loading?: boolean;
  empty?: ReactNode;
};

type DataRowProps = {
  children: ReactNode;
  gridClassName: string;
  selected?: boolean;
  className?: string;
};

export function DataToolbar({ children, meta }: DataToolbarProps) {
  return (
    <div className="grid gap-3 rounded-lg border border-app-border bg-slate-50 p-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="min-w-0">{children}</div>
      {meta ? <div className="flex items-center justify-between gap-3 text-xs font-semibold text-app-muted lg:justify-end">{meta}</div> : null}
    </div>
  );
}

export function DataSearchField(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-app-border bg-white px-3 py-2 ring-app-primary focus-within:ring-2">
      <Search className="h-4 w-4 shrink-0 text-app-muted" aria-hidden="true" />
      <input
        {...props}
        className={`w-full bg-transparent text-sm outline-none placeholder:text-slate-400 ${props.className ?? ""}`}
      />
    </label>
  );
}

export function FilterChip({ active, children, count, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
        active ? "bg-app-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {children}
      {typeof count === "number" ? (
        <span className={`mr-2 rounded px-1.5 py-0.5 ${active ? "bg-white/20 text-white" : "bg-white text-slate-500"}`}>
          {count}
        </span>
      ) : null}
    </button>
  );
}

export function DataTable({ columns, gridClassName, children, loading, empty }: DataTableProps) {
  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-app-border bg-white">
      <div className={`hidden ${gridClassName} gap-4 border-b border-app-border bg-slate-50 px-4 py-3 text-xs font-black text-app-muted lg:grid`}>
        {columns.map((column) => <span key={column}>{column}</span>)}
      </div>
      {loading ? <p className="p-5 text-sm text-app-muted">در حال دریافت...</p> : null}
      {!loading && empty ? empty : null}
      <div className="divide-y divide-app-border">{children}</div>
    </div>
  );
}

export function DataRow({ children, gridClassName, selected, className = "" }: DataRowProps) {
  return (
    <article
      className={`grid gap-4 px-4 py-4 transition hover:bg-slate-50 ${gridClassName} lg:items-start ${
        selected ? "bg-blue-50/50 ring-1 ring-inset ring-blue-100" : ""
      } ${className}`}
    >
      {children}
    </article>
  );
}
