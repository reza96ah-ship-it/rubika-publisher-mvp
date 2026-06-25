# Nashrino AppShell V2

AppShell V2 is a compatibility-first shell migration. Existing pages continue to render through the public `AppShell` component while spatial layout, navigation metadata, mobile navigation, and top-bar presentation move into focused modules.

## Components

- `components/app-shell.tsx` — workspace data, notification polling, command palette state, account state, haptics, and route-change coordination.
- `components/shell/navigation.ts` — canonical navigation items, groups, active-route logic, and mobile navigation selection.
- `components/shell/workspace-frame.tsx` — fixed ambient canvas, desktop sidebar slot, floating top-bar slot, and the only primary scroll region.
- `components/shell/workspace-topbar.tsx` — breadcrumb, search, workspace readiness action, live notification status, and account menu.
- `components/shell/mobile-navigation-drawer.tsx` — accessible full navigation for mobile with focus trapping, Escape dismissal, backdrop dismissal, and focus restoration.
- `components/sidebar.tsx` — desktop sidebar and mobile bottom navigation rendered from shared navigation metadata.

## Preserved behavior

- workspace overview loading and refresh;
- store and Rubika readiness guidance;
- notification polling every 15 seconds while visible;
- live notification broadcast and toasts;
- command palette with Ctrl/Cmd + K;
- account menu and logout;
- mobile touch feedback when reduced motion is not requested;
- scroll reset after route changes;
- existing page-level `AppShell` API.

## Spatial rules

- the ambient mesh is fixed and non-interactive;
- the desktop sidebar does not scroll with page content;
- the primary stage owns page scrolling;
- the top bar remains outside the page scroll region;
- the mobile bottom navigation respects the safe-area inset;
- all primary mobile controls meet the 44 px interaction target;
- strong floating glass is limited to navigation and overlays.

## Accessibility rules

- active navigation links use `aria-current="page"`;
- the mobile drawer is a modal dialog;
- focus enters the drawer when opened;
- Tab and Shift+Tab remain inside the drawer;
- Escape and backdrop activation close the drawer;
- focus returns to the previously focused control;
- menus and icon-only buttons have accessible labels;
- high-contrast and reduced-transparency modes continue to use the token bridge.

## Follow-up

After this compatibility shell is stable, protected pages will move under a shared `(workspace)` route-group layout. That change will remove repeated page-level `AuthGate` and `AppShell` wrappers without changing route URLs.
