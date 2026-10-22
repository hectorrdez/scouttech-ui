---
id: "018"
slug: no-license-page
title: NoLicensePage common component
role: frontend
type: feature
---

# NoLicensePage common component

## Description
scoutlog, scoutgroup and scoutpulse need the same "valid login but no license/access to this app" screen. Requested by orquestador and scoutlog-frontend. Card: child of SCOUT-294.

## Requirements
- New `NoLicensePage`: centered full-height page, `ProductMark` of `product`, title, message, `ButtonLink` to ScoutTech profile. Tokens `ui-*`, light/dark.
- Props: `product: Product`, `reason?: "no_license" | "not_granted"` (default `no_license`, varies title/message), `title?`, `message?` (override), `ctaHref: string`, `ctaLabel?` (default "Ir a mi perfil de ScoutTech"), `external?` (default true: plain `<a>`; false = router Link).
- No network and no redirects; the gate lives in each frontend.
- Exported from root + subpath `scouttech-ui/NoLicensePage`; demo with both reasons, product variants and overrides; unit tests; README row; CHANGELOG; version 0.10.0.

## Touches existing endpoints
no

## Done when
- Unit tests green, demo updated, CHANGELOG entry, version 0.10.0.
- test.cjs is green (the real gate; mark-ended.cjs enforces it).
