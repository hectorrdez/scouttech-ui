---
id: "005"
slug: cards
title: Card, StatCard and CookieConsent in the library (v0.2.0)
role: frontend
type: feature
extends: "001"
---

# Card, StatCard and CookieConsent in the library (v0.2.0)

## Description
The apps hold 4 different Card, 2 StatCard and 4 copies of CookiesCard. Move them into scouttech-ui as shared,
token-only components. Plane card SCOUT-239 (parent SCOUT-243). Adoption in the apps goes in separate cards.

## Requirements
- **Card**: `ComponentProps<"div">` + `variant?: "elevated" | "tonal" | "outlined"` (default elevated) +
  `interactive?: boolean` (subtle hover shadow, pointer). Forwards ref, className, style and data-* so apps can
  wrap their own entrance animation without a library dependency. Radius and padding from tokens.
- **StatCard**: `label`, `value` (ReactNode), `description?`, `delta?`, `icon?`, `footer?`, `footerMeta?`,
  `testId?` + Card props (`variant`, `className`, ...). Union of the scouttech and scoutgroup versions; no countUp.
- **CookieConsent**: parametrizable cookie dialog replacing CookiesCard. Props `title`,
  `sections: { key, title, description, required? }[]`, `initial`, `onSubmit(values)`, `moreInfo?: ReactNode`,
  button labels. Includes the scoutlog 029 mobile fix (`w-full max-w-xl sm:min-w-96`, overlay `fixed inset-0 p-4`,
  internal vertical scroll, actions `flex-wrap`), `role="dialog"` + `aria-labelledby`, focus on the dialog.
  Persistence stays in each app.
- Colors only `ui-*` tokens; add the missing surface/shadow tokens (tonal surface, overlay, card shadow, card
  radius/padding) with defaults in `tokens.css` and mappings in the demo themes.
- Exports from the root barrel and subpaths `./Card`, `./StatCard`, `./CookieConsent`. README, CHANGELOG, demo.
- Vitest: Card variants/forwarding, StatCard with delta/footer, CookieConsent behaviour.
- Playwright: CookieConsent without horizontal scroll at 320/375/414 and focused; AA text contrast of cards and
  dialog in the 3 demo themes × light/dark.
- package.json 0.2.0, tag v0.2.0.

## Touches existing endpoints
no

## Done when
- The three components are exported, documented and shown in the demo.
- test.cjs is green (the real gate; mark-ended.cjs enforces it).
