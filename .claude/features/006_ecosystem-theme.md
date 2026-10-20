---
id: "006"
slug: ecosystem-theme
title: Common ecosystem theme + 4 brand themes (v0.3.0)
role: frontend
type: change
extends: "001"
---

# Common ecosystem theme + 4 brand themes (v0.3.0)

## Description
Same visual base across the ecosystem: neutral surfaces, text and semantic colours identical between apps in each
mode; only the brand scale changes. `tokens.css` becomes a full light + dark base and the library ships one brand
theme per app. Plane card SCOUT-246 (parent SCOUT-245, colour decisions approved there). Extends feature 001
(token contract). Adoption in the 4 frontends goes in SCOUT-247..250.

## Requirements
- **Non-breaking indirection** (consumers map `--color-ui-*` in their own `@theme`, which compiles to `:root`
  inside `@layer theme`; a dark `html[data-theme="dark"]` block there would beat it on specificity and break their
  dark mode). So in `tokens.css`:
  - `@theme { --color-ui-<name>: var(--ui-<name>); ... }` for every colour token (radius/shadow/spacing stay literal).
  - `@layer theme { :root { --ui-<name>: <light>; } html[data-theme="dark"] { --ui-<name>: <dark>; } }` with the
    neutral base values below. Private `--ui-*` names are not used by any consumer.
  - A consumer that keeps overriding `--color-ui-*` in its `@theme` sees no change in either mode.
- **Base values** (light / dark):
  surface #ffffff / #121417 · surface-hover #f4f4f5 / #1c1f23 · surface-active #e4e4e7 / #262a2f ·
  surface-tonal #f4f4f5 / #1a1d21 · on-surface #18181b / #e6e8eb · on-surface-muted #52525b / #a1a7b0 ·
  overlay rgb(0 0 0 / 0.4) / rgb(0 0 0 / 0.6) · outline #d4d4d8 / #2e3238 · outline-strong #71717a / #6b7280 ·
  focus #2563eb / #60a5fa · danger #b91c1c / #f87171 · on-danger #ffffff / #450a0a · danger-hover #991b1b / #fca5a5 ·
  danger-soft #fef2f2 / #2a1215 · warning #c2410c / #fb923c · success #15803d / #4ade80 · info #1d4ed8 / #60a5fa ·
  disabled #f4f4f5 / #1c1f23 · on-disabled #52525b / #9ca3af.
  Neutral brand default: primary #3f3f46 / #e4e4e7 · on-primary #ffffff / #18181b · primary-hover #52525b / #d4d4d8 ·
  primary-active #27272a / #a1a1aa · primary-ink #3f3f46 / #d4d4d8 · primary-soft #f4f4f5 / #27272a.
- **New tokens**: `ui-primary-ink` (links / brand text on surfaces), `ui-primary-soft` (brand-tinted background,
  text = primary-ink), `ui-success`, `ui-info`. `ui-warning` moves from #b45309 to #c2410c.
- **Brand themes** `themes/{scouttech,scoutgroup,scoutlog,scoutpulse}.css`, exported as
  `scouttech-ui/themes/<name>.css`. Plain CSS, unlayered (beats the layered base), only the 6 brand vars
  (`--ui-primary`, `-on-primary`, `-primary-hover`, `-primary-active`, `-primary-ink`, `-primary-soft`) in `:root`
  and `html[data-theme="dark"]`. Values (primary, on, hover, active, ink, soft):
  - scouttech light #005235 #ffffff #00422b #00301c #005235 #e3f1e9 · dark #4fa97c #00301c #6fbf95 #8fd0ad #6fbf95 #10291d
  - scoutgroup light #0369a1 #ffffff #075985 #0c4a6e #0369a1 #e0f2fe · dark #7dd3fc #082f49 #bae6fd #38bdf8 #7dd3fc #0c2a3d
  - scoutlog light #f59e0b #1c1917 #e08e0b #d97706 #b45309 #fffbeb · dark #fbbf24 #1c1917 #fcd34d #f59e0b #fbbf24 #2a1f0a
  - scoutpulse light #c8102e #ffffff #a50d26 #870a1f #c8102e #fde8eb · dark #ff6b81 #2a0510 #ff8fa0 #f04d66 #ff6b81 #3a0b15
- Danger soft button variant already exists (feature 003, `danger-soft`); keep it, it must pass with the new tokens.
  ScoutPulse apps use it for delete (crimson brand vs danger).
- **Demo**: drop the app-mapped test themes in `demo/demo.css`; load the shipped `themes/*.css` instead (one brand
  at a time, swapped at runtime) with a 4-brand selector (ScoutGroup, ScoutLog, ScoutPulse, ScoutTech) + light/dark.
  Add a side-by-side comparison view: 4 brands × light/dark (8 iframes of the demo in embed mode). Show
  primary-ink / primary-soft and the success / warning / info / danger semantics.
- **Vitest contrast test**: parse `tokens.css` + each theme file, merge base + brand per mode, assert ≥ 4.5:1 for:
  on-primary on primary / hover / active; primary-ink on surface / surface-hover / surface-tonal / primary-soft;
  on-surface on surface / hover / active / tonal; on-surface-muted on surface / hover / tonal; on-danger on danger /
  danger-hover; danger on danger-soft / surface; warning / success / info on surface; on-disabled on disabled;
  and ≥ 3:1 for focus and outline-strong on surface. Also the neutral base alone (no theme).
- Playwright contrast suite (`e2e/`) runs on the 4 brands × light/dark.
- README: token table updated + how to import a theme. DESIGN.md token usage updated. CHANGELOG 0.3.0,
  `package.json` 0.3.0, `files` includes `themes`.

## Touches existing endpoints
no

## Done when
- `scouttech-ui/themes/<brand>.css` import works and recolours only the brand scale; base is identical across brands.
- Demo shows 4 brands × light/dark, selectable and side by side.
- Vitest contrast test covers every theme × mode; Playwright contrast runs on 8 combos.
- test.cjs is green (the real gate; mark-ended.cjs enforces it).
