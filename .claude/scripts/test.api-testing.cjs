#!/usr/bin/env node
'use strict';
const { run, checkUrl } = require('./_lib.cjs');

// ============ EDIT FOR YOUR PROJECT ============
// Bruno collections repo (create-project `test-api`): collections/<name>/, run through npm scripts.
// Gate command: every collection in its local env (generated test:* scripts).
const TEST_COMMAND = ['run', 'test:all'];
// Optional precondition for the local env, e.g. http://localhost:3002/api/health.
// Empty = no check (pre/ci environments target deployed APIs).
const HEALTH_URL = process.env.HEALTH_URL || '';
// ==============================================

(async () => {
  if (HEALTH_URL) {
    console.log('[1/2] API under test reachable?');
    if (!(await checkUrl(HEALTH_URL))) {
      console.log(`PRECONDITION: API not reachable at ${HEALTH_URL}. Start it, then retry. This is NOT a regression.`);
      process.exit(2);
    }
  }

  // Bruno keeps running after failed requests (flow cleanups depend on it): never --bail.
  console.log(`[${HEALTH_URL ? 2 : 1}/${HEALTH_URL ? 2 : 1}] Bruno collections (npm ${TEST_COMMAND.join(' ')})...`);
  if (run('npm', TEST_COMMAND) !== 0) {
    console.log('FAIL: one or more requests failed');
    process.exit(1);
  }

  console.log('PASS');
  process.exit(0);
})();
