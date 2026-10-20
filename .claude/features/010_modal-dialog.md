---
id: "010"
slug: modal-dialog
title: Modal / Dialog
role: frontend
type: feature
extends: null
---

# Modal / Dialog

## Description
Common Modal/Dialog based on scoutgroup's Modal (12 uses): focus trap, Escape, overlay, aria-modal, sizes. Card: SCOUT-261.

## Requirements
- Start from ../02-scoutgroup-frontend Modal.
- Keyboard: Escape closes, Tab trapped, focus returns to the trigger on close.
- `role=dialog`, `aria-modal`, labelled title.
- Add every new export (all variants, sizes, states) to `demo/App.tsx`; add to `index` and a subpath export in `package.json`.
- Use tokens from `tokens.css`/themes only; no hardcoded colors or spacing.
- Unit/component test plus Playwright E2E on the demo for behavior and contrast where relevant.
- Add a CHANGELOG entry (minor bump is done at release time per user confirmation).

## Touches existing endpoints
no

## Done when
- Unit + E2E (keyboard and focus) on the demo pass.
- test.cjs is green (the real gate; mark-ended.cjs enforces it).
