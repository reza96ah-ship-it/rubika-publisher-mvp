# Backend Agent Instructions

Read the root `AGENTS.md` and continuity documents before this file.

## Scope

These instructions apply to `backend/`.

## Architecture

- FastAPI application.
- SQLAlchemy persistence.
- Alembic migrations.
- PostgreSQL.
- Redis.
- Celery worker and Celery Beat.
- Business behavior belongs in services rather than oversized router functions.

## Domain safety

Do not change these semantics without explicit scope, compatibility analysis, tests, and documentation:

- post statuses;
- approval statuses;
- scheduling and reservation behavior;
- publishing retries and stale-job recovery;
- publish-attempt records;
- Rubika adapter behavior;
- Instagram professional-account capability;
- personal-account manual/reminder mode;
- automation event and human-takeover behavior.

## Database changes

Every persistent model change must include:

- an Alembic revision;
- upgrade-path review;
- downgrade/rollback consideration;
- test coverage;
- API compatibility review;
- continuity-document update when domain behavior changes.

Do not edit an already-deployed migration to change history. Add a new revision.

## API changes

- Register new routers in `app/main.py`.
- Use typed request/response schemas.
- Preserve store/workspace scoping.
- Validate permissions and channel capabilities on the backend, not only in UI.
- Return actionable, stable errors where clients need recovery guidance.
- Document breaking changes explicitly.

## Worker changes

Changes to `app/worker.py`, schedules, retries, or adapters require review for:

- idempotency;
- duplicate delivery;
- reservation/locking;
- retry backoff;
- stale-task recovery;
- partial publication;
- auditability;
- rate and policy limits.

## Instagram rules

- Use official Meta capabilities only.
- Professional accounts may use supported OAuth, webhook, publishing, comments, messaging, and private-reply paths.
- Personal accounts remain manual/reminder mode.
- Do not add password login, scraping, spam automation, or cold-DM behavior.

## Security

- Never commit credentials or tokens.
- Avoid logging secrets or full platform tokens.
- Treat production token encryption, rotation, expiry, audit, and secure session handling as explicit security work.
- Review CORS, authentication, and authorization impact for every new endpoint.

## Validation

```bash
python -m compileall app
alembic heads
alembic upgrade head
alembic current
python -c "from app.main import app; print(app.title)"
pytest
```

When runtime behavior changes, also validate with PostgreSQL and Redis through Docker Compose.

## Documentation

Update the decision log, roadmap, current status, and API/feature documentation when domain behavior, schema, deployment, or security posture changes.
