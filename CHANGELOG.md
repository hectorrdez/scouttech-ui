# Changelog

All notable changes to this project are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [0.2.0] - 2026-10-19

### Added
- `Card` with `variant` (`elevated`, `tonal`, `outlined`) and `interactive`; forwards `ref`, `className`, `style` and `data-*`. `cardClassName()` exported for app elements that must look like a card.
- `StatCard` KPI tile (label, value, description, delta, icon, footer, footerMeta, testId), built on `Card`.
- `CookieConsent` modal dialog with one switch per section, `required` sections locked on, accept selection / accept all and an optional reject-optional button.
- Tokens: `--color-ui-surface-tonal`, `--color-ui-overlay`, `--radius-ui-card`, `--spacing-ui-card`, `--shadow-ui-card`, `--shadow-ui-card-hover`, mapped in the demo themes for light and dark.
- Subpath exports `scouttech-ui/Card`, `scouttech-ui/StatCard` and `scouttech-ui/CookieConsent`.
- Demo: Card, StatCard and CookieConsent sections.
- Tests: Vitest for Card, StatCard, CookieConsent and the root barrel; E2E cookie consent on 320/375/414 px widths, dialog text contrast on the 3 themes × light/dark, and text contrast now also checks the Card, StatCard and CookieConsent text.

## [0.1.3] - 2026-10-19

### Added
- `controlErrorClassName` and `controlMandatoryClassName` are now also exported from the root barrel (`scouttech-ui`), not only from `scouttech-ui/Field`.

## [0.1.2] - 2026-10-19

### Added
- `Button` and `ButtonLink` variant `danger-soft` (`bg-ui-danger-soft`, `text-ui-danger`, bordered; hover and active use `ui-danger-hover`). Solid `danger` is unchanged.
- Token `--color-ui-warning` (amber, default `#b45309`), mapped in the demo themes for light and dark.
- `Input` and `Select` `mandatory` prop: amber left bar on the control (also with error). It is a visual marker only and does not set `required` or `aria-required`.
- `Input` and `Select` `mandatoryLabel` prop: screen-reader suffix for the label (default `" (obligatorio)"`).
- Public control class helpers `controlClassName` and `controlBorderClassName`, exported from the root barrel and the `scouttech-ui/Field` subpath.
- Demo: danger-soft in every grid, and mandatory Input and Select examples (with error and with `required`).
- E2E: danger-soft text contrast at rest and on hover, and mandatory bar contrast, on the 3 themes × light/dark.

## [0.1.1] - 2026-10-18

### Added
- Demo: `scouttech` test theme (light and dark) mapped from scouttech-frontend's `--st-*` values; the theme selector offers 3 options.
- E2E contrast and focus checks run on the 3 test themes × light/dark.

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
