# Nashrino Repository Map

This map helps a new agent find the correct implementation area before changing code.

## Root

- `AGENTS.md` — authoritative startup and engineering instructions.
- `README.md` — product overview and local startup.
- `CONTRIBUTING.md` — branch, PR, validation, and merge workflow.
- `docker-compose.yml` — current development stack.
- `.env.example` — environment-variable template; never commit real secrets.
- `.github/workflows/ci.yml` — Frontend and Backend CI.
- `.github/pull_request_template.md` — required PR evidence/checklist.

## Continuity and planning documents

Read in this order:

1. `docs/CURRENT_STATUS.md`
2. `docs/AI_CONTEXT.md`
3. `docs/IMPLEMENTATION_ROADMAP.md`
4. `docs/DECISION_LOG.md`
5. `docs/REPO_MAP.md`
6. `docs/NAHRINO_2026_MASTER_RFP_ROADMAP_BACKLOG.md`
7. `docs/UI_REGRESSION_BASELINE.md`

Additional references:

- `docs/UI_FOUNDATION_IMPLEMENTATION_PLAN.md`
- `docs/APP_SHELL_V2_ARCHITECTURE.md`
- `docs/LIQUID_GLASS_DESIGN_TOKENS.md`
- `docs/INSTAGRAM_COMMENT_TO_DM_AUTOMATION_PRD.md`
- `docs/REPOSITORY_GOVERNANCE.md`
- `docs/HANDOFF_PROMPT.md`

## Frontend

Root: `frontend/`

### Application routes

- `frontend/app/layout.tsx` — root HTML, global theme bootstrap, toast provider.
- `frontend/app/(workspace)/layout.tsx` — shared protected layout with `AuthGate` and `AppShell`.
- `frontend/app/(workspace)/page.tsx` — dashboard entry.
- `frontend/app/(workspace)/compose/` — Composer.
- `frontend/app/(workspace)/calendar/` — Planner and Jalali calendar.
- `frontend/app/(workspace)/campaigns/` — campaign portfolio/workbench.
- `frontend/app/(workspace)/content/` — content library and approvals.
- `frontend/app/(workspace)/media/` — media library/editor.
- `frontend/app/(workspace)/inbox/` — notifications, messages, and automation events.
- `frontend/app/(workspace)/analytics/` — reports and analytics.
- `frontend/app/(workspace)/channels/` — channel hub.
- `frontend/app/(workspace)/rubika/` — Rubika channel detail.
- `frontend/app/(workspace)/instagram/` — Instagram channel detail.
- `frontend/app/(workspace)/queue/` — operational queue route, future Planner sub-view.
- `frontend/app/(workspace)/logs/` — operational logs route, future Reports sub-view.
- `frontend/app/(workspace)/store/` — workspace settings.
- `frontend/app/(workspace)/onboarding/` — setup flow.
- `frontend/app/(workspace)/design-system/` — visual acceptance laboratory.
- `frontend/app/login/` — public login route outside workspace auth.

Some large route implementations are temporarily kept in private `_page.tsx` modules to preserve relative imports during the route-group migration.

### Shell

- `frontend/components/app-shell.tsx` — workspace state, notification polling, command palette, account state, listeners, and composition.
- `frontend/components/auth-gate.tsx` — client session validation.
- `frontend/components/sidebar.tsx` — desktop sidebar and mobile bottom navigation.
- `frontend/components/shell/navigation.ts` — canonical route metadata and active-route logic.
- `frontend/components/shell/workspace-frame.tsx` — fixed canvas and primary scroll stage.
- `frontend/components/shell/workspace-topbar.tsx` — search, breadcrumb, readiness, notifications, and account menu.
- `frontend/components/shell/mobile-navigation-drawer.tsx` — accessible mobile navigation drawer.
- `frontend/components/command-palette.tsx` — Ctrl/Cmd + K navigation/search.

### Shared UI and design system

- `frontend/components/nashrino-ui.tsx` — shared Nashrino primitives.
- `frontend/components/ui/` — lower-level/shared UI components.
- `frontend/design-tokens/nashrino.css` — semantic and legacy-compatible design tokens.
- `frontend/design-tokens/liquid-glass.css` — material, geometry, mesh, responsive, and accessibility tokens.
- `frontend/app/globals.css` — global component and compatibility styles.
- `frontend/tailwind.config.ts` — Tailwind token exposure.
- `frontend/scripts/token-audit.mjs` — design-token validation.

### Frontend domain and API helpers

- `frontend/lib/posts.ts` — post types/API helpers.
- `frontend/lib/workspace.ts` — workspace/store and readiness state.
- `frontend/lib/notifications.ts` — operational notification data and browser synchronization.
- `frontend/lib/media-preview.ts` — authenticated media-preview access.
- `frontend/lib/` — other shared domain, formatting, and API utilities.

Before adding a new helper, search for an existing domain module and avoid duplicate API clients.

### Frontend tests

- `frontend/**/*.test.*` — Vitest tests.
- `frontend/tests/e2e/` — Playwright browser scenarios.
- `frontend/scripts/check-build.mjs` — isolated build validation.

Playwright generated reports and traces must remain untracked.

## Backend

Root: `backend/`

### Application entry and configuration

- `backend/app/main.py` — FastAPI app, middleware, router registration, startup migration/seed behavior, health endpoints.
- `backend/app/config.py` — environment settings.
- `backend/app/database.py` — engine/session/database checks.
- `backend/app/migrations.py` — startup migration integration.
- `backend/app/seed.py` — initial admin seed.

### Data model and schemas

- `backend/app/models.py` — SQLAlchemy persistent models.
- `backend/app/schemas.py` or feature schema modules — request/response models where present.
- `backend/alembic/` — Alembic configuration and revisions.

Every persistent schema change requires a migration and tests.

### Routers

Root: `backend/app/routes/`

Key routers include:

- `auth.py`
- `stores.py`
- `rubika.py`
- `instagram.py`
- `channels.py`
- `campaigns.py`
- `posts.py`
- `media.py`
- `publish_attempts.py`
- `notifications.py`

New routers must be registered in `backend/app/main.py`.

### Services

Root: `backend/app/services/`

Use services for business behavior rather than expanding router functions. Important areas include publishing, Rubika integration, Instagram automation, media operations, notifications, and domain validation.

### Workers and scheduling

- `backend/app/worker.py` — Celery app, scheduled scanning, publishing tasks, automation tasks, and Beat schedule.

Changes here affect operational safety and require careful retry/idempotency analysis.

### Backend tests

Root: `backend/tests/`

Coverage includes authentication/store scope, posts, campaigns, media, channels, publishing, notifications, Instagram OAuth/automation, and other service behavior.

## Storage and runtime

- `storage/media/` — persisted media, ignored except placeholder.
- Docker volume `postgres_data` — database data.
- Docker volume `frontend_node_modules` — container frontend dependencies.
- Docker volume `frontend_next` — development Next.js cache.

Do not delete production data volumes during normal updates.

## Reference repositories

### `reza96ah-ship-it/publisher`

Use only to inspect prior frontend feature behavior, especially advanced Composer, calendar, campaigns, content approvals, media, inbox, analytics, and shell interactions.

### `reza96ah-ship-it/publish-new`

Use only to inspect modern component architecture, route registry, responsive shell patterns, and Liquid Glass visual implementation.

When bringing behavior from a reference repository:

1. confirm the canonical backend contract in `rubika-publisher-mvp`;
2. extract the user flow and edge cases;
3. redesign within current shared components and tokens;
4. do not copy old monolithic architecture blindly;
5. add tests and update continuity documents.
