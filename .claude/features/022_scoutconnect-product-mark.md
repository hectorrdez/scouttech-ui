---
id: "022"
slug: scoutconnect-product-mark
title: ScoutConnect product mark (v0.12.0)
role: frontend
type: feature
extends: null
---

# ScoutConnect product mark (v0.12.0)

## Description
Adds the ScoutConnect logo to the shared library so the ScoutConnect mobile login (SCOUT-446) and the web apps use one official mark. Card SCOUT-493 (parent SCOUT-446). The mark is designed here first; SCOUT-446 ports the SVG to Android later.

## Requirements
- New `brand/scoutconnect-mark.svg`: viewBox 0 0 32 32, one ink (`currentColor`), stroke 2 style like the ScoutTech mark. Concept: speech bubble (communication between scout families) holding the ScoutTech tent. Not a third-party icon.
- `ProductMark`: `scoutconnect` in `products`, `productNames` ("ScoutConnect"), `brandClassNames` (`text-ui-brand-scoutconnect`) and `MarkGlyph` (geometry copied from the SVG).
- Brand token `--ui-brand-scoutconnect` / `--color-ui-brand-scoutconnect` in `tokens.css` (base, like the other products): light `#6d28d9`, dark `#a78bfa`, both >= 3:1 on `ui-surface`. Covered by the contrast test in `themes.test.tsx`.
- `AuthBrandHeader product="scoutconnect"` renders "Inicia sesión en ScoutConnect" with the animated chevrons (motion-safe only).
- Demo: login headers and the marks section include ScoutConnect in `demo/App.tsx`.
- Docs: `README.md` and `.claude/DESIGN.md` list the product. CHANGELOG entry, version 0.12.0. No tag, no publish.
- Out of scope: replacing the scouttech-frontend launcher icon; Android port (SCOUT-446).

## Touches existing endpoints
no

## Done when
- Unit tests cover `ProductMark` and `AuthBrandHeader` for scoutconnect (mark renders, brand colour, `tone="inherit"`, heading and accessible name).
- test.cjs is green (mark-ended.cjs enforces it).
