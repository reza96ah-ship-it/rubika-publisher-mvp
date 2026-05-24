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

const navGroups: Array<{ title: string; items: NavItem[] }> = [
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
    <aside className="hidden w-72 shrink-0 border-l border-app-border bg-app-surface lg:block">
      <div className="border-b border-app-border p-5">
        <div className="rounded-2xl border border-app-border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-app-primary">Rubika Publisher</p>
          <h2 className="mt-1 text-lg font-bold text-app-text">انتشار روبیکا</h2>
          <p className="mt-2 text-xs leading-6 text-app-muted">ساخت، زمان‌بندی، انتشار و پیگیری محتوا از یک فضای کاری.</p>
        </div>
      </div>

      <nav className="space-y-6 p-4">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-3 text-xs font-semibold text-app-muted">{group.title}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isActiveRoute(pathname, item.href);
                const Icon = item.icon;
                const className = `flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${
                  item.disabled
                    ? "pointer-events-none text-slate-400"
                    : active
                      ? "bg-blue-50 font-semibold text-app-primary ring-1 ring-blue-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-app-text"
                }`;

                const content = (
                  <>
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </span>
                    {item.badge ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
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
