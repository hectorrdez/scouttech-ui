---
id: "009"
slug: layout-row-column
title: Layout: Row, Column, RowInverted, ColumnInverted
role: frontend
type: feature
extends: null
---

# Layout: Row, Column, RowInverted, ColumnInverted

## Description
Move Row, Column, RowInverted and ColumnInverted (identical in scoutgroup and scoutlog) into scouttech-ui. Card: SCOUT-260.

## Requirements
- Copy from ../03-scoutlog-frontend/src/components/placing; API must stay identical so consumers migrate with no changes (compare against ../02-scoutgroup-frontend too and note any diff in the CHANGELOG).
- Add every new export (all variants, sizes, states) to `demo/App.tsx`; add to `index` and a subpath export in `package.json`.
- Use tokens from `tokens.css`/themes only; no hardcoded colors or spacing.
- Unit/component test plus Playwright E2E on the demo for behavior and contrast where relevant.
- Add a CHANGELOG entry (minor bump is done at release time per user confirmation).

## Touches existing endpoints
no

## Done when
- Same props/behavior as the current consumer components.
- Tests and demo cover all four.
- test.cjs is green (the real gate; mark-ended.cjs enforces it).
