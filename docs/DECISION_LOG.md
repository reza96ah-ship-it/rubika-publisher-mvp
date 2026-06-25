# Nashrino Decision Log

This file records durable decisions that future agents must not silently reverse. Add a dated entry when a pull request changes product ownership, architecture, infrastructure, security posture, or development workflow.

## Decision format

- **Date**
- **Status**: accepted, superseded, proposed, or deprecated
- **Decision**
- **Reason**
- **Consequences**
- **Supersedes / Superseded by**, when relevant

---

## D-001 — Canonical repository

**Date:** 2026-06-25  
**Status:** accepted

**Decision:** `reza96ah-ship-it/rubika-publisher-mvp` is the only active production repository.

**Reason:** It contains the full FastAPI backend, PostgreSQL model, migrations, Redis/Celery pipeline, publishing adapters, tests, and mature frontend workflows.

**Consequences:**

- `publisher` is a frontend feature-parity reference only.
- `publish-new` is a design-system and frontend-architecture reference only.
- New implementation work must not continue independently in the reference repositories.

---

## D-002 — Canonical branch and Git workflow

**Date:** 2026-06-25  
**Status:** accepted

**Decision:** `main` is the canonical and default integration branch. Development follows focused GitHub-flow branches and pull requests.

**Reason:** Long-lived phase branches made production state and PR targets ambiguous.

**Consequences:**

- New branches start from current `main`.
- Required CI jobs are `Frontend` and `Backend`.
- Force pushes and deletion of `main` should be blocked by repository rules.
- Merged branches are retired after uniqueness and deployment verification.

---

## D-003 — Preserve backend behavior during UI modernization

**Date:** 2026-06-25  
**Status:** accepted

**Decision:** The first frontend modernization phases must not change database schema, API contracts, post/approval semantics, workers, adapters, or automation behavior unless explicitly scoped.

**Reason:** Existing full-stack behavior is more mature than the visual architecture and must remain functional during redesign.

**Consequences:**

- UI refactors require regression validation against real APIs.
- Backend behavior changes need separate analysis, migrations/tests where needed, and explicit PR documentation.

---

## D-004 — Product navigation model

**Date:** 2026-06-18  
**Status:** accepted

**Decision:** Primary navigation contains Dashboard, Create, Planner, Campaigns, Content, Media, Inbox, Reports, Channels, and Settings.

**Reason:** The product should be organized by user jobs, not infrastructure or operational internals.

**Consequences:**

- Queue is a secondary Planner view.
- Logs is a secondary Reports view.
- Rubika and Instagram routes belong to Channels.
- New top-level routes require clear ownership and documentation updates.

---

## D-005 — Honest Instagram capability

**Date:** 2026-06-18  
**Status:** accepted

**Decision:** Instagram professional accounts use official Meta capabilities. Personal accounts are manual/reminder mode only.

**Reason:** Unofficial login, scraping, false auto-publishing, spam, and cold-DM automation are unsafe and non-compliant.

**Consequences:**

- Capability differences must be visible in UI and backend validation.
- Automation and publishing features must not imply unsupported personal-account behavior.

---

## D-006 — Liquid Glass is controlled material, not universal decoration

**Date:** 2026-06-25  
**Status:** accepted

**Decision:** Use four visual levels: canvas, operational panel, floating glass, and solid dense surface.

**Reason:** Excessive blur harms readability, performance, hierarchy, high-contrast behavior, and mobile usability.

**Consequences:**

- Strong glass is limited to navigation and overlays.
- Dense tables, editors, charts, and long lists remain solid or nearly solid.
- Backdrop blur must not be stacked.
- Mobile and reduced-transparency modes reduce or remove blur.

---

## D-007 — AppShell V2 owns global workspace behavior

**Date:** 2026-06-25  
**Status:** accepted

**Decision:** AppShell owns workspace overview, notifications, command palette, account actions, navigation, mobile drawer/bottom navigation, ambient canvas, and route scroll reset.

**Reason:** Repeating these responsibilities on individual pages caused duplication and inconsistent behavior.

**Consequences:**

- Only one AppShell instance should exist.
- Only the main stage should own page scrolling.
- Global listeners and polling must not be duplicated.

---

## D-008 — Shared protected workspace layout

**Date:** 2026-06-25  
**Status:** accepted

**Decision:** Protected routes are grouped under one App Router `(workspace)` layout that owns `AuthGate` and `AppShell` without changing public URLs.

**Reason:** Page-level shell and auth wrappers were repetitive and created duplicate global behavior risks.

**Consequences:**

- `/login` remains public and outside the workspace layout.
- Existing page-level wrappers are temporary compatibility no-ops and should be removed in a follow-up refactor.

---

## D-009 — Real API integration is required for completed product features

**Date:** 2026-06-25  
**Status:** accepted

**Decision:** Fixtures may support design exploration, but a completed feature must use real backend contracts or clearly identify a blocked backend dependency.

**Reason:** The backend already contains real workflows for publishing, attempts, campaigns, media, channels, notifications, and automation.

**Consequences:**

- Dashboard V2 and later feature migrations must not ship with local-only business state.
- Optimistic updates require rollback and recovery behavior.

---

## D-010 — Current Compose remains development-only

**Date:** 2026-06-25  
**Status:** accepted

**Decision:** The existing `docker-compose.yml` remains a development environment. A separate production configuration must be created.

**Reason:** Current frontend/backend commands use dev servers, reload mode, bind mounts, and persistent build caches.

**Consequences:**

- Production deployment requires immutable images, no source mounts, health checks, migrations, backup/rollback, and reverse-proxy readiness.
- Do not silently transform the development Compose into production and break local workflows.

---

## D-011 — Documentation is part of the implementation

**Date:** 2026-06-25  
**Status:** accepted

**Decision:** Every milestone-changing PR must update continuity documentation.

**Reason:** Future chats and agents do not inherit private conversation context.

**Consequences:**

- Update `docs/CURRENT_STATUS.md` when active phase or next steps change.
- Update `docs/IMPLEMENTATION_ROADMAP.md` when milestone status or sequencing changes.
- Update this log when a durable decision is accepted or superseded.
- Keep `AGENTS.md` accurate enough to bootstrap a new agent from GitHub alone.

---

## D-012 — Separate immutable production runtime

**Date:** 2026-06-25  
**Status:** accepted

**Decision:** Production uses `compose.production.yaml`, immutable version-tagged application images, standalone Next.js output, and one shared backend image for API, worker, Beat, and migrations. The development Compose file remains separate.

**Reason:** Production needs repeatable builds, migration ordering, health-gated startup, persistent data, controlled rollback, and reverse-proxy integration without source bind mounts or development servers.

**Consequences:**

- PostgreSQL and Redis have no host port mappings in production.
- Frontend and backend bind to loopback by default for a host HTTPS reverse proxy.
- Alembic runs as a one-shot dependency before application services start.
- PostgreSQL, Redis, media, and the Beat schedule use named volumes.
- Frontend public API configuration is supplied at image-build time.
- Deployment, smoke checking, backup, restore, and image rollback are scripted and documented.
- M2 is not complete until CI and a non-production operational drill pass.
