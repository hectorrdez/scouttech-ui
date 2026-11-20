#!/usr/bin/env node
'use strict';
const { run } = require('./_lib.cjs');

const env = process.argv[2] || 'local';
console.log(`[BRUNO] Running API integration test suite (env: ${env})...`);

const code = run('npx', ['@usebruno/cli', 'run', './tests/bruno', '--env', env, '--recursive']);
if (code !== 0) {
  console.log('[ERROR] Bruno API tests failed.');
  process.exit(code);
}

console.log('[OK] All API tests passed successfully.');
process.exit(0);
