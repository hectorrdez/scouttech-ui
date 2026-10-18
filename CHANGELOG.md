# Changelog

All notable changes to this project are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-10-18

### Added
- `tokens.css`: `ui-*` colour tokens (18), `--radius-ui-control` and `--shadow-ui-control` with neutral defaults.
- `Button` with `variant` (`primary`, `secondary`, `outline`, `ghost`, `danger`), `size` (`sm`, `md`), `loading`, `icon`.
- `ButtonLink` (router link styled as a button) with `external` support.
- `ButtonToogle` switch with `value`, `onChange`, `cantInteract` (alias `ButtonToggle`).
- `Input` and `Select` with `label`, `hint`, `error`, `required`, `icon`, `fieldClassName`, and `FieldError`.
- `ThemeToggle` radiogroup (light / dark / system) with configurable labels.
- `ThemeProvider`, `useTheme` and `themeInitScript` (inline script parity with the provider), with `html[data-theme]` and `color-scheme`.
- Demo app (`demo/`) with scoutgroup and scoutlog test themes.
- Unit tests (Vitest + Testing Library) and E2E contrast and focus checks (Playwright).
