# Nashrino Production Deployment

This runbook deploys Nashrino with immutable application images while preserving the existing development workflow in `docker-compose.yml`.

## Architecture

The production stack is defined in `compose.production.yaml`:

- `frontend`: standalone Next.js runtime;
- `backend`: FastAPI/Uvicorn without reload mode;
- `worker`: Celery worker using the same versioned backend image;
- `beat`: Celery Beat using the same versioned backend image;
- `migrate`: one-shot `alembic upgrade head` service;
- `postgres`: PostgreSQL 16 with a named data volume;
- `redis`: Redis 7 with append-only persistence;
- `storage_data`: persistent media and Beat schedule storage.

PostgreSQL and Redis are attached only to the internal Docker network and have no host port mappings. Frontend and backend bind to loopback by default for a reverse proxy running on the host.

## Prerequisites

- Linux deployment host;
- Docker Engine with the Docker Compose plugin;
- Git for release tags derived from commit SHAs;
- `curl` for smoke checks;
- sufficient disk capacity for images, PostgreSQL, Redis, media, and backups;
- DNS records and an HTTPS reverse proxy.

Verify the runtime:

```bash
docker version
docker compose version
git status --short
```

Deploy only from an accepted commit on `main` or an explicitly approved release commit.

## Configure the environment

Create the host-only production environment file:

```bash
cp .env.production.example .env.production
chmod 600 .env.production
```

Replace every `REQUIRED_...` placeholder. Do not commit `.env.production`.

Important values:

- `APP_SECRET_KEY`: long random application secret;
- `ADMIN_PASSWORD`: initial administrative password;
- `POSTGRES_PASSWORD`: database password;
- `DATABASE_URL`: must contain the same database credentials;
- `NEXT_PUBLIC_API_URL`: public browser-visible backend URL, baked into the frontend image;
- `FRONTEND_PUBLIC_URL`: public frontend origin;
- `CORS_ORIGINS`: exact allowed frontend origins;
- `META_OAUTH_REDIRECT_URI`: public HTTPS callback URL;
- Meta and webhook credentials when Instagram integration is enabled.

Generate random values using an approved secret-management process. A local example is:

```bash
openssl rand -base64 48
```

Do not place secrets in shell history, issue comments, CI logs, or repository files.

## First deployment

From the repository root:

```bash
bash scripts/deploy-production.sh
```

The script:

1. validates Docker, Compose, and the production environment;
2. rejects unresolved placeholders;
3. derives an immutable tag from the current commit unless a tag is supplied;
4. builds the backend and frontend production images;
5. recreates the one-shot migration container;
6. starts the health-gated stack;
7. verifies backend, database, and frontend health;
8. records current and previous image tags in ignored `.deployments/` state.

Use an explicit release tag when needed:

```bash
bash scripts/deploy-production.sh 2026.06.25-1
```

Inspect the stack:

```bash
docker compose --env-file .env.production -f compose.production.yaml ps
docker compose --env-file .env.production -f compose.production.yaml logs --tail=200 backend
docker compose --env-file .env.production -f compose.production.yaml logs --tail=200 worker
docker compose --env-file .env.production -f compose.production.yaml logs --tail=200 beat
```

## Health verification

Run the reusable smoke checks:

```bash
bash scripts/smoke-check-production.sh
```

The check resolves the active host port mappings from Compose and verifies:

- `/health`;
- `/health/db`;
- frontend `/login`.

The migration service must exit successfully before backend, worker, and Beat start. The backend currently also applies migrations during startup as an additional safeguard; the one-shot service ensures migrations complete before application traffic.

## Reverse proxy and HTTPS

Default bindings are:

- frontend: `127.0.0.1:3100`;
- backend: `127.0.0.1:8000`.

A reverse proxy on the host can publish separate HTTPS origins. Example Caddy configuration:

```caddyfile
app.example.com {
    reverse_proxy 127.0.0.1:3100
}

api.example.com {
    reverse_proxy 127.0.0.1:8000
}
```

Set these environment values consistently:

```dotenv
FRONTEND_PUBLIC_URL=https://app.example.com
NEXT_PUBLIC_API_URL=https://api.example.com
CORS_ORIGINS=https://app.example.com
META_OAUTH_REDIRECT_URI=https://api.example.com/instagram/oauth/callback
```

After changing `NEXT_PUBLIC_API_URL`, rebuild and redeploy the frontend because `NEXT_PUBLIC_*` values are embedded during `next build`.

Keep PostgreSQL and Redis unpublished. Do not bind them to public or host interfaces for routine operation.

## Routine deployment

Before every deployment:

```bash
git fetch origin
git checkout main
git pull --ff-only origin main
bash scripts/backup-postgres.sh
bash scripts/deploy-production.sh
```

Review status and logs after deployment:

```bash
bash scripts/smoke-check-production.sh
docker compose --env-file .env.production -f compose.production.yaml ps
docker compose --env-file .env.production -f compose.production.yaml logs --since=10m backend worker beat
```

## PostgreSQL backup

Create a compressed custom-format backup and checksum:

```bash
bash scripts/backup-postgres.sh
```

Default output:

```text
backups/nashrino-postgres-YYYYMMDDTHHMMSSZ.dump
backups/nashrino-postgres-YYYYMMDDTHHMMSSZ.dump.sha256
```

Choose another destination:

```bash
bash scripts/backup-postgres.sh /secure/backup/nashrino
```

Copy backups to protected off-host storage. A backup retained only on the application host is not sufficient disaster recovery.

Recommended policy:

- daily automated database backups;
- encrypted off-host replication;
- retention appropriate to business and legal requirements;
- periodic restore drills on a non-production environment;
- independent backup of persistent media.

## PostgreSQL restore

A restore replaces the active production database. Schedule downtime and verify the selected backup first.

```bash
CONFIRM_RESTORE=YES bash scripts/restore-postgres.sh backups/nashrino-postgres-YYYYMMDDTHHMMSSZ.dump
```

The restore script:

1. verifies the checksum when present;
2. stops frontend, backend, worker, and Beat;
3. creates a pre-restore database backup;
4. recreates the application database;
5. restores the selected dump;
6. reruns migrations through the current application image;
7. restarts the stack and executes smoke checks.

If restore fails after application services stop, inspect PostgreSQL logs and the pre-restore backup before restarting traffic.

## Application rollback

Rollback switches backend and frontend to an image tag already present on the host:

```bash
bash scripts/rollback-production.sh <previous-image-tag>
```

When `.deployments/previous-tag` exists, the argument may be omitted:

```bash
bash scripts/rollback-production.sh
```

Rollback reruns forward migrations and does not automatically downgrade the database. For a release containing an incompatible schema migration, use the documented migration recovery plan or restore the matching pre-deployment database backup.

Verify available images:

```bash
docker image ls 'nashrino-*'
cat .deployments/current-tag
cat .deployments/previous-tag
```

## Media backup

Application media is stored in the `storage_data` named volume. Back it up independently from PostgreSQL. Example archive:

```bash
docker run --rm \
  -v nashrino_storage_data:/source:ro \
  -v "$PWD/backups":/backup \
  alpine:3.20 \
  tar -czf /backup/nashrino-storage-$(date -u +%Y%m%dT%H%M%SZ).tar.gz -C /source .
```

Confirm the actual Compose project name before using a volume name:

```bash
docker volume ls | grep storage_data
```

## Operational commands

Stop application traffic while retaining data:

```bash
docker compose --env-file .env.production -f compose.production.yaml stop frontend backend worker beat
```

Restart application services:

```bash
docker compose --env-file .env.production -f compose.production.yaml up -d --no-build
```

View migration status:

```bash
docker compose --env-file .env.production -f compose.production.yaml run --rm migrate
```

View recent errors:

```bash
docker compose --env-file .env.production -f compose.production.yaml logs --since=30m postgres redis backend worker beat frontend
```

## Updating secrets

1. update the host-only `.env.production` file;
2. rebuild the frontend when a `NEXT_PUBLIC_*` value changes;
3. recreate affected services through `bash scripts/deploy-production.sh`;
4. verify health and integrations;
5. invalidate or rotate the old credential at its provider;
6. record the operational change without recording the secret.

Production credential encryption, token rotation, HTTP-only session migration, rate limiting, and broader security hardening remain separate roadmap work.

## Validation checklist

Before production acceptance:

- [ ] clean checkout builds successfully;
- [ ] `docker compose ... config --quiet` passes;
- [ ] no source bind mounts exist in production services;
- [ ] frontend runs from standalone production output;
- [ ] backend runs without `--reload`;
- [ ] PostgreSQL and Redis have no host ports;
- [ ] migration service completes before application services;
- [ ] PostgreSQL, Redis, media, and Beat schedule survive recreation;
- [ ] backend, database, worker, and frontend health checks pass;
- [ ] HTTPS reverse proxy forwards correct client headers;
- [ ] CORS and OAuth callback URLs use exact production origins;
- [ ] database backup and checksum are created;
- [ ] restore is tested outside production;
- [ ] rollback is tested outside production;
- [ ] no secrets or real backups are committed;
- [ ] development Compose remains functional.
