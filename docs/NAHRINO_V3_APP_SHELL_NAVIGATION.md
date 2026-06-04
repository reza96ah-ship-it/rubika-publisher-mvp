# Nahrino V-3 App Shell and Navigation

Date: 2026-06-05
Roadmap phase: `V-3: App Shell and Navigation`
Status: Implemented foundation checkpoint
Branch: `phase4b-publishing-worker`

## 1. Purpose

V-3 makes the product spine clearer before deeper page rebuilds continue.

The previous shell treated too many surfaces as equally primary. The sidebar mixed daily planning, creation, content assets, messaging, reports, and settings in one long list. The topbar carried setup/channel signals as separate actions, while creation lived as a normal nav item. This made the app feel complex and less professional.

## 2. Shell Changes

Implemented in `frontend/components/sidebar.tsx`, `frontend/components/app-shell.tsx`, and `frontend/components/command-palette.tsx`.

### Desktop Sidebar

- Removed `ساخت پست` from the normal sidebar route list.
- Grouped navigation into three product areas:
  - `برنامه`: داشبورد، تقویم، کمپین‌ها
  - `دارایی‌ها`: محتوا، رسانه، پیام‌ها
  - `رشد`: گزارش‌ها
- Kept `تنظیمات` pinned in the footer under `فضای کاری`.
- Kept onboarding visible only as a contextual setup action when the workspace is not ready.
- Reduced sidebar width and vertical spacing so settings does not require empty scrolling.

### Topbar

- Added one global desktop/tablet create action: `پست تازه`.
- Consolidated setup/channel warnings into one compact attention action.
- Kept command search and notification access as permanent utilities.
- Tokenized shell action colors and borders.

### Mobile Navigation

- Kept a five-item bottom nav:
  - داشبورد
  - تقویم
  - ساخت پست
  - محتوا
  - گزارش‌ها
- Kept compose as the central mobile create action.
- Removed hardcoded mobile nav colors in favor of semantic app tokens.

### Command Palette

- Added `کمپین‌ها` as a direct primary product route.
- Split command sections into product routes and contextual tools.
- Tokenized command icons and section labels.

## 3. Guardrail Result

V-3 improved visual debt again:

| Check | V-1 Baseline | V-2 Current | V-3 Current | Change From V-2 |
| --- | ---: | ---: | ---: | ---: |
| Hardcoded hex colors | 105 | 100 | 97 | -3 |
| Arbitrary visual Tailwind classes | 281 | 280 | 276 | -4 |
| Scroll/sticky/viewport layout markers | 47 | 47 | 47 | 0 |

## 4. Acceptance

This checkpoint satisfies the first V-3 foundation pass:

- create is no longer a normal desktop sidebar route,
- global create is available from the topbar on desktop/tablet,
- mobile create remains central and accessible,
- settings is pinned and always reachable,
- campaign navigation is first-class,
- sidebar route groups map to a simpler mental model,
- command palette mirrors the new product structure,
- frontend checks pass with no added visual debt.

The next V-3 continuation should migrate page-level duplicated create/filter actions into contextual headers using the V-2 primitives.
