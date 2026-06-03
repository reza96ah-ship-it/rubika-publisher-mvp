# RFP: Professional Persian Multi-Channel Social Operations Platform

## 1. Project Summary

Build **SocialOps Studio**, a Persian-first, RTL-native social operations web app for commerce teams, creators, and agencies. The platform must support the complete workflow:

**brand setup -> channel setup -> campaign planning -> creative production -> multi-channel variants -> approval -> scheduling -> publishing/recovery -> engagement -> analytics/reporting -> optimization**

Rubika is one channel. Instagram is one channel. Future networks must fit the same account and capability model.

## 2. Business Objective

Deliver a professional product that can compete in workflow quality with Buffer, Hootsuite, Sprout Social, Later, Planable, Metricool/Agorapulse-style operational tools, and Canva-style creative planning while serving Persian commerce teams with:

- RTL-native interface.
- Jalali scheduling.
- Persian typography and creative assets.
- Rubika publishing.
- Honest Instagram manual/professional account handling.
- Localized brand/content workflows.

## 3. Benchmark Findings

| Benchmark | Observed market pattern | Requirement for SocialOps |
| --- | --- | --- |
| Buffer | Friendly publishing, analytics, reports, comment engagement, small-team simplicity | Keep daily workflows simple and fast |
| Hootsuite | Scheduling, publishing, analytics, engagement, AI listening, sentiment, competitive benchmarking, approvals, custom reports, unified inbox | Build breadth but keep it organized by workflow |
| Sprout Social | Listening, business intelligence, customer care, AI, enterprise analytics and reporting | Analytics must become decision support, not chart decoration |
| Later | Visual-first planning, media library, visual calendar, Link in Bio, AI captions, hashtags, analytics, approval workflows | Product must be media-rich and visual where content matters |
| Planable | Multi-platform grouped posts, per-platform sync on/off, version history, comments, internal/client review, approvals | Collaboration and variants must be native |
| Metricool/Agorapulse pattern | Competitor benchmarking, unified inbox, reports, smart links, agency workflows | Add practical reporting, inbox, and comparison workflows |
| Canva pattern | Brand assets, templates, design-to-publish continuity | Media editor and brand kit must connect directly to composer/planner |

## 4. Current Product Assessment

Score: **5.8 / 10**.

### Strengths

- Real frontend modules: dashboard, composer, calendar, campaigns, content, media, queue, inbox, analytics, logs, store, channels.
- Rubika publishing and Instagram foundation.
- Persian-first frontend and Jalali work already started.
- Media editor with Persian fonts, stickers, effects, variants, and composer access.
- Docker-based frontend checks and backend reliability work exist.

### Gaps

- UI still feels like a collection of modules instead of a unified social operations product.
- Theme lacks product-specific visual assets: campaign rails, channel rails, report surfaces, content previews, health maps.
- Composer is not a true per-channel variant studio.
- Analytics is not yet a report/decision-support system.
- Inbox is not a real engagement workspace.
- Channel capability model is incomplete across Composer, Planner, Queue, Reports, Inbox.
- Collaboration, permissions, comments, and auditability are not production-grade.
- Publishing reliability needs durable jobs and idempotency.

## 5. Target Users

- **Store owner:** wants simple setup, ready posts, clear schedule, and sales-oriented reporting.
- **Social media manager:** plans campaigns, coordinates channels, tracks outcomes.
- **Content creator:** builds Persian visual posts with brand fonts/colors/templates.
- **Reviewer/manager:** approves, requests changes, audits publishing risk.
- **Agency operator:** manages multiple clients, reviews, reports, and white-label output.

## 6. Core User Journeys

### Journey A: First Setup

1. Sign in.
2. Enter brand/workspace identity.
3. Add logo/avatar, colors, CTA, content rules.
4. Configure channels and understand limitations.
5. Create or skip campaign.
6. Create first content.
7. Schedule first post.

Acceptance:

- Setup is a temporary guided flow.
- After completion, setup progress disappears from daily dashboard.
- User can reopen setup from command palette/settings.

### Journey B: Daily Command Center

1. User opens dashboard.
2. Sees operational risks, upcoming posts, failed jobs, inbox alerts, campaign progress, and top insight.
3. Takes the highest-priority next action.

Acceptance:

- Dashboard is useful after setup reaches 100%.
- No permanent setup progress blocks.
- Every surface answers "what should I do now?"

### Journey C: Multi-Channel Content Creation

1. Start from blank, campaign, or template.
2. Attach media or open editor.
3. Create source idea.
4. Tailor variants for Rubika/Instagram/future channels.
5. Validate channel limitations.
6. Submit for review or schedule.

Acceptance:

- One idea can produce multiple variants.
- Per-channel readiness is specific and actionable.
- Draft/version survives refresh.

### Journey D: Campaign Planning

1. Create campaign brief.
2. Define goal, audience, channel mix, KPI, dates, owner.
3. Link posts and media.
4. Review timeline, risks, and performance.
5. Export report.

Acceptance:

- Campaign can be shown to manager/client.
- Campaign status is visible without manually reading many pages.

### Journey E: Publishing Operations

1. Scheduled content enters durable jobs.
2. API/bot channels publish automatically.
3. Manual channels create manual tasks.
4. Failures classify cause and show recovery.
5. User retries, skips, cancels, dead-letters, or completes manual task.

Acceptance:

- Retry does not duplicate posts.
- Every failed job has recovery guidance.

### Journey F: Engagement And Reporting

1. Inbox shows conversations/comments/messages.
2. User assigns, replies, saves response, resolves.
3. Analytics summarizes campaign/channel/content performance.
4. Reports export in manager/client-ready format.

Acceptance:

- Engagement actions are trackable.
- Reports explain what happened and what to do next.

## 7. Functional Requirements

### FR1: App Shell And Command Center

- Workflow-first navigation.
- Contextual setup only while incomplete.
- Daily dashboard with risks, publishing pulse, next posts, campaign blocks, inbox alerts, and insight card.
- Command palette reaches all major workflows.

### FR2: Channels Hub

- Unified `ChannelAccount`.
- Channel modes: Rubika bot, Instagram personal manual, Instagram professional API, manual reminder, disconnected.
- Capability matrix and limitations.
- Token/test health and last failure.
- Channel logs and recovery.

### FR3: Composer Studio

- Source idea plus channel variants.
- Per-channel caption/media/hashtag/link/alt text/schedule fields.
- Sync content on/off across channels.
- Brand kit and templates.
- Autosave, draft recovery, version history.
- Inline media editor.

### FR4: Planner

- Month, week, list, grid/feed, campaign-lane views.
- Channel/campaign/status/owner/approval filters.
- Drag/drop rescheduling.
- Best-time suggestions.
- Saved views.
- Jalali compact date/time popovers.

### FR5: Campaign OS

- Brief, goal, audience, offer, channel mix, budget, KPI target.
- Content pillars and planned posts.
- Linked media.
- Timeline and risk.
- Exportable report.

### FR6: Media And Creative Studio

- Asset library with collections.
- Source/variant relationships.
- Brand templates and reusable Persian text styles.
- Multi-format channel exports.
- Creative QA.
- Usage map and safe delete.

### FR7: Collaboration And Governance

- Roles and permissions.
- Comments, mentions, internal-only notes.
- Approval workflow and review queue.
- Client review mode.
- Audit log.

### FR8: Publishing Reliability

- Durable `PublishJob`.
- Idempotency keys.
- Retry/backoff.
- Dead-letter queue.
- Worker health.
- Manual publishing tasks.
- Per-channel attempts and failure classes.

### FR9: Inbox

- Unified threads.
- Assignment/status/SLA.
- Saved replies.
- Internal notes.
- Notifications.
- Engagement metrics.

### FR10: Analytics, Reports, Listening

- Metric snapshots and analytics events.
- Channel/campaign/content metrics.
- Report builder.
- Export HTML first, PDF/XLSX later.
- Competitor/listening-lite.
- Best-time recommendations.
- AI summaries grounded in metrics.

## 8. UI/UX Requirements

The product must use a **light editorial operations theme**:

- Calm canvas, white work surfaces, hairline borders.
- No black-heavy shell.
- No generic decorative patterns as a substitute for design.
- Real content thumbnails, channel rails, campaign timelines, report surfaces, and health maps carry visual richness.
- Setup surfaces disappear after completion.
- Every page has one primary job.
- No duplicate primary actions in header/body.
- Tables/lists use shared data view patterns.
- Inspector panels show preview first, metadata second, action last.
- Persian text must not clip or overflow.

## 9. Non-Functional Requirements

- RTL-first.
- Jalali date/time consistency.
- Keyboard navigation.
- Reduced-motion support.
- Accessible contrast.
- Responsive desktop/tablet/mobile.
- Secrets masked and protected.
- Backend state transitions tested.
- Migrations for schema changes.
- Reports export cleanly.
- Browser smoke for affected routes.

## 10. Deliverables

- Updated product docs, roadmap, backlog, UI/UX system.
- Iterative implementation commits by phase.
- Tests/checks with each phase.
- Browser smoke evidence for major UI flows.
- Future optional Excel export of backlog if requested.

## 11. Delivery Phases

Use `docs/ROADMAP.md` for the official phase plan and `docs/PRODUCT_BACKLOG.md` for implementation epics/stories.

## 12. Acceptance Gates

Every implementation phase must pass:

- `docker compose exec frontend npm run check`
- Backend tests for backend changes.
- Browser smoke on changed routes.
- RTL/Persian visual review.
- No horizontal overflow.
- No duplicate primary CTAs.
- Updated docs when product/architecture changes.
- Git commit and push checkpoint.

## 13. References

- Buffer product overview: https://support.buffer.com/article/598-what-is-buffer-and-where-can-i-watch-a-demo
- Hootsuite platform: https://www.hootsuite.com/platform
- Sprout Social listening: https://sproutsocial.com/features/social-media-listening/
- Sprout Social G2 2026 announcement: https://sproutsocial.com/insights/press/sprout-social-named-1-social-listening-product-in-g2s-2026-winter-reports-achieving-40-top-rankings-overall/
- Later 2026 scheduler comparison: https://later.com/blog/best-social-media-schedulers/
- Planable product: https://planable.io/product/
- Planable collaboration guide: https://planable.io/guides/collaboration-in-planable/
