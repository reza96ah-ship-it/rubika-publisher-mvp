import {
  BarChart3,
  BellRing,
  CalendarDays,
  FileText,
  GalleryHorizontalEnd,
  LayoutDashboard,
  Network,
  PenLine,
  Rocket,
  Store,
  Target,
  type LucideIcon
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const dashboardNavItem: NavItem = { label: "داشبورد", href: "/", icon: LayoutDashboard };
export const composeNavItem: NavItem = { label: "ساخت", href: "/compose", icon: PenLine };
export const onboardingNavItem: NavItem = { label: "راه‌اندازی", href: "/onboarding", icon: Rocket };
export const plannerNavItem: NavItem = { label: "برنامه‌ریز", href: "/calendar", icon: CalendarDays };
export const campaignsNavItem: NavItem = { label: "کمپین‌ها", href: "/campaigns", icon: Target };
export const contentNavItem: NavItem = { label: "محتوا", href: "/content", icon: FileText };
export const mediaNavItem: NavItem = { label: "رسانه", href: "/media", icon: GalleryHorizontalEnd };
export const inboxNavItem: NavItem = { label: "پیام‌ها", href: "/inbox", icon: BellRing };
export const reportsNavItem: NavItem = { label: "گزارش‌ها", href: "/analytics", icon: BarChart3 };
export const channelsNavItem: NavItem = { label: "کانال‌ها", href: "/channels", icon: Network };
export const queueNavItem: NavItem = { label: "صف انتظار", href: "/queue", icon: FileText };
export const logsNavItem: NavItem = { label: "گزارش انتشار", href: "/logs", icon: BarChart3 };
export const settingsNavItem: NavItem = { label: "تنظیمات", href: "/store", icon: Store };

export const primaryNavItems: NavItem[] = [
  dashboardNavItem,
  composeNavItem,
  plannerNavItem,
  campaignsNavItem,
  contentNavItem,
  queueNavItem,
  mediaNavItem,
  inboxNavItem,
  reportsNavItem,
  logsNavItem,
  channelsNavItem
];

export const settingsNavItems: NavItem[] = [settingsNavItem];

export const navGroups: NavGroup[] = [
  { title: "محصول", items: primaryNavItems },
  { title: "تنظیمات", items: settingsNavItems }
];

export const mobileNavItems: NavItem[] = [
  dashboardNavItem,
  plannerNavItem,
  composeNavItem,
  campaignsNavItem,
  contentNavItem
];

export function isActiveRoute(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isNavItemActive(pathname: string, item: NavItem) {
  if (item.href === "/channels") {
    return (
      isActiveRoute(pathname, "/channels") ||
      isActiveRoute(pathname, "/rubika") ||
      isActiveRoute(pathname, "/instagram")
    );
  }

  return isActiveRoute(pathname, item.href);
}

export function getActiveNav(pathname: string) {
  if (isActiveRoute(pathname, onboardingNavItem.href)) {
    return { group: { title: "شروع", items: [onboardingNavItem] }, item: onboardingNavItem };
  }

  if (isActiveRoute(pathname, composeNavItem.href)) {
    return { group: { title: "ساخت", items: [composeNavItem] }, item: composeNavItem };
  }

  if (isActiveRoute(pathname, "/calendar")) {
    return { group: { title: "برنامه‌ریز", items: [plannerNavItem] }, item: plannerNavItem };
  }

  if (isActiveRoute(pathname, "/campaigns")) {
    return { group: { title: "کمپین‌ها", items: [campaignsNavItem] }, item: campaignsNavItem };
  }

  if (isActiveRoute(pathname, "/content") || isActiveRoute(pathname, "/queue")) {
    return { group: { title: "محتوا", items: [contentNavItem] }, item: contentNavItem };
  }

  if (isActiveRoute(pathname, "/analytics") || isActiveRoute(pathname, "/logs")) {
    return { group: { title: "گزارش‌ها", items: [reportsNavItem] }, item: reportsNavItem };
  }

  if (
    isActiveRoute(pathname, "/channels") ||
    isActiveRoute(pathname, "/rubika") ||
    isActiveRoute(pathname, "/instagram")
  ) {
    return { group: { title: "کانال‌ها", items: [channelsNavItem] }, item: channelsNavItem };
  }

  if (isActiveRoute(pathname, "/store")) {
    return { group: { title: "تنظیمات", items: settingsNavItems }, item: settingsNavItem };
  }

  for (const group of navGroups) {
    const item = group.items.find((entry) => isNavItemActive(pathname, entry));
    if (item) return { group, item };
  }

  return { group: navGroups[0], item: dashboardNavItem };
}
