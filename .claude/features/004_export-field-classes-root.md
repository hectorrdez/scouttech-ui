---
id: "004"
slug: export-field-classes-root
title: Export controlErrorClassName and controlMandatoryClassName from the root barrel (v0.1.3)
role: frontend
type: change
extends: "003"
---

# Export controlErrorClassName and controlMandatoryClassName from the root barrel (v0.1.3)

## Description
App-specific controls need the error and mandatory field classes, which today are only reachable through the
`scouttech-ui/Field` subpath. Plane card SCOUT-216. Extends feature 003 (public control class exports).

## Requirements
- `src/index.ts` (root barrel) also exports `controlErrorClassName` and `controlMandatoryClassName`.
- `./Field` subpath keeps exporting them (unchanged).
- Vitest: both classes importable from the root barrel and non-empty, matching the Field values.
- README public class helpers section lists the 4 classes; CHANGELOG 0.1.3; package.json 0.1.3.

## Touches existing endpoints
no

## Done when
- `import { controlErrorClassName, controlMandatoryClassName } from "scouttech-ui"` compiles.
- test.cjs is green (the real gate; mark-ended.cjs enforces it).
