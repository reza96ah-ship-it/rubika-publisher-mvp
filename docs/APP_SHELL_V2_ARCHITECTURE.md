# Nashrino AppShell V2

AppShell V2 is owned once by the shared protected `(workspace)` layout. Protected pages render route content only, while authentication, spatial layout, navigation metadata, mobile navigation, notifications, global shortcuts, and top-bar presentation remain centralized.

## Components

- `app/(workspace)/layout.tsx` — sole owner of `AuthGate` and `AppShell` for protected routes.
- `components/auth-gate.tsx` — one client-session validation boundary for the protected workspace.
- `components/app-shell.tsx` — workspace data, notification polling, command palette state, account state, haptics, and route-change coordination.
- `components/shell/navigation.ts` — canonical navigation items, groups, active-route logic, and mobile navigation selection.
- `components/shell/workspace-frame.tsx` — fixed ambient canvas, desktop sidebar slot, floating top-bar slot, and the only primary scroll region.
- `components/shell/workspace-topbar.tsx` — breadcrumb, search, workspace readiness action, live notification status, and account menu.
- `components/shell/mobile-navigation-drawer.tsx` — accessible full navigation for mobile with focus trapping, Escape dismissal, backdrop dismissal, and focus restoration.
- `components/sidebar.tsx` — desktop sidebar and mobile bottom navigation rendered from shared navigation metadata.

## Preserved behavior

- one protected-session validation request per workspace load;
- workspace overview loading and refresh;
- store and Rubika readiness guidance;
- one notification polling loop every 15 seconds while visible;
- live notification broadcast and toasts;
- one command palette listener for Ctrl/Cmd + K;
- account menu and logout;
- one mobile touch-feedback listener when reduced motion is not requested;
- scroll reset after route changes;
- unchanged public route URLs.

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

## Ownership and regression guard

- Protected route implementations must not import or render `AuthGate` or `AppShell`.
- Public routes such as `/login` remain outside workspace authentication.
- App Router route groups do not contribute URL segments, so the shared layout does not change route URLs.
- `frontend/scripts/check-single-workspace-shell.mjs` verifies that only `app/(workspace)/layout.tsx` owns the protected shell.
- `npm run shell:audit` runs in the Frontend CI job and in the aggregate frontend `check` command.
