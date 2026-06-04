# Nahrino V-2 Core Component System

Date: 2026-06-05
Roadmap phase: `V-2: Core Component System`
Status: Implemented foundation checkpoint
Branch: `phase4b-publishing-worker`

## 1. Purpose

V-2 starts replacing page-by-page styling with a shared professional component language.

The goal is to make future page rebuilds faster and more consistent: dashboard, content, queue, logs, campaigns, media, and settings should use the same primitives for actions, forms, tabs, rows, surfaces, and states.

## 2. Implemented Components

Updated in `frontend/components/nahrino-ui.tsx`:

| Component | Role |
| --- | --- |
| `NButton` | Tokenized button with icon, trailing icon, loading, disabled, focus, and size support |
| `NIconButton` | Icon-only action with accessible label, badge, focus, disabled, and size support |
| `NSurface` | Plain, muted, raised, and tonal surface/card primitive |
| `NField` | Standard label, required mark, hint, and error wrapper |
| `NInput` | Tokenized input with icon, trailing slot, default/success/error state |
| `NTextarea` | Tokenized multiline field with state support |
| `NSelect` | Tokenized select with state support |
| `NTag` | Tokenized tag/chip with optional remove action |
| `NTabs` | Standard tab/saved-view control with count support |
| `NRow` | Shared data row for content, queue, logs, campaign, and channel lists |

Existing primitives remain available:

- `NPage`
- `NPageHeader`
- `NStatusPill`
- `NSavedViewToolbar`
- `NChannelRail`
- `NNotice`
- `NInspectorDrawer`
- `NSection`
- `NActionTile`
- `NMetricTile`
- `NListItem`
- `NEmptyState`
- `NDonutChart`
- `NTrendBars`

## 3. Design-System Preview

`frontend/app/design-system/page.tsx` now acts as the V-2 reference page.

It demonstrates:

- primary, secondary, quiet, danger, loading, and icon actions,
- form fields, input, select, textarea, error state,
- tabs and tags,
- standard data rows,
- empty state,
- raised and tonal surfaces,
- status states and notice state.

## 4. Guardrail Result

V-2 improved the V-1 visual debt baseline:

| Check | V-1 Baseline | V-2 Current | Change |
| --- | ---: | ---: | ---: |
| Hardcoded hex colors | 105 | 100 | -5 |
| Arbitrary visual Tailwind classes | 281 | 280 | -1 |
| Scroll/sticky/viewport layout markers | 47 | 47 | 0 |

## 5. Acceptance

This checkpoint satisfies the first V-2 foundation pass:

- button, icon button, input, textarea, select, tag, row, card/surface, tabs, empty state, drawer, and notice primitives exist,
- controls have visible focus paths,
- controls use tokenized sizing and colors,
- mobile-safe minimum hit targets are available through tokenized density,
- the design-system preview page uses the new primitives as the reference for future page rebuilds.

The next V-2 continuation should migrate the highest-traffic pages away from old `components/ui/*`, `PageHeader`, `SectionCard`, duplicated filter bars, and one-off cards.
