# Multi-Channel Social Operations Product Architecture

## Purpose

The product is no longer a Rubika-only publisher. It should become a professional, Persian-first, RTL-native multi-channel social operations platform for commerce teams, creators, agencies, and small brands.

Rubika remains an important publishing channel, but the product identity should be broader:

- Plan campaigns across channels.
- Create channel-specific content from one source idea.
- Manage media, variants, brand assets, and Persian typography.
- Schedule, approve, publish, recover, and audit posts.
- Handle manual and API publishing paths honestly.
- Monitor inbox, notifications, analytics, reports, and channel health.

## Market Benchmark Summary

Current benchmark leaders show a consistent product pattern:

- Buffer: friendly scheduling, channel groups, understandable analytics, engagement inbox, and low-friction creation for small teams.
- Hootsuite: unified publishing, engagement, analytics, listening, benchmarking, governance, and scalable team operations.
- Sprout Social: publishing, engagement, analytics, listening, customer care, workflow management, and deeper AI-assisted intelligence.
- Later: visual planning, media-first workflow, link-in-bio commerce, analytics, and platform-specific visual preview.
- Metricool: planner, analytics, automated reports, inbox, smart links, campaigns, competitor tracking, and ad/campaign management in one workspace.
- Planable: content collaboration, review, approval, comments, calendar/grid/feed previews, and client/team workflow.
- Canva: content creation, templates, brand assets, planner, direct scheduling, social analytics, and design-to-publish continuity.

The winning pattern is not "more colors." It is a connected operating model: create, plan, approve, publish, engage, measure, and improve without jumping between tools.

## Current Product Shape

The current app is past the MVP baseline:

- Next.js RTL frontend with dashboard, composer, calendar, campaigns, content, media, queue, inbox, analytics, logs, store settings, Rubika settings, and Instagram settings.
- FastAPI backend with stores, posts, campaigns, media assets, Rubika account settings, Instagram account modes, publish attempts, notifications, and worker publishing.
- Professional UI components now exist for app shell, cards, data views, inspectors, status badges, planner, image editor, notifications, and Persian typography.
- Media editor includes Persian fonts, text layers, stickers, effects, variants, and composer access.
- Publishing now supports Rubika plus Instagram account modes, including manual-ready personal Instagram flow.

## Primary Product Gaps

### Strategic Identity

- Product name, docs, shell labels, environment defaults, and onboarding still say "Rubika Publisher."
- Navigation treats Rubika as a product pillar instead of one channel inside a channel hub.
- The product has added Instagram but still lacks a shared channel/account abstraction in the UX and domain model.

### User Journey

- The app is still module-first instead of goal-first.
- A professional daily journey should be: Command Center -> Campaign -> Create -> Review -> Schedule -> Publish/Recover -> Engage -> Report.
- Current screens exist, but the handoff between them is still weaker than top tools.

### UI/UX System

- The visual system is more consistent than before, but it still lacks a memorable product identity.
- It needs purposeful visual language: channel rails, campaign timeline patterns, content preview density, health maps, and report-quality surfaces.
- It should not add random decorative art. Any art or pattern must explain brand state, channel state, content flow, or campaign rhythm.

### Channel Management

- Rubika and Instagram should live under a unified Channels area.
- Each channel needs connection status, capabilities, limitations, account mode, publishing eligibility, rate limits, token health, and manual/API workflow disclosure.
- Personal Instagram should be supported as a reminder/manual workflow, not misrepresented as automatic API publishing.

### Composer

- Composer should generate one source idea with per-channel variants.
- It should expose per-channel caption, media, aspect ratio, link, hashtag, alt text, first comment, and scheduling validation.
- It needs saved templates, brand styles, post versions, and stronger draft recovery.

### Planner And Campaigns

- Calendar exists, but market leaders emphasize visual planning, drag/drop rescheduling, campaign lanes, platform previews, approvals, and saved views.
- Campaigns need stronger strategy fields: audience, goal, budget, landing link, channel mix, KPI targets, and report cadence.

### Media And Creative

- The image editor is becoming useful, but the broader creative system needs templates, reusable brand blocks, multi-format exports, and creative QA by channel.
- The DAM needs asset relationships: source, variants, campaign usage, post usage, owner, rights, and lifecycle.

### Inbox And Engagement

- Inbox should become a core workspace with threads, comments/messages, assignment, SLA, saved replies, sentiment tags, and action history.
- Current inbox is not yet competitive with Buffer, Hootsuite, Sprout, or Metricool engagement workflows.

### Analytics And Reporting

- Analytics must move from operational charts toward business reporting.
- Need channel metrics, campaign KPIs, content type performance, best-time recommendations, competitor/listening-lite, exports, and AI-readable insight summaries.

### Reliability And Governance

- Publishing needs durable jobs, idempotency, retry/backoff, dead-letter queue, audit logs, role permissions, and recoverable channel failures.
- Top tools feel professional because failed publishing, approvals, and permissions are explicit, not hidden.

## Product Pillars

### 1. Command Center

Daily executive view for a store/team.

Core capabilities:

- Workspace readiness.
- Channel health.
- Today's publishing plan.
- Risk and blocked items.
- Notifications.
- Campaign progress.
- Next recommended action.

### 2. Channels Hub

Unified home for Rubika, Instagram, and future networks.

Core capabilities:

- Channel accounts.
- Connection mode: API, bot, manual reminder, disconnected.
- Capability matrix.
- Token and health checks.
- Publishing limitations.
- Channel-specific setup checklist.
- Channel logs and recovery.

### 3. Campaign OS

Planning object that ties content, media, channels, goals, and reports together.

Core capabilities:

- Campaign strategy fields.
- Channel mix.
- Content pillars.
- Visual timeline.
- Post plan.
- Media collection.
- Approval status.
- KPI targets and report export.

### 4. Composer Studio

Source idea to multi-channel post variants.

Core capabilities:

- Brand-aware templates.
- Per-channel variants.
- Media and creative editor integration.
- Readiness checks.
- Persian typography.
- Autosave and versions.
- Approval handoff.

### 5. Planner

Professional calendar and scheduling workspace.

Core capabilities:

- Month, week, list, grid/feed, and campaign lane views.
- Drag/drop rescheduling.
- Channel/status/campaign filters.
- Best-time suggestions.
- Conflict warnings.
- Bulk scheduling.

### 6. Media And Creative Studio

Lightweight DAM plus social image editor.

Core capabilities:

- Collections.
- Source/variant relationships.
- Usage map.
- Channel format readiness.
- Templates and brand blocks.
- Persian fonts.
- Social crops and batch variants.

### 7. Approvals And Collaboration

Governance layer for teams and clients.

Core capabilities:

- Roles and permissions.
- Submit/review/approve/request changes.
- Comments and mentions.
- Approval history.
- Review queue.
- Audit log.

### 8. Publishing Operations

Reliable job-based publishing and recovery.

Core capabilities:

- Durable jobs.
- Per-channel attempts.
- Idempotency.
- Retry/backoff.
- Dead-letter queue.
- Manual publish tasks.
- Worker health and logs.

### 9. Inbox And Engagement

Daily response workspace.

Core capabilities:

- Unified threads.
- Assignment.
- Saved replies.
- SLA.
- Resolution state.
- Notifications.
- Basic sentiment/topic tagging.

### 10. Analytics, Reports, And Intelligence

Decision support system.

Core capabilities:

- Channel metrics.
- Campaign reports.
- Content performance.
- Best-time recommendations.
- Competitor/listening-lite.
- Exportable reports.
- AI summaries with source metrics.

## Target Navigation

Navigation should become workflow-first and channel-neutral:

1. Command Center
2. Create
3. Planner
4. Campaigns
5. Content
6. Media Studio
7. Channels
8. Inbox
9. Analytics
10. Publishing Ops
11. Settings

Rules:

- Settings must be pinned and reachable without scrolling.
- Rubika and Instagram should be sub-items or tabs under Channels, not separate product identities forever.
- Global "Create" should appear once in the shell, not duplicated on every page.
- Channel status should be visible without hijacking the header.

## Architecture Decisions

| Decision | Direction |
| --- | --- |
| Product focus | Multi-channel social operations, Persian-first and RTL-native |
| Channel model | Rubika, Instagram, and future networks as accounts under a shared Channels abstraction |
| Instagram personal accounts | Manual/reminder workflow only unless official API capability exists for that account type |
| UI strategy | Light, editorial-operational SaaS with purposeful content/campaign/channel patterns |
| Workflow model | Campaign and composer centered, with command center as daily home |
| Publishing model | Durable per-channel jobs and attempts, not post status alone |
| Analytics model | Event and metric snapshots, not UI-derived summaries |
| Collaboration model | Roles, approvals, comments, assignments, audit logs |
| Creative model | DAM source assets plus non-destructive channel variants |

## Non-Goals

- Do not keep repainting pages without changing capability or workflow.
- Do not make Rubika the product name when the product is multi-channel.
- Do not imply automatic Instagram publishing for personal accounts.
- Do not use decorative backgrounds as a substitute for real information design.
- Do not add AI before data, brand rules, templates, and review controls are reliable.
- Do not split every new channel into a one-off page and one-off data model.

## Definition Of Professional

The app becomes professional when:

- A new user understands what to do in the first 3 minutes.
- A daily user can create, schedule, recover, and report without guessing.
- Every channel clearly shows what is possible, what is blocked, and why.
- Visual design expresses content, campaigns, channels, and status rather than generic decoration.
- Failures are recoverable and auditable.
- Reports can be shown to a client or manager without rewriting them manually.
