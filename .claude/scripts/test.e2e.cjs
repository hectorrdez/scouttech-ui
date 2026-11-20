#!/usr/bin/env node
'use strict';
const { run, checkUrl } = require('./_lib.cjs');

// ============ EDIT FOR YOUR PROJECT ============
const APP_URL = 'http://localhost:5173';
// ==============================================

(async () => {
  console.log('[1/2] App under test reachable?');
  if (!(await checkUrl(APP_URL))) {
    console.log(`PRECONDITION: app not reachable at ${APP_URL}. Start it, then retry. This is NOT a regression.`);
    process.exit(2);
  }

  console.log('[2/2] Playwright suite...');
  if (run('npx', ['playwright', 'test']) !== 0) {
    console.log('FAIL: e2e tests failed');
    process.exit(1);
  }

  console.log('PASS');
  process.exit(0);
})();
