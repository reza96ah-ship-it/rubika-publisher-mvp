# Nahrino V-4 Dashboard

Date: 2026-06-05
Roadmap phase: `V-4: Dashboard`
Status: Implemented foundation checkpoint
Branch: `phase4b-publishing-worker`

## 1. Purpose

V-4 rebuilds the home page from a decorative landing-style dashboard into a compact daily command surface.

The benchmark direction is closer to Buffer and Hootsuite: low cognitive load, useful first viewport, clear next action, operational risk, and charts only when they support a decision.

## 2. Dashboard Changes

Implemented in `frontend/app/page.tsx`.

### Removed

- The large decorative visual hero.
- The oversized first section that pushed operational work down the page.
- Old list primitives on the dashboard in favor of V-2 rows and surfaces.
- Hardcoded chart hex colors in dashboard data.

### Added

- Compact top command surface:
  - workspace identity,
  - status pills,
  - short briefing,
  - one `اقدام بعدی`,
  - refresh action.
- A first-viewport schedule panel for the nearest publishable posts.
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
  - channel health,
  - active campaigns,
  - quick performance insights.

## 3. Guardrail Result

V-4 continues reducing visual debt:

| Check | V-1 Baseline | V-3 Current | V-4 Current | Change From V-3 |
| --- | ---: | ---: | ---: | ---: |
| Hardcoded hex colors | 105 | 97 | 90 | -7 |
| Arbitrary visual Tailwind classes | 281 | 276 | 273 | -3 |
| Scroll/sticky/viewport layout markers | 47 | 47 | 47 | 0 |

## 4. Browser Verification

Verified on `http://localhost:3000/`:

- first viewport includes dashboard title, next action, schedule, KPI row, operation board, and priority work,
- old decorative hero image is absent,
- no horizontal overflow,
- app shell scroll root works,
- no browser console errors.

## 5. Acceptance

This checkpoint satisfies V-4 foundation:

- first viewport is useful on laptop,
- mobile stack has one clear next action before deeper modules,
- no decorative hero pushes work down,
- dashboard uses V-2 primitives,
- charts are limited to pipeline and seven-day trend,
- channel and campaign health are summaries instead of full duplicate sections.

The next phase should be **V-5: Planner and Campaigns**, focused on replacing split-scroll planner/campaign layouts with a compact Jalali planning surface.
