# Nahrino Rebuild From Zero 2026

Source: `Transforming Nahrino into a World-Class Persian-First SocialOps Platform.pdf`, reviewed on 2026-06-04.

This document resets the project direction. The product is no longer a Rubika-only publisher MVP and should not be rebuilt by repeatedly repainting existing screens. Nahrino is a Persian-first, RTL-native, multi-channel SocialOps product.

## Reset Decision

The rebuild starts from the workflow, not from pages:

**Today -> Create -> Planner -> Content -> Media -> Inbox -> Reports -> Settings**

Everything that does not support that path must move into a contextual tool, setup flow, detail drawer, or settings area. The app should feel like a professional social operations system, not a collection of modules.

## Current Score Baseline

| Area | Score | Why |
| --- | ---: | --- |
| Product direction | 6 / 10 | Multi-channel direction exists, but old Rubika/MVP mental model still leaks into surfaces. |
| UI/UX maturity | 3.2 / 10 | Too many repeated actions, filters, cards, routes, and persistent setup blocks. |
| Workflow clarity | 3.5 / 10 | Users do not get one clear daily path. |
| Design system | 4 / 10 | Tokens and components exist, but product-specific patterns are still weak. |
| Competitive readiness | 4.2 / 10 | Useful routes exist, but benchmark-level workflows are not integrated. |

Target: **10 / 10 against Buffer, Later, Planable, Metricool, Hootsuite, Sprout Social, Agorapulse, and Canva-style creative workflows.**

## Product Principles

1. The first screen answers: what needs attention today?
2. One idea can become multiple channel-ready variants.
3. Every channel has visible capabilities, limits, health, and recovery actions.
4. Calendar and campaigns are one planning system, not separate clutter.
5. Content, queue, logs, and posts are one operations model.
6. Setup is a temporary guided path, not permanent dashboard furniture.
7. UI richness must come from real product objects: channel rails, timeline lanes, content previews, inbox threads, reports, and media assets.
8. Mobile is a task workflow, not a compressed desktop layout.
9. Publishing reliability is a first-class product feature.
10. Decorative motion must support state, progress, or attention.

## Do Not Repeat

- Do not add another top tab for the same route group.
- Do not add another duplicate primary button if the header already has the action.
- Do not create another filter bar if a shared saved view/filter system can cover it.
- Do not keep permanent readiness/profile progress on the daily dashboard after setup is complete.
- Do not solve design gaps with only gradients, dark panels, or decorative backgrounds.
- Do not keep Rubika/Instagram as separate product mental models; they are channel accounts.

## 90-Day Rebuild Phases

| Phase | Window | Name | Outcome |
| --- | --- | --- | --- |
| 1 | Weeks 1-2 | Identity + Shell Reset | Persian-first workflow navigation, duplicate route cleanup, setup moved to contextual state. |
| 2 | Weeks 3-4 | Today Command Center | Actionable dashboard with risks, next publish, inbox alerts, campaign pulse, and one insight. |
| 3 | Weeks 5-6 | Design System v2 | Shared product primitives: channel rail, content tile, KPI strip, risk card, timeline lane, report panel. |
| 4 | Weeks 7-8 | Channels Hub | Shared `ChannelAccount` capability model for Rubika, Instagram manual, Instagram API, and future channels. |
| 5 | Weeks 9-10 | Composer Studio | Source idea plus channel variants, preview, readiness, autosave, approval state. |
| 6 | Weeks 11-12 | Publishing Reliability | `PublishJob`, retries, idempotency, dead-letter, manual tasks, worker health, job-first logs. |
| 7 | Month 4 | Planner + Campaign OS | Month/week/list/feed/lane planner, campaign brief, KPI targets, linked posts/media/risks. |
| 8 | Month 4 | Creative Studio | Brand templates, source/variant assets, safe zones, batch channel variants, usage map. |
| 9 | Month 5 | Inbox + Collaboration | Thread model, assignments, saved replies, approvals, comments, audit trail. |
| 10 | Month 5-6 | Reports + Intelligence | Client-ready reports, campaign/channel/content analytics, listening-lite, recommendations. |

## Phase 1 Acceptance Criteria

- Primary navigation is exactly: امروز، ساخت، برنامه‌ریزی، محتوا، رسانه، پیام‌ها، گزارش‌ها، تنظیمات.
- Campaigns and queue are contextual under planning/content, not competing sidebar destinations.
- Rubika, Instagram, and logs are settings/channel/reliability sub-surfaces.
- Header breadcrumb labels match the same workflow language.
- Command palette uses the same naming.
- No completed setup progress is treated as an always-visible dashboard section.
- Mobile nav keeps only the five fastest actions: امروز، برنامه‌ریزی، ساخت، محتوا، گزارش‌ها.

## Immediate Backlog After Phase 1

1. Build Today Command Center around a single compact first viewport.
2. Replace content/queue/logs with one shared operations view model.
3. Build Channels Hub capability matrix and remove channel-specific navigation thinking.
4. Rebuild Composer Studio around source idea and per-channel variants.
5. Rebuild Planner as calendar plus campaign lanes and saved views.
6. Add durable PublishJob engine and job-first recovery UX.

## Phase Gate Rule

Each phase must end with:

- frontend check passing,
- browser smoke test for affected routes,
- commit,
- push,
- short status note with remaining risks.
