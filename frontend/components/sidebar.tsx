"use client";

import {
  CalendarDays,
  FileText,
  GalleryHorizontalEnd,
  LayoutDashboard,
  ListChecks,
  LucideIcon,
  PenLine,
  Plug,
  ScrollText,
  Store
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  disabled?: boolean;
};

export type NavGroup = {
  title: string;
  caption: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    title: "عملیات انتشار",
    caption: "برنامه، تولید و کنترل",
    items: [
      { label: "داشبورد", href: "/", icon: LayoutDashboard },
      { label: "ایجاد پست", href: "/compose", icon: PenLine },
      { label: "فضای محتوا", href: "/content", icon: FileText },
      { label: "تقویم انتشار", href: "/calendar", icon: CalendarDays },
      { label: "صف انتشار", href: "/queue", icon: ListChecks }
    ]
  },
  {
    title: "دارایی و اتصال",
    caption: "رسانه، روبیکا و خروجی",
    items: [
      { label: "کتابخانه رسانه", href: "/media", icon: GalleryHorizontalEnd },
      { label: "اتصال روبیکا", href: "/rubika", icon: Plug },
      { label: "لاگ انتشار", href: "/logs", icon: ScrollText }
    ]
  },
  {
    title: "تنظیمات",
    caption: "اطلاعات برند",
    items: [
      { label: "پروفایل فروشگاه", href: "/store", icon: Store }
    ]
  }
];

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getActiveNav(pathname: string) {
  for (const group of navGroups) {
    const item = group.items.find((entry) => isActiveRoute(pathname, entry.href));
    if (item) return { group, item };
  }
  return { group: navGroups[0], item: navGroups[0].items[0] };
}

function NavEntry({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  const className = `group flex items-center justify-between rounded-md border px-2.5 py-2 text-sm transition ${
    item.disabled
      ? "pointer-events-none border-transparent text-slate-400"
      : active
        ? "border-slate-200 bg-slate-950 font-bold text-white shadow-soft"
        : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-app-text"
  }`;

  const content = (
    <>
      <span className="flex min-w-0 items-center gap-2">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded ${active ? "bg-white/10" : "bg-slate-100 text-slate-500 group-hover:text-app-text"}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="truncate">{item.label}</span>
      </span>
      {item.badge ? (
        <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"}`}>
          {item.badge}
        </span>
      ) : null}
    </>
  );

  if (item.disabled) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link href={item.href} className={className}>
      {content}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[244px] shrink-0 border-l border-app-border bg-white lg:flex lg:min-h-screen lg:flex-col">
      <div className="border-b border-app-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-xs font-black text-white">
            RP
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.08em] text-app-primary">Rubika Publisher</p>
            <h2 className="truncate text-base font-black text-app-text">انتشار روبیکا</h2>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.title}>
            <div className="mb-2 px-2">
              <p className="text-[11px] font-black text-app-text">{group.title}</p>
              <p className="mt-0.5 text-[10px] font-bold text-app-muted">{group.caption}</p>
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isActiveRoute(pathname, item.href);
                return <NavEntry key={item.href} item={item} active={active} />;
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-app-border px-3 py-3">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] font-black text-app-text">وضعیت محیط</p>
          <p className="mt-1 text-xs leading-5 text-app-muted">نسخه محلی برای تست و آماده‌سازی انتشار.</p>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const flatItems = navGroups.flatMap((group) => group.items);

  return (
    <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden" aria-label="ناوبری اصلی">
      {flatItems.map((item) => {
        const active = isActiveRoute(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-xs font-bold ${
              active ? "border-slate-950 bg-slate-950 text-white" : "border-app-border bg-white text-slate-600"
            }`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
