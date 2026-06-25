# UI Regression Baseline

This checklist protects the existing Nashrino product while the updated design system is integrated.

## Runtime baseline

From WSL Ubuntu or a Linux shell with Docker Compose:

```bash
cp .env.example .env
docker compose up -d --build
docker compose ps
```

Expected services:

- PostgreSQL
- Redis
- FastAPI backend
- Celery worker
- Celery Beat
- Next.js frontend

Expected endpoints:

- Frontend: `http://localhost:3100`
- Backend health: `http://localhost:8000/health`
- Database health: `http://localhost:8000/health/db`

## Required validation commands

```bash
docker compose exec frontend npm run check
docker compose exec backend python -m compileall app
docker compose exec backend pytest
```

## Viewport matrix

Capture and compare each route at:

- 390 × 844 — narrow mobile
- 430 × 932 — large mobile
- 768 × 1024 — portrait tablet
- 820 × 1180 — large portrait tablet
- 1024 × 768 — compact desktop/tablet landscape
- 1280 × 800 — standard laptop
- 1440 × 900 — primary desktop reference
- 1920 × 1080 — wide desktop

## Route matrix

### Public

- `/login`

### Protected workspace

- `/`
- `/compose`
- `/calendar`
- `/campaigns`
- `/content`
- `/media`
- `/inbox`
- `/analytics`
- `/channels`
- `/rubika`
- `/instagram`
- `/store`
- `/queue`
- `/logs`
- `/onboarding`
- `/design-system`

## State matrix

Every relevant feature must be checked in these states:

- loading;
- populated;
- empty;
- partial/degraded data;
- API error;
- expired or missing authentication;
- permission restricted;
- channel disconnected;
- channel manual-only;
- action in progress;
- action succeeded;
- action failed and recoverable.

## Interaction baseline

Verify before and after each UI migration:

- `Tab` order follows the visual reading order;
- focus indicators are visible;
- `Escape` closes dialogs, drawers, menus, and command palette;
- focus returns to the triggering control;
- `Ctrl/Cmd + K` opens the command palette;
- desktop sidebar navigation works;
- mobile drawer navigation works;
- mobile bottom navigation works;
- page content does not create horizontal overflow;
- only the intended stage or page region scrolls;
- Persian labels and mixed Latin account handles remain correctly ordered;
- Jalali dates remain correct;
- light, dark, and high-contrast themes remain usable;
- reduced-motion preference is respected.

## Functional flows that must not regress

### Authentication and workspace

- sign in;
- sign out;
- restore workspace state;
- onboarding warning;
- workspace profile and branding.

### Composer

- create a draft;
- edit an existing post;
- autosave and restore;
- attach media;
- edit image;
- assign campaign;
- select channels;
- display channel capability warnings;
- request or validate approval;
- schedule future publication;
- configure Instagram automation where supported.

### Publishing

- display scheduled and active work;
- show publish attempts;
- retry one failure;
- retry all failures;
- cancel publication;
- complete manual publication;
- display partial-publication and manual-ready states.

### Planner

- month view;
- week view;
- list view;
- Jalali navigation;
- filters;
- reschedule;
- inspect a post;
- open Composer from the planner.

### Content and campaigns

- saved views;
- search and filters;
- bulk selection;
- approval actions;
- campaign workbench sections;
- associated posts and media.

### Inbox and automation

- operational notifications;
- Instagram automation events;
- read/unread state;
- assignment;
- internal notes;
- saved replies;
- human takeover;
- resolve/reopen behavior.

### Channels

- Rubika health and connection;
- Instagram OAuth;
- professional-account selection;
- personal-account manual/reminder mode;
- webhook health and permissions.

## Regression evidence

Each feature PR should include:

- before and after screenshots for 390 px and 1440 px;
- affected routes;
- changed components;
- API contracts used;
- tests added or updated;
- known limitations;
- accessibility notes;
- performance notes where blur, animation, large lists, or image previews are involved.
