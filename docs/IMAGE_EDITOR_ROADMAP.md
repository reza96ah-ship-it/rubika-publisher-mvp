# Professional Image Editor Roadmap

## Objective

Turn the current media image editor into a professional, Persian-first creative studio for social publishing. The editor should remain fast enough for a store manager preparing a Rubika post, while gaining the precision, brand consistency, and reusable workflows expected from mature publishing products.

## Current Benchmark Score

Current editor score: **4.5 / 10**

The existing editor is a useful foundation:

- Non-destructive save as a new library asset.
- Movable Persian text layers.
- Bundled Persian fonts.
- Text color, alignment, and size controls.
- Emoji and sticker layers.
- Brightness, contrast, and saturation sliders.
- Integration with the existing media library.

The main gaps are structural:

- The canvas does not expose visible selection boxes, resize handles, rotation, snapping, or safe zones.
- There is no real layer panel, ordering, locking, duplication, grouping, or per-action undo/redo.
- There are no social-format canvas presets or multi-format exports.
- Text styling is still basic: no weight, line height, spacing, background, outline, shadow, opacity, or reusable styles.
- Stickers are a small hard-coded emoji set rather than a searchable asset system.
- There are no logo, watermark, shape, frame, or uploaded overlay layers.
- Brand kit values are not pulled into the editor.
- There are no templates, saved drafts, or version history.
- Export has no quality, format, or platform validation controls.
- The editor is accessible only from the media inspector, not directly in the composer flow.

## Competitor Benchmark

### Hootsuite

Hootsuite keeps editing close to publishing: users open the editor from an image thumbnail while composing or editing scheduled content. Its editor includes effects, social formats, custom dimensions, text overlays, stickers including custom uploads, brush controls, opacity, undo, previews, and accessibility-oriented alt text support.

Lesson for this product: prioritize a fast publishing workflow and Rubika-ready output over building a generic design application first.

### Sprout Social

Sprout Social combines an Asset Library with a built-in photo editor. Its editor covers filters, effects, frames, text overlays, stickers, color adjustments, brightness, shadows, and social-network transform presets. Edited Asset Library exports are saved separately while originals remain unchanged.

Lesson for this product: preserve the current non-destructive save model, then add professional editing tools and variant management inside the DAM.

### Buffer

Buffer integrates Canva inside the composer so teams can create and edit stronger visuals without leaving the publishing workflow. Buffer's own lighter editor intentionally has fewer adjustment features.

Lesson for this product: the editor should open from both Media Library and Composer, and it should support a future external Canva-style integration without depending on one.

### Canva

Canva combines crop and resize presets, drag-and-drop layers, text, stickers, filters, effects, AI editing, background removal, and high-quality exports. Its professional advantage is the full system around the canvas: templates, reusable assets, brand consistency, and multi-format reuse.

Lesson for this product: a polished canvas alone is insufficient. Brand kit, templates, and variant workflows are necessary for a professional result.

### Adobe Express

Adobe Express combines crop, resize, lighting adjustments, filters, blur, sharpening, text overlays, effects, background removal, shape crops, animation, brand kits, and AI-assisted resizing. It emphasizes accessible quick actions and progressive disclosure.

Lesson for this product: keep the editor approachable. Place common actions in a compact toolbar and advanced controls in contextual side panels.

### VistaCreate

VistaCreate offers text styling, font upload, opacity, spacing, alignment, static and animated effects, background removal, sticker maker, brand kits, templates, and resize-to-multiple-formats workflows.

Lesson for this product: Persian-first text quality, brand kits, and one-to-many creative variants are high-value differentiators for store teams.

## Product Direction

The editor should use a **calm creative studio** theme:

- Light neutral canvas workspace with a subtle checkerboard only for transparent regions.
- Compact top toolbar for common actions.
- Right contextual inspector for the selected layer.
- Left asset rail for text, stickers, shapes, logos, uploads, templates, and brand kit.
- Bottom zoom and artboard controls.
- Strong visual hierarchy with restrained teal and blue accents consistent with the existing app.
- No decorative gradients or visual noise inside the working canvas.

The core user journey:

1. Open an image from Composer or Media Library.
2. Choose a Rubika post preset or retain the original ratio.
3. Crop and adjust the photo.
4. Add on-brand Persian text, logo, shapes, or stickers.
5. Preview safe zones and mobile rendering.
6. Save a new reusable variant or attach it directly to the current post.

## 10-Phase Refactor

### Editor Phase 1: Professional Canvas Foundation

Goal: make editing precise and predictable.

Scope:

- Visible selection box for active layers.
- Corner resize handles and rotation handle.
- Drag boundaries and keyboard nudging.
- Zoom controls, fit-to-screen, and reset zoom.
- Alignment guides, snapping, center lines, and Rubika safe-zone overlay.
- Real undo/redo history for every edit.
- Keyboard shortcuts for delete, duplicate, undo, redo, and nudge.

Acceptance criteria:

- A user can move, resize, rotate, duplicate, and undo changes to every overlay layer.
- Snapping and safe-zone guides make centered layouts easy.
- The canvas remains usable on laptop and desktop widths.

Current implementation status:

- Active layers now show a selection box with resize and rotation handles.
- Dragging is bounded to the canvas and snaps to horizontal or vertical center guides.
- The artboard now includes a Rubika safe-zone overlay, zoom controls, and fit-to-screen.
- Undo, redo, duplicate, delete, and keyboard nudging shortcuts are available for editing.

Priority: **P0**.

### Editor Phase 2: Real Layer System

Goal: support multi-element creative composition.

Scope:

- Layer panel with thumbnails and names.
- Reorder layers with drag and drop.
- Lock, hide, duplicate, rename, and delete actions.
- Group and ungroup.
- Multi-select and alignment commands.
- Layer opacity.

Acceptance criteria:

- Users can reliably manage designs with at least 20 layers.
- Layer ordering and visibility match the exported image.

Current implementation status:

- The editor now has a real layer rail with editable names, selection state, and stack ordering.
- Layers can be reordered with drag-and-drop or explicit forward/back controls.
- Visibility, lock, duplicate, delete, opacity, group, ungroup, and center alignment controls are available.
- Hidden layers are excluded from export, and locked layers are protected from canvas edits.

Priority: **P0**.

### Editor Phase 3: Social Crop And Variant Studio

Goal: turn one source image into platform-ready creatives.

Scope:

- Crop tool with freeform and preset ratios.
- Rubika post, square, landscape, portrait, and story presets.
- Exact custom width and height.
- Rotate, flip, scale, and reposition image.
- Save as a new variant linked to the source asset.
- Generate several selected variants in one action.

Acceptance criteria:

- Users can produce square, portrait, and story variants from one image.
- Source asset and generated variants are clearly linked in Media Library.

Current implementation status:

- The editor now has social crop presets for original, Rubika, square, portrait, story, and landscape outputs.
- Users can zoom, reposition, rotate, and horizontally flip the source photo before saving a variant.
- Exported filenames include the selected variant type when a social preset is used.
- The editor is now available from Composer for selected library images or newly uploaded local images.

Priority: **P0**.

### Editor Phase 4: Persian Typography Pro

Goal: make Persian marketing text feel designed, not merely overlaid.

Scope:

- Expanded Persian font library and optional custom font upload.
- Font weight, line height, character spacing, and paragraph spacing.
- Text boxes with width wrapping and auto-fit.
- Outline, shadow, opacity, background fill, and rounded label styles.
- Heading, subtitle, price, discount, and CTA presets.
- Correct RTL editing and mixed Persian-number handling.

Acceptance criteria:

- Text wraps correctly within a resizable text box.
- Common store promotional layouts can be built without external software.

Current implementation status:

- Text layers now render as resizable wrapped Persian text boxes.
- Typography controls include 20 additional Persian/Arabic-capable fonts, font weight, line height, character spacing, width, padding, rounded background labels, outline, and shadow.
- Preset text styles are available for sale headers, prices, CTAs, and subtitles.
- Canvas export preserves styled labels, outlines, shadows, opacity, and RTL text layout.

Priority: **P0**.

### Editor Phase 5: Brand Kit Integration

Goal: make on-brand output the default.

Scope:

- Pull store logo, avatar, primary color, accent color, and typography into the editor.
- Brand palette section above generic colors.
- One-click logo and watermark insertion.
- Saved text styles and CTA badges.
- Optional locked logo safe area.

Acceptance criteria:

- A store manager can create an on-brand design without manually re-entering brand values.
- Brand assets remain reusable across designs.

Priority: **P1**.

### Editor Phase 6: Creative Asset Library

Goal: replace the hard-coded emoji set with reusable design elements.

Scope:

- Searchable sticker library.
- Shapes, badges, lines, arrows, frames, and price tags.
- Uploaded PNG/SVG overlay assets.
- Recent and favorite assets.
- Category filters for sales, product, seasonal, announcement, and CTA elements.
- Color customization where supported.

Acceptance criteria:

- Users can build a polished promotional card using only in-app assets.
- Recently used assets are one click away.

Priority: **P1**.

### Editor Phase 7: Photo Adjustments And Effects

Goal: match mature publisher editing basics.

Scope:

- Exposure, highlights, shadows, warmth, tint, blur, sharpen, and vignette.
- Filter presets with preview thumbnails.
- Background blur.
- Frame and shape crop support.
- Before/after compare control.
- Reset per adjustment group.

Acceptance criteria:

- Product photos can be polished without leaving the app.
- Users can compare the original and edited result instantly.

Priority: **P1**.

### Editor Phase 8: Templates And Draft Designs

Goal: shift from one-off edits to repeatable production.

Scope:

- Save editable design documents separately from flattened exports.
- Template gallery for product, discount, announcement, story, and campaign creatives.
- Duplicate and remix templates.
- Save personal and store templates.
- Autosave and restore drafts.
- Version history with named variants.

Acceptance criteria:

- A design remains editable after leaving the editor.
- Teams can reuse a campaign layout with new images and text.

Priority: **P1**.

### Editor Phase 9: Composer-Native Workflow

Goal: reduce the distance between creative work and publishing.

Scope:

- Open editor from media thumbnails inside Composer.
- Attach saved output directly to the active post.
- Add alt text and internal notes before save.
- Show Rubika mobile preview beside the editor.
- Warn when text enters unsafe crop zones.
- Preserve campaign, folder, and source-asset metadata.

Acceptance criteria:

- A user can edit, attach, preview, and schedule a creative without leaving Composer.
- Generated assets remain organized in the DAM.

Priority: **P1**.

### Editor Phase 10: Smart Assistance And Governance

Goal: add high-value automation after the editor foundation is stable.

Scope:

- Background remover.
- Product cutout and simple background replacement.
- Smart crop suggestions.
- AI-assisted alt text.
- Brand compliance checks for colors, logo, safe zones, and minimum text readability.
- Approval status for creative variants.
- Optional Canva or Adobe Express integration for advanced external workflows.

Acceptance criteria:

- Smart actions reduce repetitive work without hiding the underlying design controls.
- Teams can approve a creative variant before attaching it to scheduled posts.

Priority: **P2**.

## Recommended Next Implementation

Start with **Editor Phase 1: Professional Canvas Foundation**.

This is the highest-leverage next step because the current editor already has layers but does not yet feel trustworthy during manipulation. Selection bounds, handles, rotation, snapping, safe zones, zoom, and real undo/redo will produce the biggest immediate improvement in perceived quality and everyday usability.

After Phase 1, implement Phase 3 and Phase 4 before adding a large sticker library. Precise social variants and strong Persian typography will create more professional business value than decorative assets alone.
