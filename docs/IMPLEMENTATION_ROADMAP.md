# Nashrino Executable Implementation Roadmap

Last updated: 2026-06-25  
Canonical branch: `main`  
Roadmap status vocabulary: `done`, `in progress`, `next`, `planned`, `blocked`, `deferred`

## Roadmap principles

- Preserve real backend behavior while redesigning frontend workflows.
- One focused branch and pull request per concern.
- Use real APIs in completed features; fixtures are temporary only.
- Persian, RTL, Jalali, mobile, accessibility, and channel capability are acceptance requirements, not optional polish.
- Production infrastructure changes must be separated from feature redesigns.
- Each milestone updates `docs/CURRENT_STATUS.md` and this file.

## Milestone summary

| Milestone | Status | Primary outcome |
|---|---|---|
| Repository consolidation and governance | done | `main` is canonical; governance and CI established |
| Generated-artifact cleanup | done | Browser reports and exported review artifacts removed |
| Liquid Glass token bridge | done | Controlled material, geometry, theme, and accessibility tokens |
| AppShell V2 | done | Shared navigation, top bar, mobile drawer, fixed canvas, single main scroll |
| Shared workspace route layout | done | Protected routes share one App Router layout without URL changes |
| Production Compose and deployment | in progress | Immutable production runtime, operations runbook, and rollback path |
| Remove legacy page shell wrappers | planned | Eliminate duplicate compatibility wrappers and listeners |
| Dashboard V2 | planned | First complete real-data product vertical slice |
| Composer and publishing V2 | planned | Professional creation, preview, approval, scheduling, and recovery |
| Planner and Jalali calendar V2 | planned | Month/week/list planning and mobile agenda flow |
| Campaigns, content, and media V2 | planned | Coherent campaign and asset operations |
| Inbox and reports V2 | planned | Social engagement, operational recovery, and insights |
| Channels, onboarding, and settings V2 | planned | Production-ready account and workspace administration |
| Production security hardening | planned | Session, credentials, tokens, audit, and deployment controls |
| Final application audit | planned | Responsive, accessibility, performance, dead-code, and consistency sign-off |

---

## M0 — Repository consolidation and governance

Status: `done`

Completed:

- consolidated accepted application history into `main`;
- set `main` as default branch;
- added `CONTRIBUTING.md`;
- added pull-request template;
- added repository-governance documentation;
- prepared main-branch ruleset JSON;
- preserved safety branches during consolidation;
- established Frontend and Backend CI jobs.

Remaining administrative check:

- verify the imported GitHub ruleset is active and targets `main`.

---

## M1 — Design-system foundation

Status: `done`

Completed:

- deterministic frontend installation;
- token audit;
- semantic-token preservation;
- Liquid Glass material bridge;
- controlled radii;
- ambient mesh;
- dark, studio, high-contrast, reduced-motion, and reduced-transparency behavior;
- design-system laboratory;
- AppShell V2;
- accessible mobile navigation drawer;
- shared `(workspace)` route layout.

Follow-up technical cleanup:

- remove page-level compatibility wrappers;
- align Next.js and `eslint-config-next` major versions in a dedicated tooling PR;
- update stale documentation references.

---

## M2 — Production Compose and deployment

Status: `in progress`

Current branch: `chore/production-compose`

### Goals

- run immutable application images in production;
- stop using development servers and source bind mounts on the server;
- provide repeatable backup, migration, health, deployment, and rollback procedures;
- prepare for HTTPS reverse proxy without coupling to one hosting provider.

### Implemented on the milestone branch

- `compose.production.yaml` with separate edge and internal networks;
- standalone multi-stage Next.js production image;
- non-root backend production image without reload mode;
- API, Celery worker, Celery Beat, and migration services using one versioned backend image;
- one-shot Alembic migration dependency before application startup;
- health checks and restart policies;
- named PostgreSQL, Redis, and application-storage volumes;
- no application source bind mounts;
- loopback-only frontend and backend host bindings by default;
- `.env.production.example` with deployment variables;
- deployment and smoke-check scripts;
- image-tag rollback script;
- PostgreSQL backup, checksum, and guarded restore scripts;
- `docs/PRODUCTION_DEPLOYMENT.md`;
- Deployment CI job for shell syntax, Compose rendering, and production image builds.

### Acceptance still required

- Frontend, Backend, and Deployment CI pass on the pull request;
- production stack builds from a clean checkout;
- frontend runs from standalone output;
- backend runs without `--reload`;
- no application source bind mounts;
- PostgreSQL data and media persist across recreation;
- Alembic migrations apply before app traffic;
- backend, database, worker, and frontend health checks pass;
- HTTPS reverse proxy behavior is verified;
- database backup and restore are tested outside production;
- application rollback is tested outside production;
- no deployment credentials or real backups are committed;
- current development Compose remains usable locally.

M2 becomes `done` only after repository CI and a documented non-production operational drill pass.

---

## M3 — Remove legacy page shell wrappers

Status: `planned`

Recommended branch: `refactor/remove-legacy-page-shell-wrappers`

### Scope

- remove page-level imports and wrappers for `AuthGate` and `AppShell` from protected page implementations;
- retain ownership in `frontend/app/(workspace)/layout.tsx`;
- remove compatibility nesting contexts once all pages are migrated;
- update AppShell architecture documentation;
- add regression tests for one shell and one auth check.

### Acceptance

- one AuthGate request per protected page load;
- one AppShell instance;
- one notification polling loop;
- one command-palette shortcut listener;
- one mobile haptic listener;
- no public route is wrapped by workspace auth;
- all existing URLs remain unchanged;
- all CI checks pass.

---

## M4 — Dashboard V2

Status: `planned`

Recommended branch: `feat/dashboard-v2`

### Route ownership

Dashboard owns:

- today state;
- publishing health;
- next scheduled post;
- active campaign summary;
- channel readiness;
- alerts requiring action;
- compact performance/throughput insight.

Dashboard does not own:

- full onboarding after setup;
- full calendar;
- full campaign report;
- duplicate content library;
- permanent queue/log tables.

### Data requirements

- posts and post statistics;
- publishing attempts and failure categories;
- campaigns;
- workspace/channel readiness;
- operational notifications;
- next scheduled post;
- recent throughput/performance.

### UX requirements

- Publishing Pulse uses real worker/post state;
- one clear primary action;
- action-oriented alerts;
- loading, empty, degraded, partially connected, and error states;
- single-column mobile hierarchy;
- two-column tablet hierarchy;
- dense but readable desktop grid;
- no horizontal overflow at 390 px;
- no decorative charts without operational meaning.

### Acceptance

- no final fixture-only business state;
- backend/API failures show recovery guidance;
- mobile, desktop, RTL, dark, high-contrast, keyboard, and screen-reader review complete;
- automated unit/integration coverage;
- before/after screenshots included in PR.

---

## M5 — Composer and publishing workflow V2

Status: `planned`

Recommended branch: `feat/composer-v2`

### Preserve existing capabilities

- create draft;
- edit existing post;
- autosave and restore;
- campaign assignment and creation;
- media library selection;
- upload and image editing;
- Rubika and Instagram destination selection;
- channel-specific readiness checks;
- professional/personal Instagram capability differences;
- Rubika and Instagram previews;
- approval submission and validation;
- scheduling;
- manual publication flow;
- Instagram automation-rule attachment;
- retry/cancel/recovery actions where owned by the publishing workflow.

### Architecture goals

Split large page logic into:

- domain types;
- API clients/repositories;
- query/mutation hooks;
- form state;
- channel capability adapters;
- media workflow;
- preview components;
- readiness and validation panel;
- submission state machine.

### Acceptance

- real create/update API calls;
- edit flow by post ID;
- no silent data loss;
- clear autosave status;
- mobile step flow;
- keyboard-accessible media and scheduling controls;
- full error/retry behavior;
- automated tests for create, edit, approval, schedule, and manual mode.

---

## M6 — Planner and Jalali calendar V2

Status: `planned`

Recommended branch: `feat/planner-calendar-v2`

### Scope

- month, week, and list modes;
- Persian weekdays and Jalali navigation;
- campaign, channel, status, and approval filters;
- drag/reschedule with server validation;
- day details;
- post inspector drawer;
- open in Composer;
- gap detection;
- Queue as a secondary Planner view;
- agenda-first mobile mode.

### Acceptance

- no duplicate calendar and queue filter systems;
- rescheduling has optimistic state with rollback;
- timezone/Jalali behavior is tested;
- keyboard alternatives exist for drag actions;
- no nested scroll traps;
- mobile agenda is usable at 390 px.

---

## M7 — Campaigns, content, and media V2

Status: `planned`

### Campaigns

- portfolio and health overview;
- campaign workbench;
- posts, media, calendar, reports, and automation tabs;
- owner, goal, date, risk, and progress state;
- create/edit in drawer.

### Content

- unified content library;
- saved views;
- one filter model;
- bulk selection/actions;
- approvals: submit, approve, reject, request changes;
- retry and open in Composer.

### Media

- upload and asset library;
- folder/tag organization;
- post/campaign association;
- Persian image editor;
- square, horizontal, portrait, and story variants;
- brand kit assets and templates.

### Acceptance

- shared query/filter primitives;
- bulk actions are recoverable;
- approval permissions are enforced by backend and reflected in UI;
- editor remains solid, readable, and performant;
- responsive and keyboard review complete.

---

## M8 — Inbox and reports V2

Status: `planned`

### Inbox

Unify:

- operational notifications;
- Instagram comments and messages;
- automation events;
- assignment;
- read/unread and priority;
- saved replies;
- internal notes;
- human takeover;
- resolve/reopen;
- retryable failures.

### Reports

- publishing health;
- attempts and error categories;
- campaign performance;
- automation performance;
- channel comparison;
- actionable insight cards;
- exports;
- Logs as a secondary Reports view.

### Acceptance

- no double-scrolling charts;
- clear filters and date ranges;
- report queries are bounded and performant;
- automation event delivery/failure/retry state is visible;
- operational and customer messages are distinguishable but share one triage model.

---

## M9 — Channels, onboarding, and settings V2

Status: `planned`

### Channels

- Rubika connection and health;
- Meta OAuth;
- professional account discovery/selection;
- personal account manual/reminder mode;
- webhook status;
- permissions and capability matrix;
- health tests and troubleshooting.

### Onboarding

- minimal guided setup;
- workspace identity;
- first channel;
- first scheduled post;
- no permanent onboarding dashboard after completion.

### Settings

- workspace/store profile;
- brand kit;
- team and roles;
- security;
- webhook/API settings later;
- billing later.

### Acceptance

- channel capability is honest and explicit;
- credentials are never shown after entry;
- failure and reconnect flows are documented;
- setup can be completed on mobile;
- permissions are backend-enforced.

---

## M10 — Production security hardening

Status: `planned`

- move toward secure HTTP-only session handling;
- encrypt platform credentials/tokens at rest;
- token expiry and rotation;
- audit log for privileged changes;
- rate limiting and abuse protection;
- CSRF/session review;
- secret-management and deployment review;
- backup retention and restore drills;
- security headers and HTTPS deployment.

This milestone may be split and partially delivered earlier when production deployment begins.

---

## M11 — Final application audit

Status: `planned`

Audit all core routes at:

- 390 × 844;
- 430 × 932;
- 768 × 1024;
- 820 × 1180;
- 1024 × 768;
- 1280 × 800;
- 1440 × 900;
- 1920 × 1080.

Review:

- RTL and mixed Persian/Latin ordering;
- Jalali correctness;
- keyboard navigation;
- focus order and restoration;
- screen-reader labels;
- contrast;
- reduced motion/transparency;
- horizontal overflow;
- nested scroll containers;
- backdrop-blur cost;
- image performance;
- duplicate API requests and listeners;
- loading/empty/error consistency;
- dead CSS and superseded components;
- deployment and rollback documentation;
- feature parity against the prior implementation.

Final acceptance requires clean CI, completed production smoke tests, and an updated `docs/CURRENT_STATUS.md` marking the release candidate state.
