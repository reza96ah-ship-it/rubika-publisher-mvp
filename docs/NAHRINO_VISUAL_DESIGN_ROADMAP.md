# Nahrino Visual Design Master Roadmap

Date: 2026-06-05  
Status: Main visual-design roadmap for the rebuild  
Product: Persian-first multi-channel SocialOps workspace  
Target: modern, minimal, professional, responsive, motion-aware, benchmark-level

## 1. Decision

Use the user-provided `Professional Visual Design System Roadmap for a 10/10 App` as the main visual-design roadmap, with one correction:

Do not paste it into the product as a generic global design-system report. Convert it into a Nahrino-specific execution plan.

The source is strong because it gives us:

- benchmark direction from Buffer, Hootsuite, Sprout Social, Later, Planable, Canva, and Agorapulse,
- mature system references from W3C design tokens, Figma variables, Material roles, Atlassian, Carbon, Apple, and WCAG,
- a clear visual personality,
- token, component, motion, layout, accessibility, and QA rules,
- an operating model for rollout.

The roadmap below is therefore the controlling visual plan. The detailed implementation rules live in `NAHRINO_DESIGN_SYSTEM_V2.md`.

The newer source `World-Class Visual Design System for Your App.docx` has also been reviewed. Its repo summary is `docs/NAHRINO_WORLD_CLASS_VISUAL_SYSTEM_REVIEW.md`, and it adds one important correction: before the next large page rebuild, the implemented token system must be calibrated to the warm editorial light theme, selective frosted utility policy, and contextual Dark Studio scope.

## 1.1 Source Document Verification

Primary source file:

```text
C:/Users/Reza/Desktop/Professional Visual Design System Roadmap for a 10_10 App.docx
```

The Word document was checked directly before adopting this roadmap. It contains:

- 158 text paragraphs,
- 35 styled headings,
- 20 structured Word tables,
- benchmark tables,
- light, dark, and high-contrast token tables,
- typography, spacing, radius, elevation, and responsive-grid tables,
- motion-token and choreography tables,
- component-library specifications,
- visual-language rules,
- operating-model, team, and QA-gate tables.

Nahrino does not copy the Word file verbatim into the product roadmap. Instead, it converts the Word report into a Nahrino-specific execution plan and keeps the detailed token/component rules in `NAHRINO_DESIGN_SYSTEM_V2.md`.

Secondary source file:

```text
C:/Users/Reza/Desktop/World-Class Visual Design System for Your App.docx
```

This Word document was checked after V-4. It contains 192 text paragraphs and 19 structured Word tables. It confirms the main direction, but sharpens it into three theme layers:

- **Calm Editorial Ops Light** as the default operational shell,
- **Selective Frosted Utility** for overlays, drawers, sheets, command bars, filter bars, and confirmations,
- **Dark Studio** only for media, creative preview, approval, and before/after comparison contexts.

The complete review is tracked in `docs/NAHRINO_WORLD_CLASS_VISUAL_SYSTEM_REVIEW.md`.

## 2. North Star

Nahrino should feel like:

- Canva's create-to-publish continuity,
- Planable's workflow clarity,
- Hootsuite's operational density,
- Sprout's report intelligence,
- Agorapulse's inbox speed,
- Buffer's calm simplicity,
- Apple's contextual motion discipline,
- Atlassian/Carbon/W3C-level token rigor.

The target is not "more UI." The target is:

- clearer workflow hierarchy,
- deliberate density,
- visible system status,
- fewer duplicate controls,
- one strong primary action per context,
- mobile-first task flows,
- tokenized accessible visual language,
- meaningful motion tied to state changes.

## 3. Visual Positioning

Theme direction: **Calm Editorial Operations**

This is a neutral modern productivity brand for Persian content operations.

It should look:

- crisp,
- warm-neutral,
- editorial,
- trustworthy,
- RTL-native,
- focused,
- premium without heavy decoration.

It should not look:

- black-heavy,
- card-heavy,
- like a generic SaaS template,
- like a decorative landing page,
- like a data wall,
- like a Rubika-only MVP,
- like a set of disconnected admin forms.

## 4. Benchmark Borrow Map

| Benchmark | What to borrow | Nahrino implication |
| --- | --- | --- |
| Buffer | Calm publishing path and low cognitive load | Default shell must be simpler than feature depth |
| Hootsuite | Dense operational dashboard and status scanning | Use compact dashboards with strict hierarchy |
| Sprout Social | Executive-ready analytics and listening summaries | Reports must answer decisions, not just show charts |
| Later | Visual planning and media-first scheduling | Planner must show previews, channels, and campaign lanes |
| Planable | In-context approvals, comments, previews, versioning | Composer and content library need approval beside content |
| Canva | Brand kit, templates, editing, planner continuity | Media, composer, templates, and scheduling must connect |
| Agorapulse | Inbox triage, labels, assignment, saved replies | Inbox becomes a productivity surface, not a message list |
| Apple | Contextual motion, bottom-reachable mobile controls | Mobile needs native-feeling sheets, bottom bars, and alerts |
| Atlassian / Carbon | Token discipline, spacing, elevation, productive type | Components must use semantic tokens and density modes |

## 5. Product Spine

Primary navigation should remain focused:

| Persian | English | Purpose |
| --- | --- | --- |
| داشبورد | Today dashboard | What needs attention now |
| ساخت پست | Create | Draft, variant, preview, schedule |
| تقویم | Planner | Calendar, queue, campaign schedule |
| کمپین‌ها | Campaigns | Campaign management when it needs its own page |
| محتوا | Content | Library, approvals, failures, published history |
| رسانه | Media | Assets, brand kit, templates, image editor |
| پیام‌ها | Inbox | Comments, messages, assignments, triage |
| گزارش‌ها | Reports | Analytics, recommendations, export |
| تنظیمات | Settings | Brand, channels, team, integrations, accessibility |

Secondary pages must be contextual:

- Queue is a content/planner state, not a separate mental model.
- Rubika and Instagram belong under Channels.
- Logs belong under reliability/settings.
- Onboarding is a temporary flow, not a permanent dashboard block.

## 6. Visual System Foundations

### 6.1 Token Architecture

Use a four-layer token model:

1. Primitive tokens: raw values.
2. Semantic tokens: product intent.
3. Component tokens: local component behavior.
4. Platform exports: CSS variables now, Figma/native exports later.

Naming target:

```text
nahrino.{category}.{role}.{property}.{state}.{scale}
```

Examples:

```text
nahrino.color.action.primary.bg.default
nahrino.color.action.primary.bg.hover
nahrino.color.surface.raised.bg
nahrino.color.text.muted.default
nahrino.motion.panel.enter.duration
nahrino.component.button.primary.bg.default
```

Rule: new product surfaces should not consume raw primitive colors directly.

### 6.2 Color Direction

Recommended balance:

- 68% neutral/surface,
- 12% primary brand,
- 8% secondary/data accent,
- 7% semantic states,
- 5% illustrative or celebratory accents.

Target palette:

| Role | Value | Use |
| --- | --- | --- |
| Primary | `#0B7A75` | Main CTA, selected state, live operational signal |
| Primary hover | `#095E5A` | Pressed/hover CTA |
| Primary container | `#D8F2F0` | Selected chips, soft state panels |
| Secondary | `#3653CC` | Navigation/data emphasis |
| Secondary container | `#E3E9FF` | Filter and analytics surfaces |
| Tertiary | `#A35A00` | Milestones and warm highlights |
| Canvas | `#F8FAF9` | App background |
| Surface | `#FFFFFF` | Cards, panels, dialogs |
| Surface muted | `#EEF2F1` | Nested wells, side panels |
| Text | `#151A19` | Primary content |
| Muted text | `#46504E` | Captions and labels |
| Border | `#C7D3D0` | Fields, separators |
| Focus | `#7C5CFC` | Keyboard focus |
| Success | `#1F7A52` | Healthy states |
| Warning | `#A05A00` | Risk states |
| Error | `#B42318` | Failure/destructive states |
| Info | `#155EEF` | Informational states |

Accessibility rules:

- normal text: WCAG AA 4.5:1 minimum,
- large text: 3:1 minimum,
- AAA target: 7:1 for critical text,
- focus and non-text UI: 3:1 against adjacent colors.

### 6.3 Theme Modes

Ship the system in this order:

1. Light theme: production default.
2. High contrast: accessibility-first mode.
3. Dark theme: after all semantic tokens are stable.

High contrast must be a real mode, not just stronger borders.

### 6.4 Typography

Use a Productive scale by default:

- app shell,
- dashboards,
- tables,
- filters,
- composer controls,
- inbox rows,
- reports.

Use Expressive type only for:

- onboarding,
- premium empty states,
- brand kit moments,
- template/gallery surfaces,
- marketing-like success milestones inside the product.

Rules:

- default app body: 14px desktop,
- critical mobile reading: 16px,
- metadata/table text: 13px minimum,
- explanatory text width: 60-75 characters,
- one primary UI font family unless a Persian brand font is intentionally part of a creative asset.

### 6.5 Spacing, Radius, Elevation

Use an 8px spacing base with small exceptions:

| Token | Value | Use |
| --- | ---: | --- |
| `space.025` | 2px | tiny icon/text detail |
| `space.050` | 4px | tight chip gaps |
| `space.100` | 8px | base gap |
| `space.150` | 12px | compact padding |
| `space.200` | 16px | default component padding |
| `space.300` | 24px | section rhythm |
| `space.400` | 32px | major card rhythm |
| `space.600` | 48px | large page spacing |
| `space.800` | 64px | empty/hero spacing |

Radius:

- 4px: tags/chips,
- 6px: buttons/inputs/nav,
- 8px: cards/popovers,
- 12px: modals/tables/large panes,
- 16px: media containers,
- 999px: avatars/circular controls.

Elevation:

- default: flat/border,
- raised: cards and draggable items,
- overlay: menus, drawers, floating toolbars,
- modal: blocking dialogs.

Rule: do not use shadows everywhere. Use elevation only when it communicates layer, drag, selection, or overlay.

## 7. Motion System

Motion should explain state, not decorate.

Principles:

- Fast for frequent interactions.
- Longer for spatial transitions.
- One focal animation at a time.
- Reduced motion must remain fully usable.
- Animate transform and opacity before layout properties.

Motion tokens:

| Token | Value | Use |
| --- | ---: | --- |
| `motion.instant` | 0ms | reduced motion |
| `motion.fast` | 50ms | hover/list hover |
| `motion.quick` | 80ms | press/switch |
| `motion.standard` | 120ms | focus/icon/validation |
| `motion.enter` | 180ms | menu/toast/drawer |
| `motion.modal` | 250ms | dialogs/sheets |
| `motion.page` | 320ms | route/wizard step |
| `motion.emphasis` | 480ms | milestone success |

Interaction map:

| Event | Timing | Behavior |
| --- | --- | --- |
| Button hover | 50ms | background/border only |
| Button press | 80ms | color + subtle scale |
| Input focus | 100ms | border + focus ring |
| Menu/popover | 180ms | fade + 4px origin movement |
| Toast | 180ms enter / 120ms exit | fast status feedback |
| Side panel | 220ms | opacity + translate |
| Modal | 250ms | fade + slight scale |
| Route inside shell | 220-320ms | shell stable, content transitions |

## 8. Component Library Priorities

### 8.1 Core Components

Must be rebuilt first:

- Button,
- Icon button,
- Input,
- Textarea,
- Select/combobox,
- Checkbox/switch/segmented control,
- Tag/status pill,
- Card/surface,
- List row,
- Tabs,
- Dialog/sheet,
- Toast/banner.

### 8.2 Product Components

Must replace generic cards:

- KPI tile,
- action queue item,
- content row,
- media tile,
- channel rail,
- campaign lane,
- planner event,
- approval panel,
- report card,
- chart card,
- inbox thread row,
- inspector drawer,
- mobile bottom sheet.

### 8.3 Data and Charts

Every chart card must include:

- title,
- timeframe,
- filter state,
- one short interpretation sentence,
- accessible data fallback or summary,
- export/share affordance when relevant.

Reports must feel like decision surfaces, not a generic BI clone.

## 9. Screen Blueprints

### 9.1 Home / Dashboard

Purpose: answer "What needs my attention now?"

Required structure:

- top bar with search, quick create, alerts, user,
- compact KPI row,
- priority queue,
- today's timeline or next scheduled items,
- campaign/channel health summary,
- one clear recommended action.

Avoid:

- permanent setup progress blocks after onboarding,
- duplicate campaign/calendar sections when KPI cards already link to those filtered views,
- decorative hero content that pushes real work below the fold,
- endless card stacking on laptop/mobile.

### 9.2 Onboarding

Purpose: one-time setup.

Required structure:

- 3-4 focused steps,
- channels,
- team/workflow mode,
- goal,
- brand kit basics,
- completion summary.

It should use expressive type and subtle visual assets, but it must not become a permanent dashboard.

### 9.3 Settings

Purpose: make the system trustworthy and configurable.

Required structure:

- profile,
- workspace,
- notifications,
- publishing,
- team and roles,
- integrations,
- accessibility,
- theme/density/motion preview.

Settings should preview the system visually, not only show form fields.

### 9.4 Reports

Purpose: turn activity into decisions.

Required structure:

- performance overview,
- sentiment/listening summary when data exists,
- top content,
- recommendations,
- export/share.

Each report should answer:

- what changed,
- why it matters,
- what to do next.

### 9.5 Planner

Purpose: make publishing plans visible and editable.

Required structure:

- month/week/list/campaign lane modes,
- compact Jalali date controls,
- anchored mini date picker,
- post preview in context,
- inspector drawer or mobile bottom sheet,
- campaign/channel filters as saved views.

Avoid two independent scroll panels.

### 9.6 Composer

Purpose: create one idea and adapt it per channel.

Required structure:

- source idea,
- media/text tools,
- per-channel variants,
- campaign selector,
- schedule/readiness inspector,
- native previews,
- image editor entry.

Mobile composer must behave like a focused step flow.

### 9.7 Media / Creative Studio

Purpose: connect assets, brand kit, templates, and publishing.

Required structure:

- asset library,
- brand kit,
- templates,
- image editor,
- export/variant controls,
- send to composer.

The editor should feel like a contained creative tool, not a form inside a dashboard.

### 9.8 Inbox

Purpose: triage engagement fast.

Required structure:

- unified thread list,
- labels,
- assignment,
- saved replies,
- status/SLA,
- filters,
- bulk actions,
- link back to content/campaign.

## 10. Visual Asset Direction

Recommended assets:

- real post thumbnails,
- brand avatars,
- campaign colors,
- channel icons,
- subtle geometric diagrams,
- layered paper/card motifs,
- product-native timeline lanes,
- report chart thumbnails,
- creator workflow photography only where it adds context.

Avoid:

- generic office stock art,
- cartoon mascot systems unless brand changes,
- heavy gradients,
- noisy textures,
- decorative blobs,
- large abstract hero art inside product workflows.

## 11. Main Rebuild Phases

### Phase V-0: Visual Inventory Lock

Goal: stop guessing.

Current baseline output: `docs/NAHRINO_V0_VISUAL_INVENTORY_LOCK.md`

Deliverables:

- current UI screenshot inventory,
- component duplication map,
- hardcoded color/radius/shadow audit,
- mobile scroll and overflow audit,
- benchmark gap checklist.

Acceptance:

- no new page rebuild starts without inventory notes,
- top 20 visual debt items are ranked.

### Phase V-1: Token Source of Truth

Goal: make theme changes systematic.

Current phase output: `docs/NAHRINO_V1_TOKEN_SOURCE_OF_TRUTH.md`

Deliverables:

- primitive token table,
- semantic token table,
- component token examples,
- CSS variable implementation,
- Figma variable naming plan,
- light theme complete,
- high contrast theme plan,
- dark theme plan.

Acceptance:

- new UI does not use arbitrary hex values,
- focus, semantic state, surface, and text pairings are documented,
- density and elevation tokens exist.

### Phase V-2: Core Component System

Goal: make every page use the same professional building blocks.

Current phase output: `docs/NAHRINO_V2_CORE_COMPONENT_SYSTEM.md`

Deliverables:

- buttons,
- icon buttons,
- inputs,
- tags,
- rows,
- cards/surfaces,
- section headers,
- empty states,
- toasts,
- modals/drawers,
- tabs/saved views.

Acceptance:

- all components have default, hover, pressed, focus, disabled, loading/error where relevant,
- keyboard focus is visible,
- mobile hit targets are safe.

### Phase V-3: App Shell and Navigation

Goal: make the product spine obvious.

Current phase output: `docs/NAHRINO_V3_APP_SHELL_NAVIGATION.md`

Deliverables:

- sidebar cleanup,
- topbar cleanup,
- one global create entry,
- command/search,
- alerts,
- mobile bottom nav,
- settings always reachable.

Acceptance:

- no duplicate primary actions,
- no duplicate library/operations mental model,
- no setting item hidden after empty scroll,
- mobile nav fits.

### Phase V-4: Dashboard

Goal: create the signature daily command surface.

Current phase output: `docs/NAHRINO_V4_DASHBOARD.md`

Deliverables:

- compact KPI row,
- next-action module,
- priority queue,
- timeline/next schedule,
- chart/donut only where useful,
- channel/campaign health summary.

Acceptance:

- first viewport is useful on laptop,
- mobile page has one clear next action before scroll,
- no decorative hero pushes work down.

### Phase V-4.5: Visual Token Calibration

Goal: make the implemented app inherit the correct world-class visual DNA before rebuilding more pages.

Current source review: `docs/NAHRINO_WORLD_CLASS_VISUAL_SYSTEM_REVIEW.md`

Deliverables:

- warm editorial light palette replaces the remaining cool/generic shell feel,
- typography scale, tabular numerals, and Persian-first type rules are encoded as tokens,
- motion tokens match functional interaction timing,
- focus, target size, density, radius, and elevation rules are explicit,
- frosted/glass treatment is limited to utility layers,
- Dark Studio is scoped to media/editor/preview contexts only.

Acceptance:

- token audit remains clean or improves,
- no whole-app dark/glass theme is introduced,
- new UI uses state motion instead of decorative animation,
- primary shell stays light, compact, and readable on laptop and mobile.

### Phase V-5: Planner and Campaigns

Goal: replace abstract day cards and split scroll panels.

Deliverables:

- planner modes,
- Jalali compact date controls,
- campaign lanes,
- post previews,
- inspector drawer/bottom sheet,
- saved filters.

Acceptance:

- one page scroll,
- compact calendar picker opens in place,
- campaign and calendar workflows connect.

### Phase V-6: Composer

Goal: make post creation feel like a professional studio.

Deliverables:

- source idea panel,
- variant tabs/lanes,
- media and text tools,
- preview,
- readiness/schedule inspector,
- campaign selector,
- image editor entry.

Acceptance:

- no messy field clusters,
- active step state is visually consistent,
- mobile composer is a focused flow.

### Phase V-7: Content Library and Queue

Goal: unify content, approvals, queue, and recovery.

Deliverables:

- unified data view,
- saved views,
- content rows,
- approval state,
- retry/recovery actions,
- bulk operations,
- inspector.

Acceptance:

- duplicate filters removed,
- queue is a content state,
- failed items have clear recovery path.

### Phase V-8: Media / Creative Studio

Goal: make media a competitive advantage.

Deliverables:

- asset grid,
- brand kit,
- template browser,
- image editor,
- text/style kits,
- stickers/emoji,
- export variants,
- send to composer.

Acceptance:

- editor is usable from media and composer,
- visual controls are responsive,
- custom color and font changes remain smooth.

### Phase V-9: Inbox

Goal: make engagement operational.

Deliverables:

- thread list,
- labels,
- assignment,
- saved replies,
- status/SLA,
- filters,
- bulk actions,
- campaign/content links.

Acceptance:

- user can triage without opening many pages,
- actions are reachable on mobile.

### Phase V-10: Reports

Goal: make analytics executive-ready.

Deliverables:

- performance overview,
- trend cards,
- top content,
- recommendations,
- campaign reports,
- export/share,
- accessible chart summaries.

Acceptance:

- every chart includes interpretation,
- labels are readable,
- report fits mobile without becoming endless scroll.

### Phase V-11: Settings, Accessibility, Modes

Goal: make the system configurable and trustworthy.

Deliverables:

- settings IA,
- theme preview,
- density preview,
- motion preview,
- accessibility settings,
- integration/channel settings.

Acceptance:

- Light, high contrast, and reduced motion are tested,
- settings are not just form boxes,
- users understand the effect before saving.

### Phase V-12: Governance and QA

Goal: keep the app from drifting back into template UI.

Deliverables:

- docs,
- visual regression plan,
- accessibility checklist,
- token lint plan,
- component adoption checklist,
- sprint release notes.

Acceptance:

- new UI outside the system needs a written exception,
- each phase is committed and pushed,
- before/after screenshots are captured for major UI pages.

## 12. QA Gates

Every visual phase must pass:

- no horizontal overflow on mobile,
- no nested full-height scroll traps unless intentionally part of a tool,
- no duplicate primary action on a page,
- all visible text fits its container,
- focus states are visible,
- reduced motion works,
- semantic colors are not color-only indicators,
- chart labels are readable,
- mobile first viewport contains a useful action,
- `npm run check` passes for frontend changes,
- browser smoke test passes for changed screens.

## 13. Implementation Rule

From this point forward:

1. Use this file for visual phase order and product-level design direction.
2. Use `NAHRINO_DESIGN_SYSTEM_V2.md` for detailed token/component/layout implementation.
3. Use `NAHRINO_UI_UX_THEME_RFP_2026.md` for product and UX rationale.
4. Commit and push every completed phase so the project can restore safely.
