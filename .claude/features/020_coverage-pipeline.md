---
id: "020"
slug: coverage-pipeline
title: Vitest coverage to SonarQube (new-code gate)
role: frontend
type: feature
extends: null
---

# Vitest coverage to SonarQube

## Description
Makes the library send Vitest coverage to SonarQube so the ScoutTech New Code gate can measure new-code coverage (SCOUT-453, child of SCOUT-448). Test files inside src/ are reclassified as Sonar tests; production code is not excluded.

## Requirements
- Add `@vitest/coverage-v8`, pinned exact to 5.0.4 with vitest pinned to 5.0.4 (peer must match; 5.0.5 was under two weeks old).
- `vitest.config.ts`: provider v8, reporters lcov + text-summary, `reportsDirectory` `coverage`, include `src/**`, exclude test files and `src/test/**`.
- `test:coverage` npm script; `test.cjs` runs it and then normalizes lcov `SF:` paths to repo-relative posix (`lcov-posix.cjs`).
- `.claude/sonar.json`: `coverageReports` for `sonar.javascript.lcov.reportPaths` = `coverage/lcov.info`, `tests` = `src`, `testInclusions` = `src/**/*.test.ts`, `src/**/*.test.tsx`, `src/test/**`. No `sonar.exclusions`, `sonar.coverage.exclusions` or NOSONAR.
- `.claude/scripts/sonar.cjs` and `verify.cjs` are byte-identical copies from 01-scouttech-frontend.
- `coverage/` is git-ignored.
- No gate, threshold or Sonar server setting changes. No test deleted or skipped. The Playwright demo contrast e2e is unchanged.

## Touches existing endpoints
no

## Done when
- `node .claude/scripts/test.cjs` is green (exit 0).
- `coverage/lcov.info` is produced with repo-relative SF paths and sonar.cjs uploads it.
- A Sonar scan of 05-scouttech-ui reports non-zero overall coverage and computes new-code coverage from the report.
- test.cjs is green (mark-ended.cjs enforces it).
