# SocialOps Studio Professional Product Roadmap

This roadmap resets the product direction after benchmarking current social media management leaders. The goal is no longer to keep repainting screens. The goal is to build a Persian-first, RTL-native social operations product with the workflow maturity of Buffer, Hootsuite, Sprout Social, Later, Planable, Metricool/Agorapulse-style reporting, and Canva-like creative continuity.

Every implementation slice must be committed and pushed as a restore checkpoint.

## Current Product Score

Current score against top market products: **5.8 / 10**.

The app has real modules, but the product still feels less professional because the modules are not yet unified into a strong operating system. The biggest issue is not only colors or boxes. It is the absence of product-specific visual language, role-based workflows, professional reporting, and a simple daily journey.

## Benchmark Diagnosis

Professional products share these patterns:

- **Buffer** wins on simplicity: clear publishing, analytics, reports, and comment engagement for small teams.
- **Hootsuite** wins on breadth: scheduling, publishing, analytics, engagement, AI listening, sentiment, competitive benchmarking, approvals, custom reporting, and unified inbox.
- **Sprout Social** wins on enterprise intelligence: listening, analytics, customer care, AI, and business-grade reporting.
- **Later** wins on visual planning: visual calendar, media-first workflow, Link in Bio, AI captions, hashtags, analytics, and approvals.
- **Planable** wins on collaboration: grouped multi-platform posts, sync on/off per-platform variants, version history, comments, client review, and approval flow.
- **Metricool/Agorapulse pattern** wins on practical operations: competitor benchmarking, unified inbox, reports, smart links, and agency workflows.
- **Canva pattern** wins on creative continuity: templates, brand kit, design assets, content planner, and export/publish flow.

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
| 0 | Benchmark + Product System Reset | P0 | Document strategy, UX direction, RFP, backlog | In progress |
| 1 | App Shell + Daily Command Center | P0 | Make the app goal-first, not module-first | Partial |
| 2 | Channels Hub + Capability Model | P0 | Make every channel honest, inspectable, and reusable | Partial |
| 3 | Composer Studio Pro | P0 | One idea becomes channel-ready variants | Not started |
| 4 | Planner + Campaign Timeline Pro | P1 | Visual planning, campaign lanes, saved views | Partial |
| 5 | Campaign OS Pro | P1 | Strategy, KPI, content plan, report-ready campaigns | Partial |
| 6 | Media + Creative Studio Pro | P1 | Brand templates, variants, creative QA, asset system | Partial |
| 7 | Collaboration + Approvals | P1 | Comments, roles, approvals, review queue, audit | Partial |
| 8 | Publishing Reliability Engine | P0 | Durable jobs, idempotency, retries, dead-letter queue | Partial |
| 9 | Inbox + Engagement Workspace | P2 | Threads, assignment, saved replies, SLA, metrics | Early |
| 10 | Analytics + Reports + Listening | P1 | Decision support, exports, competitor/listening-lite | Early |
| 11 | AI Assistance + Recommendations | P2 | AI grounded in brand rules and real metrics | Not started |
| 12 | Agency/Team Administration | P2 | Multi-workspace, permissions, client review, billing-ready | Not started |

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

- Navigation simplified.
- Publishing workspace sub-navigation simplified.
- Guided setup route exists and is contextual.
- Remaining: command center insight architecture, campaign timeline preview, duplicate action audit.

## Phase 2: Channels Hub + Capability Model

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

## Phase 3: Composer Studio Pro

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

## Phase 4: Planner + Campaign Timeline Pro

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

## Phase 5: Campaign OS Pro

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

## Phase 6: Media + Creative Studio Pro

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

## Phase 7: Collaboration + Approvals

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

## Phase 8: Publishing Reliability Engine

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

## Phase 9: Inbox + Engagement Workspace

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

## Phase 10: Analytics + Reports + Listening

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

## Phase 11: AI Assistance + Recommendations

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

## Phase 12: Agency/Team Administration

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
