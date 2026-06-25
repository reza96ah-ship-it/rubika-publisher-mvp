---
project: Nashrino SocialOps Studio
repository: reza96ah-ship-it/rubika-publisher-mvp
canonical_branch: main
status_date: 2026-06-25
active_program: Liquid Glass modernization and production readiness
next_recommended_branch: chore/production-compose
---

# Current Project Status

This is the first file a new agent should read after `AGENTS.md`. Update it whenever a pull request changes the active phase, next step, or a major risk.

## Current repository state

- `main` is the canonical and default branch.
- Accepted application history has been consolidated into `main`.
- No active feature pull request was open when this status was prepared.
- Generated Playwright reports, traces, test-result bundles, and exported review artifacts have been removed from source control.
- Repository contribution and pull-request governance files exist.
- A branch ruleset JSON was prepared for protecting `main`; the active repository ruleset must be verified manually in GitHub Settings.

## Completed foundation work

### Repository and CI

- Deterministic frontend installation with `npm ci`.
- Frontend lint diagnostics and TypeScript diagnostics available as CI artifacts.
- Token audit added to CI.
- Frontend validation covers lint, token audit, strict typecheck, unit tests, production build, and production dependency audit.
- Backend validation covers compilation, Alembic migrations, app import, and pytest.
- Generated browser reports and temporary output artifacts are ignored and removed.

### Design system

- Existing semantic, density, motion, chart, dark, studio, and high-contrast tokens preserved.
- Liquid Glass material bridge added.
- Fixed ambient mesh added.
- Operational panel, floating glass, and solid dense-surface levels defined.
- Controlled radius hierarchy defined.
- `/design-system` upgraded as a visual acceptance laboratory.

### AppShell and routes

- AppShell V2 implemented.
- Desktop sidebar and mobile navigation use shared navigation metadata.
- Accessible mobile navigation drawer implemented.
- Workspace top bar extracted.
- Main stage is the primary scroll owner.
- Protected routes are organized under shared `(workspace)` layout.
- Existing route URLs remain unchanged.

## Work still pending from the foundation phase

- Remove remaining page-level `AuthGate` and `AppShell` wrappers that are now compatibility no-ops.
- Update older documents that still describe the workspace route-group migration as pending.
- Confirm branch ruleset is active on `main`.
- Close or update GitHub issues #7 and #20 after their final acceptance conditions are verified.
- Remove obsolete merged branches only after confirming they have no unique commits and the deployed application is verified.

## Immediate next sequence

### 1. Production deployment configuration

Recommended branch: `chore/production-compose`

Deliverables:

- production frontend Dockerfile with `next build` and `next start`;
- backend production command without `--reload`;
- immutable application images without source bind mounts;
- production Compose file or override;
- health checks and restart policies;
- internal-only PostgreSQL and Redis exposure where appropriate;
- reverse-proxy-ready network configuration;
- deployment, backup, health verification, and rollback runbooks;
- no secrets committed.

### 2. Remove legacy page shell wrappers

Recommended branch: `refactor/remove-legacy-page-shell-wrappers`

Acceptance:

- exactly one `AuthGate` instance;
- exactly one `AppShell` instance;
- one notification polling loop;
- one command-palette listener;
- one haptic listener;
- all route URLs unchanged;
- full frontend/backend CI passes.

### 3. Dashboard V2

Recommended branch: `feat/dashboard-v2`

Use real backend data for:

- publishing health;
- next scheduled publication;
- active campaign summary;
- channel readiness;
- approval and failure backlog;
- operational alerts;
- compact performance and throughput insight.

Do not reintroduce onboarding progress, full calendar, full campaign reports, or duplicate content lists into Dashboard.

### 4. Composer and publishing workflow V2

Preserve create/edit, autosave, media, image editing, campaigns, channel readiness, approvals, scheduling, previews, Instagram automation rules, queue actions, retry, cancel, and manual publication.

### 5. Planner and Jalali calendar V2

Preserve month/week/list modes, filters, day and post inspection, rescheduling, gap detection, queue secondary view, and agenda-first mobile behavior.

## Current technical risks

- Development Compose is still being used on the server unless production Compose has been created outside this repository.
- Next.js and `eslint-config-next` major versions are not aligned.
- Browser authentication relies on localStorage bearer tokens.
- Production credential encryption and token rotation need hardening.
- Several page modules remain large and tightly coupled.
- Playwright E2E files need a fully configured, separately validated toolchain.

## Current validation commands

```bash
docker compose exec frontend npm run check
docker compose exec backend python -m compileall app
docker compose exec backend pytest
```

Full local startup:

```bash
cp .env.example .env
docker compose up -d --build
docker compose ps
curl -fsS http://localhost:8000/health
curl -fsS http://localhost:8000/health/db
```

## Status update rule

Every PR that changes phase status must update:

- this file;
- `docs/IMPLEMENTATION_ROADMAP.md` when milestone status changes;
- `docs/DECISION_LOG.md` when a new durable decision is accepted.
