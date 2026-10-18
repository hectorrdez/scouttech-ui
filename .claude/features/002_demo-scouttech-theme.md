---
id: "002"
slug: demo-scouttech-theme
title: Demo scouttech test theme + contrast coverage (v0.1.1)
role: frontend
type: change
extends: "001"
---

# Demo scouttech test theme + contrast coverage (v0.1.1)

## Description
The demo only has the scoutgroup and scoutlog test themes; scouttech-frontend (the third consumer, adoption 071)
is missing. Add a "scouttech" light + dark test theme to the demo using the app's real `--st-*` values, and run the
Playwright contrast checks on all 3 themes × light/dark. Plane card SCOUT-213. Extends feature 001 (demo/quality).

## Requirements
- `demo/demo.css`: `html[data-demo="scouttech"]` (light) and `[data-theme="dark"]` blocks with literal values copied
  from `../01-scouttech-frontend/src/index.css` (`:root` and `.dark`). Mapping (orchestrator, 2026-10-18):
  ui-primary/on-primary → st-primary/on-primary; ui-primary-hover → st-primary-container;
  ui-surface/-hover/-active → st-surface/surface-container/surface-container-high;
  ui-on-surface/-muted → st-on-surface/on-surface-variant; ui-outline/-strong → st-outline-variant/outline;
  ui-focus → st-primary; ui-danger/on-danger/danger-soft → st-error/on-error/error-container;
  shadow-ui-control → scouttech `--shadow-card`. Not specified, chosen by analogy with scoutlog (same M3 scheme):
  ui-primary-active → st-primary, ui-danger-hover → st-on-error-container, ui-disabled → st-surface-container-high,
  ui-on-disabled → st-on-surface-variant.
- Demo top-bar selector offers 3 options (ScoutGroup, ScoutLog, ScoutTech); `?demo=scouttech` and stored value work.
- `e2e/contrast.spec.ts` covers 3 themes × light/dark (text ≥ 4.5:1, focus outline ≥ 3:1).
- If a scouttech pair fails, do NOT tweak the demo values to pass: report it to the orchestrator (fixed in the app, 071).
- README mentions the 3 test themes; CHANGELOG entry 0.1.1; `package.json` version 0.1.1.

## Touches existing endpoints
no

## Done when
- Demo switches between 3 test themes at runtime, each in light and dark.
- Playwright contrast + focus checks run on 6 combos.
- test.cjs is green (the real gate; mark-ended.cjs enforces it).
