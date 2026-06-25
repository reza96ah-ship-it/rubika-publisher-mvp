# Nashrino UI Foundation Implementation Plan

Status: Active  
Tracking issue: #7  
Implementation branch: `ui/liquid-glass-foundation`  
Canonical application: `rubika-publisher-mvp`

## 1. Direction

`rubika-publisher-mvp` remains the only active product repository.

- The FastAPI backend, PostgreSQL schema, Alembic migrations, Redis, Celery workers, publishing adapters, automation rules, API contracts, and backend tests remain authoritative.
- `publish-new` is a design-system and frontend-architecture donor only.
- `publisher` is a feature-parity reference only.
- No backend workflow, status, schema, or endpoint is changed as part of the first three UI foundation pull requests.

## 2. Success criteria

The redesign is successful only when it improves the interface without reducing existing product capability.

Every migrated feature must preserve:

- real API integration;
- Persian-first RTL behavior;
- Jalali date behavior;
- current publishing and approval states;
- Rubika and Instagram capability differences;
- loading, empty, degraded, restricted, and error states;
- keyboard and screen-reader behavior;
- mobile and desktop functionality;
- automated test coverage.

## 3. Delivery sequence

### PR 1 — Repository stabilization and regression baseline

Scope:

- switch frontend container installation to deterministic `npm ci`;
- exclude generated browser-test artifacts from Git;
- correct canonical product-plan links;
- document the baseline routes, viewports, states, and validation commands;
- record the Next.js and ESLint major-version mismatch for a controlled lockfile refresh;
- make no visual or backend behavior changes.

Acceptance:

- `docker compose exec frontend npm run check` passes;
- `docker compose exec backend pytest` passes;
- Docker Compose starts the full stack;
- frontend is reachable on port 3100;
- backend health endpoints respond on port 8000.

### PR 2 — Token and material bridge

Scope:

- retain the existing primitive, semantic, density, motion, chart, dark, and high-contrast tokens;
- add the updated OKLCH accent and canvas values;
- add three controlled material levels: operational panel, floating glass, and solid dense surface;
- add the fixed ambient mesh;
- add the final radius hierarchy;
- map legacy aliases to the new semantic tokens;
- update `/design-system` as the visual acceptance page.

No feature page is redesigned in this PR.

### PR 3 — AppShell V2 and workspace route layout

Scope:

- move protected pages under one shared workspace route layout;
- preserve existing auth, workspace, notification, command-palette, onboarding, account, and channel-health behavior;
- split the shell into focused components;
- adopt the fixed mesh, right-side desktop navigation, floating command bar, mobile top bar, accessible drawer, and floating bottom navigation;
- remove repeated page-level `AppShell` and `AuthGate` wrappers;
- ensure only the primary stage scrolls.

Acceptance:

- all routes remain reachable;
- focus trapping and Escape behavior work;
- mobile navigation works at 390 px;
- sidebar and background remain fixed on desktop;
- no nested shell scroll containers remain.

### PR 4 — Dashboard vertical slice

Use real endpoints for publishing health, next scheduled post, campaign summary, channel readiness, alerts, risks, and throughput. The dashboard becomes the first complete visual reference for later migrations.

### PR 5 — Composer and publishing workflow

Refactor without reducing capability:

- create and edit posts;
- autosave;
- campaigns;
- media library and image editing;
- channel selection and readiness;
- approvals;
- scheduling;
- Rubika and Instagram previews;
- automation rules;
- queue, retry, cancel, and manual-publication actions.

### PR 6 — Planner and Jalali calendar

- month, week, and list views;
- filters;
- drag/reschedule;
- day details;
- post inspector;
- queue as a secondary planner view;
- agenda-first mobile layout.

### PR 7 — Campaigns, content, and media

Migrate campaign workbench, approval-aware content library, bulk actions, media organization, image variants, and brand assets.

### PR 8 — Inbox and reports

Unify operational alerts, comments, direct messages, automation events, assignments, saved replies, human takeover, internal notes, publishing reports, and error analysis.

### PR 9 — Channels, onboarding, and settings

Migrate Rubika health, Meta OAuth, Instagram account capability, webhook health, permissions, workspace branding, team roles, and security settings.

### PR 10 — Final application audit

Audit RTL, accessibility, mobile overflow, performance, blur cost, duplicate API calls, nested scrolling, loading/error consistency, dead CSS, and superseded components.

## 4. Updated design-system rules

### 4.1 Token hierarchy

1. Primitive tokens
2. Semantic tokens
3. Material tokens
4. Component tokens
5. Temporary legacy aliases

### 4.2 Material levels

- **Canvas:** fixed ambient mesh and product background.
- **Operational panel:** restrained blur for dashboards, planners, cards, and tables.
- **Floating glass:** stronger blur for navigation, command bars, drawers, popovers, and mobile navigation.
- **Solid dense surface:** editors, long forms, charts, and high-density lists where glass would reduce readability or performance.

### 4.3 Geometry

- 8 px: compact chips and tiny controls
- 12 px: fields and compact buttons
- 16 px: standard buttons and list items
- 20 px: inner cards
- 24 px: primary panels
- 30 px: shell, sidebar, stage, and mobile navigation
- pill: status capsules and segmented controls

### 4.4 Mobile rules

- minimum interactive target: 44 px;
- one primary content column at narrow widths;
- agenda-first planner;
- no horizontal page overflow;
- blur reduced on large scrolling surfaces;
- floating controls respect safe-area insets;
- all drawers are keyboard accessible and restore focus.

## 5. Page completion checklist

A page is complete only when it has:

- real API data;
- strict TypeScript boundaries;
- loading state;
- empty state;
- recoverable error state;
- permission or disconnected-channel state;
- mobile layout;
- keyboard behavior;
- RTL review;
- dark-mode review;
- automated tests;
- feature-parity review against the previous implementation;
- removal of superseded local styling.

## 6. Protected behavior during foundation work

Do not change during PRs 1–3:

- database schema;
- post and approval statuses;
- publishing workers;
- Rubika adapter;
- Instagram OAuth and webhook processing;
- automation-event processing;
- Celery scheduling;
- backend API response contracts.
