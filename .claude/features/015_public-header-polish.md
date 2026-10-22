---
id: "015"
slug: public-header-polish
title: PublicHeader polish (no wrap, standard session slot)
role: frontend
type: change
extends: 014
---

# PublicHeader polish (no wrap, standard session slot)

## Description
Polish of the unified `PublicHeader` after adoption in the 4 frontends. Card: SCOUT-300 (parent SCOUT-294). Requested by scoutgroup-frontend (user wants "Entrar" as a ghost button).

## Requirements
- No text wrap at 1280px: `whitespace-nowrap` on nav links (`ShellLink` nav style) and on `buttonClassName`; if not enough, tighten gaps or hide more items with `secondary`.
- New `session` prop: `{ login?: { label, to, external? }, cta?: { label, to, external? } }`. Renders `ButtonLink variant="ghost"` for login and a primary CTA, so apps stop repeating `actions`. `actions` keeps working (rendered before `session`).
- Below `sm` the session links live in the mobile menu, not in the bar, so 390px never overflows.

## Touches existing endpoints
no

## Done when
- No wrap and no horizontal overflow at 1280/800/390, light and dark.
- Unit + E2E green (session slot, nowrap, mobile menu with session), demo shows session variants, CHANGELOG entry and version bump.
- test.cjs is green (the real gate; mark-ended.cjs enforces it).
