# Design system - library guidelines
# Read before building or changing any control. The real tokens live in code; this file documents usage rules.

## Tokens - source of truth
- Contract + neutral base: `tokens.css`. `@theme` maps each `--color-ui-*` onto a private `--ui-*` variable; the light
  and dark values live in `@layer theme` (`:root` and `html[data-theme="dark"]`). Radius/shadow/spacing tokens
  (`--radius-ui-control`, `--shadow-ui-control`, `--radius-ui-card`, `--spacing-ui-card`, `--shadow-ui-card`,
  `--shadow-ui-card-hover`) stay literal.
- Product brand tokens: `--color-ui-brand-scouttech|scoutgroup|scoutlog|scoutpulse` (base, not per theme; light/dark values
  in `tokens.css`). Use them only through `ProductMark` / `AuthBrandHeader` or `text-ui-brand-<product>` for brand graphics.
  Graphics need 3:1 on `ui-surface`; ScoutLog light uses its ink (`#b45309`), not `#f59e0b`.
- Brand themes: `themes/{scouttech,scoutgroup,scoutlog,scoutpulse}.css`. They set only the brand scale
  (`--ui-primary`, `-on-primary`, `-primary-hover`, `-primary-active`, `-primary-ink`, `-primary-soft`), unlayered, for
  light and dark. Apps import `tokens.css`, then one theme.
- Demo (`demo/App.tsx`) loads the shipped `themes/*.css` raw and swaps one brand at a time; `demo/demo.css` holds no
  brand values. `?embed=1&demo=<brand>&theme=light|dark` renders one embed; the compare view shows 8 of them.
- Apps that still override `--color-ui-*` in their own `@theme` keep working.

## Colors - usage
- `ui-primary` / `ui-on-primary` (+ `-hover`, `-active`): main action.
- `ui-primary-ink`: brand text and links on surfaces. `ui-primary-soft`: brand-tinted background (text in `primary-ink`).
- `ui-success`, `ui-info`, `ui-warning`: semantic text. `ui-warning` is also the mandatory bar.
- `ui-surface` / `ui-on-surface` (+ `-hover`, `-active`): secondary/outline/ghost buttons, field backgrounds,
  elevated/outlined cards.
- `ui-surface-tonal`: tonal cards. `ui-overlay`: backdrop behind dialogs (CookieConsent).
- `ui-on-surface-muted`: hints, placeholders, inactive icons.
- `ui-outline` (field borders), `ui-outline-strong` (switch off track, hovered borders).
- `ui-focus`: focus-visible outline only.
- `ui-danger` / `ui-on-danger` / `ui-danger-hover` / `ui-danger-soft`: destructive actions, errors.
- `ui-disabled` / `ui-on-disabled`: disabled and loading states (never opacity).
Rule: no raw hex, no opacity modifiers, no dynamic class names in components.

## Product marks and login header
- `ProductMark` (marks, one ink, `currentColor`) and `AuthBrandHeader` (login heading) are the only place product marks live.
  Copy the mark from `brand/<product>-mark.svg`, never redraw it. Decorative unless `title` is given.
- Chevron animation: `motion-safe:animate-ui-chevron` only. Never an unconditional `animate-*`.

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
