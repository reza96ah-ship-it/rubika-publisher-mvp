"use client";

import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  FileText,
  GalleryHorizontalEnd,
  LayoutDashboard,
  ListChecks,
  LucideIcon,
  PenLine,
  Plug,
  ScrollText,
  Settings2,
  Store
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

type SidebarProps = {
  storeName?: string;
  ready?: boolean;
};

const primaryNavGroups: NavGroup[] = [
  {
    title: "فضای کاری",
    items: [
      { label: "مرکز عملیات", href: "/", icon: LayoutDashboard }
    ]
  },
  {
    title: "انتشار",
    items: [
      { label: "فضای انتشار", href: "/calendar", icon: CalendarDays }
    ]
  },
  {
    title: "کتابخانه و گزارش",
    items: [
      { label: "رسانه‌ها", href: "/media", icon: GalleryHorizontalEnd },
      { label: "تحلیل عملکرد", href: "/analytics", icon: BarChart3 },
      { label: "سلامت انتشار", href: "/logs", icon: ScrollText }
    ]
  }
];

const settingsNavItems: NavItem[] = [
  { label: "پروفایل فروشگاه", href: "/store", icon: Store },
  { label: "اتصال روبیکا", href: "/rubika", icon: Plug }
];

const composeNavItem: NavItem = { label: "پست جدید", href: "/compose", icon: PenLine };
const publishingRouteItems: NavItem[] = [
  { label: "پلنر انتشار", href: "/calendar", icon: CalendarDays },
  { label: "لیست محتوا", href: "/content", icon: FileText },
  { label: "صف انتشار", href: "/queue", icon: ListChecks }
];
const navGroups = [
  ...primaryNavGroups,
  { title: "تنظیمات", items: settingsNavItems }
];

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getActiveNav(pathname: string) {
  if (isActiveRoute(pathname, composeNavItem.href)) {
    return { group: { title: "تولید محتوا", items: [composeNavItem] }, item: composeNavItem };
  }

  const publishingRoute = publishingRouteItems.find((item) => isActiveRoute(pathname, item.href));
  if (publishingRoute) {
    return { group: { title: "انتشار", items: publishingRouteItems }, item: publishingRoute };
  }

  for (const group of navGroups) {
    const item = group.items.find((entry) => isActiveRoute(pathname, entry.href));
    if (item) return { group, item };
  }
  return { group: primaryNavGroups[0], item: primaryNavGroups[0].items[0] };
}

function NavEntry({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`app-interactive group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm ${
        active
          ? "bg-blue-50 font-black text-app-primary"
          : "text-slate-600 hover:bg-slate-50 hover:text-app-text"
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${active ? "text-app-primary" : "text-slate-400 group-hover:text-slate-600"}`} aria-hidden="true" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function Sidebar({ storeName = "فضای کاری", ready = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[232px] shrink-0 border-l border-app-border bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:self-start lg:flex-col lg:overflow-hidden">
      <div className="shrink-0 border-b border-app-border px-3 py-3">
        <Link href="/" className="flex items-center gap-2.5 rounded-md px-1 py-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-app-primary text-[10px] font-black text-white">
            RP
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-app-text">Rubika Publisher</p>
            <p className="mt-0.5 text-[10px] font-bold text-app-muted">Publishing workspace</p>
          </div>
        </Link>

        <Link
          href="/store"
          className="app-interactive mt-3 flex items-center gap-2 rounded-md border border-app-border bg-slate-50 px-2.5 py-2 hover:border-blue-200 hover:bg-blue-50"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-white text-slate-500 ring-1 ring-app-border">
            <Store className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold text-app-muted">فضای کاری فعال</span>
            <span className="mt-0.5 block truncate text-xs font-black text-app-text">{storeName}</span>
          </span>
          <ChevronLeft className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
        </Link>

        <Link
          href="/compose"
          className="app-interactive mt-3 flex items-center justify-center gap-2 rounded-md bg-app-primary px-3 py-2.5 text-sm font-black text-white hover:bg-app-primaryHover"
        >
          <PenLine className="h-4 w-4" aria-hidden="true" />
          ایجاد پست جدید
        </Link>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-3" aria-label="ناوبری اصلی">
        {primaryNavGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-1 px-2.5 text-[10px] font-black text-slate-400">{group.title}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = item.href === "/calendar"
                  ? publishingRouteItems.some((route) => isActiveRoute(pathname, route.href))
                  : isActiveRoute(pathname, item.href);
                return <NavEntry key={item.href} item={item} active={active} />;
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-app-border p-3">
        <div className="mb-2 flex items-center justify-between px-2.5">
          <p className="text-[10px] font-black text-slate-400">تنظیمات</p>
          <Settings2 className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        </div>
        <div className="space-y-0.5">
          {settingsNavItems.map((item) => <NavEntry key={item.href} item={item} active={isActiveRoute(pathname, item.href)} />)}
        </div>
        <Link href="/rubika" className={`app-interactive mt-3 flex items-center gap-2 rounded-md border px-2.5 py-2 text-xs font-bold ${
          ready ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-amber-100 bg-amber-50 text-amber-700"
        }`}>
          <span className={`h-2 w-2 rounded-full ${ready ? "bg-emerald-500" : "app-status-pulse bg-amber-500"}`} />
          {ready ? "فضای کاری آماده انتشار" : "تکمیل آماده‌سازی"}
        </Link>
      </div>
    </aside>
  );
}

const mobileNavItems = [
  { label: "عملیات", href: "/", icon: LayoutDashboard },
  { label: "پلنر", href: "/calendar", icon: CalendarDays },
  composeNavItem,
  { label: "محتوا", href: "/content", icon: FileText },
  { label: "صف", href: "/queue", icon: ListChecks }
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-app-border bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden" aria-label="ناوبری اصلی">
      {mobileNavItems.map((item) => {
        const active = isActiveRoute(pathname, item.href);
        const Icon = item.icon;
        const isCompose = item.href === "/compose";
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            className={`app-interactive flex min-w-0 flex-col items-center gap-1 text-[10px] font-bold ${
              isCompose ? "-mt-5 text-app-primary" : active ? "text-app-primary" : "text-slate-500"
            }`}
          >
            <span className={`flex items-center justify-center rounded-md ${
              isCompose
                ? "h-11 w-11 bg-app-primary text-white shadow-lg shadow-blue-200"
                : active
                  ? "h-7 w-9 bg-blue-50 text-app-primary"
                  : "h-7 w-9 text-slate-400"
            }`}>
              <Icon className={isCompose ? "h-5 w-5" : "h-4 w-4"} aria-hidden="true" />
            </span>
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
