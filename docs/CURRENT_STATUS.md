---
project: Nashrino SocialOps Studio
repository: reza96ah-ship-it/rubika-publisher-mvp
canonical_branch: main
status_date: 2026-06-25
active_program: Dashboard V2 preparation and production deployment operational acceptance
next_recommended_branch: feat/dashboard-v2
---

# Current Project Status

Read this file after `AGENTS.md`. Update it whenever a pull request changes the active phase, next step, or a major risk.

## Current repository state

- `main` is the canonical and default branch.
- Accepted application history is consolidated into `main`.
- Production deployment implementation merged through PR #27.
- Compose healthcheck validation was corrected through PR #28.
- Repository-level production CI and image-build acceptance are complete.
- Shared workspace shell cleanup is completed through PR #30.
- Generated browser reports and temporary output artifacts are excluded.
- The active `main` ruleset still requires manual verification in GitHub Settings.

## Completed foundations

- deterministic frontend installation and validation;
- backend compilation, migration, import, and pytest validation;
- Liquid Glass token and material bridge;
- AppShell V2 with shared navigation and mobile drawer;
- shared protected `(workspace)` route layout without URL changes;
- one layout-owned `AuthGate` and one layout-owned `AppShell`;
- no page-level compatibility shell wrappers;
- structural `shell:audit` regression guard in Frontend CI;
- durable repository continuity and contribution guidance.

## Production deployment implementation

The following production assets exist on `main`:

- standalone multi-stage Next.js production image;
- non-root backend production image without reload mode;
- one versioned backend image for API, worker, Beat, and migration services;
- separate `compose.production.yaml` while preserving development Compose;
- internal-only PostgreSQL and Redis networking;
- persistent PostgreSQL, Redis, media, and Beat schedule volumes;
- health-gated startup and one-shot Alembic migration;
- loopback bindings for a host reverse proxy;
- deployment, smoke-check, rollback, backup, and guarded restore scripts;
- production environment template and deployment runbook;
- CI validation of shell syntax, Compose rendering, and clean production image builds.

Repository-level acceptance is complete. M2 remains `in progress` only until a non-production deployment, persistence, backup, restore, rollback, and reverse-proxy drill pass.

## Shared workspace shell ownership

- `frontend/app/(workspace)/layout.tsx` is the sole protected-shell owner.
- Protected pages render route content only.
- Authentication validation runs once per workspace load.
- Notification polling, command-palette shortcuts, mobile haptics, and scroll ownership remain centralized in one AppShell instance.
- Existing route URLs are unchanged.
- `npm run shell:audit` prevents page-level `AuthGate` or `AppShell` ownership from returning.

## Remaining foundation administration

- Verify the `main` repository ruleset and close or update issues #7 and #20.
- Retire obsolete merged branches only after uniqueness and deployment checks.
- Align Next.js and `eslint-config-next` major versions in a dedicated tooling PR.

## Immediate next sequence

### 1. Complete M2 operational acceptance

Use the merged `main` branch and `docs/PRODUCTION_DEPLOYMENT.md`.

Remaining evidence:

- successful non-production deployment and smoke check;
- PostgreSQL and media persistence across recreation;
- working HTTPS reverse proxy, CORS, and OAuth callback routing;
- successful database backup and checksum;
- successful restore and application rollback drills;
- development Compose regression check on the target host.

### 2. Dashboard V2

Recommended branch: `feat/dashboard-v2`

Use real backend data for:

- publishing health;
- next scheduled publication;
- active campaign summary;
- channel readiness;
- approval and failure backlogs;
- operational alerts;
- compact throughput and performance insight.

Do not add full onboarding progress, the full calendar, full campaign reports, duplicate content lists, or permanent queue/log tables to Dashboard.

### 3. Composer and publishing V2

Preserve create/edit, autosave, media, campaigns, readiness, approval, scheduling, previews, automation rules, queue actions, retry, cancel, and manual publication.

### 4. Planner and Jalali calendar V2

Preserve month/week/list modes, filtering, day/post inspection, rescheduling, gap detection, queue secondary view, and agenda-first mobile behavior.

## Current technical risks

- Production assets still need environment-specific operational acceptance.
- Reverse proxy, DNS, HTTPS, OAuth, CORS, and volume behavior vary by host.
- Next.js and `eslint-config-next` major versions are not aligned.
- Browser authentication still relies on localStorage bearer tokens.
- Production credential protection and rotation need later hardening.
- Several route modules remain large and tightly coupled.
- Playwright E2E needs a separately validated toolchain.

## Validation

Frontend:

```bash
cd frontend
npm ci
npm run lint
npm run token:audit
npm run shell:audit
npm run typecheck
npm run test
npm run build
npm audit --omit=dev
```

Development stack:

```bash
docker compose exec frontend npm run check
docker compose exec backend python -m compileall app
docker compose exec backend pytest
```

Production configuration:

```bash
cp .env.production.example .env.production
docker compose --env-file .env.production -f compose.production.yaml config --quiet
docker compose --env-file .env.production -f compose.production.yaml build backend frontend
bash -n scripts/production-common.sh scripts/deploy-production.sh scripts/rollback-production.sh scripts/backup-postgres.sh scripts/restore-postgres.sh scripts/smoke-check-production.sh
```

Use `docs/PRODUCTION_DEPLOYMENT.md` for an actual deployment.

## Status update rule

Every phase-changing PR updates this file, `docs/IMPLEMENTATION_ROADMAP.md` when milestone status changes, and `docs/DECISION_LOG.md` when a durable decision is accepted.
