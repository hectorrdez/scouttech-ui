---
id: "012"
slug: table-fileinput-dropdown
title: Table, FileInput, DropdownFloating
role: frontend
type: feature
extends: null
---

# Table, FileInput, DropdownFloating

## Description
Common Table, FileInput and DropdownFloating. Unify the two differing DropdownFloating versions (scoutgroup vs scoutlog). Card: SCOUT-263.

## Requirements
- Compare DropdownFloating in ../02-scoutgroup-frontend and ../03-scoutlog-frontend, unify, and document the diff between the previous versions (CHANGELOG or notes).
- Add every new export (all variants, sizes, states) to `demo/App.tsx`; add to `index` and a subpath export in `package.json`.
- Use tokens from `tokens.css`/themes only; no hardcoded colors or spacing.
- Unit/component test plus Playwright E2E on the demo for behavior and contrast where relevant.
- Add a CHANGELOG entry (minor bump is done at release time per user confirmation).

## Touches existing endpoints
no

## Done when
- Tests and demo; diff of previous versions documented.
- test.cjs is green (the real gate; mark-ended.cjs enforces it).
