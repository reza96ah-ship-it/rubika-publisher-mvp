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

## Canonical Navigation Structure

The navigation follows the single-source-of-truth design documented in [docs/NAHRINO_2026_MASTER_RFP_ROADMAP_BACKLOG.md](docs/NAHRINO_2026_MASTER_RFP_ROADMAP_BACKLOG.md).

### Primary Navigation (Desktop + Mobile)
1. **داشبورد** (`/`) - Dashboard overview
2. **ساخت** (`/compose`) - Content creation studio
3. **برنامه‌ریزی** (`/calendar`) - Jalali calendar planner
4. **کمپین‌ها** (`/campaigns`) - Campaign management
5. **محتوا** (`/content`) - Content library
6. **صف انتظار** (`/queue`) - Publishing queue
7. **رسانه** (`/media`) - Media library & editor
8. **پیام‌ها** (`/inbox`) - Notifications & operations
9. **گزارش‌ها** (`/analytics`) - Performance reports
10. **گزارش انتشار** (`/logs`) - Publishing audit trail
11. **کانال‌ها** (`/channels`) - Channel management hub
12. **تنظیمات** (`/store`) - Workspace settings

### Navigation Consolidation Status
✅ Quick Create FAB removed (eliminated 4th redundant entry point)
✅ Queue & Logs as direct nav items (no hidden multiplexing)
✅ Channel pages show breadcrumbs (کانال‌ها > Rubika/Instagram)
✅ Single entry point per major feature
✅ Mobile-first responsive navigation

## Current Phase

Phase 1: Navigation Consolidation (✅ IN PROGRESS)
- Removed Quick Create FAB duplicate
- Exposed Queue and Logs as direct navigation items
- Added breadcrumbs to channel sub-pages
- Next: Media composer hints, campaign unification, final testing

The current branch is focused on professionalizing the multi-channel product shell and campaign workflow before moving into broader navigation simplification, design-system hardening, planner mobile polish, and the Composer Pro rebuild.
