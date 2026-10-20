---
id: "011"
slug: badge-tabs-emptystate-skeleton
title: Badge, Tabs, EmptyState, Skeleton
role: frontend
type: feature
extends: null
---

# Badge, Tabs, EmptyState, Skeleton

## Description
Common Badge (semantic variants through tokens), Tabs, EmptyState and Skeleton, derived from scoutgroup's local versions. Card: SCOUT-262.

## Requirements
- Start from ../02-scoutgroup-frontend versions.
- Section/state colors (castores, valid, expiring...) remain theme tokens; Badge accepts a variant by class/tone, never hex.
- Tabs: keyboard arrows, `role=tablist/tab/tabpanel`.
- Add every new export (all variants, sizes, states) to `demo/App.tsx`; add to `index` and a subpath export in `package.json`.
- Use tokens from `tokens.css`/themes only; no hardcoded colors or spacing.
- Unit/component test plus Playwright E2E on the demo for behavior and contrast where relevant.
- Add a CHANGELOG entry (minor bump is done at release time per user confirmation).

## Touches existing endpoints
no

## Done when
- Tests and demo cover all four components and their variants.
- test.cjs is green (the real gate; mark-ended.cjs enforces it).
