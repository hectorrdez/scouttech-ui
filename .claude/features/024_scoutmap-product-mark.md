---
id: "024"
slug: scoutmap-product-mark
title: ScoutMap product mark (v0.14.0)
role: frontend
type: feature
extends: null
---

# ScoutMap product mark (v0.14.0)

## Description
Adds the ScoutMap logo to the shared library so the ScoutMap login, public shell and no-license pages use one official mark, like ScoutConnect (feature 022). Card SCOUT-588. The mark is designed here; the ScoutMap brand theme already exists (feature 023).

## Requirements
- New `brand/scoutmap-mark.svg`: viewBox 0 0 32 32, one ink (`currentColor`), stroke 2 style like the ScoutTech mark. Concept: a map pin holding the ScoutTech tent. Original drawing, not a third-party icon.
- `ProductMark`: `scoutmap` in `products`, `productNames` ("ScoutMap"), `brandClassNames` (`text-ui-brand-scoutmap`) and `MarkGlyph` (geometry copied from the SVG).
- Brand token `--ui-brand-scoutmap` / `--color-ui-brand-scoutmap` in `tokens.css` (base, like the other products): light `#c2410c`, dark `#fb923c`, both >= 3:1 on `ui-surface`. Covered by the contrast test in `themes.test.tsx`.
- `AuthBrandHeader product="scoutmap"` renders "Inicia sesión en ScoutMap". `PublicHeader`, `PublicFooter` and `NoLicensePage` render "ScoutMap" with `product="scoutmap"`.
- Demo: the marks section and the public shell playground include ScoutMap (`demo/App.tsx`).
- Docs: `README.md` and `.claude/DESIGN.md` list the product. CHANGELOG entry 0.14.0, `package.json` version 0.14.0. No tag, no publish.
- Out of scope: the ScoutMap map accents and theme (feature 023); replacing app launcher icons.

## Touches existing endpoints
no

## Done when
- Unit tests cover `ProductMark` (render, brand colour, `tone="inherit"`), `AuthBrandHeader`, `PublicHeader`, `PublicFooter` and `NoLicensePage` for scoutmap.
- test.cjs is green (mark-ended.cjs enforces it).
