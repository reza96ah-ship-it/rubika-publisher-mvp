"use client";

import {
  AlertCircle,
  BellRing,
  ChevronDown,
  ChevronLeft,
  LogOut,
  Menu,
  Network,
  Search,
  Settings2,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { ProductMark, WorkspaceAvatar } from "../brand-mark";
import { productName } from "../../lib/product";
import type { getActiveNav } from "./navigation";

type WorkspaceTopbarProps = {
  activeNav: ReturnType<typeof getActiveNav>;
  workspaceName: string;
  brandColor?: string;
  brandImageUrl?: string | null;
  accountMenuOpen: boolean;
  notificationCount: number;
  liveNotificationsReady: boolean;
  showAttentionAction: boolean;
  attentionHref: string;
  attentionLabel: string;
  storeReady: boolean;
  rubikaReady: boolean;
  onOpenMobileMenu: () => void;
  onOpenCommandPalette: () => void;
  onToggleAccountMenu: () => void;
  onLogout: () => void;
};

export function WorkspaceTopbar({
  activeNav,
  workspaceName,
  brandColor,
  brandImageUrl,
  accountMenuOpen,
  notificationCount,
  liveNotificationsReady,
  showAttentionAction,
  attentionHref,
  attentionLabel,
  storeReady,
  rubikaReady,
  onOpenMobileMenu,
  onOpenCommandPalette,
  onToggleAccountMenu,
  onLogout
}: WorkspaceTopbarProps) {
  const ActiveNavIcon = activeNav.item.icon;

  return (
    <header className="n-liquid-floating n-radius-panel border">
      <div className="flex min-h-[58px] items-center justify-between gap-3 px-2.5 py-2 sm:px-3 lg:px-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="app-interactive flex h-11 w-11 shrink-0 items-center justify-center rounded-control border border-app-border bg-app-surface/70 text-app-muted hover:text-app-primary lg:hidden"
            aria-label="باز کردن منوی ناوبری"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <Link href="/" className="hidden sm:block lg:hidden" aria-label={productName}>
            <ProductMark />
          </Link>

          <span
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-control border border-app-border bg-app-surface/70 text-app-primary shadow-hairline lg:flex"
            style={brandColor ? { color: brandColor } : undefined}
          >
            <ActiveNavIcon className="h-4 w-4" aria-hidden="true" />
          </span>

          <div className="min-w-0">
            <div className="hidden items-center gap-1 text-[10px] font-bold text-app-muted sm:flex">
              <span>{activeNav.group.title}</span>
              <ChevronLeft className="h-3 w-3" aria-hidden="true" />
              <span className="truncate text-app-primary">{activeNav.item.label}</span>
            </div>
            <p className="truncate text-sm font-black text-app-text sm:mt-0.5">
              {activeNav.item.label}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="app-interactive hidden h-10 min-w-0 items-center gap-2 rounded-control border border-app-border bg-app-surface/65 px-3 text-xs text-app-muted shadow-hairline hover:bg-app-surface hover:text-app-primary md:flex md:w-56 xl:w-72"
            aria-label="باز کردن جست‌وجو و دسترسی سریع"
          >
            <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">جست‌وجوی پست، مسیر یا کمپین</span>
            <span className="mr-auto hidden rounded-chip border border-app-border bg-app-surfaceMuted px-1.5 py-0.5 text-[10px] font-bold text-app-muted xl:inline">
              Ctrl K
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="app-interactive flex h-11 w-11 items-center justify-center rounded-control border border-app-border bg-app-surface/65 text-app-muted shadow-hairline hover:bg-app-surface hover:text-app-primary md:hidden"
            aria-label="باز کردن جست‌وجو و دسترسی سریع"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </button>

          {showAttentionAction ? (
            <Link
              href={attentionHref}
              className="app-interactive hidden min-h-10 items-center gap-2 rounded-control border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-800 shadow-hairline hover:bg-amber-100 xl:flex"
            >
              {!rubikaReady && storeReady ? (
                <Network className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {attentionLabel}
            </Link>
          ) : null}

          <Link
            href="/inbox"
            className="app-interactive relative flex h-11 w-11 items-center justify-center rounded-control border border-app-border bg-app-surface/65 text-app-muted shadow-hairline hover:bg-app-surface hover:text-app-coral"
            aria-label={
              notificationCount
                ? `${notificationCount} اعلان عملیاتی خوانده‌نشده`
                : "صندوق عملیات انتشار"
            }
          >
            <BellRing className="h-4 w-4" aria-hidden="true" />
            <span
              className={`absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-full ring-2 ring-app-surface ${
                liveNotificationsReady ? "bg-emerald-500" : "bg-slate-300"
              }`}
              aria-label={
                liveNotificationsReady
                  ? "اعلان زنده فعال"
                  : "اعلان زنده در حال اتصال"
              }
            />
            {notificationCount ? (
              <span className="absolute -left-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-pill bg-rose-600 px-1 text-[9px] font-black text-white">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            ) : null}
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={onToggleAccountMenu}
              className="app-interactive flex h-11 items-center gap-2 rounded-control border border-app-border bg-app-surface/65 px-2 text-xs font-bold text-app-muted shadow-hairline hover:bg-app-surface hover:text-app-primary"
              aria-label="منوی حساب کاربری"
              aria-expanded={accountMenuOpen}
              aria-haspopup="menu"
            >
              <WorkspaceAvatar
                name={workspaceName}
                size="sm"
                color={brandColor}
                imageUrl={brandImageUrl ?? undefined}
                className="h-7 w-7 rounded-control"
              />
              <span className="hidden max-w-32 truncate 2xl:inline">{workspaceName}</span>
              <ChevronDown className="hidden h-3.5 w-3.5 sm:block" aria-hidden="true" />
            </button>

            {accountMenuOpen ? (
              <div
                role="menu"
                className="n-liquid-floating n-radius-card app-popover absolute left-0 top-12 w-64 overflow-hidden border"
              >
                <div className="border-b border-[var(--n-material-panel-divider)] px-3 py-3">
                  <div className="flex items-center gap-2">
                    <WorkspaceAvatar
                      name={workspaceName}
                      color={brandColor}
                      imageUrl={brandImageUrl ?? undefined}
                    />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-xs font-black text-app-text">
                        <Sparkles className="h-3.5 w-3.5 text-app-teal" aria-hidden="true" />
                        مدیر فضای کاری
                      </p>
                      <p className="mt-1 truncate text-[11px] text-app-muted">{workspaceName}</p>
                    </div>
                  </div>
                </div>

                <div className="p-1.5">
                  <Link
                    href="/store"
                    role="menuitem"
                    className="app-interactive flex min-h-10 items-center gap-2 rounded-control px-2.5 text-xs font-bold text-app-text hover:bg-app-surfaceMuted"
                  >
                    <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
                    تنظیمات فضای کاری
                  </Link>
                  <Link
                    href="/channels"
                    role="menuitem"
                    className="app-interactive flex min-h-10 items-center gap-2 rounded-control px-2.5 text-xs font-bold text-app-text hover:bg-app-surfaceMuted"
                  >
                    <Network className="h-3.5 w-3.5" aria-hidden="true" />
                    مدیریت کانال‌ها
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={onLogout}
                    className="app-interactive flex min-h-10 w-full items-center gap-2 rounded-control px-2.5 text-right text-xs font-bold text-rose-700 hover:bg-rose-50"
                  >
                    <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                    خروج از حساب
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
