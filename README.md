# scouttech-ui

Shared design tokens and React controls for the ScoutTech apps (scouttech-frontend,
scoutgroup-frontend, scoutlog-frontend). The library ships the structure, sizes and
accessibility of the controls; each app keeps its own colours by mapping the `ui-*` tokens.

Stack: React 19, TypeScript 6, Tailwind CSS 4, React Router 7 and lucide-react (peer dependencies).

## Install

```bash
npm i github:hectorrdez/scouttech-ui#v0.3.0
```

The `prepare` script builds `dist/` when npm installs the git dependency.

In the app `index.css`:

```css
@import "tailwindcss";
@import "scouttech-ui/tokens.css";
@source "../node_modules/scouttech-ui/dist";
```

The `@source` path is relative to the CSS file (here `src/index.css`), so `../node_modules` points at the
app's `node_modules`. Tailwind scans `dist/` to generate the utility classes the components use. The library
does not ship compiled CSS.

## Tokens

Light values go in your app `@theme`, dark values under `html[data-theme="dark"]`. Map the `ui-*` names onto
your own tokens:

```css
@import "tailwindcss";
@import "scouttech-ui/tokens.css";
@source "../node_modules/scouttech-ui/dist";

@theme {
  --color-ui-primary: var(--color-primary);
  --color-ui-on-primary: var(--color-on-primary);
  --color-ui-surface: #ffffff;
  --color-ui-on-surface: #13323b;
  --color-ui-warning: #c2410c;
  /* ...the rest of the table below */
}

html[data-theme="dark"] {
  --color-ui-primary: #4fa7a9;
  --color-ui-surface: #0f1f23;
  --color-ui-on-surface: #dde9ea;
  /* ... */
}
```

Components only use the `ui-*` names. They never use raw hex values, opacity modifiers or dynamic class names.

| Token | Utilities | Used for |
| --- | --- | --- |
| `--color-ui-primary` | `bg-ui-primary` | Main action, on switch, selected radio |
| `--color-ui-on-primary` | `text-ui-on-primary` | Text on primary |
| `--color-ui-primary-hover` | `hover:bg-ui-primary-hover` | Primary hover |
| `--color-ui-primary-active` | `active:bg-ui-primary-active` | Primary pressed |
| `--color-ui-primary-ink` | `text-ui-primary-ink` | Links and brand text on surfaces (default `#3f3f46` light / `#d4d4d8` dark) |
| `--color-ui-primary-soft` | `bg-ui-primary-soft` | Brand-tinted background, text in `primary-ink` (default `#f4f4f5` / `#27272a`) |
| `--color-ui-surface` | `bg-ui-surface` | Fields, outline buttons, switch thumb |
| `--color-ui-surface-hover` | `bg-ui-surface-hover` | Secondary button, hover states |
| `--color-ui-surface-active` | `bg-ui-surface-active` | Pressed surface states |
| `--color-ui-surface-tonal` | `bg-ui-surface-tonal` | Tonal `Card` background |
| `--color-ui-on-surface` | `text-ui-on-surface` | Body text, labels |
| `--color-ui-on-surface-muted` | `text-ui-on-surface-muted` | Hints, placeholders, inactive icons |
| `--color-ui-overlay` | `bg-ui-overlay` | Backdrop behind `CookieConsent` |
| `--color-ui-outline` | `border-ui-outline` | Field borders |
| `--color-ui-outline-strong` | `border-ui-outline-strong` | Outline button border, switch off track |
| `--color-ui-focus` | `outline-ui-focus` | Focus outline (2px, offset 2px) |
| `--color-ui-danger` | `bg-ui-danger`, `text-ui-danger` | Destructive buttons, error text |
| `--color-ui-on-danger` | `text-ui-on-danger` | Text on danger |
| `--color-ui-danger-hover` | `hover:bg-ui-danger-hover` | Danger hover |
| `--color-ui-danger-soft` | `bg-ui-danger-soft` | Field background in error |
| `--color-ui-warning` | `border-l-ui-warning`, `text-ui-warning` | Mandatory marker bar on Input and Select (≥ 3:1 on `ui-surface`); warning text. Default `#c2410c` light / `#fb923c` dark |
| `--color-ui-success` | `text-ui-success` | Success text (default `#15803d` / `#4ade80`) |
| `--color-ui-info` | `text-ui-info` | Informational text (default `#1d4ed8` / `#60a5fa`) |
| `--color-ui-disabled` | `bg-ui-disabled` | Disabled and loading controls |
| `--color-ui-on-disabled` | `text-ui-on-disabled` | Text on disabled controls |
| `--radius-ui-control` | `rounded-ui-control` | Corners of controls (0.5rem) |
| `--shadow-ui-control` | `shadow-ui-control` | Elevation of primary and danger buttons |
| `--radius-ui-card` | `rounded-ui-card` | Corners of `Card` and `StatCard` (0.75rem) |
| `--spacing-ui-card` | `p-ui-card` | Padding of `Card` and `StatCard` (1.5rem) |
| `--shadow-ui-card` | `shadow-ui-card` | Elevated `Card` |
| `--shadow-ui-card-hover` | `hover:shadow-ui-card-hover` | Interactive `Card` on hover |

Typography is inherited from the app.

### Mandatory fields

`mandatory` on `Input` or `Select` draws an amber bar on the left of the control (`border-l-ui-warning`, 3px). It is a
visual marker only: it does not set `required` or `aria-required`, so use `required` as well when the field must be
validated natively. The label gets a `sr-only` suffix, `" (obligatorio)"` by default, so screen readers announce it too.
Override the suffix with `mandatoryLabel`:

```tsx
<Input label="Nombre del grupo" mandatory />
<Select label="Rama" mandatory mandatoryLabel=" (requerido)">…</Select>
<Input label="Correo" mandatory required />
```

### Public class helpers

For app-specific controls (for example a Textarea) that should look like `Input` and `Select`, use the shared
field classes. They are public API:

```tsx
import {
  controlClassName,
  controlBorderClassName,
  controlErrorClassName,
  controlMandatoryClassName,
} from "scouttech-ui";
// or the same names from "scouttech-ui/Field"

<textarea className={`${controlClassName} ${controlBorderClassName} min-h-24 py-2`} />;
```

`controlClassName` holds the size, radius, colours and focus ring. `controlBorderClassName` holds the default border.
`controlErrorClassName` replaces the border for the error state, and `controlMandatoryClassName` adds the amber
mandatory bar (visual only, like the `mandatory` prop).

## Themes

`tokens.css` is the neutral base for both modes: light by default, dark under `html[data-theme="dark"]`. Its colour
values are private `--ui-*` variables inside `@layer theme`, and `@theme` maps each `--color-ui-*` onto them. An app
that still overrides `--color-ui-*` in its own `@theme` keeps working in both modes with no change.

A brand theme changes only the brand scale: `primary`, `on-primary`, `primary-hover`, `primary-active`, `primary-ink` and
`primary-soft`. Everything else (surfaces, text, outlines, semantic colours) is the same for every brand. Import the
theme after the base tokens:

```css
@import "tailwindcss";
@import "scouttech-ui/tokens.css";
@import "scouttech-ui/themes/scoutgroup.css";
@source "../node_modules/scouttech-ui/dist";
```

The theme files are plain CSS and unlayered, so they win over the base. Import one theme per app.

| Brand (`themes/<brand>.css`) | Light `primary` / `on-primary` | Dark `primary` / `on-primary` |
| --- | --- | --- |
| `scouttech` | `#005235` / `#ffffff` | `#4fa97c` / `#00301c` |
| `scoutgroup` | `#0369a1` / `#ffffff` | `#7dd3fc` / `#082f49` |
| `scoutlog` | `#f59e0b` / `#1c1917` | `#fbbf24` / `#1c1917` |
| `scoutpulse` | `#c8102e` / `#ffffff` | `#ff6b81` / `#2a0510` |

Each theme also sets `primary-hover`, `primary-active`, `primary-ink` and `primary-soft` for light and dark. The contrast
test (`src/themes.test.tsx`) checks every theme and mode against the same pairs as the base.

## Cards

`Card` is the container for grouped content. `StatCard` is a KPI tile built on it:

```tsx
import { Card, StatCard, cardClassName } from "scouttech-ui";

<Card variant="tonal">Contenido</Card>
<Card interactive>Tarjeta clicable</Card>

<StatCard
  label="Licencias en uso"
  value="128"
  description="Actualizado hoy"
  delta="+4,2 % mes"
  footer="Ver detalle"
  footerMeta="ID 042"
  testId="stat-licences"
/>

// Link styled as a card
<Link to="/detalle" className={cardClassName({ interactive: true })}>…</Link>;
```

## Product marks and login header

`ProductMark` is the logo of an ecosystem product (`scouttech`, `scoutgroup`, `scoutlog`, `scoutpulse`) as inline SVG
with one ink (`currentColor`). Its default colour is the brand token `text-ui-brand-<product>`. Brand tokens
`--color-ui-brand-<product>` live in `tokens.css` (light and dark) and are always present, whatever theme the app imports.

`AuthBrandHeader` is the heading of a login screen. For `scouttech` it shows the ScoutTech mark and "Inicia sesión".
For the other products it shows ScoutTech › › › product marks, "Inicia sesión en {Name}" and "con tu cuenta de ScoutTech".
The chevrons animate with `motion-safe:animate-ui-chevron` and stay still under `prefers-reduced-motion`.

`NoLicensePage` is the full-page "valid login but no licence/access" screen: product mark, title, message and a
`ButtonLink` (`ctaHref`, plain `<a>` unless `external={false}`). `reason` (`no_license` default | `not_granted`) varies the
text; `title`, `message` and `ctaLabel` override it. No network and no redirects: the gate lives in each app.

```tsx
import { AuthBrandHeader, NoLicensePage, ProductMark } from "scouttech-ui";

<NoLicensePage product="scoutlog" ctaHref={scouttechUrl(base, "/perfil")} />
<NoLicensePage product="scoutgroup" reason="not_granted" ctaHref="https://scouttech.es/perfil" />

<ProductMark product="scoutlog" size={32} />               // decorative
<ProductMark product="scoutpulse" title="ScoutPulse" />    // role="img"

<AuthBrandHeader product="scoutgroup" accountInfoHref="/cuenta" />
<AuthBrandHeader product="scouttech" title="Entrar" subtitle="Usa tu cuenta" />
```

The standalone SVG files `brand/{scouttech,scoutgroup,scoutlog,scoutpulse}-mark.svg` (viewBox 0 0 32 32, `currentColor`)
ship with the package: `import mark from "scouttech-ui/brand/scoutlog-mark.svg"`, or copy them. The ScoutPulse mark is new
in 0.4.0 and pending user validation.

## Cookie consent

`CookieConsent` is a modal with one switch per section. Sections with `required` stay on and cannot be changed.
The component does not store the choice: save the values in `onSubmit` and stop rendering the dialog.

```tsx
import { CookieConsent } from "scouttech-ui";

<CookieConsent
  title="Selecciona cómo tratamos tu información"
  sections={[
    { key: "marketing", title: "Marketing", description: "Anuncios personalizados." },
    { key: "analysis", title: "Análisis", description: "Medición de uso." },
    { key: "technical", title: "Técnicas", description: "Necesarias.", required: true },
  ]}
  initial={{ marketing: true }}
  rejectOptionalLabel="Rechazar opcionales"
  moreInfo={<Link to="/cookies">Saber más</Link>}
  onSubmit={(values) => saveConsent(values)}
/>;
```

## Theme

`ThemeProvider` stores the preference (`light | dark | system`) in `localStorage` and writes the resolved
theme to `<html data-theme="light|dark">` plus `style.colorScheme`. There is no `.dark` class. To use the
attribute in Tailwind, add `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));` in your CSS.

```tsx
import { ThemeProvider } from "scouttech-ui";

<ThemeProvider storageKey="scoutgroup-theme" defaultMode="system">
  <App />
</ThemeProvider>;
```

`storageKey` defaults to `scouttech-ui-theme`. Configure one key per app. `defaultMode` defaults to `system`.

To avoid a flash of the wrong theme, inline the init script in `index.html` in the `<head>`. `themeInitScript(storageKey)`
returns the script body. It uses the same resolution as the provider, and the test suite checks parity. For
`storageKey="scouttech-ui-theme"` (default) the static snippet is:

```html
<script>
(function(){try{var stored=null;try{stored=localStorage.getItem("scouttech-ui-theme")}catch(e){}var mode=(stored==="light"||stored==="dark"||stored==="system")?stored:"system";var prefersDark=false;try{prefersDark=window.matchMedia("(prefers-color-scheme: dark)").matches}catch(e){}var resolved=mode==="system"?(prefersDark?"dark":"light"):mode;document.documentElement.dataset.theme=resolved;document.documentElement.style.colorScheme=resolved;}catch(e){}})();
</script>
```

Regenerate the snippet for a custom key with:

```bash
node -e 'import("scouttech-ui/theme").then(m=>console.log(m.themeInitScript("scoutgroup-theme")))'
```

`useTheme()` returns `{ mode, resolved, setMode }` and throws outside the provider.

## Components

| Export | Props | Notes |
| --- | --- | --- |
| `Button` | `variant` (`primary` \| `secondary` \| `outline` \| `ghost` \| `danger` \| `danger-soft`), `size` (`sm` \| `md`), `loading`, `icon`, `wrap`, plus `<button>` props | `type="button"` by default. `loading` shows a spinner, sets `aria-busy` and blocks clicks. Disabled and loading use `ui-disabled`. Labels are `whitespace-nowrap` unless `wrap` is set. |
| `ButtonLink` | `to`, `variant`, `size`, `icon`, `wrap`, `external`, `target`, plus router `Link` props | The `<Link>` itself is styled. `external` renders a plain `<a>` with `rel="noopener noreferrer"`. `to` is passed through unchanged. |
| `ButtonToogle` (alias `ButtonToggle`) | `value: boolean`, `onChange?(value)`, `cantInteract?`, plus `<button>` props | `role="switch"`, `aria-checked`. `cantInteract` locks the value and sets `aria-disabled`. |
| `Input` | `label`, `hint`, `error`, `required`, `mandatory`, `mandatoryLabel`, `icon`, `fieldClassName`, plus `<input>` props | `id` from `useId()` if not given. `aria-invalid` on error. `aria-describedby` lists the rendered hint and error. |
| `Select` | `label`, `hint`, `error`, `required`, `mandatory`, `mandatoryLabel`, `fieldClassName`, plus `<select>` props | Same field behaviour as `Input`. |
| `FieldError` | `id?` | `role="alert"`, `text-ui-danger`. |
| `ThemeToggle` | `className`, `labels?: { group?, light?, dark?, system? }` | `radiogroup` with three `radio` buttons and `aria-checked`. Spanish defaults. |
| `Card` | `variant` (`elevated` | `tonal` | `outlined`), `interactive`, plus `<div>` props | Forwards `ref`, `className`, `style` and `data-*`. `cardClassName()` returns the same classes for app elements (e.g. a link). |
| `StatCard` | `label`, `value`, `description`, `delta`, `icon`, `footer`, `footerMeta`, `testId`, plus `Card` props | KPI tile. `icon` is decorative (`aria-hidden`). `testId` goes on the card; the figure gets `${testId}-value`. |
| `ProductMark` | `product` (`scouttech` \| `scoutgroup` \| `scoutlog` \| `scoutpulse`), `size` (default 24), `tone` (`brand` default \| `inherit`), `className` (merged), `title` | Inline SVG mark. Decorative without `title`; with `title` it is `role="img"`. `products` and `productNames` are exported. |
| `AuthBrandHeader` | `product`, `title`, `subtitle`, `accountInfoHref`, `accountInfoLabel`, `className` | Login heading (`h1`) with the marks row (single `aria-label`). Chevrons are animated only under `motion-safe:`. |
| `CookieConsent` | `title`, `description`, `sections`, `initial`, `onSubmit`, `moreInfo`, `rejectOptionalLabel`, labels, `className` | Modal dialog with one switch per section. Focuses itself on mount. Required sections are locked on. Persisting the choice is the app's job (`onSubmit`). |
| `ThemeProvider` | `storageKey`, `defaultMode`, `children` | See Theme. |
| `useTheme` | — | `{ mode, resolved, setMode }`. |
| `themeInitScript` | `storageKey?`, `defaultMode?` | Returns the inline script body (string). |

Subpaths `scouttech-ui/Button`, `scouttech-ui/ButtonLink`, `scouttech-ui/ButtonToogle`, `scouttech-ui/Card`,
`scouttech-ui/StatCard`, `scouttech-ui/CookieConsent`, `scouttech-ui/Input`, `scouttech-ui/Select`, `scouttech-ui/Field`,
`scouttech-ui/ThemeToggle`, `scouttech-ui/theme`, `scouttech-ui/ProductMark` and `scouttech-ui/AuthBrandHeader` are also exported,
and `scouttech-ui/brand/<name>-mark.svg` is the standalone SVG file. The root barrel
re-exports everything, and each component file also has a default export. Types (`ButtonProps`, `ButtonVariant`,
`ButtonSize`, `InputProps`, `SelectProps`, `ThemeMode`, `ResolvedTheme`, and others) are exported from the root.

## Decisiones v0.1

1. `ButtonToogle` stays a switch (`value` / `onChange` / `cantInteract`, `role="switch"`, `aria-checked`). There is no `pressed` / `aria-pressed` API.
2. Theme is `html[data-theme]` plus `color-scheme` only, with no `.dark` class. Apps adapt with `@custom-variant`.
3. `ThemeToggle` is a radiogroup of three options with `aria-checked`, configurable labels and Spanish defaults.
4. No `helper` alias for `hint` in v0.1. Apps rename on adoption.
5. `Textarea` is out of v0.1.

## Versioning

- Semantic versioning. Every release gets a git tag `vX.Y.Z` and an entry in `CHANGELOG.md` (Keep a Changelog format).
- Apps pin the tag (`github:hectorrdez/scouttech-ui#vX.Y.Z`). Never patch an app's `node_modules` locally.
- Breaking changes to tokens or component APIs need a major version bump (or a minor bump while on 0.x, with a changelog entry).

## Development

```bash
npm install
npm run dev          # demo at http://127.0.0.1:5180 (brands scoutgroup / scoutlog / scoutpulse / scouttech, light / dark; "Comparar 4 marcas" shows all 8)
npm run build        # tsc -> dist/
npm run typecheck    # library + demo + tests
npm run lint         # oxlint
npm test             # Vitest + Testing Library (jsdom)
npx playwright test  # contrast (>= 4.5:1 text, >= 3:1 focus outline) on the demo
node .claude/scripts/test.cjs   # full gate: typecheck, lint, build, unit, E2E (must print PASS)
```

The demo binds `127.0.0.1` on purpose: `localhost` can resolve to `::1` and be refused by Chromium during E2E.
