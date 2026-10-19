# Design system - library guidelines
# Read before building or changing any control. The real tokens live in code; this file documents usage rules.

## Tokens - source of truth
- Contract + neutral defaults: `tokens.css` (`@theme`, `--color-ui-*`, `--radius-ui-control`, `--shadow-ui-control`,
  `--radius-ui-card`, `--spacing-ui-card`, `--shadow-ui-card`, `--shadow-ui-card-hover`).
- Each consumer app overrides the values (light in its `@theme`, dark under `html[data-theme="dark"]`).
- Demo test themes (scoutgroup / scoutlog / scouttech): `demo/demo.css`.

## Colors - usage
- `ui-primary` / `ui-on-primary` (+ `-hover`, `-active`): main action.
- `ui-surface` / `ui-on-surface` (+ `-hover`, `-active`): secondary/outline/ghost buttons, field backgrounds,
  elevated/outlined cards.
- `ui-surface-tonal`: tonal cards. `ui-overlay`: backdrop behind dialogs (CookieConsent).
- `ui-on-surface-muted`: hints, placeholders, inactive icons.
- `ui-outline` (field borders), `ui-outline-strong` (switch off track, hovered borders).
- `ui-focus`: focus-visible outline only.
- `ui-danger` / `ui-on-danger` / `ui-danger-hover` / `ui-danger-soft`: destructive actions, errors.
- `ui-disabled` / `ui-on-disabled`: disabled and loading states (never opacity).
Rule: no raw hex, no opacity modifiers, no dynamic class names in components.

## Typography
Inherited from the consumer app. Controls use `text-sm`/`text-base` + `font-medium` for labels.

## Sizes
- Button md min-height 44px, sm 32px; Input/Select 44px; switch and theme radios ≥ 24px hit area.
- Corners `rounded-ui-control`; elevation `shadow-ui-control` (primary/danger buttons).
- Cards: `rounded-ui-card`, `p-ui-card`, `shadow-ui-card` (elevated), `hover:shadow-ui-card-hover` (interactive).

## Components - reuse, do not re-roll
Button, ButtonLink, ButtonToogle (alias ButtonToggle), Input, Select, FieldError, ThemeToggle, ThemeProvider,
Card (elevated / tonal / outlined, interactive), StatCard, CookieConsent (`src/`).

## Interaction & accessibility
- Focus: `focus-visible:outline-2 outline-offset-2 outline-ui-focus` on every interactive element.
- Contrast: text ≥ 4.5:1, focus outline ≥ 3:1 (enforced by Playwright on the demo themes).
- Fields: label linked by id, `aria-invalid`, `aria-describedby` to hint/error, errors `role="alert"`.
