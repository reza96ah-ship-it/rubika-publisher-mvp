# Nahrino V-4 Dashboard

Date: 2026-06-05
Roadmap phase: `V-4: Dashboard`
Status: Reworked after V-4.5 visual token calibration
Branch: `phase4b-publishing-worker`

## 1. Purpose

V-4 rebuilds the home page from a decorative landing-style dashboard into a compact daily command surface.

The benchmark direction is closer to Buffer and Hootsuite: low cognitive load, useful first viewport, clear next action, operational risk, and charts only when they support a decision.

After reviewing `World-Class Visual Design System for Your App.docx`, the dashboard was reworked again on top of V-4.5 tokens. The current dashboard follows the roadmap direction:

- **Calm Editorial Ops Light** for the main shell,
- selective frosted utility only for the live work panel,
- token-backed teal primary CTAs,
- compact laptop-first layout,
- no full-page glass or decorative dark theme.

## 2. Dashboard Changes

Implemented in `frontend/app/page.tsx`.

### Removed

- The large decorative visual hero.
- The oversized first section that pushed operational work down the page.
- Old list primitives on the dashboard in favor of V-2 rows and surfaces.
- Hardcoded chart hex colors in dashboard data.

### Added

- Warm editorial command surface:
  - workspace identity,
  - status pills,
  - short briefing,
  - one `اقدام بعدی`,
  - refresh action,
  - subtle roadmap pattern treatment.
- Frosted live-work panel:
  - published count,
  - active queue count,
  - risk count,
  - seven-day trend.
- Four compact KPI tiles:
  - `انتشار بعدی`,
  - `ریسک امروز`,
  - `صف فعال`,
  - `کمپین فعال`.
- A decision board:
  - pipeline donut,
  - completion rate,
  - failure rate,
  - average attempts,
  - latest published output,
  - seven-day trend.
- A priority work module:
  - action-required notifications,
  - setup/channel risks,
  - queue and approval insights.
- Compact summaries for:
  - nearest schedule,
  - channel health,
  - quick performance insights.

## 3. Guardrail Result

V-4 continues reducing visual debt:

| Check | V-1 Baseline | Current | Result |
| --- | ---: | ---: | --- |
| Hardcoded hex colors | 105 | 79 | OK |
| Arbitrary visual Tailwind classes | 281 | 276 | OK |
| Scroll/sticky/viewport layout markers | 47 | 47 | OK |

## 4. Browser Verification

Verified on `http://localhost:3000/`:

- first viewport includes dashboard title, next action, live work panel, KPI row, operation board, and priority work,
- old decorative hero image is absent,
- no horizontal overflow,
- app shell scroll root works,
- no browser console errors.

Latest live measurement at `1186 x 794` viewport:

- command surface height reduced from `556px` to `304px`,
- dashboard scroll height reduced from `2111px` to `1440px`,
- primary CTA background resolves to `rgb(15, 61, 58)`,
- document has no horizontal overflow.

Latest polish pass:

- duplicate seven-day trend chart removed from `تابلوی انتشار`,
- trend chart remains only in `نمای زنده کار`,
- donut chart now uses a dedicated modern chart palette instead of semantic status colors,
- donut legend rows are full-width so dots, labels, and numbers do not collide,
- command surface has subtle ambient/grid motion,
- frosted live panel has backdrop blur and entrance motion,
- chart bars and donut have reveal animation,
- touch-capable browsers receive light haptic feedback on interactive controls.

## 5. Acceptance

This checkpoint satisfies V-4 foundation:

- first viewport is useful on laptop,
- mobile stack has one clear next action before deeper modules,
- no decorative hero pushes work down,
- dashboard uses V-2 primitives,
- charts are limited to pipeline and seven-day trend,
- channel and campaign health are summaries instead of full duplicate sections.

The next phase should be **V-5: Planner and Campaigns**, focused on replacing split-scroll planner/campaign layouts with a compact Jalali planning surface.
