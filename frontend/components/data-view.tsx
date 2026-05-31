import { Search } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { LoadingRows } from "./loading-skeleton";
import { WorkspaceToolbar } from "./workspace-ui";

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
    <WorkspaceToolbar meta={meta}>{children}</WorkspaceToolbar>
  );
}

export function DataSearchField(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex items-center gap-2 rounded-md bg-white px-3 py-2 shadow-hairline ring-app-primary focus-within:ring-2">
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
      className={`app-interactive rounded px-3 py-1.5 text-xs font-bold ${
        active ? "bg-app-primary text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-app-primary"
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
    <div className="app-studio-surface mt-5 overflow-hidden rounded-lg">
      <div className={`hidden ${gridClassName} gap-4 border-b border-app-border bg-app-surfaceMuted px-4 py-3 text-[11px] font-black uppercase text-slate-500 lg:grid`}>
        {columns.map((column) => <span key={column}>{column}</span>)}
      </div>
      {loading ? <LoadingRows /> : null}
      {!loading && empty ? empty : null}
      <div className="divide-y divide-app-border">{children}</div>
    </div>
  );
}

export function DataRow({ children, gridClassName, selected, className = "" }: DataRowProps) {
  return (
    <article
      className={`app-row grid gap-4 px-4 py-4 hover:bg-slate-50 ${gridClassName} lg:items-start ${
        selected ? "bg-blue-50/50 ring-1 ring-inset ring-blue-100" : ""
      } ${className}`}
    >
      {children}
    </article>
  );
}
