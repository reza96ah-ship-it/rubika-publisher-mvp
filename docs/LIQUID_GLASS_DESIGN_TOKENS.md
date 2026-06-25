# Nashrino Liquid Glass Token Bridge

The existing Nashrino semantic tokens remain authoritative for text, canvas, surfaces, borders, actions, statuses, charts, density, motion, dark mode, studio mode, and high contrast. The Liquid Glass bridge adds spatial materials without changing product meaning.

## Material levels

### Operational panel

Use `n-liquid-panel` for dashboard modules, planner containers, card collections, and low-to-medium density operational regions. It uses restrained blur and should not wrap every nested card.

### Floating glass

Use `n-liquid-floating` for the desktop sidebar, command bar, mobile navigation, drawers, popovers, and small floating control groups. This is the strongest material and should remain visually scarce.

### Solid surface

Use `n-liquid-solid` or `n-liquid-solid-muted` for long forms, editors, dense tables, charts, and large scrolling lists where transparency would reduce readability or performance.

## Geometry

- `n-radius-chip`: badges and status tokens
- `n-radius-control`: compact controls
- `n-radius-field`: fields
- `n-radius-card`: inner cards
- `n-radius-panel`: primary panels
- `n-radius-shell`: app stage and navigation
- `n-radius-pill`: capsules and segmented controls

Equivalent Tailwind aliases are available as `rounded-chip`, `rounded-control`, `rounded-field`, `rounded-card`, `rounded-panel`, `rounded-shell`, and `rounded-pill`.

## Ambient mesh

`AmbientMesh` is decorative and non-interactive. In AppShell V2 it will be fixed behind the workspace rather than placed inside a scrolling region.

## Accessibility and performance

- High-contrast mode converts glass into opaque, strongly bordered surfaces.
- Mobile panels use less blur and higher opacity.
- Reduced-transparency preferences remove blur and reduce mesh visibility.
- Do not stack blurred surfaces.
- Do not use floating glass for long lists, charts, or editors.
- Keep strong blur limited to navigation and small overlays.

## Migration rule

Feature pages keep their current semantic classes until their dedicated migration pull request. Compatibility aliases allow the shell and features to migrate independently without changing backend behavior.
