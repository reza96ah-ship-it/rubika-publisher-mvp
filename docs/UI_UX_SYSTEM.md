# Multi-Channel Social Operations UI/UX System

This document defines the professional design direction for the multi-channel rebuild. It should be used before changing page-level UI so future work improves product experience rather than repainting screens.

## Design Goal

The product should feel like a calm, modern, Persian-first operations studio for social content teams.

It should be:

- RTL-native.
- Multi-channel by default.
- Operational, not decorative.
- Light and clear, not black-heavy.
- Brand-aware.
- Media-rich where content matters.
- Dense enough for daily work.
- Warm enough to avoid looking like a skeleton/template.
- Accessible, keyboard-friendly, and reduced-motion safe.

## Benchmark Lessons

### Buffer

- Keep creation and scheduling friendly.
- Make analytics easy to understand.
- Use lightweight engagement workflows for small teams.
- Avoid hiding basic actions behind enterprise complexity.

### Hootsuite

- A professional platform needs publishing, engagement, listening, analytics, approvals, benchmarking, and governance.
- Dense calendars and bulk operations are expected.
- Operational health and failure recovery are part of UX.

### Sprout Social

- Reporting, inbox, assignment, workflow, and listening make the product feel mature.
- Analytics should look client/manager-ready.
- Roles and permissions are not optional for teams.

### Later

- Visual planning and media-first workflows make the product feel alive.
- Feed/grid previews and channel-specific previews matter.
- Link/CTA and commerce context are important for small businesses.

### Metricool

- Planner, analytics, inbox, reports, smart links, campaigns, and competitor tracking can live in one workspace.
- Good tools explain next action, not only raw metrics.

### Planable

- Collaboration UX matters: comments, approvals, versions, calendar, feed/grid preview, and client review are core.
- Review status must be visible at content-card level.

### Canva

- Creative quality comes from templates, brand assets, media, and direct scheduling continuity.
- The product does not need to become Canva, but it needs a design-to-publish bridge.

## Recommended Theme

Use a light editorial-operations theme.

Core tokens:

- App canvas: `#F5F8FA`
- Surface: `#FFFFFF`
- Raised surface: `#FBFDFE`
- Text: `#17313B`
- Muted text: `#5D7280`
- Primary: `#0F766E`
- Primary soft: `#DDF7F2`
- Info blue: `#2563EB`
- Success: `#15803D`
- Warning: `#B7791F`
- Danger: `#C24150`
- Border: `#D7E2E7`

Use channel colors only as accents:

- Rubika: blue accent.
- Instagram: warm gradient accent only in tiny channel marker, not whole backgrounds.
- Manual workflow: amber/sky status.
- Future channels: tokenized, never hard-coded into page layouts.

## Product-Specific Visual Language

The app should not rely on random dots, blobs, or generic cards. Use visual systems tied to the product domain.

### Channel Rail

Small vertical or horizontal rails that show selected channels, connection health, and publish capability.

Use in:

- Composer.
- Queue.
- Planner.
- Content rows.
- Campaign detail.

### Campaign Timeline Pattern

Subtle timeline bands showing campaign dates, content stages, and publishing rhythm.

Use in:

- Command Center.
- Campaign detail.
- Planner.
- Analytics reports.

### Content Preview Tiles

Real media thumbnails, post previews, captions, status, approval, and channel badges should carry the visual richness.

Use in:

- Content.
- Media.
- Queue.
- Campaign linked posts.
- Analytics top content.

### Health Map

Compact readiness map for brand, channels, schedule, approvals, media, worker, and analytics.

Use in:

- Command Center.
- Onboarding.
- Channels Hub.
- Publishing Ops.

### Report Surface

Analytics and campaign reports should use print/export-quality layouts with KPI strips, trend charts, thumbnail tables, and insight notes.

Use in:

- Analytics.
- Campaign exports.
- Dashboard summaries.

## What To Avoid

- Black-heavy app chrome for this product category.
- Purple/blue gradient-heavy SaaS cliché.
- Generic decorative dotted backgrounds everywhere.
- Big marketing hero sections inside the logged-in app.
- Cards inside cards.
- Oversized setup boxes that break information density.
- Duplicate primary buttons in header and body.
- Permanent blinking or decorative animation.
- Art that competes with tables, forms, or charts.

## What To Use Instead

- Calm canvas background.
- White work surfaces.
- Hairline borders.
- Small status rails.
- Campaign color dots and timeline strips.
- Real media thumbnails.
- Brand avatars/logos in relevant context.
- Soft shadow only for active overlays, drawers, popovers, and selected inspectors.
- Purposeful motion for active state, upload/progress, notification, and current creation step.

## Global App Shell

Purpose: orient the user and provide command access.

Rules:

- Shell title should be channel-neutral.
- Sidebar should be compact and workflow-first.
- Settings should be pinned.
- Channels should group Rubika, Instagram, and future networks.
- Global create action appears once.
- Header should not duplicate page body CTAs.
- Notification and command palette stay consistent across pages.
- Channel health should appear as compact status, not a large header label.

Required shell sections:

- Command Center.
- Create.
- Planner.
- Campaigns.
- Content.
- Media Studio.
- Channels.
- Inbox.
- Analytics.
- Publishing Ops.
- Settings.

## Command Center

Purpose: daily start page.

Layout:

- Top: workspace health map and next recommended action.
- Middle: today/this week publishing plan with channel rail.
- Middle: campaign progress and blocked work.
- Bottom: recent activity, notifications, and top insight.

Rules:

- It should not be a marketing landing page.
- It should not be a collection of oversized setup cards.
- Every card must answer "what should I do next?"

## Channels Hub

Purpose: account setup, capability, limitations, and health.

Layout:

- Account cards with channel marker, mode, status, and next action.
- Capability matrix.
- Health timeline.
- Setup checklist.
- Logs/recovery panel.

Rules:

- Personal Instagram must say manual/reminder workflow.
- API-capable accounts should show eligibility and token health.
- Rubika settings should feel like a channel configuration, not a separate product.

## Composer Studio

Purpose: fastest path from idea to channel-ready post.

Target layout:

- Left pane: campaign, template, media, brand kit.
- Center pane: source idea and per-channel variants.
- Right pane: preview, readiness, schedule, approval.

Rules:

- No messy field clusters.
- Per-channel validation should be visible near the channel variant.
- Media editor opens as an focused overlay or side-by-side workspace.
- Current creation step uses a same-size filled circle with restrained pulse.
- Autosave state must be clear but not noisy.

## Planner

Purpose: schedule management.

Rules:

- Month, week, list, grid/feed, and campaign lane views.
- Compact toolbar.
- Right inspector.
- Drag/drop reschedule.
- Channel/campaign/status filters.
- Label readability is mandatory.
- Mini date pickers should be true compact popovers and close on outside click.
- Jalali date handling must be consistent.

## Campaigns

Purpose: strategic planning and reporting.

Rules:

- Campaign page should show brief, timeline, linked posts, media, KPIs, risk, and report actions.
- Campaign create/edit should use compact sections and mini date/time popovers.
- Channel mix should be visible.
- Campaign health should be understandable without opening analytics.

## Content And Queue

Purpose: operational data views.

Rules:

- Shared professional table/list system.
- Thumbnail, campaign marker, channel badges, approval, schedule, and status.
- Inspector shows preview first, then metadata, then recovery/next action.
- Manual publish tasks must show copy/open/mark-published actions.
- Bulk actions appear only when selection exists.

## Media Studio

Purpose: DAM plus social creative workflow.

Rules:

- Grid/list with usage state.
- Inspector with preview, variants, campaign usage, metadata, and safe delete.
- Image editor should feel like a compact professional studio:
  - Left asset/layer rail.
  - Center canvas.
  - Right inspector.
  - Top toolbar.
  - Bottom zoom/artboard.
- Brand colors, Persian fonts, templates, and channel presets are first-class.

## Inbox

Purpose: daily engagement operations.

Rules:

- Thread list, conversation, assignment/status, saved replies, internal note.
- SLA and unresolved indicators.
- Notifications link to exact thread.
- Empty states explain how channel connection affects inbox availability.

## Analytics And Reports

Purpose: decision support.

Rules:

- Start with insight cards and next actions.
- Charts must have readable labels.
- Use thumbnails for top content.
- Support channel/campaign/date filters.
- Chart click selection must unselect on outside click.
- Reports should look export-ready.
- AI insight must cite visible metrics.

## Motion System

Use motion for:

- Panel entry.
- Button hover/press.
- Upload/progress.
- Live notification pulse.
- Current creation step.
- Selection feedback.
- Toasts.

Do not use motion for:

- Decorative background loops.
- Constant blinking outside active/current state.
- Large animated hero effects inside work surfaces.

Every motion must respect reduced-motion preferences.

## Art And Brand Direction

The app does not need random image assets everywhere. It needs art and pattern only where it improves orientation.

Use art/pattern in:

- First-run onboarding.
- Empty media library.
- First campaign setup.
- Channel disconnected state.
- Brand readiness.
- Report cover/export.

Prefer:

- Product-specific spot diagrams.
- Channel capability maps.
- Campaign rhythm/timeline patterns.
- Real content thumbnails.
- Brand avatars/logos.

Avoid:

- Generic stock-like illustrations.
- Decorative blobs/orbs.
- Noisy dot grids.
- Backgrounds that make text or charts harder to read.

## Layout Rules

- Use full-width operational layouts, not narrow marketing layouts.
- Cards are for repeated items, inspectors, modals, and actual tools.
- Avoid cards inside cards.
- Use `6px` to `8px` radius for professional controls.
- Use stable dimensions for toolbars, thumbnails, buttons, grids, and charts.
- Do not scale font size with viewport width.
- Text must not overflow its container.
- Persian/RTL labels must be checked in browser.

## Accessibility Rules

Required:

- Keyboard navigation.
- Visible focus states.
- Button labels or tooltips for icons.
- Color contrast for all token states.
- ARIA labels for icon-only buttons.
- Reduced-motion support.
- Popovers close on outside click and Escape.
