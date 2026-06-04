# Nahrino UI/UX, Theme, Design System RFP, and Rebuild Roadmap 2026

Date: 2026-06-04  
Status: Source of truth before any further UI implementation  
Product direction: Persian-first multi-channel SocialOps platform

## Executive Decision

Stop changing individual screens until the product has a complete design target.

The current app has useful engineering and modules, but visually and structurally it still feels like an MVP dashboard. Changing color, cards, or the sidebar is not enough. Nahrino needs a full product-design rebuild based on a modern, minimal, professional operating-system style.

The target is not "more decoration." The target is:

- fewer repeated boxes,
- fewer page-level scroll traps,
- stronger hierarchy,
- real product objects instead of generic cards,
- mobile-first task flows,
- calmer Persian typography,
- meaningful motion,
- professional visual identity,
- benchmark-level workflows.

## Benchmark Review

### Buffer

What to learn:

- Simple daily publishing path.
- Clear separation between publishing, analytics, engagement, and ideas.
- Low-friction UX for small teams.
- No heavy enterprise clutter in the primary journey.

Nahrino implication:

- Home must be "what should I do today?", not a full report page.
- Composer must start fast.
- Reports must be readable without analyst training.

### Hootsuite

What to learn:

- Broad platform: publishing, scheduling, analytics, engagement, listening, benchmarking, unified inbox, approvals, reports.
- Strong operational depth for mature teams.

Nahrino implication:

- Advanced features should exist, but not all as top-level navigation.
- Listening, reliability, logs, and channel health should be contextual tools.
- Do not make the main UI feel like an enterprise control room too early.

### Sprout Social

What to learn:

- Publishing, engagement, analytics, social listening, customer-care workflows, and mobile workflows are deeply connected.
- Social inbox and reports are treated as business-critical, not secondary pages.

Nahrino implication:

- Inbox must become a real engagement workspace.
- Reports must produce decisions, not just charts.
- Tags, labels, campaigns, and content types must feed analytics.

### Later

What to learn:

- Visual planning is central.
- Calendar, media, grid preview, Link in Bio, and analytics feel creator-friendly.
- The planner is visual, not only table/card based.

Nahrino implication:

- Planner must become visual and media-aware.
- Campaign and channel lanes must replace simple day-card grids.
- Media thumbnails and feed previews are mandatory visual assets.

### Planable

What to learn:

- Collaboration-first content workflow.
- Feed/calendar/grid/list views.
- Native-like post previews.
- Comments, approvals, version history, sync on/off per channel.

Nahrino implication:

- Composer must be rebuilt around one source idea and per-channel variants.
- Review and approval must be visible beside the content, not hidden in status chips.
- Calendar must show real post previews, not abstract boxes.

### Metricool

What to learn:

- Planner, analytics, competitor view, reporting, and channel performance in compact surfaces.
- Dense but scannable operational UI.

Nahrino implication:

- Reports must be compact, visual, and export-ready.
- Dashboards need fewer metrics but stronger insight.
- Competitor/listening-lite can start as a manual tracking feature.

### Agorapulse

What to learn:

- Practical unified inbox.
- Labels, assignment, reports, publishing, and engagement are tied together.
- Operational UX matters more than visual decoration.

Nahrino implication:

- Inbox needs labels, status, assignment, saved replies, and SLA.
- Content and engagement should connect to campaign reporting.

### Canva

What to learn:

- Creative workflow is a competitive advantage.
- Brand Kit, templates, media editing, resize/variants, and design-to-schedule continuity are powerful.

Nahrino implication:

- Media should become a Creative Studio, not just a file library.
- Brand kit must affect composer, media editor, templates, and reports.
- Visual assets are part of the product identity.

## Product Positioning

Nahrino should be:

**A Persian-first SocialOps workspace for teams that plan, create, approve, publish, recover, engage, and report across channels.**

It should not be:

- a Rubika publisher with extra pages,
- a generic admin dashboard,
- a set of disconnected forms,
- a card-heavy template,
- a data wall,
- a decorative landing page inside an app.

## Current UI/UX Diagnosis

### Critical Problems

1. **Old design system dominates every page**
   The same panels, shadows, spacing, and card shapes appear everywhere. This makes pages feel copied.

2. **Too many "two box" layouts**
   Calendar, content, queue, logs, campaigns, compose, analytics, and media often use a list/detail split where both sides scroll.

3. **Nested scroll areas feel unprofessional**
   A professional web app should usually have one page scroll. Detail panels should be drawers, sheets, inspectors, or sticky summaries, not separate scroll prisons.

4. **Navigation still feels module-first**
   Even after simplification, the mental model can drift back to pages: calendar, queue, logs, campaigns, channels, Rubika, Instagram. The real model must be workflow-first.

5. **Dashboard is still too card-based**
   Even the improved home still depends on generic cards. It needs a signature command-center design.

6. **Mobile is not yet a product**
   Mobile currently becomes long stacked desktop content. It needs separate task flows.

7. **Visual identity is not strong enough**
   The app has colors, but not a brand design language. It needs product-specific visual assets: timeline lanes, channel rails, media previews, report pages, inbox threads.

8. **Motion exists but is not systematic**
   Motion should communicate status, selection, progress, save/publish, conflict, and live updates. It should not just decorate cards.

## Target Design Personality

Theme name: **Nahrino Calm Operations**

Keywords:

- modern,
- minimal,
- Persian-first,
- serious but not cold,
- creator-friendly,
- operational,
- premium,
- compact,
- responsive,
- calm motion,
- content-led,
- not decorative.

Visual feel:

- More like a professional productivity workspace than a startup dashboard.
- More like an editorial operations console than a CRM.
- Warmer than Hootsuite/Sprout.
- Less colorful than Canva.
- More visual than Buffer.
- More spacious and less boxed than Metricool.
- More Persian and local than all of them.

## Theme Direction

### Color System

Primary colors:

- Ink: `#18212F`
- Deep Teal: `#0F3D3A`
- Persian Teal: `#0B7771`
- Warm Canvas: `#F8F6F1`
- Surface: `#FFFFFF`
- Soft Surface: `#F3F1EA`

Semantic colors:

- Success: `#0F8A63`
- Warning: `#C98216`
- Alert: `#D9475C`
- Info: `#2B6CB0`
- Draft/Neutral: `#6B7280`

Rules:

- Primary teal is for navigation, active states, and important product identity.
- Amber only means warning or pending.
- Rose only means failure, block, or risk.
- Blue is secondary info, not the main brand.
- Avoid purple/blue gradients.
- Avoid black dashboards.
- Avoid teal everywhere.
- Background must not be a decorative blob/orb system.

### Surfaces

Replace old generic cards with:

- command surfaces,
- timeline surfaces,
- content preview tiles,
- channel rail rows,
- report panels,
- message threads,
- media boards,
- inspector sheets.

Rules:

- Max radius: 10-12px for major surfaces, 6-8px for controls.
- Shadows must be subtle and mostly elevation-based.
- Borders should do most separation.
- No cards inside cards unless it is a list item inside a panel.
- No double panel scroll.

### Typography

Persian UI requires calm density.

Primary UI font:

- Vazirmatn or final chosen Persian UI font.

Display/accent:

- Use sparingly for brand/marketing only, not dashboard headings.

Rules:

- Page title: 24-30px desktop, 20-24px mobile.
- Section title: 14-16px.
- Card title: 12-14px.
- Data values: 18-28px depending on context.
- Body text: 12-14px.
- Never scale font with viewport width.
- Letter spacing: 0.
- Line height for Persian body: 1.75-1.9.

### Layout

Desktop:

- App shell with compact right sidebar.
- Sticky top command bar.
- Main canvas max width by page type.
- One page scroll.
- Details open in right drawer/side sheet, not permanent second scroll column.

Tablet:

- Sidebar collapses.
- Planner/content use master list + temporary drawer.
- Composer becomes two panels, not three.

Mobile:

- Bottom navigation: امروز، برنامه، ساخت، محتوا، گزارش.
- Detail opens as bottom sheet.
- No desktop tables.
- No full chart dashboards.
- Prioritize one task per screen.

## New Information Architecture

Primary navigation:

1. **امروز**
   Daily command center.

2. **ساخت**
   Composer Studio.

3. **برنامه**
   Planner: calendar, campaigns, lanes, best-time suggestions.

4. **محتوا**
   Content operations: drafts, scheduled, failed, approvals, queue.

5. **رسانه**
   Creative Studio: assets, templates, variants, brand kit usage.

6. **پیام‌ها**
   Unified inbox: comments, DMs, alerts, assignments, saved replies.

7. **گزارش**
   Reports and analytics.

8. **تنظیمات**
   Workspace, channels, team, brand kit, publishing health.

Contextual routes:

- Campaigns live inside برنامه.
- Queue lives inside محتوا.
- Logs live inside publishing health.
- Rubika and Instagram live inside channels.
- Onboarding is temporary and appears only when needed.

## Product-Specific Component System

### Core Primitives

- `NPage`
- `NTopBar`
- `NSidebar`
- `NMobileNav`
- `NButton`
- `NIconButton`
- `NInput`
- `NSelect`
- `NSegmentedControl`
- `NStatusPill`
- `NMetric`
- `NDrawer`
- `NBottomSheet`
- `NToast`

### SocialOps Components

- `CommandBrief`
- `ActionQueue`
- `ChannelRail`
- `ChannelCapabilityCell`
- `ContentPreviewTile`
- `PostVariantTabs`
- `NativePostPreview`
- `PlannerLane`
- `CampaignTimeline`
- `CalendarPostChip`
- `MediaAssetTile`
- `CreativeCanvas`
- `BrandKitPanel`
- `InboxThread`
- `AssignmentBadge`
- `SlaTimer`
- `ReportSection`
- `InsightCard`
- `PublishJobRow`
- `RecoveryPanel`

These components are the visual identity. Without them, the product remains a generic dashboard.

## Page Design Targets

### 1. Today Command Center

Goal:

Answer "What needs attention today?" in less than five seconds.

Must include:

- one primary action,
- next publish,
- active risks,
- inbox alert count,
- campaign pulse,
- one insight,
- compact health strip.

Must not include:

- permanent setup progress after completion,
- full analytics dashboard,
- long card stack,
- duplicated CTAs.

Desktop layout:

- top command brief,
- horizontal operational strip,
- action queue + planner preview,
- compact insight/report panel.

Mobile layout:

- urgent action,
- next publish,
- risks,
- one insight,
- bottom nav.

### 2. Composer Studio

Goal:

One idea becomes platform-ready variants.

Must include:

- source idea,
- channel variants,
- media/brand kit,
- native previews,
- readiness checks,
- approval state,
- autosave/version history.

Target layout:

- Desktop: channel rail + editor canvas + preview drawer.
- Mobile: step flow with sticky save/schedule bar.

Must not:

- stack many form cards,
- bury schedule controls at page bottom,
- use the same caption field for all channels without variant clarity.

### 3. Planner

Goal:

Make the calendar feel like a professional content planning product.

Must include:

- month/week/list/feed/lane views,
- campaign lanes,
- channel filters,
- saved views,
- drag/drop schedule,
- post previews,
- side drawer inspector,
- compact Jalali date/time picker.

Must not:

- use two permanent scroll boxes,
- show a heavy right panel on mobile,
- make day cards the only view.

### 4. Content Operations

Goal:

Unify content, queue, failed jobs, approvals, drafts.

Must include:

- status tabs,
- saved filters,
- bulk actions,
- content preview rows,
- queue/recovery status,
- approval owner,
- selected item drawer.

Must not:

- duplicate filters across page and toolbar,
- keep queue as a separate mental model,
- use a second scroll inspector.

### 5. Creative Studio

Goal:

Make media and image editing feel production-grade.

Must include:

- asset board,
- folders/collections,
- templates,
- brand kit,
- variants by channel,
- editor canvas,
- safe-zone overlays,
- typography kits,
- export history,
- usage map.

Must not:

- feel like a file upload page,
- open editor inside a cramped scroll area,
- hide font/style presets.

### 6. Inbox

Goal:

Create a real engagement workspace.

Must include:

- unified thread list,
- channel/source,
- labels,
- assignment,
- SLA,
- saved replies,
- internal notes,
- resolve status,
- related post/campaign.

Must not:

- be only operational notifications,
- mix system alerts and customer conversations without grouping.

### 7. Reports

Goal:

Produce decision-ready and client-ready reporting.

Must include:

- executive summary,
- KPI strip,
- campaign performance,
- channel performance,
- content performance,
- failure/recovery analysis,
- export-ready sections,
- recommendation with source metric.

Must not:

- show many charts without decisions,
- use unreadable axis labels,
- make dates too compressed.

### 8. Settings

Goal:

Keep setup and configuration out of daily workflows.

Must include:

- workspace profile,
- brand kit,
- channels,
- publishing health,
- team/roles,
- notifications,
- integrations.

Must not:

- take over dashboard/home,
- require scrolling through empty sidebar space.

## Motion and Interactive Design

Principle:

Motion must communicate state, not decorate the app.

Allowed motion:

- route transition: subtle fade/slide 120-180ms,
- drawer open/close: 180-220ms,
- selected item: soft scale or border pulse,
- autosave: small progress/success transition,
- publish job: state step animation,
- drag/drop: lifted card + destination highlight,
- live notification: subtle dot and toast,
- chart hover/selection: highlight + detail popover,
- mobile bottom sheet: native-feeling spring.

Forbidden motion:

- random dots/orbs,
- background shimmer,
- looping card effects,
- blinking labels except urgent live status,
- animation that hides data,
- motion-only communication.

Accessibility:

- support reduced motion,
- never rely only on color,
- minimum hit target 40px desktop, 44px mobile,
- keyboard access for menus/drawers/forms.

## Mobile-First Requirements

Every page must have a mobile-specific UX, not just responsive CSS.

Mobile patterns:

- one task per screen,
- bottom nav with 5 core actions,
- detail bottom sheet,
- sticky primary action,
- segmented controls instead of large tab bars,
- horizontal chips for filters,
- cards only for list items, not whole sections,
- charts summarized first with expand option,
- no two-column forms,
- no nested scroll panels.

Mobile acceptance:

- home under 2 screen-heights for normal data,
- compose can save/schedule without scrolling to top/bottom repeatedly,
- planner can select date/post without full calendar takeover,
- content item detail opens as sheet,
- reports show summary before charts.

## Full RFP

### Objective

Design and implement a modern, minimal, professional UI/UX system for Nahrino, a Persian-first multi-channel SocialOps platform.

### Scope

1. Product architecture refinement.
2. Information architecture.
3. Design system v2.
4. Theme and brand language.
5. Interaction and motion system.
6. Mobile-first responsive patterns.
7. Page template library.
8. Component library.
9. Full page rebuild for all core routes.
10. QA, accessibility, and design acceptance gates.

### Deliverables

- Design principles.
- Figma-ready token list.
- UI component inventory.
- Page templates.
- Motion spec.
- Mobile behavior spec.
- Accessibility checklist.
- Engineering implementation roadmap.
- Acceptance criteria by route.
- Before/after QA scoring.

### Success Criteria

Nahrino should score:

- UI visual quality: 8.5+/10 after phase 4.
- UX clarity: 8+/10 after phase 5.
- Mobile usability: 8+/10 after phase 6.
- Benchmark competitiveness: 7.5+/10 after phase 6, 9+/10 after full build.

### Non-Negotiables

- No old generic workspace cards as final design.
- No nested scroll areas.
- No duplicated CTAs.
- No module-first navigation.
- No desktop-only page design.
- No cosmetic-only redesign.
- No black theme.
- No gradient/orb background dependency.
- No unreadable chart labels.
- No permanent setup progress on daily pages.

## Rebuild Roadmap

### Phase 0: Design Freeze and Audit

Duration: 1-2 days

Work:

- Stop implementation of visual tweaks.
- Audit every page for duplicated actions, nested scroll, old panels, mobile length, unclear hierarchy.
- Create design debt register.

Acceptance:

- Each route has a redesign brief.
- Old design system components marked as deprecated.

### Phase 1: Design System v2 Specification

Duration: 3-5 days

Work:

- Define tokens: color, type, spacing, radius, shadow, motion.
- Define core components.
- Define SocialOps-specific components.
- Create page template rules.

Acceptance:

- No implementation starts without component target.
- All future screens use v2 primitives.

### Phase 2: Shell v2

Duration: 3-5 days

Work:

- Rebuild sidebar, topbar, mobile nav.
- Add command bar.
- Add route groups and contextual surfaces.
- Remove old shell styling.

Acceptance:

- Shell feels like a new app.
- Navigation is workflow-first.
- Mobile nav is polished and compact.

### Phase 3: Today v2

Duration: 4-6 days

Work:

- Rebuild home from scratch.
- Use signature command center design.
- Remove generic metric/card stack.
- Add action queue, planner preview, risk digest, campaign pulse.

Acceptance:

- Desktop has no nested scroll.
- Mobile normal state under 2 screen-heights.
- One primary action is obvious.

### Phase 4: Planner v2

Duration: 1-2 weeks

Work:

- Replace two-box calendar.
- Add real planner: month/week/list/feed/lane.
- Add inspector drawer.
- Add campaign lanes.
- Add compact Jalali picker.

Acceptance:

- No permanent double scroll.
- Calendar is visually rich with post previews.
- Mobile uses bottom sheet inspector.

### Phase 5: Composer Studio v2

Duration: 1-2 weeks

Work:

- Rebuild composer around source idea + channel variants.
- Add channel rail.
- Add native preview.
- Add readiness panel.
- Add media/brand kit integration.

Acceptance:

- User understands variants immediately.
- Schedule and save are always accessible.
- Mobile flow is step-based and clear.

### Phase 6: Content Operations v2

Duration: 1 week

Work:

- Merge content/queue mental model.
- Create content operations table/card hybrid.
- Add drawer inspector.
- Add recovery actions.

Acceptance:

- Queue no longer feels separate.
- Filters are unified.
- Failed jobs are actionable.

### Phase 7: Creative Studio v2

Duration: 1-2 weeks

Work:

- Rebuild media as creative board.
- Add brand templates.
- Improve editor as focused canvas.
- Add variants and usage map.

Acceptance:

- Media feels like production, not upload.
- Editor is available from composer and media.
- Brand kit affects outputs.

### Phase 8: Inbox v2

Duration: 1 week

Work:

- Separate operational alerts from customer/community threads.
- Add assignment, labels, SLA, saved replies.

Acceptance:

- Inbox supports real engagement workflow.
- Threads connect to post/campaign/channel.

### Phase 9: Reports v2

Duration: 1-2 weeks

Work:

- Rebuild analytics as reports.
- Add executive summary.
- Add export-ready report sections.
- Improve charts and date labels.

Acceptance:

- A manager/client can read it.
- Every chart has a decision or insight.

### Phase 10: Polish, Motion, Accessibility, QA

Duration: 1 week

Work:

- Motion system pass.
- Mobile QA.
- Accessibility QA.
- Empty/loading/error states.
- Performance pass.

Acceptance:

- No route uses old visual system as final.
- No route has nested scroll unless explicitly justified.
- Mobile is usable for core workflows.

## Route-Level Redesign Priority

1. Home / Today
2. Calendar / Planner
3. Composer
4. Content + Queue
5. Media / Creative Studio
6. Analytics / Reports
7. Inbox
8. Campaigns
9. Settings / Channels
10. Onboarding

## Design QA Checklist

Each route must pass:

- One primary job.
- One primary CTA.
- No duplicate filters.
- No duplicate route tabs.
- No nested scroll areas.
- Mobile task flow exists.
- Empty state exists.
- Loading state exists.
- Error/recovery state exists.
- Uses v2 primitives.
- Uses product-specific objects.
- Has keyboard-accessible controls.
- Has reduced-motion-safe interactions.
- Persian text does not clip.
- Long labels wrap or truncate intentionally.

## Source Links

- Buffer: https://buffer.com/
- Hootsuite platform: https://www.hootsuite.com/platform
- Sprout Social features: https://sproutsocial.com/features/
- Sprout Social listening: https://sproutsocial.com/features/social-media-listening/
- Later: https://later.com/
- Planable: https://planable.io/
- Planable product: https://planable.io/product/
- Metricool: https://metricool.com/
- Agorapulse inbox help: https://support.agorapulse.com/en/articles/10393075-agorapulse-inbox-explained
- Canva content planning: https://www.canva.com/solutions/content-planning-scheduling/
- Apple Human Interface Guidelines, Motion: https://developer.apple.com/design/human-interface-guidelines/motion
- Material Design color system: https://m2.material.io/guidelines/style/color.html
- Material Design motion: https://m1.material.io/motion/material-motion.html

## Final Recommendation

Do not continue page-by-page color changes.

The next real work should be:

1. Mark old components as deprecated.
2. Build the v2 primitive component layer.
3. Rebuild Home from zero using v2 only.
4. Rebuild Planner from zero using v2 only.

If a page still uses the old "two boxes with scroll" pattern, it is not considered redesigned.
