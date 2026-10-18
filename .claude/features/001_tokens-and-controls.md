---
id: "001"
slug: tokens-and-controls
title: Tokens contract + 6 controls + ThemeProvider (v0.1.0)
role: frontend
type: feature
extends: null
---

# Tokens contract + 6 controls + ThemeProvider (v0.1.0)

## Description
First release of `scouttech-ui`: a `ui-*` design-token contract plus the six shared controls
(Button, ButtonLink, ButtonToogle, Input, Select, ThemeToggle) and ThemeProvider/useTheme/themeInitScript,
consumed by scouttech-frontend, scoutgroup-frontend and scoutlog-frontend as a git dependency
(`github:hectorrdez/scouttech-ui#v0.1.0`). Structure, sizes and accessibility are identical across apps;
each app keeps its own colors by mapping the `ui-*` tokens. Plane card SCOUT-209 (parent SCOUT-208).
Reference implementations: `../01-scouttech-frontend`, `../02-scoutgroup-frontend`, `../03-scoutlog-frontend`
under `src/components/controls/` and `src/contexts/ThemeProvider.tsx`; this library is their unified superset.

## Requirements

### Package
- React 19 + TypeScript 6 + Tailwind 4.3 + Vite 8 (same versions as the apps). `react`, `react-dom`,
  `react-router-dom` (^7) and `lucide-react` are **peerDependencies** (also devDependencies for build/demo/tests).
- `"type": "module"`. Build with `tsc` only (no bundler) to `dist/` (ESM `.js` + `.d.ts`). `prepare` script runs
  the build (npm runs it when installing a git dependency). `dist/` is gitignored. `files`: `dist`, `tokens.css`.
- `exports`: `"."` (root barrel), one subpath per component (`./Button`, `./ButtonLink`, `./ButtonToogle`, `./Input`,
  `./Select`, `./ThemeToggle`, `./theme`), and `"./tokens.css"`.
- The library does NOT compile or ship utility CSS. Apps scan its classes with
  `@source "../node_modules/scouttech-ui/dist";` in their `index.css`. So: only static, complete Tailwind class
  strings in components (no string-built class names).
- No `StringUtils`/`PathUtils`/`@/` aliases from the apps: a tiny internal `cx()` joins classes.

### Token contract — `tokens.css`
- A single `@theme { ... }` block (plain `@theme`, not `inline`/`static`) with neutral defaults; apps only override.
- Colors (`--color-ui-*` → utilities `bg-ui-*`, `text-ui-*`, `border-ui-*`, `outline-ui-*`):
  `ui-primary`, `ui-on-primary`, `ui-primary-hover`, `ui-primary-active`, `ui-surface`, `ui-surface-hover`,
  `ui-surface-active`, `ui-on-surface`, `ui-on-surface-muted`, `ui-outline`, `ui-outline-strong`, `ui-focus`,
  `ui-danger`, `ui-on-danger`, `ui-danger-hover`, `ui-danger-soft`, `ui-disabled`, `ui-on-disabled`.
- Shape: `--radius-ui-control` (`rounded-ui-control`), `--shadow-ui-control` (`shadow-ui-control`).
  Typography is inherited from the app (no font tokens).
- The `ui-` prefix avoids clashes with each app's current tokens and allows gradual migration.
- Components use **only** `ui-*` tokens: no raw hex, no opacity modifiers (`/40`), no `opacity-*` for states.

### Components (unified API)
- **Button**: `variant`: `primary | secondary | outline | ghost | danger` (scoutgroup's `destructive` = `danger`);
  `size`: `sm | md`; `loading` (lucide `Loader2` spinner, `aria-busy`, blocks clicks); `icon` (ReactNode before the
  label); `type="button"` by default; disabled/loading use `ui-disabled`/`ui-on-disabled` colors (not opacity).
  Min height md 44px, sm 32px (WCAG 2.5.8). Focus: `focus-visible` outline 2px `ui-focus`, offset 2px.
- **ButtonLink**: same variants/sizes rendered on react-router `Link` (the link itself is styled — no button nested
  inside a link). `to` is passed through unchanged (route-name resolution stays in each app). `external` → plain `<a>`
  with `rel="noopener noreferrer"` (and `target` passthrough).
- **ButtonToogle**: keeps the current API of the 3 apps — `value: boolean`, `onChange?(value)`, `cantInteract`
  (locked on/off, e.g. mandatory cookies → `aria-disabled`, no toggle), `role="switch"`, `aria-checked`.
  Keep the name `ButtonToogle` (no broken imports) and export alias `ButtonToggle`. Focus outline `ui-focus`;
  colors `ui-primary` (on) / `ui-outline-strong` (off), thumb `ui-surface`. Target ≥ 24px tall hit area.
- **Input / Select**: `label`, `hint`, `error`, `required`; `id` from `useId()` when not given;
  `aria-invalid` when `error`; `aria-describedby` → `${id}-hint` / `${id}-error` (only those rendered).
  Export `FieldError` (`role="alert"`, `ui-danger` text). Height 44px. Input keeps the `icon` prop (left icon).
  `fieldClassName` applies to the wrapper. Select draws a lucide `ChevronDown`. Error state: border `ui-danger`,
  bg `ui-danger-soft`. Focus: outline `ui-focus`.
- **ThemeProvider** + `useTheme()` + `themeInitScript(storageKey?)`: modes `light | dark | system`, resolved value
  written to `<html data-theme="light|dark">` plus `style.colorScheme`; **no `.dark` class**. Persists in
  `localStorage` (every access in try/catch); `storageKey` prop configurable per app (default `"scouttech-ui-theme"`).
  Follows the OS while on `system`. `useTheme()` returns `{ mode, resolved, setMode }` and throws outside the provider.
  `themeInitScript` returns a string (IIFE) to inline in `index.html` that leaves exactly the same DOM state as the
  provider (same key, same resolution).
- **ThemeToggle**: `radiogroup` (default `aria-label` "Tema de la interfaz") with 3 `radio` buttons + `aria-checked`,
  lucide `Sun`/`Moon`/`Monitor`; labels configurable via `labels` prop, Spanish defaults
  ("Tema claro", "Tema oscuro", "Seguir al sistema"). Each radio ≥ 24px.

### Decisions (orchestrator, 2026-10-18) — the card spec was wrong on 1 and 3
1. ButtonToogle stays a switch (`value`/`onChange`/`cantInteract`, `role="switch"`, `aria-checked`); no `pressed`/`aria-pressed`.
2. Theme = `html[data-theme]` + `color-scheme` only, no `.dark` class; scouttech-frontend adapts with `@custom-variant` in its adoption (071).
3. ThemeToggle = radiogroup of 3 with `aria-checked`, configurable labels, Spanish defaults.
4. No `helper` alias for `hint` (no deprecated API in v0.1; scouttech renames on adoption).
5. Textarea is out of v0.1.

### Quality
- `demo/` (Vite): every variant/state of every control, with two test themes switchable at runtime
  (scoutgroup and scoutlog light/dark values mapped onto `ui-*`) — lightweight storybook.
- Vitest + Testing Library (jsdom): behavior, roles, `aria-*`, focus, defaults (`type="button"`), loading blocks
  clicks, ButtonToogle `cantInteract`, Input/Select ids and describedby, ThemeProvider persistence/resolution and
  `themeInitScript` parity, ThemeToggle.
- Playwright on the demo: in both test themes × light/dark, text contrast ≥ 4.5:1 for every enabled control and
  focus outline contrast ≥ 3:1 against the adjacent background.
- `README.md`: install (`npm i github:hectorrdez/scouttech-ui#v0.1.0`), `@source`, token mapping example,
  `themeInitScript`, components/props table, the decisions above, versioning policy (semver, tag per release,
  `CHANGELOG.md`). `CHANGELOG.md` with 0.1.0.

## Touches existing endpoints
no

## Done when
- `npm i github:hectorrdez/scouttech-ui#v0.1.0` in a clean Vite project installs, builds and renders with the Tailwind
  classes generated (verified locally by packing/installing from the repo path before tagging).
- test.cjs is green (typecheck + lint + build + Vitest + Playwright); mark-ended.cjs enforces it.
- Tag `v0.1.0` pushed (push only with user confirmation).
