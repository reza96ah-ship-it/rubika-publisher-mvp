# Nashrino Durable Project Context

Last reviewed: 2026-06-25  
Canonical repository: `reza96ah-ship-it/rubika-publisher-mvp`  
Canonical branch: `main`

## Purpose of this file

This document allows a new chat or coding agent to reconstruct the project context from GitHub without access to prior conversations. Read it together with `AGENTS.md` and `docs/CURRENT_STATUS.md`.

## Product summary

Nashrino is a Persian-first, RTL-native, Jalali-native SocialOps platform for planning, creating, scheduling, publishing, monitoring, automating, and reporting content across Rubika, Instagram, and future channels.

The product began as a Rubika publishing MVP and evolved into a full multi-channel operational workspace. It should compete through workflow clarity, honest channel capabilities, Persian UX, Jalali planning, safe publishing operations, and practical commerce automation.

## User groups

- Store owners needing simple daily publishing and promotion workflows.
- Social-media operators handling posts, media, calendars, queues, and failures.
- Campaign managers coordinating posts, assets, automation, and reports.
- Agencies and team leads requiring workspaces, approvals, auditability, roles, and client-ready reporting.

## Canonical repository decision

Only `rubika-publisher-mvp` is active.

Two historical repositories remain references:

- `reza96ah-ship-it/publisher`: broad frontend feature implementation and feature-parity reference.
- `reza96ah-ship-it/publish-new`: updated UI architecture and Liquid Glass design-system reference.

New production changes belong only in `rubika-publisher-mvp`.

## Technical architecture

### Frontend

- Next.js App Router.
- React and TypeScript.
- Tailwind-based design system.
- Persian/RTL layouts and Jalali workflows.
- Shared protected `(workspace)` route layout.
- AppShell V2 with fixed ambient canvas, right-side desktop navigation, floating workspace top bar, mobile drawer, and mobile bottom navigation.
- Vitest unit tests.
- Playwright E2E sources exist but require a separately maintained browser-test toolchain.

Read exact dependency versions from `frontend/package.json`. At the time of this review, Next.js is newer than the installed `eslint-config-next` major version; align those versions in a dedicated tooling PR rather than mixing the change into a feature PR.

### Backend

- FastAPI application in `backend/app/main.py`.
- SQLAlchemy data model in `backend/app/models.py`.
- Alembic migrations in `backend/alembic/`.
- PostgreSQL database.
- Redis broker/cache.
- Celery worker and Celery Beat scheduler.
- Publishing adapters and service layer under `backend/app/services/`.
- API routers under `backend/app/routes/`.

### Runtime

Current `docker-compose.yml` is optimized for development:

- backend runs with Uvicorn reload;
- frontend runs `npm run dev`;
- source directories are bind-mounted;
- frontend dependencies and `.next` use Docker volumes;
- frontend is exposed on host port 3100;
- backend is exposed on host port 8000.

A production Compose and immutable-image deployment workflow is planned but not yet complete.

## Core domain model

The backend currently includes concepts for:

- users and authentication;
- stores/workspaces and branding;
- Rubika accounts;
- Instagram accounts;
- generic channel accounts;
- campaigns;
- posts and scheduling;
- media assets;
- publishing attempts;
- approval states;
- Instagram automation rules;
- Instagram automation events;
- saved replies;
- operational notifications.

## Publishing workflow

Important post states include:

- `draft`
- `ready`
- `scheduled`
- `publishing`
- `published`
- `partially_published`
- `manual_ready`
- `failed`
- `cancelled`

Approval states include:

- `not_required`
- `pending`
- `approved`
- `rejected`
- `changes_requested`

Publishing behavior includes scheduled scanning, reservation, delivery attempts, retry, stale-job recovery, failure recording, cancellation, and manual-publication completion.

Do not rename or reinterpret these states without inspecting backend routes, services, migrations, and tests.

## Channel capability rules

### Rubika

Rubika has a direct publishing path, connection/health state, worker delivery, attempts, retry, and operational recovery.

### Instagram professional accounts

Professional accounts can use the official Meta path for OAuth, account discovery, webhooks, publishing-capability checks, comments, messaging/private replies, and compliant automation.

### Instagram personal accounts

Personal accounts are manual/reminder mode only. Do not implement unofficial password login, scraping, or false auto-publish behavior.

## Information architecture

Primary navigation:

1. Dashboard `/`
2. Create `/compose`
3. Planner `/calendar`
4. Campaigns `/campaigns`
5. Content `/content`
6. Media `/media`
7. Inbox `/inbox`
8. Reports `/analytics`
9. Channels `/channels`
10. Settings `/store`

Secondary operational routes:

- Queue `/queue`, intended to become a Planner sub-view.
- Logs `/logs`, intended to become a Reports sub-view.
- Rubika `/rubika` and Instagram `/instagram`, owned by Channels.
- Onboarding `/onboarding`, used for incomplete workspace setup.
- Design-system laboratory `/design-system`.

## Design-system direction

The approved visual direction is modern Persian Liquid Glass, but glass is controlled rather than decorative.

Material hierarchy:

- Canvas: fixed ambient mesh.
- Operational panel: restrained blur for dashboard/planner/cards.
- Floating glass: navigation, command bars, drawers, popovers, small overlays.
- Solid dense surface: editors, long forms, data tables, charts, and long scrolling lists.

Geometry hierarchy:

- 8 px for chips and small status elements.
- 12 px for compact controls.
- 16 px for fields and normal controls.
- 20 px for inner cards.
- 24 px for primary panels.
- 30 px for shell, navigation, and main stage.
- Pill for capsules and segmented controls.

Accessibility requirements:

- 44 px minimum mobile target.
- Keyboard focus and Escape behavior.
- Focus trapping and restoration in modal drawers.
- High-contrast support.
- Reduced-motion and reduced-transparency behavior.
- No horizontal overflow at 390 px.
- No stacked backdrop blur.

## Repository and branch history

The application was previously split across long-lived phase branches. The accepted history was consolidated into `main`. `main` is now the default branch.

Repository governance files:

- `CONTRIBUTING.md`
- `.github/pull_request_template.md`
- `docs/REPOSITORY_GOVERNANCE.md`

Branch protection/ruleset should require pull requests, Frontend and Backend CI, resolved conversations, no force pushes, and no deletion of `main`. Repository settings must be verified manually because they are not stored completely in Git.

## Completed modernization work

- Repository stabilization and deterministic frontend Docker installation.
- Generated Playwright reports and exported review artifacts removed from Git.
- Liquid Glass token/material bridge.
- Design-system acceptance laboratory.
- AppShell V2 spatial architecture.
- Accessible mobile navigation drawer.
- Shared workspace route layout.
- Main branch consolidation and governance documentation.
- Frontend and backend CI validation.

## Immediate roadmap

1. Production Compose and deployment runbook.
2. Remove remaining legacy page-level `AuthGate` and `AppShell` wrappers.
3. Dashboard V2 using real backend data.
4. Composer and publishing workflow V2.
5. Planner and Jalali calendar V2.
6. Campaigns, content, and media.
7. Inbox and reports.
8. Channels, onboarding, and settings.
9. Final responsive, accessibility, performance, and dead-code audit.

## Known technical debt and risks

- Current Compose is development mode, not production mode.
- Authentication still uses a browser-stored bearer token and needs future production hardening.
- Instagram tokens require secure storage/rotation hardening for production.
- Several pages remain large client components combining data access, state, and rendering.
- Legacy page-level shell/auth wrappers may remain temporarily.
- Next.js and `eslint-config-next` major versions should be aligned in a dedicated tooling change.
- E2E Playwright sources are not part of the normal TypeScript project and need an explicit test setup.
- Queue and logs still exist as standalone routes until their secondary-view migration is complete.

## Non-negotiable implementation principles

- Never replace real domain behavior with fixtures in final feature work.
- Preserve backend compatibility during visual refactors.
- Inspect existing implementation before designing a replacement.
- Use reference repositories only for parity research, not as active branches.
- Keep Persian, RTL, Jalali, mobile, accessibility, and channel-capability requirements visible in every acceptance checklist.
