# Nahrino 2026 Master RFP, Product Roadmap, UX System, and Backlog

Last updated: 2026-06-11  
Product direction: Persian-first multi-channel SocialOps platform  
Canonical status: This file replaces all older roadmap, benchmark, design-system, and backlog documents in `docs/`.

## 1. Executive Summary

Nahrino is no longer a Rubika-only publisher. It must become a professional Persian-first multi-channel management app for small businesses, creators, and content teams who need to plan, create, schedule, publish, monitor, and report content across Rubika, Instagram, and future channels.

The product should compete with the workflow clarity of Buffer, the operational depth of Hootsuite, the analytics and care maturity of Sprout Social, and the visual planning/media experience of Later, while staying simpler, RTL-native, Jalali-native, and tailored to Persian commerce teams.

The current app has strong raw capability: posts, scheduling, campaigns, media, image editing, Rubika publishing, Instagram channel modeling, notifications, analytics, and a modern design token direction. The main product risk is not missing pages; it is fragmented UX: duplicate navigation, repeated cards, old MVP surfaces, inconsistent component hierarchy, too much scroll, and workflows that reveal too many controls before the user asks for them.

The rebuild target is a single coherent product:

- One product identity: `نشرینو`.
- One navigation model: dashboard, create, planner, campaigns, library, media, inbox, reports, channels, settings.
- One visual language: editorial glass, compact command workspaces, soft motion, real content previews, and consistent 8-12px radius rules.
- One workflow model: overview first, details on demand, edit in drawers/modals, actions where the user expects them.
- One channel strategy: Rubika auto-publishing, Instagram professional auto-publishing after Meta OAuth, Instagram personal account reminder/manual mode only.

## 2. Benchmark Positioning

### 2.1 Competitor Signals

Sources reviewed on 2026-06-11:

- Buffer: positioning around creating, organizing, repurposing, scheduling, comments, AI assistance, and simple team collaboration. Source: https://buffer.com/
- Buffer 2026 tool comparison: emphasizes visual calendar, bulk scheduling, unified inbox, robust analytics, and content batching. Source: https://buffer.com/resources/social-media-scheduling-tools/
- Hootsuite: scheduling, content creation, analytics, social listening, unified inbox, routing, saved replies, auto-responses, competitive benchmarking, and report exports. Source: https://www.hootsuite.com/
- Hootsuite plans: unlimited scheduling, bulk scheduling, customizable analytics, message automation, competitor benchmarking, and scheduled report exports. Source: https://www.hootsuite.com/plans
- Sprout Social: publishing, engagement, customer care, advocacy, AI-powered business intelligence, and deeper reporting. Source: https://sproutsocial.com/
- Sprout advocacy: pre-approved sharing, employee advocacy, and impact storytelling. Source: https://sproutsocial.com/features/employee-advocacy/
- Later: visual campaign and creator/influencer management direction with AI-powered insights. Source: https://later.com/
- Meta Instagram Platform: Instagram publishing requires professional account paths and approved platform access; personal accounts must not be promised auto-publishing. Sources: https://developers.facebook.com/docs/instagram-platform/ and https://developers.facebook.com/docs/instagram-platform/content-publishing/

### 2.2 Benchmark Lessons For Nahrino

Nahrino should not copy competitor complexity. It should copy their product discipline:

- Buffer lesson: keep creation and scheduling simple enough for one person.
- Hootsuite lesson: support team operations, inbox, bulk scheduling, and reporting.
- Sprout lesson: treat analytics, care, and business intelligence as premium value.
- Later lesson: make media planning and visual previews feel native, not bolted on.
- Meta lesson: be honest about Instagram account limitations and build professional-account OAuth separately from personal reminder mode.

## 3. RFP Scope

### 3.1 Project Objective

Design and build a professional, production-ready Persian-first SocialOps web app that allows users to:

- Connect channels.
- Create posts and media.
- Edit images with Persian typography assets.
- Plan content in a Jalali calendar.
- Manage campaigns.
- Publish automatically where APIs allow.
- Use manual/reminder workflows where APIs do not allow auto-publishing.
- Monitor queue, attempts, inbox, and notifications.
- Report performance and operational health.

### 3.2 Target Users

1. Store owner  
   Wants quick publishing, simple scheduling, product campaign visibility, and low setup complexity.

2. Social media operator  
   Wants daily queue, calendar, image editing, caption reuse, channel-specific validation, and fast corrections.

3. Campaign manager  
   Wants campaign health, active campaigns, publishing gaps, assets, performance, and exports.

4. Agency/team lead  
   Wants workspace control, approvals, audit logs, role permissions, reporting, and multi-brand support.

### 3.3 Non-Negotiable Product Principles

- Persian-first, not translated later.
- Jalali-first dates and calendar.
- Mobile-friendly every page, not only responsive shrink.
- No duplicate primary actions.
- No permanent onboarding progress after setup is complete.
- Overview first, details/edit on demand.
- Real content previews over decorative empty boxes.
- Consistent component system before new feature surfaces.
- Channel truthfulness: do not claim Instagram personal auto-publish.
- Every workflow must have empty, loading, success, error, and degraded states.

## 4. Product Information Architecture

### 4.1 Final Navigation

Primary navigation:

1. داشبورد
2. ساخت
3. برنامه ریز
4. کمپین ها
5. محتوا
6. رسانه
7. پیام ها
8. گزارش ها
9. کانال ها
10. تنظیمات

Navigation cleanup rules:

- Remove duplicate top menus that repeat sidebar routes unless they are view tabs inside the same page.
- Do not show `عملیات` and `کتابخانه` as separate global destinations if they lead to the same workflow.
- Keep settings pinned at the bottom without creating long empty sidebar space.
- Use command palette for cross-page jumps, not repeated nav blocks inside each page.
- On mobile, use a compact bottom navigation or drawer pattern with only the main workflow routes.

### 4.2 Page Ownership

Dashboard owns:

- Today command view.
- Queue health.
- Next publish.
- Active campaign signal.
- Channel readiness.
- Alerts requiring action.
- Compact trend/donut/gauge summaries.

Dashboard must not own:

- Full campaign detail.
- Full calendar.
- Full onboarding progress after setup.
- Duplicate lists that already exist in content, queue, or campaigns.

Create owns:

- Caption, media, campaign, channel, schedule, preview, readiness.
- Three-pane or staged layout depending on viewport.
- Channel-specific validation.
- Image editor entry point.
- Save draft, schedule, publish now.

Planner owns:

- Month/week/list views.
- Day selection.
- Post preview drawer/modal.
- Drag/reschedule.
- Gap detection.
- Channel/campaign filters.

Campaigns owns:

- Campaign portfolio.
- Selected campaign command deck.
- Campaign workbench tabs: overview, calendar, posts, media, report.
- Edit/create campaign in modal/drawer only.
- Post assignment on demand.

Content owns:

- Unified content library.
- Saved views.
- Filters only once.
- Bulk actions.
- Inline status.
- Open in composer.

Media owns:

- Asset library.
- Image editor.
- Brand kits.
- Persian fonts.
- Stickers/emojis.
- Export variants.
- Attach to posts/campaigns.

Inbox owns:

- Channel messages/comments.
- Notifications.
- Assignments.
- Saved replies.
- Internal notes.
- Read/unread and priority.

Reports owns:

- Operational health.
- Channel performance.
- Campaign performance.
- Exportable reports.
- Benchmark/competitive modules later.

Channels owns:

- Rubika connection.
- Instagram professional OAuth path.
- Instagram personal reminder mode.
- Capability/limitation matrix.
- Channel health tests.

Settings owns:

- Workspace profile.
- Team.
- Roles.
- Brand kit.
- Billing later.
- Security.
- API/webhooks later.

## 5. UX Journeys

### 5.1 First Run Setup

Goal: get from empty app to first scheduled post with the least confusion.

Steps:

1. Create workspace identity.
2. Connect one channel or choose reminder mode.
3. Add brand basics.
4. Create first post.
5. Schedule or publish.

UX rules:

- Onboarding is a task flow, not a permanent dashboard section.
- After completion, show setup only as a small notification or settings checklist.
- Never keep a large "profile is 100%" card forever.

### 5.2 Daily Operator Journey

1. Open dashboard.
2. See next publish, queue risk, messages, and campaign health in one viewport.
3. Click the risky item.
4. Fix in composer, calendar, or campaign.
5. Return to dashboard with status updated.

### 5.3 Campaign Journey

1. Create campaign from campaigns page or composer.
2. Assign posts/media.
3. See campaign command deck.
4. Open overview for health.
5. Open calendar for gaps.
6. Open posts/media for operational fixes.
7. Export report.

### 5.4 Instagram Journey

Professional account:

1. Connect Instagram professional account through Meta OAuth.
2. Validate permissions and account status.
3. Schedule auto-publishing.
4. Record publish attempts and errors.

Personal account:

1. Add username and choose reminder mode.
2. Schedule reminders.
3. Receive manual publish task.
4. Copy caption/open media.
5. Mark complete.

The app must clearly explain that personal Instagram accounts cannot be auto-published through official APIs.

## 6. Visual Design System

### 6.1 Theme Direction

Theme name: Persian Editorial Glass

Design qualities:

- Modern, calm, operational.
- Bright glass surfaces with subtle depth.
- Warm neutral canvas, not black-heavy.
- Blue/violet/cyan/mint accents used as signals, not page-wide decoration.
- Real previews and data visualizations carry the page, not generic cards.

### 6.2 Color Roles

Canvas:

- Light neutral base.
- Very subtle radial art only when it supports hierarchy.
- No loud full-page colorful background.

Surface:

- Glass panels for command/workbench areas.
- Solid white for dense tables and forms when readability matters.
- Muted surface for nested rows only.

Status:

- Success: mint/emerald.
- Info: blue/cyan.
- Warning: amber.
- Alert: rose/red.
- Neutral: slate.

### 6.3 Radius Rules

- Buttons and tags: 8px.
- Compact rows/cards: 8-10px.
- KPI cards and workbench panels: 10-12px.
- Modals/drawers: 12-16px.
- Pills only for dots, avatars, progress ends, and true pill statuses.

No page should mix sharp 2px controls with huge 24px cards.

### 6.4 Motion Rules

Motion should make the app feel alive without becoming decorative:

- KPI hover: soft lift, subtle colored glow, animated live edge.
- Workbench tabs: active surface shift and small transform.
- Drawers/modals: short enter/exit with blur backdrop.
- Progress bars: animated fill on load.
- Calendar post preview: center modal/drawer, not scroll-to-find.
- Image editor: live color preview must be throttled/debounced to avoid update loops.
- Respect reduced-motion preferences.

### 6.5 Data Visualization

Use the right visualization for the user question:

- Dashboard: 3-4 KPI cards, one compact trend, one donut/gauge, alert rail.
- Planner: calendar grid with density dots and preview drawer.
- Campaigns: health, coverage, delivery, risk, trend, status mix.
- Reports: time-series, channel comparison, campaign comparison, export tables.
- Do not use unclear gradients as charts.
- Do not force both horizontal and vertical scroll inside charts.

### 6.6 Component Standards

Core primitives:

- `Button`: one radius system, one height scale, clear icon+label.
- `StatusToken`: consistent sizes and colors.
- `NMetricTile`: all KPI cards across dashboard, calendar, campaigns, reports.
- `WorkspacePanel`: glass variant and dense solid variant.
- `DataTable/DataRow`: unified list/table system.
- `Modal/Drawer`: one accessible overlay system.
- `DatePicker`: mini Jalali popup, not full calendar.
- `ChannelBadge`: channel capability and limitation state.
- `CommandPalette`: navigation and quick actions.

## 7. Technical Architecture

### 7.1 Current App Signals

Frontend routes include:

- `/`
- `/compose`
- `/calendar`
- `/campaigns`
- `/content`
- `/media`
- `/inbox`
- `/analytics`
- `/channels`
- `/instagram`
- `/rubika`
- `/store`
- `/onboarding`
- `/logs`
- `/queue`

Backend routes include:

- auth
- stores
- rubika
- instagram
- channels
- campaigns
- posts
- media
- publish attempts
- notifications

Backend services include:

- publisher
- publishing channel abstraction
- channel account sync
- Rubika client and health
- media storage
- Celery worker for due posts

### 7.2 Target Architecture

Core domains:

- Workspace
- ChannelAccount
- BrandKit
- Campaign
- Post
- MediaAsset
- PublishAttempt
- Notification
- InboxThread
- ReportSnapshot
- User/Role

Channel abstraction:

- Every channel exposes capabilities.
- Capabilities drive UI readiness.
- Publishing worker dispatches by channel.
- Unsupported channel actions create clear manual tasks.

Instagram:

- Professional account: OAuth, content publishing permissions, direct publish.
- Personal account: reminder/manual workflow only.
- UI must show capability difference before scheduling.

### 7.3 Quality Gates

Every phase must pass:

- `docker compose exec frontend npm run check`
- backend compile/test where applicable
- browser smoke test for changed pages
- no horizontal overflow at desktop and mobile
- no duplicate primary actions
- no uncaught runtime errors
- commit and push after each phase

## 8. 10-Phase Rebuild Roadmap

### Phase 0: Product Reset and Documentation

Objective:

Create one canonical product direction and remove stale docs.

Deliverables:

- Master RFP/roadmap/backlog doc.
- Updated README summary.
- Source-of-truth route map.
- Removed duplicate/old docs.

Acceptance:

- `docs/` contains one canonical master document.
- README points to the master document.
- Roadmap no longer conflicts across files.

### Phase 1: Navigation and UX Simplification

Objective:

Remove duplicate menus, duplicate actions, and unclear route groups.

Deliverables:

- Final sidebar.
- Mobile navigation.
- Command palette cleanup.
- Page-level tabs only when they switch views inside the same page.

Acceptance:

- No page has duplicate "new post" buttons unless one is contextual and one global.
- Settings is reachable without scrolling through empty sidebar space.
- Content/library/operations naming is not duplicated.

### Phase 2: Design System Hardening

Objective:

Make all pages obey the same visual primitives.

Deliverables:

- Button standard.
- StatusToken standard.
- NMetricTile standard.
- WorkspacePanel glass/solid variants.
- Data row/list/table standard.
- Modal/drawer standard.
- Jalali mini date picker standard.

Acceptance:

- No page-specific KPI card implementation.
- Buttons and labels have consistent height/radius.
- Token audit trends down.

### Phase 3: Dashboard Rebuild

Objective:

Make the dashboard a compact command center, not a long feed of cards.

Deliverables:

- One viewport desktop summary.
- Mobile-first compact stack.
- Top KPI strip.
- Next publish card linked to planner.
- Active campaign card linked to campaigns.
- Queue health.
- Alerts requiring action.
- Compact trend/donut/gauge.

Acceptance:

- No duplicate campaign/calendar sections below the fold.
- No permanent onboarding progress after complete.
- Works well on phone without excessive scroll.

### Phase 4: Composer Pro

Objective:

Make post creation feel like a professional content studio.

Deliverables:

- Three-pane desktop: content, media, schedule/preview.
- Mobile staged flow.
- Channel-specific validation.
- Campaign assignment.
- Image editor entry.
- Persian font roles.
- Autosave and readiness.

Acceptance:

- No messy campaign/date boxes.
- Mini Jalali date picker opens in place.
- Current step indicator is clear and consistent.
- Image editor is reachable from composer and media.

### Phase 5: Planner Pro

Objective:

Turn calendar into a real publishing planner.

Deliverables:

- Month/week/list modes.
- Compact calendar grid.
- Day detail drawer.
- Post preview modal centered in viewport.
- Drag/reschedule later.
- Channel/campaign filters.
- Jalali mini picker for quick schedule.

Acceptance:

- No two independent scroll panes fighting each other.
- Today and selected day are visually distinct.
- Mobile shows calendar and preview without long confusing scroll.

### Phase 6: Campaign Command Center

Objective:

Make campaigns operational and modern, without duplicate KPIs and two-side clutter.

Deliverables:

- Campaign portfolio deck.
- Selected campaign command deck.
- Overview/calendar/posts/media/report tabs.
- Edit/create modal only on demand.
- Post assignment modal.
- Campaign health model.
- Export report.

Acceptance:

- Campaign KPI cards use `NMetricTile`.
- Detail panel does not repeat top KPIs.
- Active campaign color is calm.
- Campaign page has no horizontal overflow and less nested scrolling.

### Phase 7: Media Studio and Image Editor Pro

Objective:

Make media editing a real creator tool, not a toy editor.

Deliverables:

- Asset library with folders/tags.
- Image editor with layers.
- Persian font kits.
- Stickers/emojis.
- Brand colors.
- Templates/compositions.
- Export sizes.
- Attach edited assets to posts.

Acceptance:

- Color picker live preview is smooth and does not create update loops.
- Effects can be selected and unselected.
- Ready compositions are useful, not messy.
- Mobile layout does not create oversized page height.

### Phase 8: Inbox and Notifications

Objective:

Make the app feel live and operational.

Deliverables:

- Unified notifications.
- Live in-app push.
- Inbox threads.
- Comments/DMs where channel APIs allow.
- Assignments/internal notes later.
- Saved replies later.

Acceptance:

- Notifications open/close correctly.
- Inbox is not just a static list.
- Errors from publish attempts create actionable notifications.

### Phase 9: Reports and Analytics Pro

Objective:

Make analytics understandable and exportable.

Deliverables:

- Channel performance.
- Campaign performance.
- Operational health.
- Queue reliability.
- Content format performance.
- Export CSV/HTML/PDF later.
- Report scheduling later.

Acceptance:

- Charts do not require horizontal and vertical scroll together.
- Axis labels are readable.
- Chart selection can be cleared by clicking outside.
- Month names are Persian/Jalali where appropriate.

### Phase 10: Productionization and Enterprise Readiness

Objective:

Prepare for real users and paid usage.

Deliverables:

- Roles and permissions.
- Audit logs.
- Workspace switching.
- Error monitoring.
- Backup/export.
- Rate limit handling.
- Meta app review readiness.
- Security hardening.
- Billing later.

Acceptance:

- Channel tokens are stored securely.
- Publish worker is observable.
- Failed jobs are recoverable.
- API errors are user-readable.

## 9. Product Backlog

### P0: Must Have

1. Clean navigation duplication.
2. Shared KPI cards across all pages.
3. Shared buttons/tags/labels.
4. Campaign deck without duplicate lower KPIs.
5. Planner mobile redesign.
6. Composer schedule/campaign fields cleanup.
7. Media editor stability.
8. Instagram channel capability matrix.
9. Rubika publish reliability.
10. Publish attempt notifications.
11. Jalali mini date picker standard.
12. Dashboard one-viewport command center.
13. Content library filter cleanup.
14. Reports chart scroll fix.
15. README and docs source of truth.

### P1: Should Have

1. Campaign report export polish.
2. Post preview drawer from calendar.
3. Bulk schedule.
4. Saved content views.
5. Brand kit management.
6. Media templates.
7. Caption snippets.
8. Channel-specific preview.
9. Image export variants.
10. Team assignments.
11. Saved replies.
12. Inbox routing.
13. Analytics comparison periods.
14. Mobile bottom navigation.
15. Onboarding completion migration.

### P2: Could Have

1. AI caption assistant.
2. AI rewrite by channel.
3. AI image background suggestions.
4. Competitor benchmarking.
5. Employee/advocacy sharing.
6. Approval workflow.
7. Report scheduling.
8. Public share links.
9. Webhooks.
10. Agency multi-workspace billing.

### P3: Later

1. TikTok.
2. LinkedIn.
3. YouTube Shorts.
4. Facebook Pages.
5. Social listening.
6. Sentiment analysis.
7. Influencer CRM.
8. Paid campaign ROI.

## 10. Detailed Epic Backlog

### Epic A: Navigation and IA

Stories:

- As a user, I can understand the product route list without duplicate names.
- As a mobile user, I can reach the 5 main workflows quickly.
- As a user, I can open settings without scrolling through empty nav space.
- As a power user, I can use command palette to jump to routes and actions.

Acceptance:

- Sidebar has one route per workflow.
- Page tabs do not duplicate global nav.
- Mobile nav tested at 390px width.

### Epic B: Component System

Stories:

- As a designer/developer, I can use one button system everywhere.
- As a developer, I can use one status token system everywhere.
- As a user, KPI cards look and behave the same across dashboard, calendar, campaigns, and reports.

Acceptance:

- No page-specific KPI CSS unless extending layout only.
- No old sharp buttons.
- Tokens documented and enforced.

### Epic C: Dashboard

Stories:

- As an operator, I see the next publish and queue risk immediately.
- As a manager, I see campaign health without opening campaigns.
- As a mobile user, I see the most important status without long scroll.

Acceptance:

- Desktop important summary fits in first viewport.
- Mobile first screen shows top status and next action.
- No duplicate calendar/campaign blocks.

### Epic D: Composer

Stories:

- As a creator, I can write, attach media, choose campaign, schedule, and preview without messy fields.
- As an Instagram personal user, I see reminder/manual mode.
- As a professional Instagram user, I see OAuth readiness.

Acceptance:

- Date picker is mini and anchored.
- Channel warnings are clear.
- Image editor opens without losing draft.

### Epic E: Planner

Stories:

- As an operator, I can see a month at a glance.
- As an operator, I can click a post and see details in place.
- As a mobile user, I can switch day/post preview without full-page chaos.

Acceptance:

- No horizontal overflow.
- Today/selected day states are distinct.
- Post preview centers or drawers correctly.

### Epic F: Campaigns

Stories:

- As a manager, I can see all campaigns as a compact portfolio.
- As a manager, I can inspect one campaign without entering edit mode.
- As a manager, I can edit only when I ask.
- As an operator, I can assign content in a modal.

Acceptance:

- Edit is not always visible.
- Selected campaign has command deck.
- KPI duplication removed.

### Epic G: Media Studio

Stories:

- As a creator, I can edit image text with Persian fonts.
- As a creator, I can use brand colors and stickers.
- As an operator, I can attach edited images to posts.

Acceptance:

- Layers are selectable/unselectable.
- Color changes are live and stable.
- Font dropdown visibly changes typography.

### Epic H: Channels and Publishing

Stories:

- As a user, I can connect Rubika.
- As a user, I can configure Instagram professional OAuth.
- As a personal Instagram user, I can choose reminder mode.
- As an operator, I can see why a channel is not ready.

Acceptance:

- Capability matrix is visible.
- Worker records per-channel attempts.
- Personal Instagram never promises auto-publish.

### Epic I: Analytics and Reports

Stories:

- As a manager, I can compare channels.
- As a manager, I can export campaign reports.
- As an operator, I can clear chart selection.

Acceptance:

- Charts are readable.
- No nested chart scroll.
- Persian/Jalali labels where appropriate.

### Epic J: Production

Stories:

- As an owner, I can trust token storage.
- As an operator, failed publishes are recoverable.
- As a team, actions are auditable.

Acceptance:

- Sensitive values are masked.
- Failed worker jobs create notifications.
- Audit trail exists for publish/edit actions.

## 11. Definition Of 10/10 Professional

Nahrino reaches 10/10 when:

- A new user can understand the product in 60 seconds.
- A daily operator can fix the next urgent issue in under 3 clicks.
- The dashboard is useful without scrolling.
- The planner feels purpose-built, not a table wrapped in a calendar.
- The campaign page feels like an operations center, not a form dump.
- The composer feels like a studio.
- The media editor can produce usable Persian social graphics.
- The reports explain what happened and what to do next.
- Every page works on mobile.
- The app is honest about channel limitations.
- The design has a recognizable brand language.
- The code has one component system, not page-specific reinventions.

## 12. Immediate Next Implementation Order

1. Finish committing the current campaign command deck cleanup.
2. Update README to point to this master document.
3. Phase 1: navigation simplification and duplicate menu removal.
4. Phase 2: component system hardening for buttons, tokens, panels, and data rows.
5. Phase 3: planner mobile and post preview redesign.
6. Phase 4: composer field cleanup and schedule/campaign mini picker.
7. Phase 5: content library filter cleanup.
8. Phase 6: reports chart scroll and chart interaction fixes.
9. Phase 7: media editor template/font/color stability.
10. Phase 8: Instagram professional OAuth production path.

## 13. Risks

- Over-designing before workflow cleanup.
- Adding animations before layout hierarchy is solved.
- Treating Instagram personal accounts as auto-publish capable.
- Creating more docs than the team reads.
- Continuing page-specific components instead of shared primitives.
- Building feature depth before mobile is fixed.

## 14. Success Metrics

Product:

- First post scheduled under 5 minutes.
- Daily dashboard action resolved under 3 clicks.
- Calendar post preview opens without scroll hunting.
- Campaign edit hidden until requested.
- Media editor export completes without runtime error.

Design:

- 0 duplicate primary actions per page.
- 0 horizontal overflow on mobile.
- Shared KPI component usage across all KPI strips.
- Consistent button and status token sizes.

Engineering:

- Frontend check passes every phase.
- Backend compile/tests pass for backend phases.
- Publish attempts are auditable per channel.
- Worker failures are recoverable.

## 15. Documentation Policy

This file is the source of truth.

Do not create new roadmap files unless this file becomes too large to maintain. If split later, split into:

- `01_RFP.md`
- `02_DESIGN_SYSTEM.md`
- `03_ROADMAP.md`
- `04_BACKLOG.md`
- `05_TECHNICAL_ARCHITECTURE.md`

Until then, keep the docs folder clean and update this file directly.
