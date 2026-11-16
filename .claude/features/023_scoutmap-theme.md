---
id: "023"
slug: scoutmap-theme
title: ScoutMap brand theme + map accents (v0.13.0)
role: frontend
type: feature
extends: null
---

# ScoutMap brand theme + map accents (v0.13.0)

## Description
Adds a ScoutMap brand theme so `11-scoutmap-frontend` imports it instead of hand-written overrides. Card SCOUT-569 (parent SCOUT-535). Consumer: SCOUT-536 (001 base-shell-sso). Values come from `11-scoutmap-frontend/docs/prototype/stitch-DESIGN.md` and its `.claude/DESIGN.md`.

## Requirements
- New `themes/scoutmap.css`, same structure as `themes/scoutgroup.css`: `:root` and `html[data-theme="dark"]` blocks, unlayered, only brand variables.
- Brand scale, light: `--ui-primary #C2410C`, `--ui-primary-hover #9A3412`, `--ui-primary-active #7C2D12`, `--ui-primary-ink #C2410C`, `--ui-on-primary #FFFFFF`, `--ui-primary-soft #FFEDD5`.
- Brand scale, dark: `--ui-primary #FB923C`, `--ui-primary-hover #FDBA74`, `--ui-primary-active #F97316`, `--ui-primary-ink #FB923C`, `--ui-on-primary #431407`, `--ui-primary-soft` a dark terracotta that passes the contrast test.
- Hover/active/soft values other than the prototype ones are proposals; adjust only if the contrast test fails.
- Map accents, defined ONLY in this theme: `--ui-map-campsite #15803D`, `--ui-map-route #4F46E5`, `--ui-map-hostel #D97706`, `--ui-map-verified #10B981`, each with a lighter dark-mode variant. Document them in README as ScoutMap-only.
- `src/themes.test.tsx`: add `scoutmap` to `BRANDS` (same text-contrast pairs as the other brands) and a check that each map accent has at least 3:1 against the base background in both modes (WCAG 1.4.11).
- Demo: add ScoutMap to the brand switcher in `demo/App.tsx` (palette, names, embed compare rows).
- Other brand themes byte-for-byte unchanged.
- README theme table row for `scoutmap`; CHANGELOG entry; package version bumped to 0.13.0 (0.12.0 is already taken by feature 022 on dev, untagged).

## Touches existing endpoints
no

## Done when
- Vitest suite green, including the new scoutmap contrast cases and the map-accent 3:1 checks.
- Importing `tokens.css` then `themes/scoutmap.css` gives the values above in light and dark.
- test.cjs is green (mark-ended.cjs enforces it).
