# Professional Rebuild Roadmap

This roadmap replaces the previous UI-polish loop with capability-driven phases. Each phase should be committed and pushed as a restore checkpoint.

## Phase 1: Product Architecture Freeze

Goal: create the product map before more implementation.

Scope:

- Product architecture.
- Domain model.
- UI/UX system.
- Professional roadmap and backlog.
- Non-duplicate module list.

Acceptance criteria:

- Product docs exist in `docs/`.
- Future coding phases map to a product capability.
- No next task is described only as "make UI more professional".
- Data model direction is clear before migrations.

Status: completed.

## Phase 2: Brand Kit Pro

Goal: make the workspace identity reusable across composer, preview, dashboard, content, reports, and empty states.

Scope:

- Add brand kit fields or entity.
- Store logo/avatar reference.
- Store brand color and accent.
- Tone of voice.
- Default CTA.
- Default hashtags and caption footer.
- Brand readiness panel.
- Apply brand defaults in composer.

Acceptance criteria:

- Brand settings persist in backend.
- Composer can start from brand defaults.
- Rubika preview reflects brand avatar/name/default footer.
- Dashboard shows brand readiness.
- Store settings fields are clean and non-messy.

Risk: medium.

Priority: P0.

Current implementation status:

- Store brand color, accent color, tone of voice, default CTA, and content guidelines persist in the backend.
- Store logo and avatar can reference existing media assets or freshly uploaded brand images.
- Store settings has a clean Brand Kit panel with color controls and brand copy fields.
- Composer uses brand defaults, brand color, and brand avatar/logo for starter panels and preview identity.
- App shell and dashboard now use the active brand avatar/logo and primary color.
- Analytics/report views now use the active brand avatar/logo and brand color for report identity.
- The next Brand Kit slice should apply the same visual identity to analytics exports and campaign workspaces.

## Phase 3: Campaign OS

Goal: replace free-text campaign labels with a first-class campaign planning module.

Scope:

- Campaign model and CRUD API.
- Campaign color, status, goal, date range, owner, notes.
- Campaign picker in composer.
- Campaign filters in content, queue, calendar, analytics.
- Campaign detail workspace.
- Campaign health score.

Acceptance criteria:

- Posts reference `campaign_id`.
- Calendar can show campaign lanes or campaign filters.
- Analytics can summarize campaign health.
- Content and queue can use campaign object metadata.

Risk: medium.

Priority: P0.

Current implementation status:

- Campaign model, migration, and scoped CRUD API exist.
- Posts can reference `campaign_id` while the legacy free-text `campaign` field remains supported.
- Existing free-text campaign names are backfilled into Campaign records during migration.
- Composer can now load campaigns, attach a post to a real campaign, and quick-create a campaign without leaving the studio.
- Content, queue, calendar, and analytics now share campaign-aware filters that understand `campaign_id` and legacy text campaigns.
- A dedicated Campaign Center now shows campaign health, timeline, linked posts, and linked media assets.
- Campaign Center can create and edit campaign name, goal, status, color, owner, date range, and notes.
- Campaign details now include a compact performance funnel for media coverage, queue, successful publishing, and active risk.
- Campaign Center now supports bulk assigning posts to the selected campaign and removing linked posts from that campaign.
- Campaign Center now includes selected-campaign analytics for delivery rate, media coverage, attempt success, weekly risk, activity trend, status mix, and priority posts.
- Campaign Center can export the selected campaign as CSV or a print-ready HTML report with metrics, trend, risks, and linked posts.
- The next Campaign OS slice should add deeper benchmark comparisons and report scheduling.

## Phase 4: Composer Studio Pro

Goal: make content creation the strongest workflow.

Scope:

- Three-pane composer layout.
- Template picker.
- Brand-aware defaults.
- Media panel and preview.
- Schedule/readiness panel.
- Autosave.
- Draft recovery.
- Version history.
- Optional AI assist with human confirmation.

Acceptance criteria:

- Create-to-schedule workflow is clear and fast.
- No messy field clusters.
- Composer shows missing items before scheduling.
- Refresh does not lose active draft.
- Template fills structured post fields.

Risk: high.

Priority: P0.

## Phase 5: Planner Pro

Goal: turn the calendar into a real planner.

Scope:

- Month/week/list/campaign lane views.
- Drag/drop reschedule.
- Compact toolbar.
- Right-side inspector.
- Conflict warnings.
- Best-time suggestions v1.
- Bulk scheduling.

Current implementation status:

- Calendar has month, week, and list views with drag-and-drop rescheduling.
- Calendar planning now exposes campaign workload, campaign-colored post rails, campaign-aware quick-create, and a direct Campaign Manager action.
- Calendar inspector now warns about tight post spacing, failed posts, missing media, and suggests open publish-time slots for the selected day.
- Calendar planner now checks Rubika readiness and points stale or missing connections to the Rubika setup page before scheduled posts are at risk.

Acceptance criteria:

- Scheduled posts can be moved safely.
- Labels do not clip.
- Campaign and status filters work.
- Planner warns about missing media, invalid connection, or tight spacing.

Risk: high.

Priority: P1.

## Phase 6: Media DAM Pro

Goal: make media a reusable asset system, not only uploads.

Scope:

- Collections.
- Usage map.
- Campaign-linked assets.
- Better inspector.
- Safe delete warnings.
- Crop/variant presets.
- Storage abstraction.

Acceptance criteria:

- Every asset shows where it is used.
- Assets can be grouped and reused.
- Deleting an asset with usage requires confirmation.
- Composer can pull media by campaign/collection.

Current implementation status:

- Media library supports folders, tags, grid/list views, and attaching assets to posts.
- Media inspector now exposes a usage map and safe delete flow; attached assets are blocked by the backend unless deletion is explicitly forced after confirmation.
- Media Library can filter attached assets by campaign, and Campaign Center opens the library already scoped to the selected campaign.
- Composer media picker now filters reusable assets by folder and campaign, defaulting to the post's selected campaign when available.

Risk: medium.

Priority: P1.

## Phase 7: Approvals And Collaboration

Goal: reduce publishing risk and support teams.

Scope:

- Team/user roles.
- Permissions.
- Submit for review.
- Approve/reject/request changes.
- Comments and mentions.
- Review queue.
- Audit history.

Acceptance criteria:

- Only permitted roles can approve.
- Approval state controls scheduling/publishing.
- Comments and approval decisions are recorded.
- Notifications link to the exact post.

Risk: high.

Priority: P1.

## Phase 8: Publishing Reliability

Goal: make publishing safe, recoverable, and observable.

Scope:

- Durable publish jobs.
- Idempotency key.
- Retry policy and backoff.
- Worker heartbeat.
- Queue depth.
- Dead-letter queue.
- Failure classification.
- Backend test harness fix.

Acceptance criteria:

- Retried jobs do not duplicate sends.
- Failed jobs can be inspected and recovered.
- Worker health is visible.
- Backend tests run in Docker.
- Publish state transitions are deterministic.

Risk: high.

Priority: P0.

## Phase 9: Inbox And Engagement

Goal: make the inbox a real engagement workspace.

Scope:

- Message/comment model.
- Unified inbox.
- Assignment.
- Saved replies.
- Resolution state.
- SLA metrics.
- In-app notifications.

Acceptance criteria:

- Messages are persisted.
- User can assign, resolve, and reply from inbox.
- Response time and unresolved count are measurable.

Risk: high.

Priority: P2.

## Phase 10: Analytics, Reporting And AI Optimization

Goal: turn analytics into decision support.

Scope:

- Analytics event model.
- Post engagement metrics.
- Campaign reports.
- Report builder.
- XLSX/PDF export.
- Best-time recommendations.
- AI insight summaries.
- Competitor/listening-lite tracker.

Acceptance criteria:

- Reports can be saved/exported.
- Recommendations cite source metrics.
- Campaign performance is clear.
- Analytics shows what to do next, not only what happened.

Risk: high.

Priority: P1.

## Release Sequence

| Release | Theme | Core result |
| --- | --- | --- |
| R0 | Stabilize current branch | Existing checks pass and current work is pushed |
| R1 | Product architecture and brand kit | Workspace can become branded and publish-ready |
| R2 | Campaign and composer | User can create campaign-based content quickly |
| R3 | Planner and media DAM | User can plan and manage assets professionally |
| R4 | Approvals and reliability | Team can publish safely |
| R5 | Analytics and inbox | User can measure, report, and respond |
| R6 | Hardening | Accessibility, E2E, visual regression, docs, backup/restore |

## Quality Gates For Every Phase

- `docker compose exec frontend npm run check`
- Backend compile/test path verified for backend changes.
- Migration upgrade/downgrade considered for schema changes.
- Browser smoke on affected routes.
- No horizontal overflow or clipped primary labels.
- Git commit and push checkpoint.
- Update docs when architecture changes.
