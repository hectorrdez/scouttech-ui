#!/usr/bin/env node
'use strict';
const fs = require('fs');
const { run, checkUrl } = require('./_lib.cjs');

// API_PORT from the project .env (create-project API scaffold default: 3002).
function envPort() {
  try {
    const m = fs.readFileSync('.env', 'utf8').match(/^\s*API_PORT\s*=\s*"?(\d+)"?/m);
    if (m) return m[1];
  } catch {}
  return '3002';
}

// ============ EDIT FOR YOUR PROJECT ============
// Override with HEALTH_URL=... ; default matches the create-project API scaffold.
const HEALTH_URL = process.env.HEALTH_URL || `http://localhost:${envPort()}/api/health`;
const BRUNO_DIR = 'tests/bruno';
const BRUNO_ENV = 'local';
// ==============================================

(async () => {
  console.log('[1/3] Typecheck (tsc --noEmit)...');
  if (run('npx', ['tsc', '--noEmit']) !== 0) {
    console.log('FAIL: typecheck');
    process.exit(1);
  }

  console.log('[2/3] API reachable?');
  if (!(await checkUrl(HEALTH_URL))) {
    console.log(`PRECONDITION: API not reachable at ${HEALTH_URL}. Start the server, then retry. This is NOT a regression.`);
    process.exit(2);
  }

  console.log('[3/3] Bruno collection (regression)...');
  if (run('npx', ['@usebruno/cli', 'run', BRUNO_DIR, '--env', BRUNO_ENV, '--recursive']) !== 0) {
    console.log('FAIL: one or more requests failed');
    process.exit(1);
  }

  console.log('PASS');
  process.exit(0);
})();
