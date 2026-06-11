# Nahrino SocialOps Studio

Persian-first, RTL-native, Jalali-native social operations platform for planning, creating, scheduling, publishing, monitoring, and reporting content across Rubika, Instagram, and future channels.

The project started as a Rubika publisher MVP, but the product direction is now a multi-channel SocialOps web app inspired by the workflow maturity of Buffer, Hootsuite, Sprout Social, and Later, while staying focused on Persian commerce and content teams.

## Current Product Scope

- Admin authentication and workspace/store profile.
- Rubika publishing setup, health checks, worker delivery, retries, and publish attempts.
- Instagram channel foundation with professional-account API path and personal-account reminder/manual mode.
- Multi-channel composer with campaign, schedule, readiness, media, and preview flows.
- Jalali planner/calendar.
- Campaign command center with portfolio, overview, calendar, posts, media, and report views.
- Content library, media library, Persian-first image editor, queue, logs, inbox, notifications, and analytics foundations.

## Canonical Product Plan

The roadmap, RFP, design system direction, backlog, architecture notes, and phase plan now live in one source of truth:

[docs/NAHRINO_2026_MASTER_RFP_ROADMAP_BACKLOG.md](docs/NAHRINO_2026_MASTER_RFP_ROADMAP_BACKLOG.md)

## Stack

- Frontend: Next.js + Tailwind CSS
- Backend: FastAPI
- Database: PostgreSQL
- Queue: Redis
- Worker: Celery
- Local runtime: Docker Compose on Windows WSL2 Ubuntu

## Run Locally

From WSL Ubuntu:

```bash
cd /home/reza/projects/rubika-publisher-mvp
cp .env.example .env
docker compose up -d --build
```

Frontend:

```text
http://localhost:3100
```

The frontend container listens on `3000` internally, but Docker Compose exposes it on host port `3100` by default through `FRONTEND_PORT=3100`, so it does not conflict with local tools that use port `3000`.

Backend:

```text
http://localhost:8000/health
http://localhost:8000/health/db
```

## Useful Commands

```bash
docker compose ps
docker compose logs --tail=120 frontend
docker compose logs --tail=120 backend
docker compose exec backend python -m compileall app
docker compose exec frontend npm run check
```

## Current Phase

The current branch is focused on professionalizing the multi-channel product shell and campaign workflow before moving into broader navigation simplification, design-system hardening, planner mobile polish, and the Composer Pro rebuild.
