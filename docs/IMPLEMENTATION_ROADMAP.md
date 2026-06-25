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
| Production Compose and deployment | in progress | Repository implementation validated; operational staging drill remains |
| Remove legacy page shell wrappers | done | One layout-owned auth boundary and application shell |
| Dashboard V2 | done | Real-data operational dashboard with production visual acceptance |
| Composer and publishing V2 | in progress | Domain/repository foundation complete; workflow decomposition active |
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
- shared `(workspace)` route layout;
- removal of page-level shell compatibility wrappers;
- structural shell-ownership audit in Frontend CI.

Remaining tooling follow-up:

- align Next.js and `eslint-config-next` major versions in a dedicated tooling PR.

---

## M2 — Production Compose and deployment

Status: `in progress`

Implementation merged through PR #27. Compose validation was corrected through PR #28.

### Goals

- run immutable application images in production;
- stop using development servers and source bind mounts on the server;
- provide repeatable backup, migration, health, deployment, and rollback procedures;
- prepare for HTTPS reverse proxy without coupling to one hosting provider.

### Repository implementation and validation complete

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
- Deployment CI for shell syntax, Compose rendering, and production image builds;
- final Frontend, Backend, and Deployment CI passed;
- clean backend and frontend production image builds passed;
- frontend healthcheck YAML parsing defect fixed by quoting the complete Node command.

### Operational acceptance still required

- deploy the merged `main` branch to a non-production host;
- verify PostgreSQL and media persistence across service recreation;
- verify Alembic migrations complete before application traffic;
- verify backend, database, worker, and frontend runtime health checks;
- verify HTTPS reverse proxy, CORS, and OAuth callback routing;
- create and verify a database backup and checksum;
- complete a database restore drill outside production;
- complete an application image rollback drill outside production;
- verify the development Compose workflow remains usable on the target environment;
- record the drill results without committing credentials or real backups.

M2 becomes `done` after the documented non-production operational drill passes. Repository CI and image-build acceptance are already complete.

---

## M3 — Remove legacy page shell wrappers

Status: `done`

Completed through PR #30.

### Delivered

- removed page-level imports and JSX wrappers for `AuthGate` and `AppShell` from all 16 protected route implementation modules;
- retained sole ownership in `frontend/app/(workspace)/layout.tsx`;
- removed temporary nested-context compatibility bypasses from `AuthGate` and `AppShell`;
- preserved all existing public route URLs;
- preserved one notification polling loop, one command-palette listener, one mobile haptic listener, and one workspace scroll owner;
- updated AppShell architecture documentation;
- added `frontend/scripts/check-single-workspace-shell.mjs`;
- added `npm run shell:audit` to the aggregate frontend check and Frontend CI.

### Acceptance

- one AuthGate request per protected workspace load;
- one AppShell instance;
- one notification polling loop;
- one command-palette shortcut listener;
- one mobile haptic listener;
- no public route is wrapped by workspace auth;
- all existing URLs remain unchanged;
- structural shell audit and complete CI pass.

---

## M4 — Dashboard V2

Status: `done`

Completed through PR #32 with final acceptance through PR #36.

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

### Delivered and accepted

- real posts, publishing attempts, campaigns, channel accounts, workspace state, and operational notifications;
- partial-source degradation with recovery guidance;
- publishing pulse, next action, channel readiness, approval/failure backlog, active campaigns, alerts, and rolling seven-day throughput;
- no duplicate Planner, Content, Campaign report, Queue, or Logs ownership;
- fresh-workspace onboarding state without unnecessary store-scoped requests;
- unit coverage for scheduling, attempts, backlogs, throughput, degradation, and missing-store behavior;
- Frontend, Backend, and Deployment CI passed;
- immutable production-browser screenshots passed at 390 × 844 and 1440 × 900 in light and dark modes;
- RTL order, single-column mobile hierarchy, contrast, readability, and horizontal overflow reviewed.

---

## M5 — Composer and publishing workflow V2

Status: `in progress`

Recommended branch: `feat/composer-v2`

Foundation delivered through PR #37:

- typed form, media, autosave, workspace-mode, and save-action contracts;
- pure readiness and validation derivation;
- validated local-draft parsing and serialization;
- centralized Composer loading, media, post persistence, scheduling, readiness, and status repository;
- route migration away from duplicate local API/domain implementations;
- unit coverage for readiness, approval blocking, validation precedence, and local drafts.

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
