# Multi-Channel Social Operations Roadmap

This roadmap replaces the Rubika-only product direction with a multi-channel social management rebuild. Every implementation slice should be committed and pushed as a restore checkpoint.

## Benchmark-Derived Product Score

Current app score against top multi-channel tools: **6 / 10**.

Why it is no longer low:

- It has real modules: composer, planner, campaigns, content, media, image editor, queue, logs, analytics, inbox, notifications, Rubika, and Instagram foundation.
- It has a maturing RTL/Persian design system.
- It has backend tests and real publishing reliability work started.

Why it is not yet world-class:

- The product identity is still Rubika-first in names, docs, and shell language.
- Channels are not unified under one account/capability model.
- Composer is not yet a true multi-channel variant studio.
- Analytics and inbox are not deep enough for daily business decisions.
- The UI has consistency, but not yet enough product-specific visual identity, reporting polish, and guided user journey.
- Governance, permissions, durable publish jobs, and auditability still need depth.

## Phase 1: Product Identity And App Shell Reset

Goal: make the app feel like a multi-channel social operations product, not a renamed MVP.

Scope:

- Rename product surfaces from Rubika Publisher to a neutral working name.
- Update README, docs, app shell, sidebar, login, metadata, and environment defaults.
- Replace standalone Rubika/Instagram identity in navigation with a Channels mental model.
- Pin Settings and account actions without scroll problems.
- Remove duplicate primary actions across header/body.
- Create a first-run onboarding route for workspace, brand, channel, campaign, and first post.

Acceptance criteria:

- User sees a multi-channel product identity on first load.
- Rubika and Instagram appear as channels, not the app name.
- Settings are always reachable.
- One global create action exists.
- Onboarding explains next step clearly.

Priority: P0.

## Phase 2: Channels Hub And Account Capability Model

Goal: make every network explicit, inspectable, and honest.

Scope:

- `ChannelAccount` abstraction for Rubika, Instagram, and future networks.
- Account mode: bot/API/manual reminder/disconnected.
- Capability matrix: publish, schedule, media types, analytics, inbox, comments, manual-only.
- Connection health, token age, last test, limitation notes, and recovery actions.
- Move Rubika and Instagram setup into Channels Hub tabs.
- Keep existing Rubika and Instagram routes as redirects or compatibility pages during migration.

Acceptance criteria:

- Channels Hub shows every account and what it can do.
- Personal Instagram is clearly manual/reminder publishing, not automatic API publishing.
- Composer, planner, queue, and logs read channel capabilities from one model.
- Channel failures link to exact recovery action.

Priority: P0.

Current implementation status:

- Rubika settings and Instagram account modes exist separately.
- Per-channel publish attempts exist.
- Manual-ready Instagram workflow exists in queue.
- Shared channel abstraction is not implemented yet.

## Phase 3: Multi-Channel Composer Studio

Goal: turn one idea into channel-ready variants.

Scope:

- Source post idea plus per-channel variant fields.
- Channel tabs for Rubika, Instagram, and future networks.
- Per-channel caption, hashtag, media, alt text, first comment, link, and schedule rules.
- Channel readiness checks using the capability matrix.
- Template picker by objective: launch, sale, reminder, education, announcement, support, story/reel.
- Autosave, draft recovery, and version history.
- Media editor opens inline for selected variant.

Acceptance criteria:

- User can create one campaign post and tailor it per channel.
- Validation explains why a channel can or cannot publish.
- Draft survives refresh.
- Saved versions can be restored.
- The UI has three clear zones: idea/media, content variants, schedule/preview/readiness.

Priority: P0.

## Phase 4: Visual Planner And Campaign Timeline

Goal: match top products' calendar and campaign planning depth.

Scope:

- Month, week, list, grid/feed, and campaign-lane views.
- Channel-colored and campaign-colored visual rails.
- Drag/drop rescheduling with conflict warnings.
- Best-time suggestions v1.
- Bulk schedule and bulk move.
- Campaign timeline with planned, approved, scheduled, published, and failed states.
- Saved planner views.

Acceptance criteria:

- Planner can be filtered by channel, campaign, status, owner, and approval.
- Labels are readable in Persian and never clipped.
- Moving a post updates schedule safely.
- Campaign lane gives a strategic view, not only date boxes.

Priority: P1.

Current implementation status:

- Calendar has month/week/list views, drag/drop, filters, inspector, campaign context, and Rubika readiness warnings.
- It needs channel capability integration, saved views, and stronger visual campaign lanes.

## Phase 5: Campaign OS Pro

Goal: make campaigns the strategic center of the product.

Scope:

- Campaign strategy fields: goal, audience, KPI target, channel mix, budget, landing link, content pillars, report cadence.
- Campaign dashboard with content plan, media, approvals, schedule health, risk, and performance.
- Campaign templates.
- Campaign brief and printable/exportable report.
- Competitor/listening-lite notes for campaign planning.

Acceptance criteria:

- Campaign page can answer: what are we doing, where, when, why, and how is it performing?
- Posts, media, analytics, and reports are linked to the campaign.
- Campaign report can be shared with a manager/client.

Priority: P1.

Current implementation status:

- Campaign model, CRUD, filters, health, linked media/posts, analytics, bulk assignment, CSV, and print report exist.
- Strategy fields and report scheduling are not implemented yet.

## Phase 6: Media Studio And Creative System

Goal: make media assets and image editing feel like a real creative workflow.

Scope:

- Source asset and variant relationship.
- Multi-channel crop/export presets.
- Brand blocks, templates, logo/watermark, reusable text styles.
- Asset rights/owner/lifecycle metadata.
- Collections and campaign usage map.
- Batch variant generation.
- Creative QA: aspect ratio, file size, safe zone, text density, missing alt text.

Acceptance criteria:

- User can create Rubika and Instagram variants from one source.
- Each variant is linked to its source and campaign.
- Composer can attach a variant without leaving the post flow.
- Creative QA warns before schedule.

Priority: P1.

Current implementation status:

- Media library, usage map, safe delete, campaign filters, storage abstraction, image editor, Persian fonts, stickers, variants, effects, brand colors, and composer editor access exist.
- Source/variant relationship, templates, batch export, and channel QA need work.

## Phase 7: Approvals, Collaboration, And Governance

Goal: support teams, clients, and safer publishing.

Scope:

- Roles: owner, manager, creator, reviewer, viewer.
- Permissions for channel setup, approval, publishing, deletion, and reporting.
- Comments and mentions on posts, campaigns, media, and reports.
- Review queue.
- Approval chains and request-changes workflow.
- Audit log for sensitive actions.

Acceptance criteria:

- Only permitted users can approve/publish/channel-configure.
- Review history is visible.
- Comments link to exact resource.
- Audit log records publishing and channel credential decisions.

Priority: P1.

Current implementation status:

- Approval status and review actions exist for posts.
- Comments, roles, permissions, and audit logs do not exist yet.

## Phase 8: Publishing Reliability And Operations

Goal: make publishing recoverable, observable, and channel-safe.

Scope:

- Durable `PublishJob` state machine.
- Idempotency keys and payload hashes.
- Retry/backoff policy.
- Dead-letter queue.
- Worker heartbeat and queue depth.
- Per-channel failure classification.
- Manual publishing task lifecycle.
- Recovery playbooks in queue/logs.

Acceptance criteria:

- Retries do not duplicate posts.
- Worker health is visible.
- Failed jobs can be recovered or dead-lettered.
- Logs explain channel-specific failure.
- Manual Instagram tasks can be completed, skipped, or reminded.

Priority: P0.

Current implementation status:

- Worker, publish attempts, logs, retry, notifications, and per-channel attempts exist.
- Durable jobs and dead-letter queue are not implemented yet.

## Phase 9: Inbox, Engagement, And Notifications

Goal: make the inbox a daily action surface, not a placeholder.

Scope:

- Unified thread model.
- Messages/comments by channel.
- Assignment, saved replies, internal notes, status, and SLA.
- In-app push-style notifications.
- Notification center with read/unread and resource links.
- Engagement analytics: response time, unresolved count, top topics.

Acceptance criteria:

- User can triage, assign, reply, and resolve.
- Notifications link to exact post/thread/job.
- Inbox metrics appear in dashboard and analytics.

Priority: P2.

Current implementation status:

- In-app notifications exist.
- Inbox UI exists but not a full threaded engagement system.

## Phase 10: Analytics, Reporting, Listening, And AI Insight

Goal: become decision-support software, not only a chart page.

Scope:

- Analytics event and metric snapshot model.
- Channel performance.
- Campaign KPIs.
- Content type and creative variant performance.
- Best-time recommendations.
- Competitor/listening-lite tracker.
- Report builder with XLSX/PDF/HTML export.
- AI insight summaries grounded in visible metrics.

Acceptance criteria:

- Analytics says what happened, why it matters, and what to do next.
- Reports are exportable and client-ready.
- Recommendations cite the metric source.
- Competitive/listening notes can inform campaign planning.

Priority: P1.

Current implementation status:

- Analytics page exists with charts and drilldown improvements.
- It needs real channel metrics, event storage, reports, recommendations, and listening/competitor support.

## Release Sequence

| Release | Theme | Core result |
| --- | --- | --- |
| R0 | Stabilize | Current checks pass and branch is pushed |
| R1 | Identity + Channels | Product becomes channel-neutral and setup becomes honest |
| R2 | Composer + Planner | Users create and schedule channel variants professionally |
| R3 | Campaign + Creative | Campaigns, media, and variants become strategic/reusable |
| R4 | Governance + Reliability | Teams can approve, publish, recover, and audit safely |
| R5 | Inbox + Analytics | Users can respond, report, and improve |
| R6 | Advanced Integrations | More channels, exports, listening, smart links, AI summaries |

## Quality Gates For Every Phase

- `docker compose exec frontend npm run check`
- Backend compile/test path for backend changes.
- Migration upgrade/downgrade considered for schema changes.
- Browser smoke on affected routes.
- No horizontal overflow or clipped primary Persian labels.
- Accessibility smoke: keyboard focus, reduced motion, contrast.
- Git commit and push checkpoint.
- Roadmap/RFP updated when architecture changes.

## Naming Direction

Temporary working names to evaluate:

- ChannelFlow
- Neshan Social
- BazaarFlow
- SocialOps Studio
- Persian Social Studio

Recommendation: use a neutral placeholder in code/docs first, such as **SocialOps Studio**, until final branding is chosen.
