"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import {
  isRubikaConnected,
  isStoreConfigured,
  loadWorkspaceOverview,
  type WorkspaceOverview,
  workspaceUpdatedEvent
} from "../lib/workspace";
import {
  loadKnownNotificationIds,
  loadOperationalNotifications,
  notificationsUpdatedEvent,
  notifyLiveNotifications,
  saveKnownNotificationIds,
  unreadOperationalCount
} from "../lib/notifications";
import { useMediaPreviewUrl } from "../lib/media-preview";
import { CommandPalette } from "./command-palette";
import { MobileNav, Sidebar } from "./sidebar";
import { useToast } from "./toast-provider";
import { getActiveNav } from "./shell/navigation";
import { MobileNavigationDrawer } from "./shell/mobile-navigation-drawer";
import { WorkspaceFrame } from "./shell/workspace-frame";
import { WorkspaceTopbar } from "./shell/workspace-topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const activeNav = getActiveNav(pathname || "");

  const [overview, setOverview] = useState<WorkspaceOverview>({
    store: null,
    rubika: null
  });
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [liveNotificationsReady, setLiveNotificationsReady] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const knownNotificationIds = useRef<Set<string> | null>(null);
  const scrollRootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function refreshOverview() {
      setOverviewLoading(true);
      loadWorkspaceOverview()
        .then(setOverview)
        .catch(() => setOverview({ store: null, rubika: null }))
        .finally(() => setOverviewLoading(false));
    }

    refreshOverview();
    window.addEventListener(workspaceUpdatedEvent, refreshOverview);
    return () => window.removeEventListener(workspaceUpdatedEvent, refreshOverview);
  }, []);

  const refreshNotifications = useCallback(
    async (announceNew = true) => {
      try {
        const data = await loadOperationalNotifications();
        const currentIds = new Set(data.notifications.map((item) => item.id));
        const knownIds =
          knownNotificationIds.current ?? loadKnownNotificationIds();
        const isFirstRefresh =
          knownNotificationIds.current === null && knownIds.size === 0;

        knownNotificationIds.current = currentIds;
        saveKnownNotificationIds(currentIds);
        setNotificationCount(unreadOperationalCount(data));
        setLiveNotificationsReady(true);
        notifyLiveNotifications(data);

        if (!isFirstRefresh && announceNew) {
          data.notifications
            .filter((item) => !knownIds.has(item.id))
            .slice(0, 2)
            .forEach((item) => {
              showToast({
                title: item.title,
                description: item.description,
                tone:
                  item.severity === "critical"
                    ? "alert"
                    : item.severity === "warning"
                      ? "warning"
                      : "success",
                actionHref: item.action_href,
                actionLabel: item.action_label
              });
            });
        }
      } catch {
        setNotificationCount(0);
        setLiveNotificationsReady(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    function refreshWithAnnouncement() {
      void refreshNotifications();
    }

    function refreshWithoutAnnouncement() {
      void refreshNotifications(false);
    }

    function refreshWhenVisible() {
      if (document.visibilityState === "visible") {
        void refreshNotifications();
      }
    }

    void refreshNotifications(false);
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void refreshNotifications();
      }
    }, 15000);

    window.addEventListener(
      notificationsUpdatedEvent,
      refreshWithAnnouncement
    );
    window.addEventListener(
      workspaceUpdatedEvent,
      refreshWithoutAnnouncement
    );
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener(
        notificationsUpdatedEvent,
        refreshWithAnnouncement
      );
      window.removeEventListener(
        workspaceUpdatedEvent,
        refreshWithoutAnnouncement
      );
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [refreshNotifications]);

  useEffect(() => {
    setAccountMenuOpen(false);
    setCommandPaletteOpen(false);
    setMobileMenuOpen(false);
    scrollRootRef.current?.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto"
    });
  }, [pathname]);

  useEffect(() => {
    function handleGlobalKeyDown(event: KeyboardEvent) {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLocaleLowerCase() === "k"
      ) {
        event.preventDefault();
        setCommandPaletteOpen((current) => !current);
        return;
      }

      if (event.key === "Escape" && accountMenuOpen) {
        setAccountMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [accountMenuOpen]);

  useEffect(() => {
    function handleTouchHaptic(event: PointerEvent) {
      if (event.pointerType === "mouse") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const target = event.target instanceof Element ? event.target : null;
      if (!target?.closest("button, a, [role='button']")) return;
      window.navigator.vibrate?.(8);
    }

    window.addEventListener("pointerup", handleTouchHaptic, {
      passive: true
    });
    return () => window.removeEventListener("pointerup", handleTouchHaptic);
  }, []);

  const storeReady =
    !overviewLoading && isStoreConfigured(overview.store);
  const rubikaReady =
    !overviewLoading && isRubikaConnected(overview.rubika);
  const shellReady = storeReady && rubikaReady;
  const showAttentionAction = !overviewLoading && !shellReady;
  const attentionHref = !storeReady ? "/onboarding" : "/channels";
  const attentionLabel = !storeReady
    ? "تکمیل راه‌اندازی"
    : "اتصال کانال";
  const brandAssetId =
    overview.store?.avatar_asset_id ??
    overview.store?.logo_asset_id ??
    null;
  const brandImageUrl = useMediaPreviewUrl(brandAssetId);
  const brandColor = overview.store?.brand_primary_color;
  const workspaceName = overview.store?.name || "پروفایل فروشگاه";

  function logout() {
    window.localStorage.removeItem("rubika_publisher_access");
    router.replace("/login");
  }

  return (
    <WorkspaceFrame
      scrollRootRef={scrollRootRef}
      sidebar={
        <Sidebar
          storeName={workspaceName}
          ready={shellReady}
          brandColor={brandColor}
          avatarUrl={brandImageUrl}
        />
      }
      topbar={
        <WorkspaceTopbar
          activeNav={activeNav}
          workspaceName={workspaceName}
          brandColor={brandColor}
          brandImageUrl={brandImageUrl}
          accountMenuOpen={accountMenuOpen}
          notificationCount={notificationCount}
          liveNotificationsReady={liveNotificationsReady}
          showAttentionAction={showAttentionAction}
          attentionHref={attentionHref}
          attentionLabel={attentionLabel}
          storeReady={storeReady}
          rubikaReady={rubikaReady}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onToggleAccountMenu={() =>
            setAccountMenuOpen((current) => !current)
          }
          onLogout={logout}
        />
      }
      mobileNavigation={<MobileNav />}
      overlays={
        <>
          <MobileNavigationDrawer
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            storeName={workspaceName}
            ready={shellReady}
            brandColor={brandColor}
            avatarUrl={brandImageUrl}
          />
          <CommandPalette
            open={commandPaletteOpen}
            onClose={() => setCommandPaletteOpen(false)}
          />
        </>
      }
    >
      {children}
    </WorkspaceFrame>
  );
}
