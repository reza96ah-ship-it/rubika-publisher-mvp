# Multi-Channel Social Operations Studio

یک وب‌اپ فارسی، راست‌به‌چپ و چندکاناله برای مدیریت محتوا، کمپین، رسانه، زمان‌بندی، انتشار، بازیابی خطا، اینباکس و تحلیل شبکه‌های اجتماعی.

این پروژه از یک MVP روبیکا شروع شد، اما جهت محصول اکنون **مدیریت چندکاناله شبکه‌های اجتماعی** است. روبیکا یکی از کانال‌های انتشار است و Instagram نیز به عنوان کانال دوم با حالت‌های API/دستی در حال اضافه شدن است.

## Current Product Scope

The app currently includes:

- Admin authentication.
- Store/workspace profile and brand defaults.
- Rubika channel setup and publishing.
- Instagram channel foundation with account modes and manual publishing workflow.
- Composer for post creation, media selection, schedule, preview, and readiness.
- Campaign manager.
- Calendar/planner.
- Content library.
- Media library and Persian-first image editor.
- Queue, publish attempts, logs, notifications, and retry/recovery.
- Analytics and inbox foundations.

## Target Product Direction

The target product should compete as a professional Persian-first social management platform:

- Command Center.
- Multi-channel Channels Hub.
- Multi-channel Composer Studio.
- Visual Planner.
- Campaign OS.
- Media Studio and creative variants.
- Approvals and collaboration.
- Reliable publishing operations.
- Inbox and engagement.
- Analytics, reports, listening-lite, and AI-assisted insights.

## Stack

- Frontend: Next.js + Tailwind CSS
- Backend: FastAPI
- Database: PostgreSQL
- Queue: Redis
- Worker: Celery
- Local runtime: Docker Compose on Windows WSL2 Ubuntu

## Run Locally

```bash
cp .env.example .env
docker compose up -d --build
```

Frontend:

```text
http://localhost:3000
```

Backend health:

```text
http://localhost:8000/health
```

Database health:

```text
http://localhost:8000/health/db
```

Database migrations:

```bash
docker compose exec backend alembic current
docker compose exec backend alembic upgrade head
```

## Verification

Frontend:

```bash
docker compose exec frontend npm run check
```

Backend:

```bash
docker compose exec backend python -m compileall app
docker compose exec backend python -m pytest
```

## Product Docs

- [Product Architecture](docs/PRODUCT_ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)
- [Multi-Channel RFP](docs/MULTI_CHANNEL_RFP.md)
- [Domain Model](docs/DOMAIN_MODEL.md)
- [UI/UX System](docs/UI_UX_SYSTEM.md)
- [Image Editor Roadmap](docs/IMAGE_EDITOR_ROADMAP.md)

The older Excel roadmap/RFP/backlog artifact is still available, but the Markdown docs above are now the source of truth:

- [Professional Webapp Roadmap RFP Backlog](outputs/pro_roadmap/Rubika_Publisher_Professional_Webapp_Roadmap_RFP_Backlog.xlsx)

## Current Strategic Gap

The codebase already contains multi-channel features, but some labels, docs, and architecture still reflect the old Rubika-only MVP identity. The next product phase should reset identity and shell/navigation around a Channels Hub before adding more page-level polish.
