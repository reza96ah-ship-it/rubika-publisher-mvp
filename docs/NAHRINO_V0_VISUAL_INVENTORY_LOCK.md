# Nahrino V-0 Visual Inventory Lock

Date: 2026-06-05  
Roadmap phase: `V-0: Visual Inventory Lock`  
Status: Baseline before the next visual rebuild implementation  
Branch: `phase4b-publishing-worker`

## 1. Purpose

This document locks the current visual state before continuing the rebuild from the master roadmap.

The goal is to stop repeating small UI changes and instead rebuild the product from a measured baseline:

- current route inventory,
- current visual debt,
- current component duplication,
- hardcoded style usage,
- scroll and layout risk,
- page rebuild priority,
- acceptance gates for the next phases.

Main roadmap: `docs/NAHRINO_VISUAL_DESIGN_ROADMAP.md`  
Detailed design-system spec: `docs/NAHRINO_DESIGN_SYSTEM_V2.md`

## 2. Current App Surface

Current frontend route pages:

| Area | Route | Current role | V-roadmap destination |
| --- | --- | --- | --- |
| Dashboard | `/` | Daily status dashboard | V-4 Dashboard |
| Create | `/compose` | Post creation and scheduling | V-6 Composer |
| Planner | `/calendar` | Calendar planning | V-5 Planner and Campaigns |
| Campaigns | `/campaigns` | Campaign manager | V-5 Planner and Campaigns |
| Content | `/content` | Content library | V-7 Content Library and Queue |
| Queue | `/queue` | Publishing recovery queue | V-7 Content Library and Queue |
| Media | `/media` | Asset library and editor | V-8 Media / Creative Studio |
| Inbox | `/inbox` | Operational notifications | V-9 Inbox |
| Reports | `/analytics` | Performance analytics | V-10 Reports |
| Store | `/store` | Brand/store settings | V-11 Settings, Accessibility, Modes |
| Channels | `/channels` | Channel settings | V-11 Settings, Accessibility, Modes |
| Rubika | `/rubika` | Rubika-specific settings | V-11 Settings, Accessibility, Modes |
| Instagram | `/instagram` | Instagram-specific settings | V-11 Settings, Accessibility, Modes |
| Logs | `/logs` | Reliability logs | V-11 Settings or V-7 Recovery |
| Onboarding | `/onboarding` | Setup flow | V-11 as temporary setup flow |
| Login | `/login` | Auth | System shell |
| Design System | `/design-system` | Internal reference | V-12 Governance |
| Posts alias | `/posts` | Compatibility route | Merge into Content |

## 3. Code Inventory

Current shared component surface includes both new and legacy layers:

- Newer system components: `nahrino-ui.tsx`, `app-shell.tsx`, `sidebar.tsx`, `pro-product-ui.tsx`, `data-view.tsx`.
- Legacy or partially replaced components: `dashboard-card.tsx`, `dashboard-command-center.tsx`, `page-header.tsx`, `workspace-ui.tsx`, `post-card.tsx`, `filter-bar.tsx`.
- Heavy product-specific tool: `media-image-editor.tsx`.

The app currently has **18 route page files** and **31 top-level component files** under `frontend/components`.

## 4. Style Debt Counts

Automated source scan of `frontend/app` and `frontend/components`:

| Debt type | Count | Meaning |
| --- | ---: | --- |
| Hardcoded hex color occurrences | 105 | Direct colors still bypass semantic tokens |
| Arbitrary Tailwind visual classes | 281 | One-off `bg-[#...]`, `text-[#...]`, `shadow-[...]`, `border-[#...]` decisions remain |
| Scroll/sticky/viewport layout markers | 47 | Possible nested scroll, sticky, or viewport-height layout traps |
| Shared surface/header/card references | 31 | Multiple overlapping UI surface conventions remain |

Top files with hardcoded hex colors:

| File | Count | Risk |
| --- | ---: | --- |
| `frontend/components/media-image-editor.tsx` | 48 | Highest token drift; creative editor needs its own token layer |
| `frontend/app/campaigns/page.tsx` | 17 | Campaign surfaces are not yet systemized |
| `frontend/app/globals.css` | 11 | Some are expected token values, but should be separated as token source |
| `frontend/app/store/page.tsx` | 8 | Store/brand settings still use page-local visual decisions |
| `frontend/app/page.tsx` | 7 | Dashboard still has a few local color values after DS-2 |
| `frontend/components/nahrino-ui.tsx` | 5 | Some temporary component constants remain |

Top files with arbitrary visual classes:

| File | Count | Risk |
| --- | ---: | --- |
| `frontend/components/media-image-editor.tsx` | 91 | The editor is visually isolated from the system |
| `frontend/app/analytics/page.tsx` | 25 | Reports need chart/card tokens |
| `frontend/app/campaigns/page.tsx` | 19 | Campaign manager needs planner/campaign lane components |
| `frontend/components/nahrino-ui.tsx` | 18 | Shared UI still has temporary arbitrary styling |
| `frontend/app/calendar/page.tsx` | 12 | Calendar needs planner component rebuild |
| `frontend/components/workspace-ui.tsx` | 11 | Old workspace components should be retired |
| `frontend/components/dashboard-command-center.tsx` | 10 | Old dashboard pattern should not be expanded |

## 5. Browser Visual Audit

Browser viewport during audit: `1186 x 794`.  
Pages were loaded through the in-app browser at `http://localhost:3000`.

No sampled page showed runtime overlay, console errors, or horizontal overflow.

The counts below are directional. `cardCount` is a broad DOM count of card-like surfaces and intentionally over-includes some nested surfaces; it is useful for comparing page heaviness, not as an exact component count.

| Route | Scroll ratio | Internal scroll containers | Card-like surfaces | Main issue |
| --- | ---: | ---: | ---: | --- |
| `/` | 2.46 | 0 | 59 | Dashboard improved, but still surface-heavy |
| `/compose` | 1.63 | 2 | 36 | Studio still has internal scroll and field clustering |
| `/calendar` | 1.47 | 2 | 29 | Planner still depends on split/internal scroll patterns |
| `/campaigns` | 1.22 | 1 | 67 | Campaign page is the densest card surface |
| `/content` | 1.56 | 2 | 48 | Content and queue mental models still overlap |
| `/media` | 1.41 | 1 | 27 | Editor has the largest token/style drift |
| `/inbox` | 2.11 | 0 | 27 | Inbox is still notification-first, not triage-first |
| `/analytics` | 2.05 | 2 | 54 | Reports are card-heavy and not yet decision-led |
| `/store` | 1.24 | 2 | 49 | Settings still feel like stacked form panels |
| `/onboarding` | 1.81 | 0 | 29 | Setup flow still feels like a page, not a temporary guided flow |

## 6. Locked Visual Problems

These are the top 20 visual debts to solve in order:

1. Replace hardcoded color usage with semantic tokens, starting with `media-image-editor.tsx`, `campaigns/page.tsx`, `analytics/page.tsx`, and `store/page.tsx`.
2. Retire duplicate surface systems: `dashboard-card`, `page-header`, old `workspace-ui` cards, and ad hoc page sections.
3. Eliminate nested full-page scroll patterns from Composer, Calendar, Content, Analytics, and Store.
4. Make mobile-first layouts per page instead of stacked desktop layouts.
5. Enforce one primary action per route and remove duplicate "ساخت پست" patterns where they compete with page actions.
6. Build component tokens for metric tiles, rows, planner events, campaign lanes, chart cards, inspector drawers, and bottom sheets.
7. Replace the current Calendar with planner modes: month, week/list, campaign lane, inspector.
8. Rebuild Campaigns as campaign lanes and lifecycle panels, not many separate cards.
9. Rebuild Composer as a studio: source idea, media/text, channel variants, preview, schedule/readiness.
10. Rebuild Media as Creative Studio with its own tokenized editor controls and smoother custom color/font handling.
11. Rebuild Reports around decision cards: insight, chart, interpretation, next action, export.
12. Rebuild Content and Queue as one unified data view with saved views and recovery states.
13. Rebuild Inbox as triage: labels, assignment, saved replies, status/SLA, bulk actions.
14. Rebuild Settings as a previewable system: theme, density, motion, accessibility, channels, workspace.
15. Convert Onboarding into a temporary 3-4 step guided flow and remove permanent progress modules after setup.
16. Establish responsive page blueprints for laptop, tablet, and mobile before modifying each page.
17. Establish screenshot/visual regression snapshots before each page rebuild.
18. Add high-contrast and reduced-motion QA paths to the design-system checklist.
19. Add chart accessibility summaries and readable labels to every report chart.
20. Block new page-local visual decisions unless they are added as tokens or documented exceptions.

## 7. Page Rebuild Priority

Priority order for implementation:

| Priority | Phase | Why |
| ---: | --- | --- |
| 1 | V-1 Token Source of Truth | All later pages need stable color, surface, density, elevation, and motion tokens |
| 2 | V-2 Core Component System | Prevents each page from inventing its own forms/cards/rows |
| 3 | V-3 App Shell and Navigation | Locks the product spine before page migration |
| 4 | V-5 Planner and Campaigns | Calendar/campaigns are core workflow and currently visually fragmented |
| 5 | V-6 Composer | Creation workflow is the heart of the product and still has field/layout issues |
| 6 | V-7 Content Library and Queue | Removes duplicate library/queue/log mental models |
| 7 | V-8 Media / Creative Studio | Biggest token drift and major differentiator |
| 8 | V-10 Reports | Needs Sprout/Hootsuite-style decision surfaces |
| 9 | V-9 Inbox | Needs to move from notifications to triage |
| 10 | V-11 Settings, Accessibility, Modes | Needed for trust, but should inherit the mature system |
| 11 | V-12 Governance and QA | Keeps the system from drifting after rebuild |

Dashboard already received a DS-2 foundation pass, so it should not receive more isolated polish until V-1/V-2 tokens and components are stronger.

## 8. Acceptance Gate For Moving To V-1

V-0 is complete when:

- the current page inventory is documented,
- hardcoded style debt is counted,
- browser route audit is recorded,
- top visual debts are ranked,
- rebuild phase order is explicit,
- future implementation is blocked from ad hoc page polish.

This document satisfies V-0 and unlocks:

**V-1: Token Source of Truth**

## 9. Operating Rule From This Point

Do not start another page redesign by changing a single page first.

Every implementation phase must:

1. map to `NAHRINO_VISUAL_DESIGN_ROADMAP.md`,
2. reuse or extend `NAHRINO_DESIGN_SYSTEM_V2.md`,
3. commit and push after the phase,
4. run frontend checks for code changes,
5. browser-smoke changed screens,
6. record any exception to the design system.
