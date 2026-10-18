# Project brief
# Filled by /init-app from the intake interview. Stable reference; update rarely.

## Goal
`scouttech-ui` is the shared React component library of the ScoutTech ecosystem (scouttech-frontend,
scoutgroup-frontend, scoutlog-frontend). It makes the base controls (buttons, inputs, selects, switches, theme
toggle) identical in structure, sizes and accessibility across the three apps while each app keeps its own colors
through a `ui-*` design-token contract. Distributed as a public git dependency pinned to a tag.

## Stack
React 19 + TypeScript 6 + Tailwind 4.3 (consumer apps scan `dist/` via `@source`), built with plain `tsc`.
Demo with Vite 8. Tests: Vitest + Testing Library, Playwright (contrast on the demo). Lint: oxlint.

## Repo type
frontend-web (component library + demo app)

## Scope - in
- Token contract (`tokens.css`), Button, ButtonLink, ButtonToogle, Input, Select, FieldError, ThemeToggle,
  ThemeProvider/useTheme/themeInitScript.
- Demo app with test themes, unit tests, contrast E2E, README + CHANGELOG.

## Scope - out (explicitly NOT doing)
- No npm registry publishing; no bundler; no shipped utility CSS.
- No app-specific logic (routing/SiteMap, i18n, data fetching).
- No Textarea, modals, cards, layout components in v0.1 (later versions on demand from adoptions).

## Conventions / decisions
- Only `ui-*` tokens in components; static Tailwind class strings only (apps scan dist).
- Each consumer adoption that needs a change → new feature here + new `v0.x.y` tag; never patch an app's copy.
- Work on `main`; push/tag only with user confirmation.
