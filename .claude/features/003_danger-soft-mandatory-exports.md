---
id: "003"
slug: danger-soft-mandatory-exports
title: Button danger-soft variant, Input/Select mandatory, public control class exports (v0.1.2)
role: frontend
type: change
extends: "001"
---

# Button danger-soft variant, Input/Select mandatory, public control class exports (v0.1.2)

## Description
scoutgroup-frontend adoption (069) needs three things the library lacks: a soft danger button, a visual
"mandatory" marker on fields that does not imply native `required`, and the shared field classes as public API
for app-specific controls. Plane card SCOUT-214. Extends feature 001 (Button, Input, Select, tokens).

## Requirements
- **Button / ButtonLink** variant `danger-soft`: `bg-ui-danger-soft text-ui-danger border border-ui-danger`,
  hover/active `bg-ui-danger-hover text-ui-on-danger`. Focus, disabled and loading behave like the other variants.
  Solid `danger` unchanged.
- **Token** `--color-ui-warning` in `tokens.css` (amber default, ≥ 3:1 against the default `ui-surface`), also mapped
  in the 3 demo themes × light/dark.
- **Input / Select** prop `mandatory?: boolean`: control gets `border-l-[3px] border-l-ui-warning` (also with error).
  Does NOT set `required`/`aria-required`. Label gets a `sr-only` suffix, prop `mandatoryLabel` (default
  `" (obligatorio)"`). Bar ≥ 3:1 against `ui-surface` in every demo theme.
- **Exports**: `controlClassName` and `controlBorderClassName` from the root barrel and the `./Field` subpath;
  documented in README as public API.
- Demo shows danger-soft (sizes, icon, loading, disabled, ButtonLink) and mandatory (Input, Select, with error,
  with required) in all 3 themes.
- Vitest: roles/aria/classes for danger-soft and mandatory (no required, sr-only text, custom label), exports.
- Playwright: danger-soft text ≥ 4.5:1 at rest and on hover; mandatory bar ≥ 3:1; 3 themes × light/dark.
- README, CHANGELOG 0.1.2, package.json 0.1.2.

## Touches existing endpoints
no

## Done when
- danger-soft, mandatory and the exports are available and documented.
- Contrast checks pass in all 6 demo combos.
- test.cjs is green (the real gate; mark-ended.cjs enforces it).
