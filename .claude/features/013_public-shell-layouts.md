---
id: "013"
slug: public-shell-layouts
title: PublicHeader, PublicFooter, LegalLayout
role: frontend
type: feature
extends: null
---

# PublicHeader, PublicFooter, LegalLayout

## Description
Extract the public-site shell from 02-scoutgroup-frontend (src/layouts/Header.tsx, Footer.tsx, src/utils/scouttechUrl.ts) into reusable, product-agnostic components so scoutpulse-frontend (019-026) and others can adopt them. Card: SCOUT-271 (child of SCOUT-269).

## Requirements
- `PublicHeader`: props `product` (ProductMark + productNames), `brandHref`, `nav` (label, to, external?, secondary?), `actions` (ReactNode), `themeToggle` (default on), labels for menu buttons. Mobile menu with disclosure (aria-expanded/controls), active link via NavLink, external links with icon + sr-only text.
- `PublicFooter`: props `product`, `description`, `columns` (title + links), `legalLinks`, `children` (brand column extras), `copyright`/`year`. Links external-aware.
- `LegalLayout`: article shell for legal pages (title, updated date, related legal links with aria-current, prose children).
- `scouttechUrl(base, path, params)` + `SCOUTTECH_PATHS` pure helpers (no import.meta.env: the app passes its base URL).
- Only `ui-*` tokens (no raw hex, no opacity modifiers, no dynamic class names). Peer deps only (react-router-dom, lucide-react).
- Add exports to `index.ts` + subpath exports in package.json + exports.test.ts; demo section with all variants/states.
- Unit tests + Playwright E2E: contrast AA light/dark (all palettes, via demo contrast spec), no horizontal scroll at 390/800/1280, mobile menu journey.
- CHANGELOG entry (version bump at release time, user confirmation).

## Touches existing endpoints
no

## Done when
- Tests and demo cover the three components; AA contrast light/dark; no horizontal scroll at 390/800/1280.
- test.cjs is green (the real gate; mark-ended.cjs enforces it).
