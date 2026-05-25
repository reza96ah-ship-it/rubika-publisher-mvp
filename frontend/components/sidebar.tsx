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

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  disabled?: boolean;
};

export const navGroups: Array<{ title: string; items: NavItem[] }> = [
  {
    title: "عملیات انتشار",
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
    items: [
      { label: "کتابخانه رسانه", href: "/media", icon: GalleryHorizontalEnd },
      { label: "اتصال روبیکا", href: "/rubika", icon: Plug },
      { label: "لاگ انتشار", href: "/logs", icon: ScrollText }
    ]
  },
  {
    title: "تنظیمات",
    items: [
      { label: "پروفایل فروشگاه", href: "/store", icon: Store }
    ]
  }
];

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-l border-app-border bg-white lg:block">
      <div className="border-b border-app-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-app-primary text-xs font-black text-white">
            RP
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.08em] text-app-primary">Rubika Publisher</p>
            <h2 className="truncate text-base font-black text-app-text">انتشار روبیکا</h2>
          </div>
        </div>
      </div>

      <nav className="space-y-5 px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-2 text-[11px] font-black text-app-muted">{group.title}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isActiveRoute(pathname, item.href);
                const Icon = item.icon;
                const className = `flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                  item.disabled
                    ? "pointer-events-none text-slate-400"
                    : active
                      ? "bg-slate-950 font-bold text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-app-text"
                }`;

                const content = (
                  <>
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </span>
                    {item.badge ? (
                      <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"}`}>
                        {item.badge}
                      </span>
                    ) : null}
                  </>
                );

                if (item.disabled) {
                  return <div key={item.href} className={className}>{content}</div>;
                }

                return (
                  <Link key={item.href} href={item.href} className={className}>
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
