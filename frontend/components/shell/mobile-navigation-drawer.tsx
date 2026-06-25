"use client";

import { ChevronLeft, Settings2, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ProductMark, WorkspaceAvatar } from "../brand-mark";
import { productName, productShortTagline } from "../../lib/product";
import {
  isNavItemActive,
  primaryNavItems,
  settingsNavItems
} from "./navigation";

type MobileNavigationDrawerProps = {
  open: boolean;
  onClose: () => void;
  storeName: string;
  ready: boolean;
  brandColor?: string;
  avatarUrl?: string;
};

export function MobileNavigationDrawer({
  open,
  onClose,
  storeName,
  ready,
  brandColor,
  avatarUrl
}: MobileNavigationDrawerProps) {
  const pathname = usePathname();
  const drawerRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) return;

      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => !element.hasAttribute("disabled"));

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
      <button
        type="button"
        aria-label="بستن منوی ناوبری"
        className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="ناوبری اصلی"
        className="n-liquid-floating n-radius-shell absolute inset-y-2 right-2 flex w-[min(22rem,calc(100vw-1rem))] flex-col overflow-hidden border"
      >
        <header className="flex items-center justify-between gap-3 border-b border-[var(--n-material-panel-divider)] p-3">
          <Link href="/" onClick={onClose} className="flex min-w-0 items-center gap-2.5 rounded-control px-1 py-1">
            <ProductMark />
            <span className="min-w-0">
              <span className="block truncate text-sm font-black text-app-text">{productName}</span>
              <span className="mt-0.5 block text-[10px] font-bold text-app-primary">{productShortTagline}</span>
            </span>
          </Link>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="app-interactive flex h-11 w-11 items-center justify-center rounded-control border border-app-border bg-app-surface/70 text-app-muted hover:text-app-primary"
            aria-label="بستن منوی ناوبری"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="border-b border-[var(--n-material-panel-divider)] p-3">
          <Link
            href="/store"
            onClick={onClose}
            className="n-liquid-solid-muted n-radius-card app-interactive flex items-center gap-3 border p-3"
          >
            <WorkspaceAvatar name={storeName} size="sm" color={brandColor} imageUrl={avatarUrl} />
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold text-app-muted">فضای کاری فعال</span>
              <span className="mt-0.5 block truncate text-sm font-black text-app-text">{storeName}</span>
            </span>
            <ChevronLeft className="h-4 w-4 shrink-0 text-app-muted" aria-hidden="true" />
          </Link>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto p-3" aria-label="ناوبری موبایل">
          <p className="mb-2 px-2 text-[10px] font-black text-app-muted">محصول</p>
          <div className="grid gap-1">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const active = isNavItemActive(pathname || "", item);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={`app-interactive flex min-h-11 items-center gap-3 rounded-control px-3 text-sm font-bold ${
                    active
                      ? "bg-app-soft text-app-primary shadow-hairline"
                      : "text-app-muted hover:bg-app-surface/70 hover:text-app-text"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <footer className="border-t border-[var(--n-material-panel-divider)] p-3">
          <div className="mb-2 flex items-center justify-between px-2">
            <p className="text-[10px] font-black text-app-muted">فضای کاری</p>
            <Settings2 className="h-4 w-4 text-app-muted" aria-hidden="true" />
          </div>
          {settingsNavItems.map((item) => {
            const Icon = item.icon;
            const active = isNavItemActive(pathname || "", item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`app-interactive flex min-h-11 items-center gap-3 rounded-control px-3 text-sm font-bold ${
                  active ? "bg-app-soft text-app-primary" : "text-app-muted hover:bg-app-surface/70"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}

          {!ready ? (
            <Link
              href="/onboarding"
              onClick={onClose}
              className="app-interactive mt-2 flex min-h-11 items-center gap-2 rounded-control border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-800"
            >
              <span className="app-status-pulse h-2 w-2 rounded-full bg-amber-500" />
              تکمیل راه‌اندازی
            </Link>
          ) : null}
        </footer>
      </aside>
    </div>
  );
}
