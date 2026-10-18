---
id: "000"
slug: short-slug
title: Human-readable title
role: backend          # backend | frontend
type: feature          # feature = new | change = modifies shipped behavior
extends: null          # id of the shipped feature this replaces/extends (e.g. "002"), else null
---

# {title}

## Description
What this feature does and why. 2-4 sentences. Intent at THIS moment; this file is immutable once shipped.

## Requirements
- Concrete constraint or sub-task.
- What to reuse (point to notes.md / existing components or modules).
- Edge cases or rules to respect.

## Touches existing endpoints
no
<!-- If yes: list them. This tells the tester that a failing OLD Bruno request on these is an
     EXPECTED contract change (update the request), not a regression. Frontend: list the endpoints
     this feature consumes from endpoints.md. -->

## Done when
- Observable acceptance criterion.
- test.cjs is green (the real gate; mark-ended.cjs enforces it).
