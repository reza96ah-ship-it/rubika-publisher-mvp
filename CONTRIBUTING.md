# Contributing to Nashrino

This repository uses a lightweight GitHub-flow model. `main` is the canonical integration branch and should always represent the latest accepted application state.

## Branches

Create every change from the latest `main` branch. Use one focused branch per change:

- `feat/<scope>` — new product functionality
- `fix/<scope>` — bug fixes
- `refactor/<scope>` — structural changes without intended business-behavior changes
- `chore/<scope>` — dependencies, CI, build, and maintenance
- `docs/<scope>` — documentation-only changes
- `test/<scope>` — test infrastructure or coverage
- `release/<version>` — temporary release stabilization

Examples:

```text
feat/content-calendar
fix/mobile-navigation-focus
refactor/workspace-route-layout
chore/upgrade-next-eslint
```

Long-lived phase branches are not used for normal development. Merged branches should be deleted after confirming they contain no unique commits.

## Pull requests

Every pull request must:

1. target `main`;
2. describe the user or engineering problem;
3. explain the solution and affected routes;
4. identify API, database, worker, or migration changes;
5. include tests or explain why tests are unchanged;
6. include mobile and RTL verification for frontend work;
7. pass all required CI checks;
8. resolve review conversations before merge.

Use draft pull requests while implementation is incomplete. Mark the pull request ready only when it is reviewable and the branch is rebased or merged with current `main` as needed.

## Required validation

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
```

## Frontend acceptance

Frontend work is incomplete until it has been checked for:

- Persian-first RTL layout;
- Jalali dates where relevant;
- 390 px mobile and 1440 px desktop behavior;
- keyboard navigation and visible focus;
- loading, empty, error, restricted, and disconnected-channel states;
- light, dark, high-contrast, and reduced-motion behavior;
- no horizontal overflow or unintended nested scrolling;
- feature parity with the prior implementation.

## Backend safety

Changes to database models, Alembic migrations, API response contracts, post states, approval states, publishing workers, Rubika or Instagram adapters, automation processing, or Celery scheduling must be called out explicitly in the pull request.

Do not combine large backend behavior changes with unrelated visual refactors.

## Merge policy

Prefer a regular merge commit for large feature histories or repository consolidation. Squash small maintenance and documentation pull requests when a single logical commit is clearer.

Never force-push or delete `main`. Release tags should point to commits already present on `main`.
