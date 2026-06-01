# Rubika Publisher UI/UX System

This document defines the professional design direction for Rubika Publisher. It should be used before changing page-level UI, so future work improves the system instead of repainting screens repeatedly.

## Design Goal

Rubika Publisher should feel like a serious, calm, modern publishing workspace for Persian commerce and content teams.

The interface should be:

- RTL-native.
- Operational and clear.
- Light, not black-heavy.
- Brand-aware.
- Dense enough for daily work.
- Warm enough to avoid looking like a skeleton/template.
- Accessible and keyboard-friendly.
- Consistent across all modules.

## Benchmark Lessons

### Buffer

Learn:

- Keep creation flows friendly and low-friction.
- Make analytics understandable at a glance.
- Avoid unnecessary enterprise complexity in daily workflows.

### Hootsuite

Learn:

- Professional publishing needs approvals, calendars, inbox, listening, and reporting.
- Governance and recovery matter as much as layout.
- Calendar density and bulk operations are important.

### Sprout Social

Learn:

- Analytics should feel like a business reporting product.
- Engagement and response workflows need assignment, state, and SLA.
- Role-based workflow makes the app feel enterprise-ready.

### Later

Learn:

- Visual planning and media-first workflows make social tools feel alive.
- Drag/drop planning and media previews are core, not decoration.
- Link/CTA and commerce flows matter for small business users.

### Metricool

Learn:

- Planner, analytics, inbox, smart links, and reporting can live in one operational system.
- The product must explain what to do next, not only show raw data.

## Theme Direction

### Recommended Theme

Use a light operational SaaS theme.

Core tokens:

- Canvas: `#F5F8FA`
- Surface: `#FFFFFF`
- Text: `#17313B`
- Muted text: `#5D7280`
- Primary: `#0F766E`
- Info blue: `#2563EB`
- Success: `#15803D`
- Warning: `#B7791F`
- Danger: `#C24150`
- Border: `#D7E2E7`

### What To Avoid

- Black-heavy theme for this product category.
- Purple/blue gradient-heavy SaaS cliché.
- Decorative dotted backgrounds everywhere.
- Big marketing-style hero sections inside the app.
- Cards inside cards.
- Oversized boxes that do not match information density.
- Generic illustrations that do not explain brand, content, or publishing state.

### What To Use Instead

- Calm canvas background.
- Clear white work surfaces.
- Hairline borders.
- Small status rails.
- Campaign color dots.
- Brand avatar/logo where context matters.
- Media thumbnails for real content objects.
- Soft shadows only for active surfaces or overlays.
- Purposeful motion for live state, selection, and progress.

## Component System

### App Shell

Purpose: global orientation and command access.

Rules:

- Sidebar must not require scrolling through empty space to reach settings.
- Settings should be pinned near the bottom or grouped clearly.
- Active nav should show icon, label, and calm active state.
- Header should avoid duplicate primary CTAs.
- Global create action should appear once.
- Workspace command/search should stay consistent.

Required components:

- Sidebar.
- Topbar.
- Workspace switcher.
- Command palette.
- Notification button.
- Global create button.
- Account/settings menu.

### Page Header

Purpose: explain current workflow and show current operational state.

Rules:

- Use one page title.
- Include short description.
- Use status tokens sparingly.
- Avoid duplicate actions in header and body.
- Primary action should be clear and singular.

### Data View

Purpose: professional tables/lists for operational work.

Rules:

- Use thumbnails when row represents content or media.
- Use campaign markers when campaign context exists.
- Use saved views once backend supports them.
- Provide search, filters, sort, bulk selection, and inspector.
- Keep row height predictable.
- Avoid text clipping for primary labels.

Required states:

- Loading.
- Empty.
- Filter-empty.
- Selected.
- Bulk selected.
- Error/recovery.

### Inspector

Purpose: selected entity context and next action.

Rules:

- Inspector should show preview first when visual content exists.
- Then status/readiness.
- Then key metadata.
- Then recovery or next action.
- Avoid duplicating the entire row.

Used by:

- Content.
- Queue.
- Media.
- Calendar.
- Campaigns.
- Inbox.

### Composer Studio

Purpose: fastest path from idea to scheduled post.

Target layout:

- Left pane: templates, campaign, media library, brand defaults.
- Center pane: title, caption, hashtags, internal note, writing assist.
- Right pane: Rubika preview, readiness, schedule, approval status.

Rules:

- Do not stack unrelated fields in many boxes.
- Group fields by workflow: idea, content, media, schedule, review.
- Always show readiness.
- Show missing brand/media/schedule warnings early.
- Use autosave feedback.

### Planner

Purpose: schedule management.

Rules:

- Month/week/list/campaign-lane views.
- Compact toolbar.
- Right inspector.
- Drag/drop reschedule.
- Campaign and status filters.
- Label readability is mandatory.
- No fake hidden labels or clipped month names.

### Analytics

Purpose: decision support.

Rules:

- Start with narrative insight cards.
- Show top-performing or highest-risk content with thumbnails.
- Support chart drilldown and click-out behavior.
- Explain next action.
- Keep chart labels readable.
- Reports should be exportable later.

### Media Library

Purpose: lightweight DAM.

Rules:

- Grid and list views.
- Inspector with preview, metadata, usage, attach actions.
- Collections and campaign filters.
- Safe delete warnings.
- Show usage map once data model supports it.

### Inbox

Purpose: daily engagement operations.

Rules:

- Thread list and conversation panel.
- Assignment and status.
- Saved replies.
- SLA and unresolved indicators.
- Notifications link to exact thread.

## Motion System

Motion should be restrained and stateful.

Use motion for:

- Entering panels.
- Button hover/press.
- Live notification pulse.
- Current creation step.
- Upload/progress.
- Selection feedback.
- Toasts.

Do not use motion for:

- Decorative background loops.
- Constant blinking outside active/current state.
- Large animated hero effects inside work surfaces.

Every motion must respect reduced-motion preferences.

## Brand And Art Direction

The app does not need random art everywhere. It does need brand expression where it clarifies product state.

Use brand/art in:

- Empty media library.
- First campaign setup.
- No Rubika connection.
- Brand readiness.
- First post creation.
- Report cover/export.

Prefer:

- Small product-specific spot illustrations.
- Code-native diagrams or simple generated assets.
- Brand avatars/logos.
- Workflow rails and status maps.

Avoid:

- Generic stock-like illustrations.
- Decorative blobs/orbs.
- Noisy dot-grid backgrounds.
- Art that competes with tables.

## Layout Rules

- Max content width should support dense operations, not narrow marketing pages.
- Use full-width bands or plain constrained layouts for major sections.
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
- Form labels and errors.
- No action hidden only behind color.

## Page-Specific Direction

### Dashboard / Command Center

Should answer:

- Is workspace publish-ready?
- What needs attention?
- What is scheduled next?
- Which campaign/content should I work on?

Next improvements:

- Configurable widgets.
- Brand readiness.
- Campaign health.
- Worker health.
- Approval queue.

### Store / Settings

Should answer:

- Is my brand identity complete?
- Is Rubika connected?
- Are defaults ready for fast content creation?

Next improvements:

- Brand kit section.
- Better grouped fields.
- Logo/avatar upload.
- Tone/CTA/default hashtags.
- Readiness score.

### Compose

Should answer:

- What am I creating?
- Which template/brand/campaign/media is used?
- Is it ready to schedule?
- What will it look like?

Next improvements:

- Three-pane studio.
- Templates.
- Autosave.
- Version history.
- AI assist.

### Calendar

Should answer:

- What is planned?
- What is risky?
- Where can I move content?
- How does this campaign look over time?

Next improvements:

- Drag/drop.
- Campaign lanes.
- Best-time suggestions.
- Bulk scheduling.

### Content

Should answer:

- What exists?
- What is ready, missing, risky, or published?
- What needs review?

Next improvements:

- Saved views.
- Approval states.
- Version history.
- Campaign object.

### Queue / Logs

Should answer:

- What is publishing?
- What failed?
- Why did it fail?
- How do I recover safely?

Next improvements:

- Publish jobs.
- Retry policies.
- Dead-letter queue.
- Worker health.

### Analytics

Should answer:

- What worked?
- What failed?
- Which campaign/content should I repeat?
- What should I do next?

Next improvements:

- Analytics events.
- Engagement metrics.
- Report builder.
- Exports.

## Design QA Checklist

Before merging UI work:

- Page has no horizontal overflow.
- Primary labels are not clipped.
- Persian text is readable.
- Primary CTA is not duplicated.
- Header and body actions do not fight.
- Empty state explains next action.
- Loading state is present.
- Error/recovery state is present.
- Mobile and desktop are checked.
- Browser console has no runtime errors.
- Design uses shared components or improves shared components.
- UI change maps to product capability, not only decoration.
