# Nashrino Agent Instructions

This file is the authoritative starting point for any coding agent, assistant, or new chat working on this repository.

## 1. Mandatory startup protocol

Before proposing or changing anything:

1. Confirm the repository is `reza96ah-ship-it/rubika-publisher-mvp`.
2. Confirm the active base branch is `main`.
3. Inspect the latest commit, open pull requests, open issues, and CI status.
4. Read these files in order:
   - `docs/CURRENT_STATUS.md`
   - `docs/AI_CONTEXT.md`
   - `docs/IMPLEMENTATION_ROADMAP.md`
   - `docs/DECISION_LOG.md`
   - `docs/REPO_MAP.md`
   - `docs/NAHRINO_2026_MASTER_RFP_ROADMAP_BACKLOG.md`
   - `CONTRIBUTING.md`
5. Inspect the affected code and tests before making assumptions.
6. State the exact current phase and proposed branch before implementation.

Do not rely on previous chat memory. The repository documents and current GitHub state are the source of truth.

## 2. Source-of-truth priority

When sources disagree, use this order:

1. Current code, migrations, tests, and API behavior on `main`.
2. `docs/CURRENT_STATUS.md` for active work and immediate next steps.
3. `docs/DECISION_LOG.md` for accepted architectural and product decisions.
4. `docs/IMPLEMENTATION_ROADMAP.md` for sequencing and acceptance criteria.
5. `docs/NAHRINO_2026_MASTER_RFP_ROADMAP_BACKLOG.md` for product scope and route ownership.
6. Older documentation and closed PR descriptions.
7. Reference repositories only when explicitly needed for feature parity.

## 3. Repository roles

- `rubika-publisher-mvp`: the only active and canonical product repository.
- `reza96ah-ship-it/publisher`: frontend feature-parity reference only.
- `reza96ah-ship-it/publish-new`: design-system and frontend-architecture reference only.

Never implement new production work in the reference repositories.

## 4. Product identity

- Product name: `نشرینو` / Nashrino.
- Product type: Persian-first, RTL-native, Jalali-native, multi-channel SocialOps platform.
- Primary channels: Rubika and Instagram.
- Target users: store owners, social-media operators, campaign managers, agencies, and team leads.
- Core principle: improve workflow clarity without reducing existing capability.

## 5. Current stack

### Frontend

- Next.js App Router.
- React 19.
- TypeScript with strict checking.
- Tailwind CSS.
- Vitest.
- Persian-first RTL interface with Jalali date flows.

Read the exact installed versions from `frontend/package.json`; do not repeat stale version numbers from old documents.

### Backend

- FastAPI.
- SQLAlchemy.
- Alembic migrations.
- PostgreSQL 16.
- Redis 7.
- Celery worker and Celery Beat.

### Runtime

- Docker Compose.
- Development frontend: `http://localhost:3100`.
- Backend: `http://localhost:8000`.
- Health endpoints: `/health` and `/health/db`.

The current Compose file is development-oriented. Production Compose is a pending roadmap item.

## 6. Canonical navigation

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

Operational routes `/queue` and `/logs` remain valid but should ultimately be secondary views inside Planner and Reports, not permanent primary navigation items.

Do not add a primary navigation item without updating the master roadmap, `docs/CURRENT_STATUS.md`, and this file.

## 7. Current frontend architecture rules

- Protected routes use the shared App Router `(workspace)` layout.
- `AuthGate` and `AppShell` are owned by the shared workspace layout.
- Existing page-level wrappers may still exist as temporary compatibility no-ops; removing them is a pending cleanup task.
- Only the primary workspace stage should scroll.
- AppShell owns workspace overview, notifications, command palette, account actions, mobile navigation, and route-change scroll reset.
- Strong glass material is limited to navigation and small overlays.
- Dense tables, editors, charts, and long lists use solid or nearly solid surfaces.

## 8. Design-system rules

Read:

- `frontend/design-tokens/nashrino.css`
- `frontend/design-tokens/liquid-glass.css`
- `docs/LIQUID_GLASS_DESIGN_TOKENS.md`
- `frontend/app/(workspace)/design-system/`

Required behavior:

- Persian and RTL by default.
- Jalali dates where relevant.
- Minimum 44 px mobile interaction targets.
- No horizontal overflow at 390 px.
- Light, dark, studio, and high-contrast compatibility.
- Reduced-motion and reduced-transparency support.
- No stacked backdrop blur.
- No hardcoded visual values when a token exists.

## 9. Backend safety rules

Do not silently change:

- database models;
- Alembic migrations;
- API response contracts;
- post status or approval-state semantics;
- Celery scheduling;
- publishing retry behavior;
- Rubika adapter behavior;
- Instagram OAuth, webhook, or automation behavior.

Any such change must be explicitly described in the PR, include migration/compatibility analysis, and update relevant tests and documentation.

All new backend routers must be registered in `backend/app/main.py`. All persistent schema changes require Alembic migrations.

Instagram automation is only for professional accounts. Personal Instagram accounts remain reminder/manual mode.

## 10. Branch and PR workflow

- Create focused work from current `main`.
- Preferred prefixes: `feat/`, `fix/`, `refactor/`, `chore/`, `docs/`, `test/`, `release/`.
- One concern per branch and pull request.
- Do not force-push shared or protected branches.
- Do not commit generated reports, traces, build output, dependency folders, or secrets.
- Update `docs/CURRENT_STATUS.md` in every PR that changes phase status or next steps.
- Update `docs/DECISION_LOG.md` for new architectural/product decisions.
- Update `docs/IMPLEMENTATION_ROADMAP.md` when sequencing or acceptance criteria change.

## 11. Required validation

Frontend:

```bash
cd frontend
npm ci
npm run lint
npm run token:audit
npm run typecheck
npm run test
npm run build
npm audit --omit=dev
```

Backend:

```bash
cd backend
python -m compileall app
alembic heads
alembic upgrade head
python -c "from app.main import app; print(app.title)"
pytest
```

Full stack:

```bash
cp .env.example .env
docker compose up -d --build
docker compose ps
curl -fsS http://localhost:8000/health
curl -fsS http://localhost:8000/health/db
```

For frontend changes, also verify 390 px and 1440 px layouts, keyboard focus, RTL ordering, loading, empty, error, restricted, disconnected-channel, dark, and high-contrast states.

## 12. Definition of done

A feature is not complete until it has:

- real API integration or a clearly documented backend dependency;
- loading, empty, error, and recovery states;
- permission/channel capability states;
- mobile and desktop behavior;
- keyboard and screen-reader behavior;
- RTL and mixed Persian/Latin text review;
- automated tests;
- no duplicate shell, polling, or global listeners;
- updated continuity documentation;
- passing required CI.
