# Frontend Agent Instructions

Read the root `AGENTS.md` and continuity documents before this file.

## Scope

These instructions apply to `frontend/`.

## Architecture

- Next.js App Router with a shared protected `(workspace)` layout.
- Public login remains outside workspace auth.
- `AppShell` owns workspace-global behavior.
- Route URLs must remain stable during internal route-group refactors.
- Large route implementations may temporarily live in private `_page.tsx` modules.

## Required product behavior

- Persian-first and RTL-native.
- Jalali dates where relevant.
- Honest Rubika and Instagram capability differences.
- Real API integration for completed features.
- Loading, empty, error, retry, restricted, and disconnected states.
- Mobile-first interaction with minimum 44 px touch targets.
- Keyboard navigation, visible focus, accessible labels, focus trapping, and focus restoration.

## Design system

Use existing tokens and shared components before adding local styles:

- `design-tokens/nashrino.css`
- `design-tokens/liquid-glass.css`
- `app/globals.css`
- `components/nashrino-ui.tsx`
- `app/(workspace)/design-system/`

Material rules:

- floating glass only for navigation and small overlays;
- operational panel for low/medium-density containers;
- solid surfaces for editors, charts, tables, and long lists;
- no stacked backdrop blur;
- reduced blur/opacity behavior on mobile and reduced-transparency modes.

## AppShell safety

Do not introduce duplicate:

- `AuthGate` instances;
- `AppShell` instances;
- notification polling loops;
- Ctrl/Cmd + K listeners;
- touch-haptic listeners;
- route-level scroll roots.

The shared workspace layout should remain the owner.

## Data access

- Search `lib/` for existing API/domain helpers before creating new clients.
- Keep API contracts typed.
- Separate large pages into domain types, data hooks/repositories, state machines, and presentation components.
- Optimistic mutations require rollback and actionable errors.
- Do not ship final fixture-only business state when backend endpoints exist.

## Validation

```bash
npm ci
npm run lint
npm run token:audit
npm run typecheck
npm run test
npm run build
npm audit --omit=dev
```

Visual acceptance at minimum:

- 390 px mobile;
- 820 px tablet;
- 1440 px desktop;
- light, dark, and high contrast;
- Persian/Latin mixed text ordering;
- no horizontal overflow;
- no unintended nested scrolling.

## Documentation

Update the continuity package when frontend architecture, route ownership, milestone status, or design-system rules change.
