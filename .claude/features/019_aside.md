---
id: "019"
slug: aside
title: Aside (sidebar) components
role: frontend
type: feature
---

# Aside components

## Description
Shared themeable sidebar for the three frontends (SCOUT-395, child of SCOUT-394; consumers migrate in SCOUT-396). Union of the needs of 01 Aside, 02 Sidebar, 03 Aside.

## Requirements
- New `Aside` (container) + item/section parts, styled only with `ui-*` tokens (bg-ui-surface, border-ui-outline, active bg-ui-primary-soft text-ui-primary-ink font-semibold, hover bg-ui-surface-hover, focus outline-ui-focus, rounded-ui-control, min item height 44px).
- Props/slots: `header` (brand/group switcher), `items` or `sections` (optional title), `footer` slot, `footerItems`, `aria-label`.
- Item: `label`, `to` (react-router NavLink), `icon`, `end`, `badge?: ReactNode`, `disabled?` + `disabledReason` (tooltip/title).
- Collapse to icon rail (expanded ~w-64, rail w-16): controlled `collapsed` + `onToggle`, uncontrolled default; built-in toggle labels "Contraer"/"Expandir" overridable; toggle `aria-expanded`; rail shows icons only with title/aria-label.
- Mobile (<md): off-canvas drawer + backdrop, controlled `mobileOpen` + `onCloseMobile`; closes on navigate and Escape.
- Sticky full-height by default; optional top offset prop.
- Active link `aria-current="page"`; keyboard reachable, visible focus ring.
- Export from `src/index.ts` and subpath in `package.json` exports; README row; demo entries in `demo/App.tsx` (expanded, collapsed, active, disabled, badge, sections, mobile open, under each product theme); vitest unit tests; CHANGELOG; version 0.11.0; annotated tag v0.11.0 (tag/push only after OK relayed by orchestrator).
- Out of scope: consumer apps; product widgets (they go in slots).

## Touches existing endpoints
no

## Done when
- Unit tests green, demo updated, CHANGELOG entry, version 0.11.0.
- test.cjs is green (mark-ended.cjs enforces it).
