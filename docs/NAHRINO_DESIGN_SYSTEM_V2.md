# Nahrino Design System v2

Date: 2026-06-04  
Status: Design source of truth before the next rebuild phase  
Product: Persian-first multi-channel SocialOps workspace  
Target quality: modern, minimal, professional, responsive, motion-aware, benchmark-level

Roadmap authority:

- Main visual-design phase order: `docs/NAHRINO_VISUAL_DESIGN_ROADMAP.md`
- Detailed token/component/layout implementation: this file
- Product and UX rationale: `docs/NAHRINO_UI_UX_THEME_RFP_2026.md`

## 1. Design Decision

Nahrino should stop looking like a decorated MVP dashboard.

The new design system must make it feel like a real daily work product for teams who create, schedule, publish, monitor, and report content across channels.

The target experience is:

- calm and compact,
- Persian-first and RTL-native,
- mobile-first for daily actions,
- content-led instead of decoration-led,
- professional enough for managers and clients,
- simple enough for non-technical operators,
- interactive through meaningful state motion,
- visually consistent across every page.

The app should not depend on:

- large decorative hero artwork,
- random gradients,
- black-heavy chrome,
- repeated cards,
- two independent scroll panels,
- duplicate menus,
- permanent setup/progress modules,
- abstract dashboards with no clear next action.

## 2. Research Basis

This system is based on:

- the user-provided benchmark report: `The 2026 Digital Interface Ecosystem`,
- the user-provided visual systems report: `The Comprehensive Architecture of Modern Visual Design Systems`,
- the user-provided roadmap report: `Professional Visual Design System Roadmap for a 10/10 App`,
- existing Nahrino rebuild docs,
- observed weaknesses in the current app,
- benchmark patterns from Buffer, Hootsuite, Sprout Social, Later, Planable, Metricool, Agorapulse, and Canva-style creative workflows,
- platform standards from Apple HIG, Material Design, WCAG 2.2, Core Web Vitals, and Figma token practices.

Useful reference anchors:

- Apple HIG says motion should support feedback and not exist for its own sake: https://developer.apple.com/design/human-interface-guidelines/motion
- Apple HIG buttons guidance uses a 44 x 44 pt minimum hit region: https://developer.apple.com/design/human-interface-guidelines/buttons
- Material touch target guidance uses 48 x 48 px/dp targets: https://m2.material.io/develop/web/supporting/touch-target
- WCAG 2.2 target size minimum is 24 x 24 CSS px with exceptions: https://www.w3.org/TR/WCAG22/
- Core Web Vitals focus on LCP, INP, and CLS: https://web.dev/articles/vitals
- Figma variables support token modes for design systems: https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables

### 2.1 Visual Systems Source Integration

The visual systems report adds one important correction to this document:

**Nahrino must be built as a tokenized product system, not as styled pages.**

That means every future UI decision should map to:

1. a primitive value,
2. a semantic role,
3. a component-level behavior.

The source also adds five practical rules:

- use color roles, not arbitrary hex decisions,
- support density modes for compact operational work and comfortable touch work,
- separate productive UI typography from expressive brand/template typography,
- use elevation as a small tokenized Z-axis system, not random shadows,
- use motion physics for state feedback, but avoid decorative or costly optical effects.

Nahrino interpretation:

- adopt the rigor of W3C-style design tokens,
- borrow the responsiveness and emotional motion discipline of Material 3 Expressive,
- borrow the layered clarity of Apple spatial design only where it improves hierarchy,
- do not chase literal Liquid Glass refraction in the app shell because it is expensive, browser-fragile, and distracts from operational clarity.

## 3. Product Mental Model

Nahrino is not "Rubika Publisher" anymore.

It is:

**نشرینو: فضای کاری مدیریت انتشار و ارتباطات چندکاناله**

Daily user model:

1. See what matters today.
2. Create or improve content.
3. Plan schedule and campaigns.
4. Publish and recover failures.
5. Respond to messages.
6. Read performance.
7. Tune channels, brand, and team settings.

Primary navigation:

| Persian label | English meaning | Route | Purpose |
| --- | --- | --- | --- |
| داشبورد | Dashboard | `/` | One-screen daily operating summary |
| ساخت پست | Create | `/compose` | Source idea, channel variants, preview, schedule |
| تقویم | Planner | `/calendar` | Calendar, campaigns, queue, planning |
| محتوا | Content | `/content` | Published, draft, scheduled, failed content library |
| رسانه | Media | `/media` | Assets, brand kit, templates, image editor |
| پیام ها | Inbox | `/inbox` | Engagement, comments, messages, assignments |
| گزارش ها | Reports | `/analytics` | Analytics, campaign reports, exports |
| تنظیمات | Settings | `/store` or future `/settings` | Brand, channels, team, integrations |

Secondary pages must be contextual, not primary nav:

- Queue lives inside Planner and Content.
- Campaigns live inside Planner.
- Logs live inside Publishing Reliability or Settings.
- Rubika and Instagram live inside Channels/Settings.
- Onboarding is a temporary flow or checklist, not a permanent page.

## 4. Design Personality

Theme name: **Calm Editorial Operations**

Personality:

- precise,
- warm,
- modern,
- quiet,
- trustworthy,
- editorial,
- efficient,
- Persian-native.

It should feel closer to a professional publishing room than a generic SaaS template.

It should not feel like:

- a landing page,
- a command-and-control war room,
- a decorative portfolio,
- a CRM clone,
- a Tailwind dashboard starter.

## 5. Visual Identity

### 5.1 Brand Name

Use Persian naming in the UI:

- Product name: `نشرینو`
- English internal name: `Nahrino`
- Dashboard title: `داشبورد`
- Avoid: `فرماندهی`, `کنترل روم`, `عملیات` as primary labels.

### 5.2 Logo Direction

Logo should be a compact Persian-first mark:

- wordmark: `نشرینو`,
- symbol idea: a minimal publishing pulse, folded post, or channel signal,
- avoid extra square containers around the logo,
- avoid app-icon-only identity in the sidebar if text is needed for clarity.

Logo placement:

- desktop: top of sidebar, 32px mark plus wordmark,
- mobile: top bar wordmark only, with app menu action,
- no decorative box behind logo unless it is the actual symbol.

### 5.3 Visual Asset Philosophy

Beauty should come from real product objects:

- post thumbnails,
- brand avatars,
- campaign colors,
- channel icons,
- report charts,
- media templates,
- content previews,
- inbox thread snippets.

Use generated or illustrative assets only for:

- onboarding empty states,
- brand kit previews,
- template placeholders,
- rare educational states.

Do not use generic abstract backgrounds to hide weak layout.

## 6. Theme Tokens

### 6.0 Token Architecture

Nahrino tokens must use a three-tier model.

| Tier | Purpose | Nahrino example |
| --- | --- | --- |
| Primitive | Raw approved value with no usage meaning | `color.teal.700`, `space.4`, `radius.md` |
| Semantic | Product intent mapped to primitive values | `color.action.primary`, `surface.panel`, `text.muted` |
| Component | Scoped component behavior mapped to semantic roles | `button.primary.bg.default`, `content-row.rail.channel`, `drawer.surface.overlay` |

Rules:

- primitive tokens never appear directly in page components,
- semantic tokens drive surfaces, text, borders, status, motion, and elevation,
- component tokens are allowed only when a component has a real behavioral state,
- token names must be descriptive and predictable, not visual nicknames like `blue1` or `nice-shadow`,
- dark mode, high contrast, compact density, and future brand modes must change semantic mappings, not page CSS.

Recommended naming syntax:

```text
nahrino.{category}.{role}.{property}.{state}.{scale}
```

Examples:

```text
nahrino.color.feedback.background.error
nahrino.surface.panel.background.default
nahrino.button.primary.background.hover
nahrino.content.row.spacing.compact
nahrino.motion.drawer.enter.standard
```

### 6.1 Color Primitives

| Token | Value | Use |
| --- | --- | --- |
| `ink-950` | `#111827` | Highest contrast text |
| `ink-900` | `#18212F` | Main text |
| `ink-700` | `#334155` | Secondary strong text |
| `ink-500` | `#64748B` | Muted labels |
| `canvas-50` | `#FBFAF7` | App background top |
| `canvas-100` | `#F7F6F2` | App background |
| `canvas-200` | `#EFEDE6` | Soft band |
| `surface-0` | `#FFFFFF` | Main surface |
| `surface-50` | `#FCFBF8` | Raised surface |
| `surface-100` | `#F5F3ED` | Toolbar surface |
| `border-100` | `#E7E2D8` | Default border |
| `border-200` | `#D8D2C5` | Strong border |
| `teal-700` | `#0B7771` | Primary action |
| `teal-900` | `#0F3D3A` | Primary dark |
| `blue-700` | `#2563EB` | Information |
| `emerald-700` | `#15803D` | Success |
| `amber-700` | `#B7791F` | Warning |
| `rose-700` | `#C24150` | Failure |

### 6.2 Semantic Color Tokens

| Token | Value |
| --- | --- |
| `--app-bg` | `canvas-100` |
| `--app-bg-soft` | `canvas-50` |
| `--surface` | `surface-0` |
| `--surface-muted` | `surface-50` |
| `--surface-toolbar` | `surface-100` |
| `--text` | `ink-900` |
| `--text-muted` | `ink-500` |
| `--border` | `border-100` |
| `--border-strong` | `border-200` |
| `--primary` | `teal-700` |
| `--primary-strong` | `teal-900` |
| `--focus-ring` | `rgba(11, 119, 113, 0.24)` |

Semantic color roles must be paired with foreground roles.

| Background role | Required foreground role | Rule |
| --- | --- | --- |
| `surface.panel` | `text.primary` | Body contrast target 4.5:1 |
| `surface.muted` | `text.secondary` | Secondary copy remains readable |
| `action.primary.bg` | `action.primary.fg` | CTA text must be algorithmically paired |
| `feedback.error.bg` | `feedback.error.fg` | Never rely only on red rail or icon |
| `channel.rail.*` | `text.primary` | Channel colors are accent only |

Future theme modes must alter the semantic role values together. A surface color should never be changed without its matching text, icon, and border roles.

### 6.3 Status Tokens

| State | Text | Surface | Border |
| --- | --- | --- | --- |
| Ready | `#0F766E` | `#ECFDF5` | `#A7F3D0` |
| Scheduled | `#1D4ED8` | `#EFF6FF` | `#BFDBFE` |
| Draft | `#475569` | `#F8FAFC` | `#CBD5E1` |
| Needs Action | `#B7791F` | `#FFFBEB` | `#FDE68A` |
| Failed | `#BE123C` | `#FFF1F2` | `#FECDD3` |
| Offline | `#52525B` | `#F4F4F5` | `#D4D4D8` |

### 6.4 Channel Tokens

Channel color must be an accent rail, not a full background.

| Channel | Token | Color |
| --- | --- | --- |
| Rubika | `--channel-rubika` | `#00A1B2` |
| Instagram | `--channel-instagram` | `#D62976` |
| Telegram future | `--channel-telegram` | `#229ED9` |
| Website future | `--channel-web` | `#334155` |
| Manual task | `--channel-manual` | `#B7791F` |

Rules:

- use channel color for a 3px rail, icon dot, or small chip,
- never flood cards with channel gradients,
- show capability state beside channel name: API, manual, limited, disconnected.

## 7. Typography

### 7.1 Font Stack

Base:

```css
font-family: Vazirmatn, Tahoma, Arial, sans-serif;
```

Display:

```css
font-family: Vazirmatn, Lalezar, Tahoma, Arial, sans-serif;
```

Rules:

- Vazirmatn is the product workhorse.
- Decorative Persian fonts are allowed inside media editor outputs, not core app UI.
- Lalezar is allowed only for brand moments or template previews.
- UI must not use too many font families.

### 7.2 Type Scale

| Role | Desktop | Mobile | Weight | Line height |
| --- | ---: | ---: | ---: | ---: |
| Page title | 24px | 20px | 800 | 1.35 |
| Section title | 16px | 15px | 800 | 1.45 |
| Card title | 14px | 14px | 800 | 1.5 |
| Body | 14px | 14px | 500 | 1.65 |
| Small body | 13px | 13px | 500 | 1.65 |
| Label | 12px | 12px | 700 | 1.4 |
| Data | 20px | 18px | 900 | 1.2 |

Rules:

- no viewport-scaled typography,
- no negative letter spacing,
- no body text below 13px,
- Persian paragraphs need generous line height,
- use Persian numerals consistently in UI copy where appropriate.

### 7.3 Productive and Expressive Typography

Nahrino has two typography suites.

| Suite | Use | Baseline | Behavior |
| --- | --- | ---: | --- |
| Productive | App shell, dashboards, tables, filters, composer controls | 14px | Fixed sizes, compact, high readability |
| Expressive | Brand moments, media templates, report covers, onboarding moments | 16px+ | More spacious, visual, used sparingly |

Rules:

- daily product UI uses the Productive suite,
- report exports and creative templates may use Expressive typography,
- core app pages must not use fluid viewport-scaled headings,
- line measure should be capped for long text blocks,
- dense tables and rows use fixed type sizes so alignment does not break.

Recommended line measure:

- body paragraphs: max `64ch`,
- explanatory side notes: max `52ch`,
- dense rows: truncate or wrap to two lines,
- report narrative blocks: max `72ch`.

## 8. Spacing, Radius, Shadows

### 8.1 Spacing Scale

Base grid: 4px. Layout rhythm: 8px.

| Token | Size |
| --- | ---: |
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |

Rules:

- compact work surfaces use 12px to 16px padding,
- dashboards should fit the primary summary in one laptop viewport,
- mobile pages should avoid long stacks of equally heavy cards.

### 8.2 Radius

| Token | Size | Use |
| --- | ---: | --- |
| `radius-xs` | 6px | Chips, tiny badges |
| `radius-sm` | 8px | Buttons, inputs, rows |
| `radius-md` | 10px | Cards and tiles |
| `radius-lg` | 14px | Sheets, dialogs |
| `radius-pill` | 999px | Pills only |

Rules:

- cards should usually be 8px to 10px,
- avoid over-rounded SaaS blobs,
- avoid nesting rounded cards inside rounded cards.

### 8.3 Shadow

Use borders first, shadows second.

| Token | Value | Use |
| --- | --- | --- |
| `shadow-hairline` | `0 0 0 1px rgba(216, 210, 197, 0.9)` | Default surface |
| `shadow-soft` | `0 10px 24px rgba(24, 33, 47, 0.055)` | Hover or raised panel |
| `shadow-float` | `0 18px 42px rgba(24, 33, 47, 0.12)` | Popover, drawer |

Rules:

- no heavy black shadows,
- no card pile effect,
- popovers must feel layered but not dramatic.

### 8.4 Elevation Tokens

Elevation is a structural role, not decoration.

| Level | Token | Use | Shadow |
| --- | --- | --- | --- |
| 0 | `elevation.base` | Page canvas, flat lists, nav areas | none or hairline |
| 1 | `elevation.raised` | Panels, KPI strips, content rows on hover | `shadow-soft` |
| 2 | `elevation.overlay` | Menus, command palette, sticky toolbar | `shadow-float` |
| 3 | `elevation.modal` | Drawer, bottom sheet, dialog | `shadow-lift` |
| 4 | `elevation.critical` | Blocking alert or destructive confirmation | strongest allowed shadow |

Rules:

- most surfaces stay at level 0 or 1,
- hover/focus may lift one level only,
- drawers, sheets, and command palette are overlays, not cards inside cards,
- elevation must clarify interaction priority, not create visual drama.

### 8.5 Density Modes

Nahrino must support three density modes at the token level.

| Mode | Purpose | UI behavior |
| --- | --- | --- |
| Compact | Power users, desktop operations, data-heavy views | tighter rows, smaller gaps, 36px controls where safe |
| Standard | Default desktop/laptop | current baseline, balanced readability |
| Comfortable | Mobile, touch, accessibility | 48px targets, larger row padding, more air |

Initial implementation:

- standard mode is default,
- compact mode is allowed for tables, planner list, content library, reports,
- comfortable mode is automatic on mobile and touch-heavy flows,
- density changes must be implemented through spacing and component tokens, not one-off classes.

## 9. Layout System

### 9.1 Page Shell

Desktop:

- sidebar: 232px expanded, 76px compact future,
- topbar: 56px,
- content max width: 1440px,
- page padding: 16px to 24px,
- one page scroll.

Laptop:

- dashboard first viewport target height: 720px to 820px,
- avoid more than 2 major vertical sections before the fold,
- summary cards must be compact.

Mobile:

- bottom navigation for primary routes,
- topbar with product name and one primary action,
- bottom sheets for details,
- no desktop sidebar,
- no side-by-side list/detail panels,
- no nested scrolling inside cards.

### 9.2 Layout Patterns

Allowed:

- single-column mobile flow,
- desktop grid with one main surface and one compact side summary,
- sticky inspector drawer,
- modal or bottom sheet for detailed tasks,
- horizontal segmented views for planner/report modes.

Avoid:

- two large panels that both scroll,
- three equal columns of cards,
- huge hero plus dashboard below,
- permanent setup modules,
- duplicate action bars.

### 9.3 Responsive Breakpoints

| Breakpoint | Width | Behavior |
| --- | ---: | --- |
| XXS | `< 360px` | Single column, no dense tables, labels may stack |
| Mobile | `360px - 639px` | Bottom nav, sheets, single goal per screen |
| Tablet | `640px - 1023px` | Two-column only when content is short |
| Laptop | `1024px - 1279px` | Compact dashboard and planner |
| Desktop | `1280px - 1767px` | Full shell, inspector drawers allowed |
| Wide | `1768px+` | Centered max-width, never stretch text indefinitely |

Grid rules:

- use fluid grids until desktop,
- cap main content width on wide displays,
- gutters grow by breakpoint: 16px mobile, 24px tablet, 32px desktop, 40px wide,
- content aligns to columns, not gutters,
- intrinsic controls like chips and buttons keep natural width.

### 9.4 Surface Topology

Surface hierarchy:

1. Canvas: page background.
2. Base surface: lists, toolbars, flat rows.
3. Raised surface: panels and important groups.
4. Overlay surface: menus, command palette, drawers.
5. Critical surface: destructive confirmations and blocking recovery.

Do not simulate Liquid Glass as a general theme.

Allowed spatial effects:

- subtle translucent topbar,
- soft overlay blur behind command palette or drawer,
- edge shadow on drawers,
- small focus glow for live status.

Forbidden spatial effects:

- heavy refraction,
- chromatic edge dispersion,
- noisy glass textures,
- glass cards over dense app content,
- background distortion behind text.

## 10. Core Components

### 10.0 Atomic Component Model

Nahrino components must be rebuilt bottom-up.

| Layer | Meaning | Nahrino examples |
| --- | --- | --- |
| Atom | Basic token or element | color role, text label, icon, focus ring |
| Molecule | Small functional control | search field, status chip, channel badge |
| Organism | Product object surface | content row, planner lane, inbox thread, report panel |
| Template | Screen structure | dashboard grid, composer studio, planner layout |
| Page | Real data in a template | dashboard, composer, media, reports |

Rules:

- page components should compose organisms, not rebuild atoms,
- content row, channel rail, saved-view toolbar, drawer, and KPI strip are required organisms,
- design-system examples must use real Nahrino objects, not generic demo cards.

### 10.1 App Shell

Components:

- sidebar,
- topbar,
- command/search input,
- create button,
- alert area,
- user/workspace menu,
- mobile bottom nav.

Rules:

- one global create action only,
- settings pinned at bottom but always visible,
- no long empty sidebar space,
- no duplicate top route tabs when sidebar already defines the route,
- route labels must use the Persian workflow names.

### 10.2 Page Header

Contains:

- page title,
- one sentence value/context,
- one primary action,
- optional saved view selector.

Does not contain:

- permanent setup progress,
- multiple competing CTAs,
- decorative badges,
- duplicated filters.

### 10.3 KPI Tile

Use for:

- next publish,
- active campaign count,
- failed jobs,
- inbox due,
- weekly performance.

Rules:

- tile is clickable if it represents a route or filtered view,
- maximum 4 KPI tiles on dashboard,
- label, value, change/detail, status rail,
- no big icons on every tile.

Token anatomy:

- container: `surface.panel`, `elevation.raised`,
- label: `text.secondary`, Productive label,
- value: `text.primary`, Productive data,
- state rail: semantic status or channel accent,
- hover: one elevation level only.

### 10.4 Action Row

Use instead of oversized cards for compact tasks.

Contains:

- icon,
- title,
- one-line reason,
- status chip,
- action.

### 10.5 Content Preview Tile

Contains:

- thumbnail,
- title/caption,
- channel rail,
- status,
- scheduled/published time,
- campaign tag,
- quick action menu.

Rules:

- no media means quiet placeholder,
- text must clamp cleanly,
- channel state visible without opening detail.

Token anatomy:

- container background: `surface.panel`,
- thumbnail: fixed ratio with fallback,
- channel rail: component token, 3px or compact chip,
- status: semantic feedback token,
- primary action: visible only on focus/hover or row selection when possible.

### 10.5.1 Data Table and Row Anatomy

Tables and dense rows must use density tokens.

Compact mode:

- smaller vertical padding,
- fixed Productive type,
- row height target 40px to 44px,
- fewer secondary details.

Standard mode:

- row height target 48px to 56px,
- thumbnail and status visible,
- one-line details.

Comfortable mode:

- row height target 56px+,
- touch-friendly actions,
- details can wrap to two lines.

Rules:

- tables need clear header alignment,
- row actions should not crowd the data,
- mobile table fallback is a stacked row list,
- selection state must be visible without relying only on background color.

### 10.6 Channel Rail

Small visual marker for channel/capability.

Variants:

- horizontal badges,
- vertical rail on cards,
- compact icon stack,
- capability matrix row.

Must show:

- channel,
- state: connected, manual, limited, failed,
- action if blocked.

### 10.7 Planner Cell

Month view:

- compact date,
- count by status,
- top 2 content previews,
- more indicator.

Week/list view:

- time lane,
- content preview row,
- channel rail,
- publish/recovery state.

Rules:

- click opens inspector or bottom sheet,
- no large full-card day boxes on mobile,
- campaign lanes are visible without a separate campaign page.

### 10.8 Composer Studio

Desktop layout:

- right: source idea and caption,
- center: channel previews,
- left: schedule/readiness/approval inspector.

Mobile layout:

- stepper: content, media, channels, schedule, preview,
- sticky bottom action: save/schedule/publish,
- full-screen preview when needed.

Rules:

- one source idea can produce channel variants,
- each channel shows limits and readiness,
- media editor is available from selected media,
- autosave state must be visible and calm.

### 10.9 Media Creative Studio

Contains:

- asset library,
- brand kit,
- image editor,
- template kits,
- usage map,
- export variants.

Rules:

- image editor must not make the page too tall on open,
- selected effects must have clear unselect/reset,
- custom colors must update live without infinite loops,
- text tools need Persian fonts but core UI stays restrained.

### 10.10 Inbox Thread

Contains:

- sender/avatar,
- channel,
- message preview,
- status,
- assignment,
- SLA/age,
- last action.

Rules:

- unread and due states are clear,
- saved replies live near the reply box,
- assignment is not hidden in menus.

### 10.11 Reports Surface

Contains:

- KPI strip,
- trend chart,
- channel split,
- top posts,
- campaign result,
- insight notes,
- export action.

Rules:

- month/date labels must be readable,
- charts need hover/click states and unselect,
- reports should look client-ready,
- every chart needs a table fallback on mobile.

### 10.12 Forms

Rules:

- labels above fields,
- helper/error text below,
- 44px minimum desktop interactive height where practical,
- 48px mobile touch targets,
- Jalali date picker for Persian workflows,
- date picker should be compact and anchored to the field,
- only one date picker open at a time,
- click outside closes it.

## 11. Motion System

Motion rule:

**Motion exists to show state, progress, causality, or focus.**

Nahrino chooses restrained spring-like motion, not decorative animation.

The visual systems source is clear that modern motion should preserve continuity and feel interruptible. For web implementation, we approximate this with consistent easing and state-driven transitions until a dedicated motion library is introduced.

### 11.1 Motion Durations

| Motion | Duration |
| --- | ---: |
| Tap feedback | 80ms to 120ms |
| Hover/focus | 120ms to 180ms |
| Popover/sheet enter | 160ms to 220ms |
| Page section enter | 220ms to 280ms |
| Save/publish progress | state-driven |

### 11.2 Motion Tokens

| Token | Easing |
| --- | --- |
| `ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` |
| `ease-emphasized` | `cubic-bezier(0.2, 0, 0, 1.2)` |
| `ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` |

### 11.2.1 Motion Physics Roles

| Role | Feel | Use |
| --- | --- | --- |
| `motion.press` | fast, firm, no bounce | buttons, rows, chips |
| `motion.reveal` | soft and clear | drawer, command palette, bottom sheet |
| `motion.reorder` | spring-like continuity | future drag/drop planner and media ordering |
| `motion.progress` | linear or state-driven | upload, save, publish, retry |
| `motion.attention` | one pulse only | warning, failed publish, live notification |

Rules:

- hover and press feedback should be under 180ms,
- page transitions should not block interaction,
- repeated looping motion is forbidden except live status indicators,
- interrupted interactions should settle naturally instead of snapping,
- future drag/drop interactions should use spring-like return/snap behavior.

### 11.3 Functional Motion Map

| State | Motion |
| --- | --- |
| Saving draft | small inline progress shimmer |
| Saved | brief checkmark fade, no toast spam |
| Publishing | timeline progress and job state |
| Failed publish | row pulse once plus clear recovery action |
| Selected chart bar | selected state, click outside clears |
| Selected media | visible border and toolbar |
| Active composer step | same-size circle filled, soft pulse |
| Calendar drag/drop future | follow pointer, snap preview |
| Live inbox notification | compact toast plus inbox badge |

### 11.4 Reduced Motion

Respect `prefers-reduced-motion`.

When reduced motion is enabled:

- disable loops,
- replace movement with color/focus changes,
- keep progress state visible.

## 12. Accessibility and Ergonomics

Minimum:

- WCAG 2.2 AA target.
- Text contrast 4.5:1 for body.
- Interactive target at least 24 x 24 CSS px by WCAG minimum.

Nahrino internal target:

- desktop controls: minimum 36px visual height, 44px hit area,
- mobile controls: 48px hit area,
- icon buttons: 40px desktop, 44px to 48px mobile,
- rows: 48px minimum mobile touch area.

Rules:

- focus states are visible,
- keyboard access is required for menus, filters, modals, and date pickers,
- no action should rely only on color,
- RTL alignment must be natural,
- bottom sheets should place primary action within thumb reach.

## 13. Data Visualization

Charts must be readable before beautiful.

Rules:

- use Persian month labels where the product context is Persian,
- use compact labels but not truncated nonsense,
- chart hover/click state must have unselect behavior,
- selected data should also show as a readable summary,
- mobile charts need a table/list version,
- no decorative chart backgrounds,
- use color consistently with semantic meaning.

Dashboard chart set:

- mini trend line for weekly reach or engagement,
- donut for content status or channel mix,
- horizontal bars for campaign progress,
- sparkline inside KPI only if it adds meaning.

## 14. Visual Asset System

### 14.1 Required Asset Types

| Asset | Use |
| --- | --- |
| Product thumbnails | Content, planner, reports |
| Brand avatar/logo | Shell, store/settings, preview |
| Channel icons | Rails, filters, account states |
| Campaign color swatches | Planner lanes, reports |
| Template thumbnails | Media studio |
| Empty-state line icons | Empty planner, inbox, media |
| Report mini charts | Dashboard and analytics |

### 14.2 Art Direction

Allowed:

- editorial grid lines at very low contrast,
- timeline lines,
- soft paper-like surfaces,
- thumbnail collages from real content,
- meaningful status pulses,
- subtle progress waves,
- product screenshots/mock panels.

Avoid:

- random dotted backgrounds,
- generic blobs/orbs,
- high-saturation gradients,
- abstract 3D objects,
- dark glassmorphism,
- decorative hero art inside the app,
- repeated illustration cards.

### 14.3 Image Guidelines

If visual assets are needed, prefer:

1. real uploaded media,
2. generated product mock thumbnails,
3. brand-kit previews,
4. template previews,
5. restrained empty-state illustrations.

No asset should increase scroll just to look decorative.

## 15. Screen-Level Design Specs

### 15.1 Dashboard

Purpose:

- answer "what should I do now?"

First viewport:

- page title: `داشبورد`,
- compact date/workspace context,
- 4 KPI tiles max,
- one operational focus panel,
- one compact chart,
- one action list.

Remove:

- permanent profile readiness,
- permanent setup progress,
- duplicate campaign/calendar sections if KPI tiles link to them,
- oversized brand identity cards.

Mobile:

- KPI carousel or 2 x 2 compact grid,
- one "needs attention" list,
- chart collapses into summary plus details button.

### 15.2 Planner

Purpose:

- schedule, campaigns, and publishing queue in one workspace.

Views:

- month,
- week,
- list,
- campaign lanes.

Rules:

- no separate campaign mental model,
- click KPI or campaign opens filtered planner,
- inspector is a drawer on desktop and bottom sheet on mobile,
- no dual full-height scroll panels.

### 15.3 Composer

Purpose:

- create once, adapt per channel.

Required areas:

- source idea,
- media,
- channel variants,
- schedule,
- preview,
- approval/comments,
- readiness.

Rules:

- campaign field must not feel messy,
- date picker must be compact,
- image editor available inside media step,
- current step indicator uses same-size filled circle with gentle pulse.

### 15.4 Content Library

Purpose:

- one library for draft, scheduled, published, failed, and archived content.

Rules:

- one shared saved-view/filter system,
- no duplicated filter rows,
- content rows use preview tile pattern,
- queue/log details are contextual states of content or publish jobs.

### 15.5 Media

Purpose:

- creative studio, not file storage.

Required:

- brand kit,
- image editor,
- templates,
- asset library,
- usage map,
- export variants.

Rules:

- editor opens in a contained studio layout,
- layer/effect selection has clear reset,
- color picker live updates must be performant,
- Persian fonts are grouped by role and preview visibly.

### 15.6 Inbox

Purpose:

- operational engagement.

Required:

- unread/due views,
- assignments,
- labels,
- saved replies,
- channel filters,
- thread detail,
- internal notes.

Rules:

- not just a message list,
- dashboard shows inbox only when action is needed.

### 15.7 Reports

Purpose:

- management-ready analytics.

Required:

- KPI strip,
- trend,
- channel mix,
- campaign performance,
- top content,
- recommendations,
- export.

Rules:

- readable labels,
- unselect chart interaction,
- mobile summary first,
- export view should look polished.

### 15.8 Settings and Onboarding

Purpose:

- configure once, recover when broken.

Rules:

- onboarding is 3 to 5 steps,
- first meaningful win within 60 seconds,
- setup progress becomes hidden after completion,
- health warnings appear only when action is needed,
- channels and store profile live here.

## 16. Empty States

Empty states should not be generic.

Pattern:

- short title,
- one sentence reason,
- one primary action,
- optional example preview.

Examples:

- Empty planner: show a small example post lane and "زمان بندی اولین پست".
- Empty inbox: show connected channels and "وقتی پیامی برسد اینجا دیده می شود".
- Empty media: show template placeholders and "افزودن اولین تصویر".
- Empty reports: show required publish volume and "بعد از اولین انتشار گزارش ساخته می شود".

## 17. Copywriting

Language:

- Persian UI first,
- calm and direct,
- no inflated enterprise language,
- avoid "command center" style labels.

Button labels:

- `ساخت پست`
- `زمان بندی`
- `انتشار`
- `ذخیره پیش نویس`
- `رفع مشکل`
- `مشاهده گزارش`
- `اتصال کانال`

Avoid:

- vague labels like `ادامه`,
- duplicate primary actions,
- technical terms unless needed.

## 18. Implementation Phases

Each phase should end with:

- frontend check passing,
- browser desktop smoke test,
- browser mobile smoke test,
- screenshot review when visual layout changes,
- commit,
- push.

### Phase DS-0: Design Inventory Lock

Goal:

- freeze the current problems and prevent more random UI patches.

Deliverables:

- list all duplicate nav/actions/filters,
- list all two-scroll layouts,
- list all pages using old card system,
- define routes to keep, merge, or hide.

Acceptance:

- every current screen has a redesign target,
- no new UI work starts without mapping to this system.

### Phase DS-1: Token Foundation

Goal:

- replace scattered colors, radius, shadows, spacing, density, and elevation with tokens.

Deliverables:

- CSS variables in `globals.css`,
- Tailwind token mapping if needed,
- token examples in design-system page,
- remove old one-off background patterns.
- primitive, semantic, and component token map,
- density token map for compact, standard, comfortable,
- elevation token map for base, raised, overlay, modal.

Acceptance:

- all new components use semantic tokens,
- no hardcoded random colors in new surfaces,
- reduced motion behavior exists.
- page components do not consume primitive tokens directly,
- new tables/rows declare a density mode,
- overlay components use elevation tokens.

### Phase DS-2: Shell Rebuild

Goal:

- make the app structure simple and Persian-first.

Deliverables:

- nav labels finalized,
- duplicate "library/operations" removed,
- settings pinned and visible,
- mobile bottom nav,
- one global create button,
- command/search area.

Acceptance:

- no route has two primary create buttons,
- settings does not require scrolling,
- mobile nav fits without horizontal overflow.

### Phase DS-3: Dashboard Rebuild

Goal:

- build a real compact operating dashboard.

Deliverables:

- 4 KPI max,
- operational focus list,
- compact chart/donut,
- needs-attention area,
- campaign/calendar KPIs link to filtered views.

Acceptance:

- laptop first viewport does not feel like endless scroll,
- no permanent setup/progress block after setup,
- mobile dashboard has one clear next action.

### Phase DS-3.5: Productive UI Component Anatomy

Goal:

- replace generic cards with product-object organisms.

Deliverables:

- KPI tile anatomy,
- content row anatomy,
- data table row anatomy,
- channel rail anatomy,
- planner lane anatomy,
- report panel anatomy,
- density behavior for each organism.

Acceptance:

- no new dashboard/content/planner surface is a generic card,
- every reusable organism maps to semantic/component tokens,
- compact and comfortable density are possible without rewriting markup.

### Phase DS-4: Planner Rebuild

Goal:

- merge calendar, campaigns, and queue into one planner experience.

Deliverables:

- month/week/list/campaign lane views,
- compact Jalali date controls,
- inspector drawer/bottom sheet,
- campaign filters as saved views.

Acceptance:

- no two full scroll panels,
- campaign creation date picker is compact and anchored,
- one date picker open at a time.

### Phase DS-5: Composer Rebuild

Goal:

- make post creation feel like a professional studio.

Deliverables:

- source idea panel,
- per-channel variants,
- preview surface,
- schedule/readiness inspector,
- media editor entry,
- clean campaign selector.

Acceptance:

- fields do not visually collide,
- mobile stepper works as a focused flow,
- active step circle is same size and stateful.

### Phase DS-6: Content Library Rebuild

Goal:

- remove duplicated filters and merge queue/log mental models.

Deliverables:

- saved views,
- unified preview rows,
- status rail,
- job/recovery detail drawer,
- batch actions.

Acceptance:

- only one filter system,
- scheduled/published/failed are views of content,
- logs are contextual, not a daily primary page.

### Phase DS-7: Media Creative Studio Rebuild

Goal:

- make media feel like a real creative tool.

Deliverables:

- compact editor shell,
- template gallery,
- brand kit,
- Persian font roles,
- stickers/emoji/text/color tools,
- usage map.

Acceptance:

- editor does not cause initial page height jump,
- effect selection can be reset,
- live color editing is smooth,
- media editor is accessible from composer.

### Phase DS-8: Inbox Rebuild

Goal:

- make engagement operational.

Deliverables:

- thread list,
- assignment,
- labels,
- saved replies,
- SLA/due states,
- internal notes.

Acceptance:

- unread/due states are obvious,
- mobile reply flow is one-screen,
- dashboard only shows inbox if action is needed.

### Phase DS-9: Reports Rebuild

Goal:

- make analytics client-ready and readable.

Deliverables:

- KPI strip,
- charts with readable Persian labels,
- chart unselect behavior,
- top content previews,
- export-ready report surface,
- insight/recommendation notes.

Acceptance:

- chart dates are readable,
- every chart has mobile table fallback,
- reports fit professional presentation/export use.

### Phase DS-10: Settings and Onboarding Rebuild

Goal:

- move setup from daily dashboard into guided setup and settings.

Deliverables:

- 3 to 5 step onboarding,
- channel setup,
- brand setup,
- store/profile setup,
- team/settings areas,
- health alerts only when needed.

Acceptance:

- setup completion is not permanent dashboard content,
- onboarding UI matches the rest of the product,
- channel health is actionable.

### Phase DS-11: Motion, Performance, QA

Goal:

- make the app feel alive without becoming heavy.

Deliverables:

- motion token utilities,
- loading/saving/publishing states,
- chart interaction states,
- reduced-motion support,
- performance budget.
- motion role map for press, reveal, reorder, progress, attention,
- no general Liquid Glass implementation,
- optional overlay translucency only where readability remains strong.

Acceptance:

- no infinite animation loops on critical pages,
- LCP target under 2.5s on normal local build,
- INP interaction target under 200ms for common controls,
- CLS target under 0.1,
- no color picker/update loops.

### Phase DS-12: Final Polish and Mobile Pass

Goal:

- make the product coherent across all pages.

Deliverables:

- mobile audit,
- laptop audit,
- RTL spacing audit,
- icon audit,
- copy audit,
- screenshot review pack.

Acceptance:

- all primary routes share one visual language,
- no duplicate primary actions,
- no nested scroll traps,
- no page feels like old MVP cards,
- app score target: 8.5+ visual/product UX before deeper backend features.

## 19. Component Build Order

Build primitives before pages:

1. tokens,
2. button,
3. input/select/date picker,
4. chip/status pill,
5. page header,
6. shell/nav,
7. KPI tile,
8. action row,
9. content preview tile,
10. channel rail,
11. drawer/sheet,
12. saved view/filter bar,
13. chart wrappers,
14. empty state,
15. toast/live notification.

Then rebuild pages in this order:

1. shell,
2. dashboard,
3. planner,
4. composer,
5. content,
6. media,
7. inbox,
8. reports,
9. settings/onboarding.

## 20. Hard Rules

These rules prevent the app from falling back into the old design.

1. No page gets two primary CTAs for the same action.
2. No permanent setup/progress dashboard block after setup is complete.
3. No two large panels with independent scroll.
4. No duplicate route tabs inside a page when sidebar already handles navigation.
5. No route named `عملیات` as a primary destination.
6. No decorative background that makes content harder to read.
7. No card stack where a table/list would be clearer.
8. No chart without readable labels and a clear selected/unselected state.
9. No mobile page that is only a compressed desktop page.
10. No animation that does not communicate state, focus, progress, or causality.

## 21. Definition of 10 out of 10

Nahrino reaches the target when:

- a first-time user understands the daily flow in under 60 seconds,
- the dashboard fits the main operating picture without long scrolling,
- composer feels like a studio, not a form,
- planner combines calendar, campaigns, and queue naturally,
- content library has one clean filter/view system,
- media editor feels useful and controlled,
- reports look presentable to a client,
- mobile flows are designed separately,
- UI motion explains what is happening,
- the product uses real content assets instead of decorative filler,
- every page clearly belongs to the same Persian-first product.
