---
id: "017"
slug: button-wrap-optout
title: Button wrap opt-out
role: frontend
type: change
extends: 015
---

# Button wrap opt-out

## Description
015 forced `whitespace-nowrap` on every button. Some consumers need long labels to wrap in narrow containers. Card: SCOUT-316 (parent SCOUT-294).

## Requirements
- New prop `wrap?: boolean` (default `false` = `whitespace-nowrap`, current behaviour) on `Button`, `ButtonLink` and `buttonClassName`. `wrap` drops `whitespace-nowrap`.
- Demo: Button/ButtonLink with a long label in a narrow container, with and without `wrap`.
- Unit tests for default nowrap and `wrap`; README + CHANGELOG; version bump to 0.9.0.

## Touches existing endpoints
no

## Done when
- Unit tests green, demo updated, CHANGELOG entry, version 0.9.0.
- test.cjs is green (the real gate; mark-ended.cjs enforces it).
