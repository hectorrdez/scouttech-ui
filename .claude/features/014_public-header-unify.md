---
id: "014"
slug: public-header-unify
title: Unified public header (PublicHeader / ShellLink)
role: frontend
type: feature
extends: 013
---

# Unified public header (PublicHeader / ShellLink)

## Description
Make `PublicHeader` the common public header for the ecosystem, with the look of the public header in scouttech-frontend (`src/layouts/Header.tsx`). Keeps the 013 API backwards compatible and adds `brand`, `banner` and `sticky`. Card: SCOUT-295 (parent SCOUT-294, "Cabecera común en scouttech-ui"). Unblocks SCOUT-296..299 (adoption in the 4 frontends).

## Requirements
- Props (retro-compatible with 013): `product`, `brandHref` (default "/"), `brand?: ReactNode` (overrides the logo block, e.g. "by ScoutTech"), `nav`, `actions?: ReactNode` (session/CTA/user menu slot), `banner?: ReactNode` (optional top strip), `themeToggle` (default true), `sticky` (default true), `labels`, `className`.
- Keep the existing mobile menu disclosure (aria-expanded/aria-controls, closes on navigation and on Escape).
- `ShellLink` states, tokens `ui-*` only:
  - Rest: `text-ui-on-surface-muted`, `py-1`, 2px underline `after:` with `bg-ui-primary` and `scale-x-0`.
  - Hover: `text-ui-on-surface` + underline `scale-x-100`, origin-left, 200ms, `motion-reduce:transition-none`. No size or border change that shifts layout.
  - Active (`aria-current="page"`): `text-ui-primary-ink font-medium` + visible underline.
  - Focus-visible: outline `ui-focus` 2px, offset 2.
  - External: ExternalLink icon + sr-only "(se abre en otra pestaña)".
- Mobile (<md): vertical list, same colors and active state; hover `bg-ui-surface-hover`.
- Bar: `h-16`, `bg-ui-surface`, `border-b border-ui-outline`, `sticky top-0 z-40` when `sticky`. No opacity modifiers or hex. Translucency, if wanted, needs a new `ui-surface-translucent` token, not `/80`.
- Out of scope: in-session headers (ConsoleHeader, AppHeader, Topbar, AppShell), AuthBrandHeader, PublicFooter.

## Touches existing endpoints
no

## Done when
- Demo shows every variant: with/without banner, custom brand, actions logged-in/anonymous, external link, secondary link, sticky on/off.
- Exports in `index.ts`, subpath in package.json, `exports.test.ts` updated.
- Unit tests (Vitest/RTL): rest/hover/active classes, aria-current, mobile menu (open, close on navigation, Escape), banner/brand slots, 013 props still work.
- E2E Playwright on demo: AA contrast light/dark, no horizontal scroll at 390/800/1280, mobile menu journey.
- CHANGELOG entry; version bump confirmed with the user.
- test.cjs is green (the real gate; mark-ended.cjs enforces it).
