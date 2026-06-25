"use client";

import { ChevronLeft, Settings2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProductMark, WorkspaceAvatar } from "./brand-mark";
import { productName, productShortTagline } from "../lib/product";
import {
  getActiveNav,
  isNavItemActive,
  mobileNavItems,
  primaryNavItems,
  settingsNavItems,
  type NavItem
} from "./shell/navigation";

export { getActiveNav } from "./shell/navigation";
export type { NavGroup, NavItem } from "./shell/navigation";

type SidebarProps = {
  storeName?: string;
  ready?: boolean;
  brandColor?: string;
  avatarUrl?: string;
};

function NavEntry({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`app-interactive group relative flex min-h-11 items-center gap-2.5 rounded-control px-3 text-sm transition ${
        active
          ? "bg-app-soft font-black text-app-primary shadow-hairline"
          : "font-bold text-app-muted hover:bg-app-surface/70 hover:text-app-text"
      }`}
    >
      {active ? (
        <span className="absolute inset-y-2 right-0 w-0.5 rounded-l-full bg-app-primary" />
      ) : null}
      <Icon
        className={`h-4 w-4 shrink-0 ${
          active ? "text-app-primary" : "text-app-muted group-hover:text-app-primary"
        }`}
        aria-hidden="true"
      />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function Sidebar({
  storeName = "فضای کاری",
  ready = false,
  brandColor,
  avatarUrl
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="n-liquid-floating n-radius-shell hidden h-full w-[244px] shrink-0 flex-col overflow-hidden border lg:flex">
      <div className="shrink-0 border-b border-[var(--n-material-panel-divider)] p-3">
        <Link href="/" className="flex items-center gap-2.5 rounded-control px-1 py-1">
          <ProductMark />
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-app-text">{productName}</p>
            <p className="mt-0.5 text-[10px] font-bold text-app-primary">{productShortTagline}</p>
          </div>
        </Link>

        <Link
          href="/store"
          className="n-liquid-solid-muted n-radius-card app-interactive mt-3 flex items-center gap-2.5 border p-2.5 hover:bg-app-surface"
        >
          <WorkspaceAvatar name={storeName} size="sm" color={brandColor} imageUrl={avatarUrl} />
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold text-app-muted">فضای کاری فعال</span>
            <span className="mt-0.5 block truncate text-xs font-black text-app-text">{storeName}</span>
          </span>
          <ChevronLeft className="h-3.5 w-3.5 shrink-0 text-app-muted" aria-hidden="true" />
        </Link>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-3" aria-label="ناوبری اصلی">
        <p className="mb-2 px-2.5 text-[10px] font-black text-app-muted">محصول</p>
        <div className="space-y-1">
          {primaryNavItems.map((item) => (
            <NavEntry
              key={item.href}
              item={item}
              active={isNavItemActive(pathname || "", item)}
            />
          ))}
        </div>
      </nav>

      <div className="shrink-0 border-t border-[var(--n-material-panel-divider)] bg-app-surface/25 p-3">
        <div className="mb-2 flex items-center justify-between px-2.5">
          <p className="text-[10px] font-black text-app-muted">فضای کاری</p>
          <Settings2 className="h-3.5 w-3.5 text-app-muted" aria-hidden="true" />
        </div>
        <div className="space-y-0.5">
          {settingsNavItems.map((item) => (
            <NavEntry
              key={item.href}
              item={item}
              active={isNavItemActive(pathname || "", item)}
            />
          ))}
        </div>

        {!ready ? (
          <Link
            href="/onboarding"
            className="app-interactive mt-3 flex min-h-11 items-center gap-2 rounded-control border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-800 shadow-hairline"
          >
            <span className="app-status-pulse h-2 w-2 rounded-full bg-amber-500" />
            تکمیل راه‌اندازی
          </Link>
        ) : null}
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const activeNav = getActiveNav(pathname || "");

  return (
    <nav
      className="n-liquid-floating n-radius-shell fixed inset-x-2 bottom-2 z-40 grid grid-cols-5 border px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 lg:hidden"
      aria-label="ناوبری اصلی"
    >
      {mobileNavItems.map((item) => {
        const active = isNavItemActive(pathname || "", item);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            className={`app-interactive flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-control px-1 text-[10px] font-bold ${
              active ? "text-app-primary" : "text-app-muted"
            }`}
          >
            <span
              className={`flex items-center justify-center rounded-control transition ${
                active
                  ? "h-9 w-11 bg-app-primary text-white shadow-accent"
                  : "h-8 w-10 text-app-muted"
              }`}
            >
              <Icon className={active ? "h-5 w-5" : "h-4 w-4"} aria-hidden="true" />
            </span>
            <span className="max-w-full truncate">
              {activeNav.item.href === item.href ? activeNav.item.label : item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
