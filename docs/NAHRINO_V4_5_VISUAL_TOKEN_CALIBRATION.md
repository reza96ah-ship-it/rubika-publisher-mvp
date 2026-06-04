# Nahrino V-4.5 Visual Token Calibration

Date: 2026-06-05  
Status: Implemented foundation restart from the `World-Class Visual Design System for Your App` roadmap  
Scope: tokens, global theme utilities, Tailwind token aliases

## 1. Goal

Restart the rebuild from the visual foundation so future page work inherits the new professional style instead of repainting the old MVP shell.

This phase applies the new source document's core direction:

- default shell: **Calm Editorial Ops Light**,
- utility material: **Selective Frosted Utility**,
- focused editor mode: **Dark Studio** only for media/editor/preview contexts,
- motion: functional state feedback, not decorative looping,
- product feel: warm, compact, Persian-first, editorial, and operational.

## 2. Implemented Changes

### 2.1 Warm Editorial Light Tokens

Updated `frontend/design-tokens/nahrino.tokens.json` and `frontend/design-tokens/nahrino.css` so the app now uses the new warm editorial base:

| Role | Value |
| --- | --- |
| Canvas | `#F7F6F2` |
| Surface | `#FFFFFF` |
| Surface muted | `#FCFBF8` |
| Text | `#18212F` |
| Muted text | `#64748B` |
| Border | `#E7E2D8` |
| Primary | `#0B7771` |
| Primary strong | `#0F3D3A` |
| Info/focus | `#2563EB` |
| Success | `#15803D` |
| Warning | `#8A5A12` |
| Danger | `#C24150` |

### 2.2 Dark Studio Scope

Added Dark Studio tokens without making the whole app dark-first:

- `--n-color-studio-bg`,
- `--n-color-studio-surface`,
- `--n-color-studio-raised`,
- `--n-color-studio-text`,
- `--n-color-studio-muted`,
- `--n-color-studio-primary`.

The CSS now supports:

- `[data-theme="studio"]`,
- `.nahrino-dark-studio`,
- existing `[data-theme="dark"]` mapped to the same studio palette for now.

Future usage should be limited to media editor, image editor, preview, approval, and before/after comparison surfaces.

### 2.3 Selective Frosted Utility

Added utility variables:

- `--n-color-frost`,
- `--n-color-frost-border`.

Updated global utility classes so frosted material is used for the right layer type:

- topbar,
- studio surfaces,
- studio panels,
- visual chips,
- overlays and future drawers/sheets.

Frosted treatment should not become the base style for every card.

### 2.4 Motion Token Alignment

Added the new motion scale:

| Token | Value |
| --- | ---: |
| `--n-motion-fastest` | 80ms |
| `--n-motion-fast` | 120ms |
| `--n-motion-base` | 180ms |
| `--n-motion-emphasized` | 240ms |
| `--n-motion-section` | 280ms |

Existing aliases remain so current components keep working.

Reduced-motion support now also disables the new motion aliases.

### 2.5 Tailwind Alias Fix

Added missing Tailwind colors for:

- `app.graphite`,
- `app.frost`,
- `app.studio`,
- `app.studioSurface`,
- `app.studioRaised`,
- `app.studioText`,
- `app.studioMuted`,
- `app.studioPrimary`.

This fixes a foundation issue where `NButton` referenced `bg-app-graphite` before Tailwind knew what `app.graphite` meant.

## 3. What This Does Not Do Yet

This phase intentionally does not redesign pages.

Next phases should now rebuild visible screens on top of the calibrated foundation:

1. Planner and Campaigns
2. Composer
3. Content Library and Queue
4. Media Studio
5. Inbox
6. Reports

## 4. Acceptance

- new theme is warm editorial, not cool admin,
- primary shell remains light-first,
- Dark Studio exists without becoming the global shell,
- frosted material is scoped to utility layers,
- global theme utilities use tokens instead of scattered raw colors,
- full frontend check passes.

