---
id: "016"
slug: public-header-demo-playground
title: PublicHeader demo as one header with toggles
role: frontend
type: change
extends: 014
---

# PublicHeader demo as one header with toggles

## Description
The header component arranges information; it does not own the content. The demo stacked five different headers at once, which says nothing about the component. Replace them with a single `PublicHeader` driven by controls (product, banner, custom brand, session, free actions, external link, secondary link, theme toggle, sticky). Also move the Playwright dev server from 5180 to 5190: 5180 is used by scoutlog-frontend and `reuseExistingServer` ran the contrast suite against the wrong app.

## Requirements
- Demo: one `PublicHeader` + toggles; default state shows session, external and secondary links.
- E2E updated to the single header (no index-based selectors); playground toggle test.
- Playwright port 5190.
- No change to the library code or the published API.

## Touches existing endpoints
no

## Done when
- test.cjs is green (the real gate; mark-ended.cjs enforces it).
