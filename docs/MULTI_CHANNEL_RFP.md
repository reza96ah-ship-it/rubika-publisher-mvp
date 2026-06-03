# Multi-Channel Social Management RFP

## 1. Project Summary

Build a Persian-first, RTL-native, professional multi-channel social operations web app. The product must support content creation, visual planning, campaign management, publishing, manual publishing tasks, engagement, analytics, reporting, and channel operations for Rubika, Instagram, and future social networks.

This RFP supersedes the older Rubika-only MVP framing.

## 2. Business Objective

Create a product that can compete with the workflow quality of Buffer, Hootsuite, Sprout Social, Later, Metricool, Planable, and Canva's content planner while serving Persian commerce teams with localized UX, Jalali scheduling, Persian typography, and Rubika-specific publishing.

## 3. Benchmark Findings

| Competitor | Relevant strengths | Product lesson |
| --- | --- | --- |
| Buffer | Friendly scheduling, analytics, engagement, AI assistant, channel management | Keep daily workflows simple and fast |
| Hootsuite | Publishing, engagement, analytics, listening, approvals, benchmarking, enterprise workflows | Governance and recovery must be visible |
| Sprout Social | Publishing, engagement, analytics, listening, care, workflow, AI intelligence | Analytics and inbox should feel business-grade |
| Later | Visual planner, media-first workflow, link-in-bio, social analytics | Planning should be visual and commerce-aware |
| Metricool | Planner, analytics, reports, inbox, smart links, competitor tracking, ads/campaigns | Combine planning, reporting, and operations in one workspace |
| Planable | Collaboration, calendar/grid/feed views, comments, approvals, clients | Review workflow should be native, not bolted on |
| Canva | Templates, brand assets, creative editor, content planner, scheduler | Creative-to-publish continuity is a competitive advantage |

## 4. Current Product Assessment

Score: **6 / 10** against top multi-channel social management tools.

Strengths:

- RTL/Persian app foundation.
- Campaigns, composer, planner, content, queue, media, analytics, inbox, notifications.
- Rubika publishing and Instagram foundation.
- Media editor with Persian fonts and social image editing.
- Backend test coverage and Docker-based local checks.

Gaps:

- Brand/product identity is still Rubika-only.
- Channel setup is split into one-off pages.
- Composer does not yet create per-channel variants from one idea.
- Inbox is not yet a full engagement workspace.
- Analytics lacks true channel metrics, event model, reports, and recommendations.
- Publishing reliability needs durable jobs, idempotency, and dead-letter handling.
- UI needs product-specific visual systems: channel rails, campaign timelines, health maps, and report surfaces.

## 5. Target Users

- Store owner managing multiple social channels.
- Social media manager scheduling campaigns.
- Content creator preparing Persian visual posts.
- Reviewer/manager approving content.
- Agency operator managing client workspaces.

## 6. Core User Journeys

### Journey A: First Setup

1. User signs in.
2. Creates workspace/store identity.
3. Completes brand kit.
4. Connects Rubika.
5. Adds Instagram as API-capable or manual reminder mode.
6. Creates first campaign.
7. Creates and schedules first post.

Acceptance:

- User always knows the next setup step.
- Manual Instagram limitations are explicit.
- Setup progress appears in Command Center.

### Journey B: Campaign Planning

1. User creates a campaign brief.
2. Selects channels, dates, goal, audience, and KPI target.
3. Adds content pillars and planned posts.
4. Assigns media and templates.
5. Reviews timeline and risk.

Acceptance:

- Campaign has a complete plan, linked posts, linked media, and visible health.

### Journey C: Create Multi-Channel Post

1. User starts from campaign, template, or blank idea.
2. Adds media or edits media in studio.
3. Creates source caption.
4. Tailors Rubika and Instagram variants.
5. Checks readiness per channel.
6. Submits for approval or schedules.

Acceptance:

- One idea can produce multiple channel-ready variants.
- Validation is channel-specific and actionable.

### Journey D: Publishing Operations

1. Scheduled jobs enter queue.
2. Worker publishes API/bot-capable channels.
3. Manual channels create manual publish tasks.
4. Failed jobs show reason and recovery action.
5. User can retry, cancel, dead-letter, or mark manual task complete.

Acceptance:

- No duplicate publishing on retry.
- Every failure has a clear recovery path.

### Journey E: Measure And Improve

1. User opens analytics.
2. Filters by channel/campaign/date.
3. Reviews top content, weak content, timing, and campaign KPIs.
4. Exports report.
5. Gets next action recommendation.

Acceptance:

- Analytics explains what to do next and cites source metrics.

## 7. Functional Requirements

### FR1: Product Identity

- Rename user-facing product from Rubika-only identity to a multi-channel identity.
- Keep Rubika as a channel.
- App metadata, shell, README, and docs must align.

### FR2: Channels Hub

- Create shared channel account model.
- Show account status, mode, capability, limitations, token/test health, and recovery actions.
- Support Rubika bot/API-like workflow and Instagram manual/API-capable modes.

### FR3: Composer Studio

- Support source idea plus per-channel variants.
- Validate each channel independently.
- Integrate brand kit, templates, media editor, autosave, versions, and approval.

### FR4: Planner

- Support month, week, list, grid/feed, and campaign lane views.
- Support drag/drop, filters, saved views, best-time suggestions, and conflict warnings.

### FR5: Campaigns

- Add strategy fields, channel mix, KPI targets, content pillars, budget, landing link, and report cadence.
- Provide campaign timeline, linked media, linked posts, health, and export.

### FR6: Media Studio

- Support source/variant relationships.
- Support brand templates, batch variants, channel QA, usage map, rights metadata, and safe delete.

### FR7: Publishing Operations

- Implement durable publish jobs, idempotency, retry/backoff, dead-letter queue, per-channel attempts, and worker health.
- Manual publishing tasks must have complete/cancel/remind states.

### FR8: Collaboration

- Add roles, permissions, comments, mentions, review queue, approval history, and audit log.

### FR9: Inbox

- Add unified thread model, assignment, status, saved replies, SLA, notifications, and engagement metrics.

### FR10: Analytics And Reports

- Add analytics events/metric snapshots, channel metrics, campaign KPIs, report builder, XLSX/PDF/HTML export, best-time recommendations, and competitor/listening-lite.

## 8. Non-Functional Requirements

- RTL and Persian labels must be first-class.
- Jalali date/time must be consistent.
- UI must avoid clipped labels and horizontal overflow.
- Pages must be keyboard navigable.
- Motion must respect reduced-motion.
- Backend state transitions must have tests.
- Every schema change must use migration.
- Secrets must be encrypted or masked in responses.
- Publishing retries must be idempotent.
- Reports must be export-ready and readable.

## 9. UI/UX Requirements

- Use light editorial-operations theme.
- Use product-specific visual language:
  - Channel rails.
  - Campaign timelines.
  - Content preview tiles.
  - Health maps.
  - Report surfaces.
- Avoid generic decorative art, noisy backgrounds, card stacking, and black-heavy shells.
- Real media thumbnails and campaign/channel status should provide visual richness.

## 10. Delivery Phases

| Phase | Name | Priority | Output |
| --- | --- | --- | --- |
| 1 | Product Identity And App Shell Reset | P0 | Channel-neutral app shell and onboarding |
| 2 | Channels Hub And Capability Model | P0 | Unified channels/account setup |
| 3 | Multi-Channel Composer Studio | P0 | Per-channel post variants |
| 4 | Visual Planner And Campaign Timeline | P1 | Professional planner views |
| 5 | Campaign OS Pro | P1 | Strategy, KPI, report-ready campaign workspace |
| 6 | Media Studio And Creative System | P1 | DAM variants, templates, creative QA |
| 7 | Approvals, Collaboration, Governance | P1 | Roles, comments, reviews, audit |
| 8 | Publishing Reliability And Operations | P0 | Durable jobs and recovery |
| 9 | Inbox, Engagement, Notifications | P2 | Threaded engagement workspace |
| 10 | Analytics, Reporting, Listening, AI Insight | P1 | Decision-support analytics |

## 11. Acceptance Gates

Every phase must pass:

- Frontend check.
- Backend tests for backend changes.
- Browser smoke on affected routes.
- Persian/RTL visual review.
- Accessibility smoke.
- Updated docs if product architecture changed.
- Commit and push checkpoint.

## 12. Open Product Decisions

- Final brand name.
- Whether to support agency/client multi-workspace in first production release.
- Which additional social channels are next after Rubika and Instagram.
- Whether AI content assistance is built in-house or integrated later.
- Whether reports should export as PDF directly or print-ready HTML first.

## 13. Reference Sources

- Buffer product and analytics pages: https://buffer.com/ and https://support.buffer.com/article/602-getting-started-with-buffers-analytics-features
- Hootsuite platform page: https://www.hootsuite.com/platform
- Sprout Social publishing/best-time and AI/social intelligence pages: https://sproutsocial.com/features/viralpost/ and https://sproutsocial.com/ai/
- Later scheduler and analytics pages: https://later.com/social-media-scheduler/ and https://later.com/social-media-analytics/
- Metricool product, competitor, and reporting pages: https://metricool.com/, https://help.metricool.com/en/article/competitor-analysis-1vs9jxy/, and https://help.metricool.com/en/article/what-is-metricool-studio-1rzufa0/
- Planable grid/collaboration planning reference: https://help.planable.io/hc/en-us/articles/21715518913308-Grid-View
- Canva content planner/scheduler pages: https://www.canva.com/solutions/content-planning-scheduling/ and https://www.canva.com/pro/content-planner/
- Meta Instagram Platform Content Publishing documentation for API limitations and professional account requirements: https://developers.facebook.com/docs/instagram-platform/content-publishing/
