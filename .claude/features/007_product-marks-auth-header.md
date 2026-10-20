---
id: "007"
slug: product-marks-auth-header
title: Product marks + AuthBrandHeader for the login screens (v0.4.0)
role: frontend
type: feature
extends: "006"
---

# Product marks + AuthBrandHeader for the login screens (v0.4.0)

## Description
Each frontend's login shows its product mark and name; the ecosystem apps (ScoutGroup, ScoutLog, ScoutPulse) also
show that the credentials are ScoutTech's: ScoutTech mark → chevrons → app mark. Marks and header live once in
scouttech-ui instead of being copied per app. Plane card SCOUT-252 (parent SCOUT-251). Builds on 006 (tokens
indirection, brand colours). ScoutPulse had no mark: designed here (orchestrator/user validate before adoption).

## Requirements
- **Marks** (viewBox 0 0 32 32, one ink = `currentColor`), sources:
  - scouttech: tent + nodes, from `01-scouttech-frontend/src/components/data/ScoutTechMark.tsx` (stroke 2 + circles).
  - scoutgroup: stepped pine, from `01-scouttech-frontend/src/components/data/ScoutGroupMark.tsx`.
  - scoutlog: from `03-scoutlog-frontend/public/brand/scoutlog-mark.svg`, drop its `<style>`/hex, fill currentColor.
  - scoutpulse: new, `brand/scoutpulse-mark.svg` (rounded tile rx 8 with a cut-out heartbeat line and a detached
    dot = prediction, via `<mask>`). In React the mask id must be unique per instance (`useId`).
  - Standalone files `brand/{scouttech,scoutgroup,scoutlog,scoutpulse}-mark.svg` (fill/stroke currentColor),
    exported as `scouttech-ui/brand/<name>-mark.svg`; package `files` includes `brand`.
- **ProductMark** (`product: "scouttech" | "scoutgroup" | "scoutlog" | "scoutpulse"`, `size?` default 24,
  `className?`, `title?`): inline SVG, `aria-hidden` unless `title` given (then `role="img"` + `<title>`),
  `data-product`, default colour class `text-ui-brand-<product>` (overridable via className). Export
  `products` list and `productNames` (ScoutTech, ScoutGroup, ScoutLog, ScoutPulse) + type `Product`.
- **Brand tokens** in the base (same indirection as 006: `--color-ui-brand-<p>: var(--ui-brand-<p>)`, values in
  `@layer theme`, light / dark), always present regardless of the imported theme; themes do not set them:
  scouttech #005235 / #4fa97c · scoutgroup #0369a1 / #7dd3fc · scoutlog #b45309 / #fbbf24 (light uses the
  ScoutLog ink; #f59e0b is 2.15:1 on white) · scoutpulse #c8102e / #ff6b81. Each ≥ 3:1 on ui-surface in both
  modes — add to `src/themes.test.tsx` (and to its "every referenced --ui-* is defined" check).
- **AuthBrandHeader** (`product`, `title?`, `subtitle?`, `accountInfoHref?`, `accountInfoLabel?` default
  "¿Qué es una cuenta ScoutTech?", `className?`):
  - scouttech → its mark + heading "ScoutTech" + "Inicia sesión".
  - other → row [ScoutTech mark] › › › [product mark] (each in its brand colour), heading
    "Inicia sesión en {Name}", subtitle "con tu cuenta de ScoutTech", optional link to `accountInfoHref`.
  - `title` / `subtitle` override the defaults. Heading is an `h1`. Only ui-* tokens.
  - Marks row: `role="img"` with a single `aria-label` ("Acceso a {Name} con tu cuenta de ScoutTech";
    scouttech: "ScoutTech"); marks and chevrons `aria-hidden`.
  - Chevrons: 3 lucide `ChevronRight` (or CSS), animated left→right with a pure-CSS keyframe defined in
    `tokens.css` `@theme` (`--animate-ui-chevron` + `@keyframes ui-chevron`, staggered delays), applied only via
    `motion-safe:` so `prefers-reduced-motion` leaves them static. Colour `text-ui-on-surface-muted`.
- Exports: root barrel + subpaths `./ProductMark`, `./AuthBrandHeader`, `./brand/*.svg`.
- **Demo**: "Marcas de producto" section (4 marks at 16/24/32/64 px, brand colour) and "Cabecera de login"
  section with the 4 AuthBrandHeader variants; both visible in every demo brand × light/dark.
- **Vitest**: ProductMark (each product renders, data-product, aria-hidden vs title, unique mask ids for two
  scoutpulse instances), AuthBrandHeader (scouttech vs app variant texts, single aria-label, link only when
  href, chevrons carry `motion-safe:` animation class and no unconditional `animate-` class).
- Playwright contrast suite keeps passing with the new sections (text ≥ 4.5:1).
- README (ProductMark, AuthBrandHeader, brand tokens, brand SVG files), DESIGN.md, CHANGELOG 0.4.0,
  `package.json` 0.4.0. No tag (release pending user OK).

## Touches existing endpoints
no

## Done when
- The 4 marks and AuthBrandHeader are exported, documented and shown in the demo in light and dark.
- `brand/scoutpulse-mark.svg` exists for user validation.
- test.cjs is green (the real gate; mark-ended.cjs enforces it).
