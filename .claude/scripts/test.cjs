#!/usr/bin/env node
'use strict';
const { run } = require('./_lib.cjs');

const steps = [
  ['Typecheck (lib + demo + tests)', 'npm', ['run', 'typecheck']],
  ['Lint', 'npm', ['run', 'lint']],
  ['Build (tsc -> dist)', 'npm', ['run', 'build']],
  ['Unit tests (Vitest, coverage/lcov.info)', 'npm', ['run', 'test:coverage']],
  ['Coverage paths (lcov SF posix)', 'node', ['.claude/scripts/lcov-posix.cjs']],
  ['Playwright E2E (contrast on demo)', 'npx', ['playwright', 'test']],
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
