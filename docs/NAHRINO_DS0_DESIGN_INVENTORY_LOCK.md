# Nahrino DS-0 Design Inventory Lock

Date: 2026-06-05  
Status: Phase DS-0 completed as an implementation gate  
Scope: current frontend route, shell, navigation, layout, action, and component audit  
Goal: stop repeated UI patching and define exactly what must be rebuilt before DS-1 coding

## Executive Lock

The current app has useful product logic, but the UI structure is still not ready for a 10 out of 10 redesign pass.

The main problem is not color anymore. The main problem is product structure:

- old module routes still exist as top-level app pages,
- primary and secondary navigation models are mixed,
- content, queue, logs, campaigns, media, composer, store, and analytics repeat the same two-panel layout,
- many pages use capped scroll regions inside the page,
- filters are rebuilt page by page instead of using one saved-view model,
- setup/readiness still appears as a persistent product object,
- the app still feels like a collection of admin pages, not one SocialOps workflow.

DS-1 should not start by repainting pages. DS-1 should start by removing structural duplication.

## Current Route Inventory

| Route | Current role | DS-0 decision | Future destination |
| --- | --- | --- | --- |
| `/` | Dashboard | Keep, rebuild | Primary route: `داشبورد` |
| `/compose` | Post creation | Keep, rebuild | Primary route: `ساخت پست` |
| `/calendar` | Planner calendar | Keep, rebuild | Primary route: `تقویم` |
| `/content` | Content library | Keep, rebuild | Primary route: `محتوا` |
| `/media` | Media library/editor | Keep, rebuild | Primary route: `رسانه` |
| `/inbox` | Operational notifications | Keep, rebuild | Primary route: `پیام ها` |
| `/analytics` | Analytics/reports | Keep, rebuild | Primary route: `گزارش ها` |
| `/store` | Store/profile settings | Keep temporarily | Rename or migrate into `/settings` |
| `/campaigns` | Campaign manager | Merge | Contextual planner view |
| `/queue` | Publishing queue | Merge | Content/planner saved view |
| `/logs` | Publishing attempts | Merge | Reliability drawer/settings subview |
| `/channels` | Channel hub | Merge | Settings subview |
| `/rubika` | Rubika channel setup | Merge | Settings > channels |
| `/instagram` | Instagram setup | Merge | Settings > channels |
| `/onboarding` | Guided setup | Keep as temporary flow | Trigger only when incomplete |
| `/posts` | Legacy or placeholder route | Remove or redirect | `/content` or `/compose` |
| `/design-system` | Dev/design reference | Keep internal | Not primary product nav |
| `/login` | Auth | Keep | Auth-only route |

## Primary Navigation Lock

Final primary nav:

1. `داشبورد`
2. `ساخت پست`
3. `تقویم`
4. `محتوا`
5. `رسانه`
6. `پیام ها`
7. `گزارش ها`
8. `تنظیمات`

Do not add:

- `عملیات` as a primary route,
- `کتابخانه` as a separate primary route,
- `صف انتشار` as a primary route,
- `کمپین ها` as a primary route,
- channel names as primary routes.

## Navigation Findings

### Sidebar

Evidence:

- `frontend/components/sidebar.tsx`
- `frontend/components/sidebar.tsx:24-30` defines old labels like `امروز`, `ساخت`, `برنامه‌ریزی`.
- `frontend/components/sidebar.tsx:62-82` maps `/campaigns`, `/queue`, `/channels`, `/rubika`, `/instagram`, and `/logs` under other active nav items.

Decision:

- Keep the visual sidebar only as a temporary shell.
- Rename `امروز` to `داشبورد`.
- Rename `ساخت` to `ساخت پست`.
- Keep `/campaigns`, `/queue`, `/logs`, `/channels`, `/rubika`, `/instagram` out of visible primary nav.
- Settings must remain pinned and never require scrolling.

### Command Palette

Evidence:

- `frontend/components/command-palette.tsx:14-25`
- It exposes `راه‌اندازی`, `مرکز کانال‌ها`, and `بازیابی انتشار` next to primary product routes.

Decision:

- Command palette should show primary routes first.
- Secondary routes must be grouped under `تنظیمات`, `تقویم`, or `محتوا`.
- Onboarding appears only if setup is incomplete.
- Queue appears as `نمای بازیابی انتشار` under Content/Planner, not as a standalone mental model.

### Publishing Workspace Header

Evidence:

- `frontend/components/publishing-workspace.tsx:18-24`
- The header creates sub-tabs: `تقویم`, `کمپین‌ها`, `کتابخانه`, `صف انتشار`.

Decision:

- Remove this top tab model in DS-2/DS-4.
- It duplicates sidebar navigation and adds the complexity the user flagged.
- Replace with route-specific saved views:
  - Planner views: Month, Week, List, Campaign lanes.
  - Content views: All, Drafts, Scheduled, Published, Failed, Needs review.

## Duplicate Action Inventory

| Area | Duplicate action | Evidence | Decision |
| --- | --- | --- | --- |
| Campaigns | `کمپین جدید` in header and form | `frontend/app/campaigns/page.tsx:892`, `frontend/app/campaigns/page.tsx:1141` | Keep one create action; form opens in drawer/sheet |
| Campaigns | `پست جدید` from campaign page and planner | `frontend/app/campaigns/page.tsx:896`, `frontend/app/calendar/page.tsx:682` | Contextual create only, prefilled with campaign/day |
| Content | Empty state creates post while global create exists | `frontend/app/content/page.tsx:577` | Empty-state action allowed only when no content exists |
| Queue | Empty state and inspector both create/schedule post | `frontend/app/queue/page.tsx:504`, `frontend/app/queue/page.tsx:673` | Queue becomes filtered content view; no separate create CTA |
| Media | Header upload and panel actions compete with compose | `frontend/app/media/page.tsx:525`, `frontend/app/media/page.tsx:669` | Media primary action is upload; compose link becomes secondary contextual |
| Onboarding | Buttons to compose/calendar plus next action | `frontend/app/onboarding/page.tsx:164-169` | Onboarding has one next action plus secondary skip/close |
| Logs | Back to queue and retry actions mixed | `frontend/app/logs/page.tsx:343-347` | Logs become reliability detail from queue/content |
| App shell | Setup action and readiness badges remain global | `frontend/components/app-shell.tsx:197-211` | Show setup only when incomplete and actionable |

## Duplicate Filter Inventory

Pages currently rebuild their own search/filter systems:

| Page | Current filters | Problem | Future pattern |
| --- | --- | --- | --- |
| Calendar | search, campaign, view mode, density, status chips | Too many controls before content | Planner toolbar with saved views |
| Campaigns | search plus detail editor | Search is ok, but campaign page is separate from planner | Campaign lane/search inside Planner |
| Content | search, status, campaign, approval, sort | Useful but too dense and repeated | Shared `SavedViewToolbar` |
| Queue | search, status, campaign | Duplicates content filters | Queue as saved view of Content |
| Logs | search, status, mode | Should be a reliability diagnostic view | Contextual reliability drawer |
| Media | search, folder, campaign, attached/free | Useful but too scattered | Media saved views and chips |
| Analytics | time range, campaign, post search, post filter, sort | Useful but layout too heavy | Report controls in compact header |
| Inbox | search and status | Needs inbox-specific triage views | Inbox views: unread, due, assigned, resolved |

Lock:

- Build one shared saved-view/filter system before rebuilding Content, Queue, Logs, Media, and Reports.
- Every filter row must have:
  - search,
  - saved view selector,
  - one compact filter menu,
  - clear filters only when active.
- Do not keep separate full filter bars on each page.

## Nested Scroll and Two-Panel Inventory

The current app still violates the one-page-scroll target in many places.

Evidence from code:

| Page/component | Evidence | Problem |
| --- | --- | --- |
| Content | `frontend/app/content/page.tsx:570`, `635`, `640` | list scroll plus sticky inspector scroll |
| Queue | `frontend/app/queue/page.tsx:497`, `555`, `557` | duplicate content pattern with side inspector |
| Logs | `frontend/app/logs/page.tsx:467`, `472` | technical inspector traps scroll |
| Compose | `frontend/app/compose/page.tsx:789`, `1002`, `1009` | main form and studio inspector scroll separately |
| Store | `frontend/app/store/page.tsx:529`, `708` | form column and readiness preview scroll separately |
| Campaigns | `frontend/app/campaigns/page.tsx:935`, `977`, `978`, `1076`, `1325` | list, details, editor, assignment list all scroll |
| Media | `frontend/app/media/page.tsx:754`, `844`, `862` | grid and inspector are separate scroll zones |
| Calendar | `frontend/app/calendar/page.tsx:828` | planner has sticky side day inspector |
| Analytics | `frontend/app/analytics/page.tsx:640`, `825` | main report and side brand/summary scroll separately |
| DataView | `frontend/components/data-view.tsx:72` | shared capped scroll table/list |
| Command palette | `frontend/components/command-palette.tsx:90` | acceptable modal scroll |
| Image editor | `frontend/components/media-image-editor.tsx:1727`, `2312`, `2537` | acceptable only inside editor shell if contained |

Lock:

- Product pages should have one page scroll.
- Detail views should be drawers, bottom sheets, or inline expandable rows.
- Internal scroll is allowed only for:
  - modal command palette,
  - image editor side tools,
  - long dropdown lists,
  - mobile bottom sheets,
  - data tables with fixed headers only when explicitly needed.

## Old Component Inventory

The app currently has three overlapping component generations.

### Legacy/basic design system

- `frontend/components/ui/button.tsx`
- `frontend/components/ui/card.tsx`
- `frontend/components/ui/form.tsx`
- `frontend/components/ui/tag.tsx`
- `frontend/components/page-header.tsx`
- `frontend/components/filter-bar.tsx`
- `frontend/components/view-tabs.tsx`
- `frontend/components/dashboard-card.tsx`
- `frontend/components/post-card.tsx`
- `frontend/components/media-card.tsx`

Decision:

- Keep only until replaced.
- Do not use in new rebuild pages.
- Migrate button, form, status, card, and tag behavior into DS-1 primitives.

### Workspace/pro product layer

- `frontend/components/workspace-ui.tsx`
- `frontend/components/pro-product-ui.tsx`
- `frontend/components/publishing-workspace.tsx`
- `frontend/components/data-view.tsx`

Decision:

- Useful transitional layer.
- Must be split into final primitives:
  - `PageShell`
  - `PageHeader`
  - `SavedViewToolbar`
  - `ContentPreviewRow`
  - `ChannelRail`
  - `InspectorDrawer`
  - `BottomSheet`
  - `KpiStrip`

### Nahrino v2 primitives

- `frontend/components/nahrino-ui.tsx`

Decision:

- Keep as the starting point for DS-1.
- It is still dashboard-oriented and must be expanded beyond cards.
- It needs tokens from `NAHRINO_DESIGN_SYSTEM_V2.md`.

## Page-by-Page Redesign Lock

### Dashboard

Current state:

- improved, but still contains old card language,
- still has route links to secondary pages like `/channels`,
- visual asset work can become decorative instead of product-led.

Lock:

- Dashboard becomes one compact operations screen.
- Max 4 KPI tiles.
- No permanent setup/progress.
- No decorative hero art.
- Chart and attention list must be visible without long scroll on laptop.

### Composer

Current state:

- useful features exist,
- still feels like a long form plus side inspector,
- campaign and optional details still create visual friction,
- media editor entry exists but page can become too tall.

Lock:

- Rebuild as a step-based studio on mobile and 3-zone studio on desktop.
- Campaign field becomes a compact picker, not an expanded form by default.
- Schedule/readiness becomes sticky bottom action on mobile.
- Studio inspector becomes drawer/sheet, not permanent scroll trap.

### Planner

Current state:

- month/week/list exists,
- campaign page remains separate,
- right day inspector creates two-panel feeling,
- toolbar is too dense.

Lock:

- Planner owns campaigns, queue timing, calendar, and saved views.
- Campaign lanes are a planner view.
- Day details open in drawer/bottom sheet.
- Toolbar becomes compact: date nav, view selector, saved view/filter.

### Content

Current state:

- content and queue overlap heavily,
- filters are dense,
- side post reviewer repeats queue inspector.

Lock:

- Content becomes the single source for all posts.
- Queue is a saved view, not a separate route.
- Post detail opens drawer/sheet.
- Batch actions appear only after selection.

### Queue

Current state:

- duplicates content with queue-specific wording,
- has separate metrics, filters, list, inspector, and links to logs.

Lock:

- Remove as primary page.
- Keep `/queue` temporarily as redirect or compatibility route.
- Future UI: content saved view `بازیابی انتشار`.

### Logs

Current state:

- useful technical worker data,
- too prominent as user-facing page,
- duplicates queue recovery path.

Lock:

- Move to reliability detail.
- Normal users see issue and recovery action, not raw payload first.
- Advanced logs available under settings or developer mode.

### Campaigns

Current state:

- valuable data model,
- separate page adds complexity,
- campaign details/editor/post assignment create stacked scroll zones.

Lock:

- Campaigns merge into Planner.
- Campaign creation opens a focused drawer/sheet.
- Campaign details become lane inspector.
- Report export remains under Reports or campaign inspector.

### Media

Current state:

- media editor and library exist,
- filters and inspector are heavy,
- editor can dominate page shape.

Lock:

- Media becomes Creative Studio.
- Asset detail opens drawer/sheet.
- Editor opens contained workspace or fullscreen studio.
- Brand kit/templates become first-class tabs/views.

### Inbox

Current state:

- mostly operational notifications,
- not yet a real engagement inbox.

Lock:

- Rebuild around threads, assignments, labels, saved replies, due states.
- Notifications remain one inbox view, not the entire inbox concept.

### Reports

Current state:

- analytics has good data pieces,
- side report identity panel takes space,
- charts and tables compete with each other.

Lock:

- Reports become client-ready surfaces.
- Brand identity moves into export/settings, not persistent side panel.
- Charts need readable labels, selected/unselected state, and mobile table fallback.

### Store/Settings

Current state:

- store profile, brand kit, readiness checklist, preview, next step are all one long settings page,
- scroll traps exist.

Lock:

- Rename mental model from Store to Settings/Workspace.
- Split into tabs or sections:
  - Brand
  - Channels
  - Team
  - Publishing
  - Integrations
  - Advanced
- Readiness appears only if incomplete or broken.

### Onboarding

Current state:

- setup flow exists but still looks like a regular dashboard page,
- progress can become permanent product furniture.

Lock:

- Onboarding is temporary.
- Max 3 to 5 steps.
- One primary next action.
- After completion, it disappears from daily navigation.

## Hard Product Object Map

All UI must be rebuilt around these objects:

| Product object | UI pattern |
| --- | --- |
| Workspace | compact identity in shell/settings |
| ChannelAccount | channel rail and capability matrix |
| Post | content preview row/card |
| PublishJob | recovery state and reliability drawer |
| Campaign | planner lane and report grouping |
| MediaAsset | asset tile, usage map, editor source |
| InboxThread | triage row and reply sheet |
| Report | export-ready report surface |
| BrandKit | settings/media/composer shared token source |

Do not create pages around technical modules if they are not user mental models.

## DS-1 Entry Criteria

Before DS-1 coding, the team must accept these decisions:

1. The final visible nav is the 8-item Persian workflow nav.
2. Queue, campaigns, logs, channels, Rubika, Instagram are contextual or settings subviews.
3. No new UI uses `PublishingWorkspaceHeader` as a top tab system.
4. No new page uses two large independently scrolling panels.
5. New filters use a shared saved-view toolbar.
6. Setup/readiness is not permanent dashboard content.
7. Composer, Planner, Content, Media, Reports use drawers/sheets for detail.
8. Existing old pages can remain during migration, but not as design references.

## DS-1 Recommended First Code Changes

Order:

1. Create final token variables in `globals.css`.
2. Create final primitives:
   - `NPageShell`
   - `NPageHeader`
   - `NSavedViewToolbar`
   - `NKpiStrip`
   - `NContentRow`
   - `NChannelRail`
   - `NInspectorDrawer`
   - `NBottomSheet`
3. Update shell labels:
   - `امروز` -> `داشبورد`
   - `ساخت` -> `ساخت پست`
   - `برنامه‌ریزی` -> `تقویم`
4. Remove secondary command palette routes from the primary command group.
5. Replace `PublishingWorkspaceHeader` on Planner/Content surfaces.
6. Rebuild Dashboard from DS v2, then Planner, then Content.

## Risk Register

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| Repainting old layouts | Keeps app at template quality | Rebuild shell and object patterns first |
| Keeping queue/campaign/log pages primary | Preserves complex UX | Merge as views/drawers |
| Overusing cards | Makes app look like MVP | Use rows, lanes, tables, and sheets |
| Decorative assets | Adds beauty but not usability | Use real thumbnails, report charts, channel rails |
| Mobile as stacked desktop | Creates too much scroll | Design mobile task flows separately |
| Too many filters | Users cannot find first action | Saved views and filter menu |
| Persistent readiness | Feels like setup never ends | Hide when complete |

## Phase DS-0 Acceptance Result

Accepted:

- route inventory completed,
- shell/nav duplication identified,
- duplicate actions identified,
- duplicate filters identified,
- nested scroll traps identified,
- old component generations identified,
- page-by-page rebuild target defined,
- DS-1 entry criteria defined.

Remaining for DS-1:

- implement the structural shell and token reset,
- begin deleting the visible complexity,
- migrate one page at a time to the new system.

