# Nashrino (نشرینو) — Design System & UI/UX Refactor Roadmap & Backlog

This document establishes the master plan, audit findings, global benchmarks, and phase-by-step backlog for refactoring Nashrino's user interface, styling architecture, and theme engine. The goal is to achieve absolute design system consistency across all 18 pages, components, buttons, boxes, and labels.

---

## 1. Executive Summary & Goals

Nashrino is built as a **Persian-first omnichannel SocialOps platform**, providing unique capabilities like Jalali calendars, native Rubika integration, and professional Instagram comment-to-DM automation. While the core capabilities are functional, the visual styling is inconsistent:
* **The Problem:** Many pages still bypass Nashrino's custom design system tokens. They use hardcoded Tailwind colors (`bg-white`, `bg-slate-50`, `bg-blue-600`), raw layout primitives (`rounded-md`, `rounded-lg`), and inline styles. When toggling between the light (Cream) and dark (Obsidian) modes, these hardcoded classes fail to adapt, resulting in glaring white cards, unreadable text, and visual inconsistency.
* **The Goal:** Align 100% of the codebase with the custom **Editorial Command Glass** design language. All containers, buttons, inputs, labels, and badges must follow the semantic tokens defined in `nashrino.css` so that the app looks premium, cohesive, and supports dark/light switching flawlessly.

---

## 2. Competitive Benchmarks & Inspirations

To elevate Nashrino to a world-class standard, we establish the following UI/UX design targets:

### A. Buffer — Functional Calmness & Clean Steppers
* **Layout:** Generous whitespace, zero visual noise, and simple card borders.
* **Steppers:** A progress-indicator stepper for composing posts that keeps the screen clear of heavy multi-column forms.
* **Colors:** Soft backgrounds and high-contrast, descriptive labels.

### B. Later — Visual Scheduling & Immersive Media Panels
* **Calendars:** Drag-and-drop month calendars that take the full width of the main layout, rendering scheduled posts as visual blocks with clear channel badges.
* **Media Library:** Glassmorphic side drawers displaying visual media grids.

### C. Sprout Social — Information Density & Semantic Hierarchy
* **Tables/Data Rows:** Modular list items that display content stats, publication times, and statuses in compact, uniform rows.
* **Filter Bars:** Unified search and filter ribbons that sit neatly below the page header.

### D. Linear / Vercel — Obsidian Glass, Tabular Typography & Micro-Interactions
* **Depth:** Frosty glassmorphism (`backdrop-filter: blur(20px)`) layered with fine borders (`1px rgba(255,255,255,0.08)` in dark mode).
* **Typography:** Pairing font families dynamically. Using **Outfit** for tabular numbers, percentages, and metrics, and **Vazirmatn** for smooth Persian display text.
* **Transitions:** Micro-animations for buttons, cards, and list rows (`transition-all duration-200 ease-out hover:-translate-y-0.5`).

---

## 3. Core Problems & Design Mismatches

We conducted an audit across all 18 page directories in `frontend/app` and identified three categories of design bugs:

### A. Hardcoded Color Primitives (Dark Mode Breakages)
* **Canvas Mismatch:** Pages use `bg-white`, `bg-slate-50`, or `bg-slate-100` for containers. Under Obsidian mode, these cards remain white, blinding the user.
* **Borders:** Extensive use of `border-gray-200` instead of `border-app-border`.
* **Accent Colors:** Primary actions are styled with `bg-blue-600` or `bg-blue-500` instead of utilizing `--n-color-primary` (mapped as `bg-app-primary`), which dynamically adjusts values based on the active theme.

### B. Structural Layout & Radius Inconsistencies
* **Corner Radii:** Cards use arbitrary values like `rounded-md` or `rounded-lg` instead of the design system token classes (`rounded-nsm`, `rounded-nmd`, `rounded-nlg`).
* **Dense Forms:** Composer and Campaign pages render multiple columns with nested scrollbars instead of using slide-up drawers (`NInspectorDrawer`) and responsive page grids.
* **Font Fallbacks:** Metric counters and publication schedule times render with default sans-serif fonts instead of the high-legibility **Outfit** font.

### C. Mobile & Touch Boundaries (Accessibility Gaps)
* **Auto-Zoom Trigger:** Inputs and text areas are styled with `text-sm` (14px). iOS Safari forces page-zoom on focus if fonts are below 16px.
* **Viewport Clipping:** Layout elements use `h-screen` instead of `h-[100dvh]`, causing browser search bars or navigation overlays to clip action buttons at the bottom.

---

## 4. Proposed Design Tokens Schema

All refactored elements must strictly reference the design tokens configured in `tailwind.config.ts`:

### Colors (`theme.extend.colors.app`)
* **`bg-app-background`:** Main canvas background (Light Cream `#F6F8FB` / Dark Obsidian `#090D16`).
* **`bg-app-surface`:** Card background (Light `#FFFFFF` / Dark `#151D27`).
* **`bg-app-surfaceMuted`:** Secondary/inactive container panels.
* **`border-app-border`:** Standard card and divider border.
* **`text-app-text`:** Main body copy.
* **`text-app-muted`:** Subheadings and labels.
* **`bg-app-primary` / `bg-app-primaryHover`:** Brand CTAs.
* **`bg-app-frost`:** Translucent panel background.

### Radii (`theme.extend.borderRadius`)
* **`rounded-nxs`:** Mini tags, checkbox boxes (`0.75rem`).
* **`rounded-nsm` / `rounded-nmd`:** Form inputs, regular buttons (`0.875rem` / `1rem`).
* **`rounded-nlg` / `rounded-nxl`:** Cards, modal overlays (`1.25rem` / `1.5rem`).

### Typography Pairing
* **Arabic/Persian Texts:** `font-sans` maps to `Vazirmatn`.
* **Numbers, Metrics, Dates, and English Tags:** Apply `font-outfit` or style them explicitly as monospaced tabular numerals.

---

## 5. UI/UX Refactor Roadmap & Backlog

```mermaid
gantt
    title Nashrino UI/UX Refactor Roadmap
    dateFormat  YYYY-MM-DD
    section Global Setup
    Phase 1: Token Audit & Tailwind Mapping   :active, 2026-06-25, 3d
    section Page Refactoring
    Phase 2: Core Workspace Cleanup (Dashboard, Composer) : 2026-06-28, 5d
    Phase 2: Operational Cleanup (Calendar, Inbox, Analytics) : 2026-07-03, 5d
    Phase 3: Form Controls Standardization : 2026-07-08, 4d
    section Mobile Polish
    Phase 4: Mobile & Touch Target Compliance : 2026-07-12, 3d
```

### Phase 1: Token Synchronization & Global Layout Adjustment
* **[ ] Task 1.1:** Add `@import` and font-face declarations to load **Outfit** and **Vazirmatn** correctly across all routes.
* **[ ] Task 1.2:** Update `tailwind.config.ts` to expose `fontFamily.outfit` and `fontFamily.sans`.
* **[ ] Task 1.3:** Set up `app/layout.tsx` to handle dynamic `data-theme` state values without visual flash.

### Phase 2: Page-by-Page Styling Cleanup
* **[ ] Task 2.1: Main Dashboard (`app/page.tsx`)**
  * Replace all `bg-white` and `bg-slate-50` card wrappers with semantic `<NSurface variant="raised">` or `bg-app-surface border-app-border`.
  * Ensure all metric grids use the `font-outfit` typography family.
* **[ ] Task 2.2: Composer (`app/compose/page.tsx`)**
  * Refactor compose workbench to eliminate double scrolls.
  * Map input panels, preview wrappers, and steppers to use `bg-app-surface` and `rounded-nmd`.
* **[ ] Task 2.3: Calendar Planner (`app/calendar/page.tsx`)**
  * Refactor visual cell structures to scale layout cleanly.
  * Bind cell item labels to semantic status colors instead of hardcoded tailwind colors (e.g. use `var(--n-chart-published)`).
* **[ ] Task 2.4: Unified Inbox (`app/inbox/page.tsx`)**
  * Redesign message cards, detail views, and filters to follow linear glassmorphism.
* **[ ] Task 2.5: Analytics (`app/analytics/page.tsx`)**
  * Replace static chart styling. Convert hardcoded gray metrics to Outfit tabular counters.
* **[ ] Task 2.6: Campaigns, Channels, Settings & Auxiliary Pages**
  * Purge all remaining `bg-white`, `bg-slate-50`, `bg-blue-500`, and `border-gray-200` occurrences.

### Phase 3: Form Control & Component Standardization
* **[ ] Task 3.1:** Swap raw `<input>` tags for `<NInput>` components with standard validation states.
* **[ ] Task 3.2:** Swap raw `<textarea>` tags for `<NTextarea>` with correct line-height properties.
* **[ ] Task 3.3:** Swap raw `<select>` tags for `<NSelect>` to guarantee uniform native styling across all platforms.
* **[ ] Task 3.4:** Standardize active and hover transitions (`transition-all duration-200 ease-out`).

### Phase 4: Mobile Responsiveness & Accessibility Audit Actions
* **[ ] Task 4.1:** Apply `text-base md:text-sm` responsive sizing on all input text elements to prevent iOS Safari auto-zooming.
* **[ ] Task 4.2:** Re-audit navigation margins and switch layout panels from `h-screen` to `h-[100dvh]` to avoid bottom navigation clipping.
* **[ ] Task 4.3:** Verify touch target dimensions are minimum `44px × 44px` on all mobile devices.

---

## 6. Verification and QA Checkpoint

1. **Compilation Validation:** Run `npm run typecheck` to ensure no component import is broken.
2. **Production Validation:** Run `npm run build` to verify Next.js successfully compiles static bundles.
3. **Visual Verification:** Check the rendering of every page in both light (Cream) and dark (Obsidian) modes, validating color values and text contrast.
