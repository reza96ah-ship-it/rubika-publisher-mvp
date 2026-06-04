# نشرینو Professional Product Roadmap

This roadmap resets the product direction after benchmarking current social media management leaders. The goal is no longer to keep repainting screens. The goal is to build a Persian-first, RTL-native social operations product with the workflow maturity of Buffer, Hootsuite, Sprout Social, Later, Planable, Metricool/Agorapulse-style reporting, and Canva-like creative continuity.

Every implementation slice must be committed and pushed as a restore checkpoint.

## 2026 Rebuild Source Of Truth

The attached product review PDF triggered a full restart from the first step. The active rebuild control document is now:

`docs/REBUILD_FROM_ZERO_2026.md`

The restart path is:

**امروز -> ساخت -> برنامه‌ریزی -> محتوا -> رسانه -> پیام‌ها -> گزارش‌ها -> تنظیمات**

Any future page, component, route, or action should fit that path. Campaigns, queues, logs, channels, Rubika, and Instagram are contextual sub-surfaces, not competing primary navigation concepts.

## Current Product Score

Current score against top market products: **4.2 / 10 overall**.

Design and user-journey maturity score: **3.2 / 10**.

The app has real modules, working routes, Persian/RTL foundations, Jalali scheduling, publishing operations, media editing, and multi-channel direction. It still feels like a draft beside top products because the modules are not yet unified into a clear social operations system. The biggest gap is not color. It is missing product-specific interaction design, visual planning surfaces, engagement workflows, professional reporting, role-based governance, and a simple daily path.

To reach **10 / 10**, the product must stop behaving like a set of pages and become an integrated operating layer for social teams:

1. Clear daily command center.
2. One channel capability model everywhere.
3. One idea -> per-channel variants.
4. Visual planner with campaign lanes.
5. Real inbox/customer-care workflow.
6. Report builder and decision insights.
7. Creative studio with brand templates and reusable assets.
8. Collaboration, approvals, audit, permissions.
9. Reliable jobs, retries, manual publishing tasks.
10. Mobile-first workflows for quick review, reply, approve, and schedule.

## Benchmark Diagnosis

Professional products share these patterns:

- **Buffer** wins on simplicity: small teams can publish, analyze, engage, use channel groups, AI replies, campaign/tag analytics, and export reports without feeling buried.
- **Hootsuite** wins on breadth: scheduling, publishing, analytics, engagement, custom reporting, approval workflows, social listening, sentiment, competitive benchmarking, unified inbox, and social ads support sit in one platform.
- **Sprout Social** wins on enterprise intelligence: publishing, engagement, listening, customer care, response benchmarking, link tracking, analytics, and mobile workflows are deeply connected.
- **Later** wins on visual planning: visual scheduler, media-first workflow, Link in Bio, content planning, analytics, and creator-friendly presentation.
- **Agorapulse** wins on practical operations: unified inbox, publishing, monitoring, reporting, ROI, shared calendars/approvals, labels, saved replies, and agency workflows.
- **Canva pattern** wins on creative continuity: brand assets, templates, design-to-publish continuity, visual polish, and asset reuse.

## What Top Apps Have That We Still Do Not

| Area | Top app expectation | Current gap | Target |
| --- | --- | --- | --- |
| Navigation | Workflow-first: Publish, Engage, Analyze, Settings | Several module pages still compete for attention | Collapse into daily workflows and contextual tools |
| Dashboard | Daily actions, risks, inbox, next posts, campaign health | Better than before, but still not the product brain | Command Center with actionable queue and insight source |
| Composer | Multi-channel variants, sync toggle, approvals, preview fidelity | One post form still dominates | Source idea + channel variants + review state |
| Calendar | Visual planner, campaign lanes, saved views, bulk actions | Calendar exists but needs strategic lane layer | Planner Pro with month/week/list/lane/feed |
| Campaigns | Brief, audience, KPI, budget, content pillars, report | Campaigns are operational but not strategic enough | Campaign OS with brief, timeline, KPI, export |
| Media | Brand templates, source/variant asset model, creative QA | Editor exists but asset system is not pro-grade | Creative Studio with templates, variants, usage map |
| Inbox | Unified comments/messages, assignments, SLA, saved replies | Inbox is early and not customer-care ready | Engagement workspace with thread model |
| Analytics | Report builder, exports, insights, attribution, comparisons | Analytics is heavy and chart-first | Decision reports with source-backed recommendations |
| Listening | Keywords, competitors, sentiment/topics | Mostly absent | Listening-lite first, API integrations later |
| Governance | Roles, comments, approvals, audit, client review | Partial approvals only | Team/client workflow and permission model |
| Reliability | Durable jobs, idempotency, dead-letter, failure classes | Partial worker/log surfaces | Publishing Reliability Engine |
| Mobile | Quick review, approve, reply, schedule | Responsive pass started, not mobile workflow complete | Mobile-first task surfaces |

## 10 / 10 Product Definition

A 10 / 10 version does not mean “more decoration.” It means:

- The user can understand the next action in five seconds.
- Every page has one primary job.
- Data, media, campaign, and channel state are connected.
- The design language is product-specific: channel rails, campaign timelines, content cards, inbox threads, creative previews, report panels.
- Mobile screens are task-first, not mini desktop pages.
- Reports look client-ready.
- Recovery and limitations are honest.
- AI assists only when grounded in brand rules, channel capabilities, and visible metrics.

## Product Principle

The app must become a connected operating model:

**Command Center -> Campaign -> Create -> Review -> Schedule -> Publish/Recover -> Engage -> Report -> Improve**

This means:

- Setup progress is a one-time guided flow, not permanent dashboard furniture.
- Dashboards show daily work, risks, next actions, and business insights.
- UI richness comes from real content: media thumbnails, channel rails, campaign timelines, report surfaces, inbox threads, and creative assets.
- Decorative backgrounds or color changes are not enough.

## Roadmap Overview

| Phase | Name | Priority | Goal | Status |
| --- | --- | --- | --- | --- |
| 0 | Benchmark + Product System Reset | P0 | Document strategy, UX direction, RFP, backlog | Updated |
| 1 | App Shell + Daily Command Center | P0 | Make the app goal-first, not module-first | Partial |
| 2 | Design System + Brand Language Pro | P0 | Replace template feeling with product-specific UI language | Partial |
| 3 | Channels Hub + Capability Model | P0 | Make every channel honest, inspectable, and reusable | Partial |
| 4 | Composer Studio Pro | P0 | One idea becomes channel-ready variants | Not started |
| 5 | Planner + Campaign Timeline Pro | P1 | Visual planning, campaign lanes, saved views | Partial |
| 6 | Campaign OS Pro | P1 | Strategy, KPI, content plan, report-ready campaigns | Partial |
| 7 | Media + Creative Studio Pro | P1 | Brand templates, variants, creative QA, asset system | Partial |
| 8 | Collaboration + Approvals | P1 | Comments, roles, approvals, review queue, audit | Partial |
| 9 | Publishing Reliability Engine | P0 | Durable jobs, idempotency, retries, dead-letter queue | Partial |
| 10 | Inbox + Engagement Workspace | P1 | Threads, assignment, saved replies, SLA, metrics | Early |
| 11 | Analytics + Reports + Listening | P1 | Decision support, exports, competitor/listening-lite | Early |
| 12 | AI Assistance + Recommendations | P2 | AI grounded in brand rules and real metrics | Not started |
| 13 | Agency/Team Administration | P2 | Multi-workspace, permissions, client review, billing-ready | Not started |

## Phase 0: Benchmark + Product System Reset

Goal: stop the repaint loop and define the product as a professional social operations system.

Scope:

- Create benchmark research with competitor lessons and citations.
- Rewrite RFP for a complete professional product.
- Create implementation backlog by module.
- Rewrite UI/UX system around product-specific visual assets.
- Define what is dashboard, what is setup flow, and what belongs in settings.

Acceptance criteria:

- Product direction is documented.
- Roadmap, RFP, UI/UX system, and backlog agree with each other.
- Future work can be selected from backlog without repeating the same UI color pass.

## Phase 1: App Shell + Daily Command Center

Goal: daily users should see what needs action, not setup or decorative cards.

Scope:

- Keep setup/onboarding contextual only when incomplete.
- Command Center shows today, risks, next publish window, campaign blocks, inbox items, and top insight.
- Primary navigation stays compact: Today, Create, Planner, Content, Media, Inbox, Reports, Settings.
- Settings and channel setup never require scrolling through empty menu space.
- Remove duplicate CTA buttons across header/body.
- Replace generic dashboard cards with:
  - publishing pulse
  - risk queue
  - campaign timeline preview
  - engagement alerts
  - analytics insight card

Acceptance criteria:

- Completed setup does not appear as permanent dashboard content.
- First screen answers: what needs attention now?
- No duplicate primary action appears on the same page.
- Dashboard is useful after 100% setup.

Current status:

- Navigation reset to the rebuild workflow: امروز، ساخت، برنامه‌ریزی، محتوا، رسانه، پیام‌ها، گزارش‌ها، تنظیمات.
- Publishing workspace sub-navigation simplified.
- Guided setup route exists and is contextual.
- Remaining: command center insight architecture, campaign timeline preview, duplicate action audit.

## Phase 2: Design System + Brand Language Pro

Goal: remove the template/skeleton feeling and create a recognizable, premium product language.

Scope:

- Define visual grammar for a social operations product:
  - channel rails
  - campaign timelines
  - content cards
  - media thumbnails
  - inbox threads
  - report panels
  - health/risk maps
- Replace generic card stacks with dense but calm operational surfaces.
- Add responsive page templates: command, table/list, studio, planner, report, settings.
- Create mobile-specific task layouts instead of shrinking desktop pages.
- Standardize empty/loading/error/success states.
- Add motion rules: subtle state transitions, progress, live updates, but no decorative noise.
- Create a Persian typography scale for dense dashboards and creative/editor surfaces.

Acceptance criteria:

- Every page clearly belongs to the same app family.
- Components communicate product meaning, not just color.
- Mobile pages prioritize one task at a time.
- No page feels like a generic dashboard template.

## Phase 3: Channels Hub + Capability Model

Goal: every network is a channel account with explicit capabilities, limitations, status, and recovery.

Scope:

- Shared `ChannelAccount` model.
- Rubika, Instagram personal manual mode, Instagram professional API mode, and future channels.
- Capability matrix: publish, schedule, media types, inbox, analytics, comments, stories/reels, manual-only.
- Token/test health, account eligibility, rate limits, last failure, recovery action.
- Move Rubika/Instagram setup into tabs or drawers inside Channels Hub.
- Keep old `/rubika` and `/instagram` routes as compatibility redirects or deep links.

Acceptance criteria:

- Composer, Planner, Queue, Analytics, and Inbox read the same capability model.
- Personal Instagram is clearly manual/reminder publishing.
- Channel failures link to exact settings/recovery action.

## Phase 4: Composer Studio Pro

Goal: create one campaign idea and tailor it for each channel professionally.

Scope:

- Three-pane layout:
  - left: campaign, objective, template, media/brand kit
  - center: source idea plus channel variants
  - right: preview, readiness, schedule, approval
- Per-channel fields: caption, hashtags, first comment, link/CTA, alt text, media crop, schedule.
- Channel sync on/off: create once, then customize per network.
- Version history and autosave restore.
- Template picker by objective: sale, launch, reminder, education, testimonial, event, support.
- Media editor opens inline as a focused workspace.
- AI draft assistance only after brand rules and templates exist.

Acceptance criteria:

- User can produce Rubika and Instagram variants from one idea.
- Validation is channel-specific and near the relevant field.
- Draft survives refresh.
- Current creation stage is clear but not visually noisy.

## Phase 5: Planner + Campaign Timeline Pro

Goal: planner feels visual, strategic, and operational.

Scope:

- Month, week, list, feed/grid, and campaign-lane views.
- Channel and campaign rails.
- Drag/drop rescheduling with conflict warnings.
- Best-time suggestions v1.
- Saved planner views.
- Bulk move and bulk schedule.
- Right-side inspector for selected day/post.
- Mini Jalali date/time popovers only where needed.

Acceptance criteria:

- Persian labels never clip.
- Campaign lane gives strategic view beyond date boxes.
- Drag/drop changes schedule safely and visibly.
- Channel capabilities affect what can be scheduled.

## Phase 6: Campaign OS Pro

Goal: campaigns become the strategic center, not a filtered list.

Scope:

- Campaign brief: goal, audience, offer, CTA, budget, channel mix, content pillars, KPI target.
- Timeline: planned, draft, review, approved, scheduled, published, failed.
- Linked posts, linked media, owners, approvals, risks.
- Campaign report: HTML first, later PDF/XLSX.
- Competitor/listening-lite notes.
- Templates by campaign type.

Acceptance criteria:

- Campaign page answers: what are we doing, where, when, why, owner, result?
- Report can be shown to a manager/client.
- Campaign health is visible without opening analytics.

## Phase 7: Media + Creative Studio Pro

Goal: media becomes a creative system, not just uploaded files.

Scope:

- Source asset and channel variant relationships.
- Brand templates, watermark/logo blocks, reusable Persian text kits.
- Multi-format exports: square, portrait, story, feed, thumbnail.
- Creative QA: aspect ratio, text density, safe zone, file size, missing alt text.
- Collections, campaign usage map, rights/owner metadata.
- Batch variant generation.
- Professional image editor layout:
  - left layers/assets
  - center canvas
  - right inspector
  - top toolbar
  - bottom zoom/artboard

Acceptance criteria:

- Composer can attach generated variants without leaving workflow.
- Each variant knows source, campaign, channel, and usage.
- Editor feels like a focused studio, not a demo widget.

## Phase 8: Collaboration + Approvals

Goal: support teams, clients, and safer publishing.

Scope:

- Roles: owner, manager, creator, reviewer, client, viewer.
- Permissions for publish, approve, channel setup, delete, report export.
- Comments, mentions, internal-only notes, resolved threads.
- Review queue and request changes workflow.
- External review link for a post/campaign.
- Audit log for sensitive actions.

Acceptance criteria:

- Review context stays on the post/campaign.
- Client-safe and internal-only feedback are separate.
- Only permitted users can publish or configure channels.

## Phase 9: Publishing Reliability Engine

Goal: publishing is recoverable, observable, and channel-safe.

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

- Retry cannot duplicate posts.
- Failure tells user what happened and what to do.
- Manual Instagram tasks can be completed, skipped, reminded, or audited.

## Phase 10: Inbox + Engagement Workspace

Goal: inbox becomes daily engagement operations.

Scope:

- Unified thread model.
- Messages/comments by channel.
- Assignment, saved replies, status, internal notes, SLA.
- Notifications link to exact thread/resource.
- Engagement metrics: unresolved, response time, top topics.

Acceptance criteria:

- User can triage, assign, reply, resolve.
- Empty states explain channel limitations.
- Dashboard and analytics include inbox health.

## Phase 11: Analytics + Reports + Listening

Goal: analytics becomes decision support.

Scope:

- Event and metric snapshot model.
- Channel performance.
- Campaign KPIs.
- Content format and creative variant performance.
- Best-time recommendations.
- Competitor/listening-lite tracker.
- Report builder with HTML, XLSX, PDF later.
- Insight notes with source metric references.

Acceptance criteria:

- Analytics explains what happened, why it matters, and what to do next.
- Reports are client/manager-ready.
- Recommendations cite data source.

## Phase 12: AI Assistance + Recommendations

Goal: AI helps within controlled brand/workflow boundaries.

Scope:

- Brand-aware caption variants.
- Campaign brief generation from structured fields.
- Hashtag/CTA suggestions.
- Report summary from real metrics.
- Failure recovery explanation from known playbooks.
- No AI autopublish without approval.

Acceptance criteria:

- AI output is grounded in brand rules, channel constraints, and visible metrics.
- User can accept/edit/reject.
- AI never hides limitations or invents metrics.

## Phase 13: Agency/Team Administration

Goal: make the product scalable for agencies and teams.

Scope:

- Multiple workspaces/clients.
- Invite users and roles.
- Client-facing review mode.
- Workspace-level reports.
- White-label exports.
- Billing/plan readiness later.

Acceptance criteria:

- Team/user permissions work across workspaces.
- Client review does not expose internal notes.
- Reports can be branded per workspace.

## Release Sequence

| Release | Theme | Core result |
| --- | --- | --- |
| R0 | Product Reset | Strategy, RFP, backlog, UI system aligned |
| R1 | Daily Workflow | Command Center and contextual setup feel professional |
| R2 | Channels + Composer | Channel-aware creation and scheduling |
| R3 | Planner + Campaigns | Visual campaign planning and reporting |
| R4 | Media + Collaboration | Creative system, approvals, comments |
| R5 | Reliability + Inbox | Jobs, recovery, engagement operations |
| R6 | Analytics + Intelligence | Reports, listening, insights, recommendations |
| R7 | Agency Scale | Multi-workspace, client review, white-label reports |

## Quality Gates

- Frontend: `docker compose exec frontend npm run check`
- Backend: compileall and pytest path when backend changes.
- Browser smoke for affected routes.
- RTL/Persian visual review: no clipped labels, no horizontal overflow.
- Accessibility smoke: keyboard focus, contrast, reduced motion.
- Data safety: no secrets in UI/API responses.
- Migrations for schema changes.
- Docs update for architecture/product changes.
- Git commit and push checkpoint.

## Reference Sources

- Buffer overview and analytics/help pages: https://support.buffer.com/article/598-what-is-buffer-and-where-can-i-watch-a-demo
- Hootsuite platform: https://www.hootsuite.com/platform
- Sprout Social listening and G2 2026 report announcement: https://sproutsocial.com/features/social-media-listening/ and https://sproutsocial.com/insights/press/sprout-social-named-1-social-listening-product-in-g2s-2026-winter-reports-achieving-40-top-rankings-overall/
- Later scheduler comparison: https://later.com/blog/best-social-media-schedulers/
- Planable product and collaboration workflow: https://planable.io/product/ and https://planable.io/guides/collaboration-in-planable/
