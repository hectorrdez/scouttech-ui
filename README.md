# scouttech-ui

Shared design tokens and React controls for the ScoutTech apps (scouttech-frontend,
scoutgroup-frontend, scoutlog-frontend). The library ships the structure, sizes and
accessibility of the controls; each app keeps its own colours by mapping the `ui-*` tokens.

Stack: React 19, TypeScript 6, Tailwind CSS 4, React Router 7 and lucide-react (peer dependencies).

## Install

```bash
npm i github:hectorrdez/scouttech-ui#v0.1.0
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
| `--color-ui-surface` | `bg-ui-surface` | Fields, outline buttons, switch thumb |
| `--color-ui-surface-hover` | `bg-ui-surface-hover` | Secondary button, hover states |
| `--color-ui-surface-active` | `bg-ui-surface-active` | Pressed surface states |
| `--color-ui-on-surface` | `text-ui-on-surface` | Body text, labels |
| `--color-ui-on-surface-muted` | `text-ui-on-surface-muted` | Hints, placeholders, inactive icons |
| `--color-ui-outline` | `border-ui-outline` | Field borders |
| `--color-ui-outline-strong` | `border-ui-outline-strong` | Outline button border, switch off track |
| `--color-ui-focus` | `outline-ui-focus` | Focus outline (2px, offset 2px) |
| `--color-ui-danger` | `bg-ui-danger`, `text-ui-danger` | Destructive buttons, error text |
| `--color-ui-on-danger` | `text-ui-on-danger` | Text on danger |
| `--color-ui-danger-hover` | `hover:bg-ui-danger-hover` | Danger hover |
| `--color-ui-danger-soft` | `bg-ui-danger-soft` | Field background in error |
| `--color-ui-disabled` | `bg-ui-disabled` | Disabled and loading controls |
| `--color-ui-on-disabled` | `text-ui-on-disabled` | Text on disabled controls |
| `--radius-ui-control` | `rounded-ui-control` | Corners of controls (0.5rem) |
| `--shadow-ui-control` | `shadow-ui-control` | Elevation of primary and danger buttons |

Typography is inherited from the app.

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
| `Button` | `variant` (`primary` \| `secondary` \| `outline` \| `ghost` \| `danger`), `size` (`sm` \| `md`), `loading`, `icon`, plus `<button>` props | `type="button"` by default. `loading` shows a spinner, sets `aria-busy` and blocks clicks. Disabled and loading use `ui-disabled`. |
| `ButtonLink` | `to`, `variant`, `size`, `icon`, `external`, `target`, plus router `Link` props | The `<Link>` itself is styled. `external` renders a plain `<a>` with `rel="noopener noreferrer"`. `to` is passed through unchanged. |
| `ButtonToogle` (alias `ButtonToggle`) | `value: boolean`, `onChange?(value)`, `cantInteract?`, plus `<button>` props | `role="switch"`, `aria-checked`. `cantInteract` locks the value and sets `aria-disabled`. |
| `Input` | `label`, `hint`, `error`, `required`, `icon`, `fieldClassName`, plus `<input>` props | `id` from `useId()` if not given. `aria-invalid` on error. `aria-describedby` lists the rendered hint and error. |
| `Select` | `label`, `hint`, `error`, `required`, `fieldClassName`, plus `<select>` props | Same field behaviour as `Input`. |
| `FieldError` | `id?` | `role="alert"`, `text-ui-danger`. |
| `ThemeToggle` | `className`, `labels?: { group?, light?, dark?, system? }` | `radiogroup` with three `radio` buttons and `aria-checked`. Spanish defaults. |
| `ThemeProvider` | `storageKey`, `defaultMode`, `children` | See Theme. |
| `useTheme` | — | `{ mode, resolved, setMode }`. |
| `themeInitScript` | `storageKey?`, `defaultMode?` | Returns the inline script body (string). |

Subpaths `scouttech-ui/Button`, `scouttech-ui/ButtonLink`, `scouttech-ui/ButtonToogle`, `scouttech-ui/Input`,
`scouttech-ui/Select`, `scouttech-ui/ThemeToggle` and `scouttech-ui/theme` are also exported. The root barrel
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
npm run dev          # demo at http://127.0.0.1:5180 (test themes scoutgroup / scoutlog, light / dark)
npm run build        # tsc -> dist/
npm run typecheck    # library + demo + tests
npm run lint         # oxlint
npm test             # Vitest + Testing Library (jsdom)
npx playwright test  # contrast (>= 4.5:1 text, >= 3:1 focus outline) on the demo
node .claude/scripts/test.cjs   # full gate: typecheck, lint, build, unit, E2E (must print PASS)
```

The demo binds `127.0.0.1` on purpose: `localhost` can resolve to `::1` and be refused by Chromium during E2E.
