"use client";

import {
  BarChart3,
  BellRing,
  CalendarDays,
  ChevronLeft,
  FileText,
  GalleryHorizontalEnd,
  LayoutDashboard,
  LucideIcon,
  Megaphone,
  PenLine,
  Rocket,
  Settings2,
  Store
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProductMark, WorkspaceAvatar } from "./brand-mark";
import { productName, productShortTagline } from "../lib/product";

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
  brandColor?: string;
  avatarUrl?: string;
};

const todayNavItem: NavItem = { label: "داشبورد", href: "/", icon: LayoutDashboard };
const composeNavItem: NavItem = { label: "ساخت پست", href: "/compose", icon: PenLine };
const onboardingNavItem: NavItem = { label: "راه‌اندازی", href: "/onboarding", icon: Rocket };
const plannerNavItem: NavItem = { label: "تقویم", href: "/calendar", icon: CalendarDays };
const campaignsNavItem: NavItem = { label: "کمپین‌ها", href: "/campaigns", icon: Megaphone };
const contentNavItem: NavItem = { label: "محتوا", href: "/content", icon: FileText };
const settingsNavItem: NavItem = { label: "تنظیمات", href: "/store", icon: Store };

const primaryNavGroups: NavGroup[] = [
  {
    title: "مسیر اصلی",
    items: [
      todayNavItem,
      composeNavItem,
      plannerNavItem,
      campaignsNavItem,
      contentNavItem,
      { label: "رسانه", href: "/media", icon: GalleryHorizontalEnd },
      { label: "پیام‌ها", href: "/inbox", icon: BellRing },
      { label: "گزارش‌ها", href: "/analytics", icon: BarChart3 }
    ]
  }
];

const settingsNavItems: NavItem[] = [settingsNavItem];
const navGroups = [
  ...primaryNavGroups,
  { title: "تنظیمات", items: settingsNavItems }
];

function isActiveRoute(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isNavItemActive(pathname: string, item: NavItem) {
  if (item.href === "/calendar") return isActiveRoute(pathname, "/calendar");
  if (item.href === "/campaigns") return isActiveRoute(pathname, "/campaigns");
  if (item.href === "/content") return isActiveRoute(pathname, "/content") || isActiveRoute(pathname, "/queue");
  if (item.href === "/store") {
    return (
      isActiveRoute(pathname, "/store") ||
      isActiveRoute(pathname, "/channels") ||
      isActiveRoute(pathname, "/rubika") ||
      isActiveRoute(pathname, "/instagram") ||
      isActiveRoute(pathname, "/logs")
    );
  }
  return isActiveRoute(pathname, item.href);
}

export function getActiveNav(pathname: string) {
  if (isActiveRoute(pathname, onboardingNavItem.href)) {
    return { group: { title: "شروع", items: [onboardingNavItem] }, item: onboardingNavItem };
  }

  if (isActiveRoute(pathname, composeNavItem.href)) {
    return { group: { title: "ساخت پست", items: [composeNavItem] }, item: composeNavItem };
  }

  if (isActiveRoute(pathname, "/calendar")) {
    return { group: { title: "تقویم", items: [plannerNavItem] }, item: plannerNavItem };
  }

  if (isActiveRoute(pathname, "/campaigns")) {
    return { group: { title: "کمپین‌ها", items: [campaignsNavItem] }, item: campaignsNavItem };
  }

  if (isActiveRoute(pathname, "/content") || isActiveRoute(pathname, "/queue")) {
    return { group: { title: "محتوا", items: [contentNavItem] }, item: contentNavItem };
  }

  if (
    isActiveRoute(pathname, "/store") ||
    isActiveRoute(pathname, "/channels") ||
    isActiveRoute(pathname, "/rubika") ||
    isActiveRoute(pathname, "/instagram") ||
    isActiveRoute(pathname, "/logs")
  ) {
    return { group: { title: "تنظیمات", items: settingsNavItems }, item: settingsNavItem };
  }

  for (const group of navGroups) {
    const item = group.items.find((entry) => isActiveRoute(pathname, entry.href));
    if (item) return { group, item };
  }
  return { group: primaryNavGroups[0], item: todayNavItem };
}

function NavEntry({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`app-interactive group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm ${
          active
            ? "nahrino-nav-active font-black"
            : "nahrino-nav-idle hover:shadow-hairline"
      }`}
    >
      {active ? <span className="absolute inset-y-2 right-0 w-0.5 rounded-l-full bg-teal-300" /> : null}
      <Icon className={`h-4 w-4 shrink-0 ${active ? "text-teal-200" : "text-slate-400 group-hover:text-app-teal"}`} aria-hidden="true" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function Sidebar({ storeName = "فضای کاری", ready = false, brandColor, avatarUrl }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="nahrino-sidebar hidden w-[248px] shrink-0 border-l border-slate-200/80 backdrop-blur-xl lg:sticky lg:top-0 lg:flex lg:h-screen lg:self-start lg:flex-col lg:overflow-hidden">
      <div className="shrink-0 border-b border-slate-200/80 px-3 py-3">
        <Link href="/" className="flex items-center gap-2.5 rounded-md px-1 py-1">
          <ProductMark />
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-app-text">{productName}</p>
            <p className="mt-0.5 text-[10px] font-bold text-app-teal">{productShortTagline}</p>
          </div>
        </Link>

        <Link
          href="/store"
          className="app-interactive nahrino-card-muted mt-3 flex items-center gap-2 rounded-md px-2.5 py-2.5 hover:bg-white"
        >
          <WorkspaceAvatar name={storeName} size="sm" color={brandColor} imageUrl={avatarUrl} />
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold text-app-muted">فضای کاری فعال</span>
            <span className="mt-0.5 block truncate text-xs font-black text-app-text">{storeName}</span>
          </span>
          <ChevronLeft className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
        </Link>

      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4" aria-label="ناوبری اصلی">
        {primaryNavGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-1.5 px-2.5 text-[10px] font-black text-slate-500">{group.title}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isNavItemActive(pathname, item);
                return <NavEntry key={item.href} item={item} active={active} />;
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-slate-200/80 bg-white/35 p-3">
        <div className="mb-2 flex items-center justify-between px-2.5">
          <p className="text-[10px] font-black text-slate-500">تنظیمات</p>
          <Settings2 className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        </div>
        <div className="space-y-0.5">
          {settingsNavItems.map((item) => <NavEntry key={item.href} item={item} active={isNavItemActive(pathname, item)} />)}
        </div>
        {!ready ? (
          <Link href="/onboarding" className="app-interactive mt-3 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs font-bold text-amber-700 shadow-hairline">
            <span className="app-status-pulse h-2 w-2 rounded-full bg-amber-500" />
            تکمیل راه‌اندازی
          </Link>
        ) : null}
      </div>
    </aside>
  );
}

const mobileNavItems = [
  todayNavItem,
  plannerNavItem,
  composeNavItem,
  contentNavItem,
  { label: "گزارش‌ها", href: "/analytics", icon: BarChart3 }
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-2 bottom-2 z-30 grid grid-cols-5 rounded-xl border border-slate-200 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_12px_34px_rgba(24,33,47,0.16)] backdrop-blur-xl lg:hidden" aria-label="ناوبری اصلی">
      {mobileNavItems.map((item) => {
        const active = isNavItemActive(pathname, item);
        const Icon = item.icon;
        const isCompose = item.href === "/compose";
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            className={`app-interactive flex min-w-0 flex-col items-center gap-1 text-[10px] font-bold ${
              isCompose ? "-mt-5 text-[#102a2a]" : active ? "text-[#102a2a]" : "text-slate-500"
            }`}
          >
            <span className={`flex items-center justify-center rounded-md ${
              isCompose
                ? "h-11 w-11 bg-[#102a2a] text-white shadow-lg shadow-slate-300"
                : active
                  ? "h-7 w-9 bg-teal-50 text-[#102a2a]"
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
