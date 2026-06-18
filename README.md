# Nahrino SocialOps Studio

Persian-first, RTL-native, Jalali-native social operations platform for planning, creating, scheduling, publishing, monitoring, and reporting content across Rubika, Instagram, and future channels.

The project started as a Rubika publisher MVP, but the product direction is now a multi-channel SocialOps web app inspired by the workflow maturity of Buffer, Hootsuite, Sprout Social, and Later, while staying focused on Persian commerce and content teams.

## Current Product Scope

- Admin authentication and workspace/store profile.
- Rubika publishing setup, health checks, worker delivery, retries, and publish attempts.
- Instagram channel foundation with professional-account API path and personal-account reminder/manual mode.
- Instagram automation roadmap for compliant comment-to-DM/private-reply workflows on professional accounts.
- Multi-channel composer with campaign, schedule, readiness, media, and preview flows.
- Jalali planner/calendar.
- Campaign command center with portfolio, overview, calendar, posts, media, and report views.
- Content library, media library, Persian-first image editor, queue, logs, inbox, notifications, and analytics foundations.

## Canonical Product Plan

The PRD, RFP, roadmap, design direction, backlog, architecture notes, and phase plan live in one source of truth:

[docs/NAHRINO_2026_MASTER_RFP_ROADMAP_BACKLOG.md](docs/NAHRINO_2026_MASTER_RFP_ROADMAP_BACKLOG.md)

The Instagram comment-to-DM automation feature has a dedicated product spec:

[docs/INSTAGRAM_COMMENT_TO_DM_AUTOMATION_PRD.md](docs/INSTAGRAM_COMMENT_TO_DM_AUTOMATION_PRD.md)

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

### Target Primary Navigation
1. **داشبورد** (`/`) - Dashboard overview
2. **ساخت** (`/compose`) - Content creation studio
3. **برنامه‌ریزی** (`/calendar`) - Jalali calendar planner
4. **کمپین‌ها** (`/campaigns`) - Campaign management
5. **محتوا** (`/content`) - Content library
6. **رسانه** (`/media`) - Media library & editor
7. **پیام‌ها** (`/inbox`) - Notifications, comments, DMs, and automation events
8. **گزارش‌ها** (`/analytics`) - Performance and operations reports
9. **کانال‌ها** (`/channels`) - Channel management hub
10. **تنظیمات** (`/store`) - Workspace settings

Operational routes such as `/queue` and `/logs` still exist, but the target product model treats them as secondary views inside Planner/Reports rather than permanent primary navigation items.

### Navigation Consolidation Status
✅ Quick Create FAB removed (eliminated 4th redundant entry point)
✅ Queue & Logs as direct nav items (no hidden multiplexing)
✅ Channel pages show breadcrumbs (کانال‌ها > Rubika/Instagram)
✅ Single entry point per major feature
✅ Mobile-first responsive navigation

## Current Phase

Phase 0/1 refresh: Product documentation, navigation finalization, and Composer Pro.

- Latest pushed work: Composer Pro first-pass layout rebuild.
- Current product planning focus: Instagram professional automation, especially compliant comment-to-DM workflows.
- Next implementation sequence: Composer Pro phase 2, Instagram automation foundation, navigation finalization, Inbox Pro.
