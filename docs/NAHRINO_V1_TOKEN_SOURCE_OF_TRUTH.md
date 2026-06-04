# Nahrino V-1 Token Source of Truth

Date: 2026-06-05
Roadmap phase: `V-1: Token Source of Truth`
Status: Implemented foundation checkpoint
Branch: `phase4b-publishing-worker`

## 1. Purpose

V-1 makes theme changes systematic before more page rebuilds continue.

The goal is not to remove all legacy visual debt in one pass. The goal is to establish the source of truth and add a guardrail so the debt cannot grow while pages are migrated.

## 2. Implemented Files

| File | Role |
| --- | --- |
| `frontend/design-tokens/nahrino.tokens.json` | DTCG-style token source for primitive, semantic, component, density, elevation, and motion tokens |
| `frontend/design-tokens/nahrino.css` | Runtime CSS variable export consumed by the app |
| `frontend/app/globals.css` | Imports token CSS and keeps only app-level utilities/keyframes/global styles |
| `frontend/tailwind.config.ts` | Maps Tailwind app colors, shadows, radius, and density utilities to semantic CSS variables |
| `frontend/scripts/token-audit.mjs` | Guardrail that prevents visual debt from growing beyond the V-0 baseline |
| `frontend/package.json` | Adds `token:audit` and runs it inside `npm run check` |

## 3. Token Layers

The source token file uses four layers:

1. **Primitive tokens**
   Raw values for neutral, teal, blue, green, amber, red, purple, spacing, radius, and motion.

2. **Semantic tokens**
   Product intent: canvas, surface, text, muted text, borders, focus, primary action, secondary action, success, warning, danger, info.

3. **Component tokens**
   Component roles for primary buttons, fields, surfaces, and row density.

4. **Runtime aliases**
   Backward-compatible `--n-color-*` variables still exist so current pages keep rendering while future components move to semantic tokens.

## 4. Theme Modes

Runtime CSS now defines:

- `:root` / `[data-theme="light"]`,
- `[data-theme="dark"]`,
- `[data-theme="high-contrast"]`,
- `[data-density="compact"]`,
- `[data-density="standard"]`,
- `[data-density="comfortable"]`,
- reduced-motion token overrides via `prefers-reduced-motion`.

Light mode is the production default. Dark and high-contrast tokens exist as foundation, but page-level QA is still required before exposing them as user-facing settings.

## 5. Tailwind Token Mapping

New semantic Tailwind mappings include:

- `app.focus`,
- `app.secondary`,
- `app.secondarySoft`,
- `app.textStrong`,
- `app.danger`,
- `shadow-overlay`,
- tokenized `nxs`, `nsm`, `nmd`, `nlg`, `nxl`, `n2xl` radii,
- tokenized density min-heights.

Future product components should use these names instead of arbitrary visual classes.

## 6. Audit Guardrail

Command:

```bash
docker compose exec frontend npm run token:audit
```

Current locked output:

| Check | Current | Baseline | Status |
| --- | ---: | ---: | --- |
| Hardcoded hex colors | 105 | 105 | Pass |
| Arbitrary visual Tailwind classes | 281 | 281 | Pass |
| Scroll/sticky/viewport layout markers | 47 | 47 | Pass |

The audit is line-based to match the V-0 inventory method.

It is now part of:

```bash
docker compose exec frontend npm run check
```

## 7. What V-1 Does Not Finish

V-1 does not migrate every legacy page. These remain known debt:

- `media-image-editor.tsx` has the largest visual-token drift,
- `campaigns/page.tsx` still needs planner/campaign lane tokens,
- `analytics/page.tsx` still needs report/chart tokens,
- `store/page.tsx` still needs settings/form tokens,
- old shared components still need retirement in V-2.

That is intentional. V-1 establishes the system. V-2 and later phases perform migration.

## 8. Acceptance

V-1 is complete when:

- primitive token source exists,
- semantic token runtime exists,
- component token examples exist,
- light theme is implemented,
- dark and high-contrast foundations exist,
- density and elevation tokens exist,
- reduced-motion token path exists,
- audit guardrail passes and is part of frontend checks.

This checkpoint satisfies V-1 and unlocks:

**V-2: Core Component System**
