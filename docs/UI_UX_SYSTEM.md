# نشرینو UI/UX System

This document defines the professional visual and interaction direction for the product. It replaces the idea of "make it more colorful" with a domain-specific design system.

## Design Thesis

نشرینو should feel like a calm Persian social operations studio:

- Light, focused, and work-ready.
- RTL-native and Jalali-native.
- Media-rich where content matters.
- Dense enough for daily operations.
- Warm and branded without looking decorative.
- Built around channel, campaign, content, report, and engagement objects.

The app should not feel like:

- A generic dashboard template.
- A skeleton prototype.
- A black/purple SaaS theme.
- A pile of cards.
- A one-time setup wizard living forever.

## Benchmark Lessons

| Product | UI lesson |
| --- | --- |
| Buffer | Simple daily flows and friendly creation matter more than decorative UI |
| Hootsuite | Dense operations, inbox, approvals, and reporting need strong information hierarchy |
| Sprout Social | Professional analytics should feel manager/client-ready |
| Later | Visual planning and media previews create perceived product quality |
| Planable | Collaboration and approval states must live directly on content |
| Canva | Brand assets, templates, and creative continuity make the product feel polished |

## Theme Direction

Name: **Light Editorial Operations**.

Use:

- Light blue-gray app canvas.
- White work surfaces.
- Teal as primary operational color.
- Blue for informational action.
- Amber for attention/setup/manual tasks.
- Rose for risk/failure.
- Emerald for success.
- Small, purposeful motion only.

Avoid:

- Black-heavy chrome.
- Decorative gradient blobs/orbs.
- Random dotted backgrounds.
- Large marketing hero sections in the logged-in app.
- Full-page setup progress after setup completion.
- Repeated “ready/100%” badges when nothing needs action.

## Core Tokens

| Token | Value | Use |
| --- | --- | --- |
| Canvas | `#EEF4F6` | App background |
| Surface | `#FFFFFF` | Main work panels |
| Surface muted | `#F2F8F8` | Toolbars, dashboard monitor heads |
| Text | `#172332` | Primary copy |
| Muted text | `#5D7280` | Secondary labels |
| Primary teal | `#0F766E` | Main action, active route |
| Info blue | `#2563EB` | Informational state/action |
| Success | `#15803D` | Healthy/done |
| Warning | `#B7791F` | Needs attention/manual |
| Danger | `#C24150` | Failed/risk |
| Border | `#D5E5E5` | Hairline structure |

## Product-Specific Visual Language

### Channel Rail

Purpose: show selected channels, capability, and health without making a huge card.

Use in:

- Composer variants.
- Planner chips.
- Queue rows.
- Content rows.
- Campaign timeline.
- Analytics filters.

Rules:

- Small vertical rail or compact horizontal badge group.
- Channel colors are accents only.
- Include capability/limitation state when relevant.

### Campaign Timeline

Purpose: show campaign rhythm and progress.

Use in:

- Command Center.
- Planner campaign lane.
- Campaign detail.
- Reports.

Rules:

- Timeline bands should show date range, planned/scheduled/published/failed counts.
- Use campaign color as a thin rail, not background flood.

### Content Preview Tile

Purpose: make the app visually rich using real content.

Use in:

- Content list.
- Queue.
- Media usage.
- Analytics top posts.
- Campaign linked posts.

Rules:

- Thumbnail first when available.
- Caption/title truncated cleanly.
- Status, channel, campaign, approval visible.
- No image means a restrained placeholder, not a decorative illustration.

### Health Map

Purpose: show operational health only when action is useful.

Use in:

- Channels Hub.
- Publishing Ops.
- Incomplete onboarding.
- Worker health.

Rules:

- Do not show completed setup progress permanently.
- Completed health can be a quiet settings detail.
- Warnings and blockers appear in dashboard only when action is needed.

### Report Surface

Purpose: make analytics/export pages feel client-ready.

Use in:

- Analytics.
- Campaign report.
- Export preview.

Rules:

- KPI strip.
- Trend chart.
- Top content thumbnails.
- Insight notes.
- Method/source notes.
- Print/export-friendly spacing.

### Collaboration Layer

Purpose: make review feel native.

Use in:

- Composer.
- Content inspector.
- Campaign detail.

Rules:

- Comments and approval state stay beside content.
- Internal-only feedback is visually distinct but not loud.
- Resolved comments collapse.

## Visual Asset Strategy

Use real product assets before decorative art:

1. User media thumbnails.
2. Brand logo/avatar.
3. Campaign color rails.
4. Channel icons/badges.
5. Generated post/template thumbnails.
6. Report charts and tables.
7. Empty states with restrained line icons only.

Do not add generic art unless it clarifies a product state. The app should gain beauty from organized content, not background decoration.

## App Shell

Rules:

- Sidebar is compact, workflow-first, and not crowded.
- Settings are pinned.
- Channels are not a permanent primary item unless there is an issue.
- Global create appears once.
- Header status chips are alert-only where possible.
- Completed setup does not occupy daily navigation.

Primary navigation:

1. Today
2. Create
3. Planner
4. Content
5. Media
6. Inbox
7. Reports
8. Settings

Advanced pages remain reachable by command palette and parent workspaces:

- Channels.
- Publishing Ops/Queue.
- Logs.
- Campaigns.
- Onboarding.

## Page Patterns

### Command Center

Job: daily start page.

Required sections:

- Hero with workspace and highest priority action.
- Publishing pulse.
- Risk queue.
- Upcoming schedule.
- Campaign timeline preview.
- Inbox alerts.
- Insight card.

Do not show:

- Permanent setup progress when complete.
- Large static readiness cards.
- Duplicate create buttons.

### Onboarding

Job: temporary guided setup.

Rules:

- Appears when setup is incomplete.
- Can be reopened from command palette/settings.
- Uses setup rail and concise side monitor.
- Does not become daily dashboard.

### Channels Hub

Job: account/capability/recovery.

Required:

- Account cards.
- Capability matrix.
- Last test/last error.
- Mode disclosure.
- Recovery action.
- Channel settings as tabs/drawers.

### Composer Studio

Job: create channel variants.

Target layout:

- Left: campaign/template/media/brand.
- Center: source idea and variants.
- Right: preview/readiness/schedule/approval.

Rules:

- No messy field clusters.
- Variant validation appears near variant.
- Media editor opens as focused workspace.
- Current creation step uses same-size filled circle, not a tiny dot.

### Planner

Job: visual schedule management.

Required:

- Month/week/list/feed/campaign lane views.
- Compact toolbar.
- Right inspector.
- Channel/campaign/status filters.
- Drag/drop with conflict warning.
- Small Jalali date/time popovers.

### Campaigns

Job: strategy and report hub.

Required:

- Campaign brief.
- Timeline.
- Linked posts/media.
- KPIs.
- Risk panel.
- Report/export action.

### Media Studio

Job: DAM plus creative workflow.

Required:

- Grid/list.
- Inspector.
- Source/variant relationship.
- Usage map.
- Creative QA.
- Professional editor layout.

### Inbox

Job: engagement operations.

Required:

- Thread list.
- Conversation.
- Assignment/status/SLA.
- Saved replies.
- Internal notes.

### Analytics

Job: decision support.

Required:

- KPI strip.
- Channel/campaign filters.
- Trends.
- Top/weak content.
- Recommendations.
- Report export.
- Competitor/listening-lite.

## Interaction Rules

- Buttons use icons where expected.
- Primary action is unique per page.
- Filters are compact and consistent.
- Bulk actions appear only after selection.
- Popovers close on outside click.
- Date/time popovers are compact and anchored.
- Motion is subtle and state-driven.
- Loading skeletons match final layout dimensions.
- Text never scales with viewport width.

## Accessibility And RTL

- All controls keyboard reachable.
- Focus ring visible.
- Persian labels tested for overflow.
- Tables/lists usable at 1280px and mobile.
- Motion respects reduced-motion.
- Color is not sole indicator.
- Jalali dates are consistent.

## Design QA Checklist

Before shipping a UI phase:

- Does this page have one primary job?
- Is setup hidden if already complete?
- Is visual richness tied to real content/status/campaign/channel?
- Are there duplicate primary buttons?
- Are Persian labels clipped?
- Are cards nested inside cards?
- Does the page use existing components?
- Is the next action obvious?
- Would a manager/client trust a report screenshot from this page?
