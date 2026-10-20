---
id: "008"
slug: form-controls-textarea-checkbox-radio
title: Form controls: Textarea, Checkbox, Radio
role: frontend
type: feature
extends: null
---

# Form controls: Textarea, Checkbox, Radio

## Description
Add Textarea, Checkbox and Radio following the same pattern as Input/Select (Field, FieldError, error and mandatory states). Card: SCOUT-259.

## Requirements
- Reuse Field/FieldError/field classes already exported by Input/Select.
- Accessible: label association, `aria-invalid`, `aria-describedby` for hint/error; Radio as a group.
- Add every new export (all variants, sizes, states) to `demo/App.tsx`; add to `index` and a subpath export in `package.json`.
- Use tokens from `tokens.css`/themes only; no hardcoded colors or spacing.
- Unit/component test plus Playwright E2E on the demo for behavior and contrast where relevant.
- Add a CHANGELOG entry (minor bump is done at release time per user confirmation).

## Touches existing endpoints
no

## Done when
- Textarea, Checkbox, Radio render with label, hint, error, mandatory, disabled, focus states.
- Unit + E2E demo tests pass.
- test.cjs is green (the real gate; mark-ended.cjs enforces it).
