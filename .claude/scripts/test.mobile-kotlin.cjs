#!/usr/bin/env node
'use strict';
// If your Android module root is not the repo root, pass cwd to run() below.
const { run, gradlew } = require('./_lib.cjs');

const wrapper = gradlew();

console.log('[1/2] Compile (assembleDebug)...');
// Lighter alternative if assembleDebug is too slow: compileDebugKotlin
if (run(wrapper, ['assembleDebug']) !== 0) {
  console.log('FAIL: build');
  process.exit(1);
}

console.log('[2/2] Lint...');
if (run(wrapper, ['lint']) !== 0) {
  console.log('FAIL: lint');
  process.exit(1);
}

console.log('PASS');
process.exit(0);
