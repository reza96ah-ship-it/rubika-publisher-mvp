# Rubika Publisher Product Architecture

## Purpose

Rubika Publisher should evolve from a polished MVP into a professional publishing operating system for Persian, RTL, commerce-led social content teams. The next work must prioritize durable product capability over repeated page-level UI polish.

The product should help a workspace:

- Define its brand identity and content rules.
- Plan campaigns with goals, dates, assets, and publishing cadence.
- Create posts quickly from templates, brand defaults, and reusable media.
- Review and approve content before publishing.
- Publish reliably with recoverable background jobs.
- Understand what happened through analytics, reports, and operational history.
- Respond to audience activity from a unified inbox.

## Current Product Shape

The current app has a strong MVP foundation:

- Next.js RTL frontend with shell, dashboard, composer, calendar, content, queue, media, logs, analytics, inbox, store, and Rubika settings.
- FastAPI backend with users, stores, Rubika account settings, posts, media assets, and publish attempts.
- Docker Compose local runtime with PostgreSQL, Redis, backend, worker, and frontend.
- A maturing UI system with shared shell, panels, data views, tags, buttons, status badges, and media-aware tables.

The biggest gap is no longer visual polish. The gap is product depth:

- Campaigns are text labels, not first-class planning objects.
- Brand identity is basic store metadata, not a reusable brand kit.
- Composer is functional but not a professional studio with templates, validation, autosave, and version history.
- Publishing uses post status and attempts, but needs durable jobs, idempotency, retry policy, and dead-letter handling.
- Analytics is mostly operational and publish-attempt based, not engagement/event/report based.
- Collaboration, roles, approvals, comments, and audit history do not exist yet.

## Product Pillars

### 1. Brand Operating Layer

The workspace needs a brand kit that controls defaults and visual identity across the app.

Core capabilities:

- Logo or avatar.
- Brand color and secondary accent.
- Tone of voice.
- Default CTA.
- Default hashtag sets.
- Caption footer.
- Product/category positioning.
- Content rules and forbidden phrases.

Primary surfaces:

- Store settings.
- Composer preview.
- Dashboard readiness.
- Content and queue rows.
- Reports and exports.
- Empty states.

### 2. Campaign Operating Layer

Campaigns should become the main planning object, not a free-text field.

Core capabilities:

- Campaign name, goal, status, date range, color, owner, and notes.
- Campaign-specific post list.
- Calendar campaign lanes.
- Media collections linked to campaign.
- Campaign health score.
- Campaign analytics and report export.

Primary surfaces:

- Campaign workspace.
- Calendar.
- Content library.
- Analytics.
- Dashboard.

### 3. Composer Studio

The composer should be the highest-quality workflow in the product.

Core capabilities:

- Three-pane layout: templates/media, editor, schedule/preview/readiness.
- Template picker for launch, sale, reminder, educational, announcement, and support posts.
- Brand-aware defaults.
- Media readiness and validation.
- Autosave and recovery.
- Version history.
- Optional AI assist with human confirmation.

Primary surfaces:

- `/compose`.
- Calendar quick-create drawer.
- Campaign detail page.
- Content inspector.

### 4. Planner

The planner should be a professional calendar, not only a day-card view.

Core capabilities:

- Month, week, list, and campaign lane views.
- Drag/drop rescheduling.
- Conflict warnings.
- Best-time suggestions.
- Bulk scheduling.
- Post inspector.
- Status and campaign filters.

Primary surfaces:

- `/calendar`.
- Campaign detail page.
- Dashboard upcoming schedule.

### 5. Media DAM

The media library should become a lightweight digital asset manager.

Core capabilities:

- Collections.
- Usage map.
- Tags and folders.
- Campaign links.
- Image variants and crop presets.
- Asset health.
- Safe delete with usage warning.

Primary surfaces:

- `/media`.
- Composer.
- Content inspector.
- Campaign media section.

### 6. Approvals And Collaboration

Professional apps reduce risk before publishing.

Core capabilities:

- Roles and permissions.
- Submit for review.
- Approve, reject, request changes.
- Comments and mentions.
- Reviewer notifications.
- Approval audit history.

Primary surfaces:

- Review queue.
- Composer.
- Content inspector.
- Notifications.

### 7. Publishing Reliability

Publishing should be job-driven and recoverable.

Core capabilities:

- Durable publish jobs.
- Idempotency keys.
- Retry policy and backoff.
- Dead-letter queue.
- Worker heartbeat.
- Queue depth and latency.
- Failure classification and recovery hints.

Primary surfaces:

- Queue.
- Logs.
- Dashboard operational health.
- Notifications.

### 8. Inbox And Engagement

Inbox should eventually become the daily engagement workspace.

Core capabilities:

- Message/comment threads.
- Assignment.
- Saved replies.
- Resolution state.
- Response SLA.
- Moderation notes.
- In-app and push notifications.

Primary surfaces:

- `/inbox`.
- Dashboard.
- Analytics.

### 9. Analytics And Reporting

Analytics should explain what happened and what to do next.

Core capabilities:

- Analytics event model.
- Post-level performance.
- Campaign-level performance.
- Publish reliability analytics.
- Best-time recommendations.
- Report builder.
- XLSX/PDF export.
- AI-assisted insight summaries.

Primary surfaces:

- `/analytics`.
- Campaign reports.
- Dashboard insights.

## Target Navigation

Primary navigation should be workflow-first:

1. Command Center
2. Compose
3. Planner
4. Campaigns
5. Content
6. Media
7. Queue
8. Inbox
9. Analytics
10. Settings

Settings should remain reachable without scrolling through empty nav space.

## Non-Goals For The Next Phase

- Do not keep changing colors without adding product capability.
- Do not add decorative art unless it clarifies a workflow or brand state.
- Do not build multi-platform abstractions before Rubika publishing is reliable.
- Do not add AI workflows before brand, templates, and human review are defined.
- Do not create new one-off UI components where shared system components can be improved.

## Architecture Decisions

| Decision | Direction |
| --- | --- |
| Product focus | Single-platform Rubika depth first, multi-channel-ready data model second |
| UI strategy | Light professional operational SaaS, not black-heavy or decorative |
| Workflow model | Campaign and composer centered |
| Publishing model | Durable job state machine, not post status alone |
| Analytics model | Event-based analytics, not only publish attempts |
| Collaboration model | Roles, approvals, comments, audit log |
| Quality model | Tests, browser QA, visual regression, and migration verification per phase |

## Definition Of Professional

The app should feel professional when:

- A new workspace can become publish-ready without guessing what to configure.
- A manager can see risk, readiness, and next action from the dashboard.
- A creator can produce a branded post from a template quickly.
- A reviewer can approve or reject content without leaving the app.
- A failed publish can be recovered safely without duplicate sends.
- A campaign can be planned, executed, measured, and exported.
- Every screen is consistent, readable, fast, responsive, accessible, and RTL-safe.
