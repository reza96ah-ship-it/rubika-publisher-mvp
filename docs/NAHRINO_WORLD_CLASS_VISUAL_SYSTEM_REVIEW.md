# Nahrino World-Class Visual System Review

Date: 2026-06-05  
Source file: `C:/Users/Reza/Desktop/World-Class Visual Design System for Your App.docx`  
Status: Adopt as a governing visual-design source for the rebuild

## 1. Verdict

This document is stronger than a moodboard. It gives Nahrino a specific design direction:

- primary shell theme: **Calm Editorial Ops Light**,
- secondary material layer: **Selective Frosted Utility**,
- optional focused mode: **Dark Studio** only for media, preview, and approval-heavy contexts.

This should now override any direction that makes the whole app dark, glassy, decorative, template-like, or card-heavy.

## 2. What It Changes

The current rebuild already moved in the right direction, but the source document makes five corrections we should apply before continuing deeper page work.

1. **Warm editorial canvas**

   The default app should use a warmer neutral canvas, softer editorial borders, white working surfaces, deep ink text, and restrained teal action color. The app should not feel like a cold admin panel or a generic SaaS starter.

2. **Frosted layers only where they help**

   Glass/frosted treatment is allowed for command bars, floating filters, inspector drawers, bottom sheets, context menus, modal headers, and in-place confirmations. It should not become the default background for every section or card.

3. **Dark Studio is contextual**

   Dark mode belongs first in the media editor, preview studio, story/reel safe-area preview, before/after comparison, and approval mode. The full operational shell remains light-first until semantic tokens are fully stable.

4. **Motion is functional**

   Motion should communicate state: command reveal, tab changes, chart selection, planner drag/drop, autosave, publish progress, alerts, and drawer transitions. Endless decorative loops, drifting cards, and background animation should be avoided.

5. **Rows and real previews beat repeated cards**

   Repeated operational data should use compact rows, tables, grouped lists, timelines, and inspectors. Cards should be reserved for KPIs, summaries, media tiles, modal content, and genuinely framed tools.

## 3. Concrete Token Direction

The source recommends this default light palette:

| Role | Value | Nahrino use |
| --- | --- | --- |
| Canvas | `#F7F6F2` | App background |
| Surface | `#FFFFFF` | Main working panels |
| Surface muted | `#FCFBF8` | Low-emphasis wells and grouped zones |
| Text | `#18212F` | Primary text |
| Muted text | `#64748B` | Captions and secondary labels |
| Border | `#E7E2D8` | Separators, fields, subtle outlines |
| Primary | `#0B7771` | Main action, selected state |
| Primary strong | `#0F3D3A` | Hover/pressed/high emphasis |
| Info | `#2563EB` | Neutral information |
| Success | `#15803D` | Healthy/success states |
| Warning | `#8A5A12` | Risk/waiting states |
| Danger | `#C24150` | Failure/destructive states |

Dark Studio should use:

| Role | Value |
| --- | --- |
| Background | `#0F141B` |
| Surface | `#111827` |
| Raised | `#18212F` |
| Text | `#F8FAFC` |
| Muted | `#CBD5E1` |
| Primary | `#3BC0B6` |
| Info | `#7AA2FF` |
| Success | `#4ADE80` |
| Warning | `#F0B34A` |
| Danger | `#FB7185` |

## 4. Typography Direction

The document reinforces a Persian-first productive scale:

| Token | Size | Weight | Line height | Use |
| --- | ---: | ---: | ---: | --- |
| `display-md` | 24 | 800 | 1.30 | Page title |
| `heading-lg` | 20 | 800 | 1.35 | Major section |
| `heading-md` | 16 | 700 | 1.45 | Component title |
| `body-lg` | 15 | 500 | 1.65 | Important reading |
| `body-md` | 14 | 500 | 1.65 | Default UI |
| `body-sm` | 13 | 500 | 1.55 | Metadata |
| `label` | 12 | 700 | 1.40 | Labels/chips |
| `metric` | 20 | 800 | 1.20 | KPI values |

Rules:

- Persian UI text should never use negative letter spacing.
- Body text should not fall below 13px in operational surfaces.
- Dashboard, report, calendar, and queue numerals should use tabular numerals.
- Recommended stack: `Vazirmatn Variable`, `Inter Variable`, `system-ui`, `Segoe UI`, `Tahoma`, `Arial`, `sans-serif`.

## 5. Motion Direction

Target motion tokens:

| Token | Value | Use |
| --- | ---: | --- |
| `fastest` | 80ms | Tiny feedback |
| `fast` | 120ms | Hover, press, focus |
| `base` | 180ms | Menus, popovers, status changes |
| `emphasized` | 240ms | Drawers, sheets, important transitions |
| `section` | 280ms | Section reveal and route-local changes |

Acceptance rules:

- `prefers-reduced-motion` must be respected.
- Animate transform and opacity before layout.
- One focal motion per view.
- No decorative loops unless the user is in a creative/editor context and the loop has direct state meaning.

## 6. UX And Layout Rules To Carry Forward

The source confirms these rules for Nahrino:

- mobile below 640px needs one task per screen, bottom nav, and sheets instead of side panes,
- laptop 1024-1279px is the primary operating viewport,
- planner must avoid split-scroll traps,
- composer should have truthful platform previews,
- reports need chart interpretation plus accessible data fallback,
- repeated content should use rows, not stacked cards,
- setup progress should be onboarding/toast/checklist, not a permanent dashboard block,
- every page should have one primary action per context.

## 7. Quality Gates

Add these to future phase acceptance:

| Gate | Target |
| --- | --- |
| Token adoption | 95%+ of new UI surfaces |
| Duplicate primary CTA count | 0 on audited routes |
| Nested scroll traps | 0 on primary routes |
| First-time comprehension | Under 60 seconds |
| Create and schedule one post | Under 3 minutes |
| Inbox triage action | Under 30 seconds |
| Report setup/export | Under 90 seconds |
| Visual consistency rating | 4.5/5+ |
| SUS target | 85+ |

## 8. Roadmap Impact

Before continuing with Planner, Composer, Content Library, and Media Studio, add a calibration phase:

**Phase V-4.5: Visual Token Calibration**

Deliverables:

- update implemented tokens to the warm editorial palette,
- add typography, tabular numeral, motion, focus, and density tokens,
- define selective frosted utility policy in CSS/component terms,
- define Dark Studio scope for media/editor surfaces only,
- add token audit rules for raw color drift and arbitrary visual classes.

Then continue:

- **V-5 Planner/Campaigns:** compact Jalali planner, no double scroll, drawer/sheet inspector.
- **V-6 Composer:** studio layout, truthful previews, schedule inspector, campaign selector.
- **V-7 Content/Queue:** one unified row-based data view, no duplicate filters.
- **V-8 Media Studio:** Dark Studio editor mode, real asset previews, brand kit, professional image tools.
- **V-9 Inbox:** one-screen triage with assignment, saved replies, status, and mobile actions.
- **V-10 Reports:** executive-ready report surfaces with interpretation, export, and mobile fallback.

