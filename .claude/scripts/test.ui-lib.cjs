#!/usr/bin/env node
'use strict';
// Gate for a UI component library (create-project type `ui-lib`): typecheck lib+demo+tests, lint,
// build dist, unit tests, then Playwright contrast/focus E2E on the demo.
const { run } = require('./_lib.cjs');

const steps = [
  ['Typecheck (lib + demo + tests)', 'npm', ['run', 'typecheck']],
  ['Lint', 'npm', ['run', 'lint']],
  ['Build (tsc -> dist)', 'npm', ['run', 'build']],
  ['Unit tests (Vitest)', 'npm', ['run', 'test']],
  ['Playwright E2E (contrast + focus on demo)', 'npx', ['playwright', 'test']],
];

for (let i = 0; i < steps.length; i++) {
  const [name, cmd, args] = steps[i];
  console.log(`[${i + 1}/${steps.length}] ${name}...`);
  if (run(cmd, args) !== 0) {
    console.log(`FAIL: ${name}`);
    process.exit(1);
  }
}

console.log('PASS');
process.exit(0);
