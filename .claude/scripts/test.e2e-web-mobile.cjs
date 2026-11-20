#!/usr/bin/env node
'use strict';
const path = require('path');
const { spawnSync } = require('child_process');
const { run, checkUrl, parseEnvFile } = require('./_lib.cjs');

// ============ EDIT FOR YOUR PROJECT ============
const SUITE_CMD = 'npm';
const SUITE_ARGS = ['test'];
// AUTO_SETUP=true lets this script bring up whatever is down via setup.cjs (which YOU configure via e2e.env).
// Default false = only check and warn.
const AUTO_SETUP = false;
// ==============================================
// URLs come from the shared config (single source of truth with setup.cjs and the runner).
const WEB_URL = 'http://localhost:5173';
const APPIUM_URL = 'http://127.0.0.1:4723/status';

const cfg = parseEnvFile(path.join(__dirname, '..', 'e2e.env'));

function adbReady() {
  const res = spawnSync('adb', ['devices'], { encoding: 'utf8', shell: true });
  if (res.status !== 0) return false;
  return /\sdevice$/m.test(res.stdout || '');
}

async function checks() {
  let missing = false;
  console.log(`[check] Web app at ${cfg.WEB_URL || WEB_URL}`);
  if (!(await checkUrl(cfg.WEB_URL || WEB_URL))) {
    console.log('  DOWN: web app');
    missing = true;
  }
  console.log(`[check] Appium at ${cfg.APPIUM_URL || APPIUM_URL}`);
  if (!(await checkUrl(cfg.APPIUM_URL || APPIUM_URL))) {
    console.log('  DOWN: appium server');
    missing = true;
  }
  console.log('[check] Android device/emulator');
  if (!adbReady()) {
    console.log('  DOWN: no ready emulator/device');
    missing = true;
  }
  return !missing;
}

(async () => {
  let ready = await checks();
  if (!ready) {
    if (AUTO_SETUP) {
      console.log('Prerequisites missing. AUTO_SETUP=true -> running setup.cjs ...');
      run('node', [path.join(__dirname, 'setup.cjs'), 'all']);
      ready = await checks();
      if (!ready) {
        console.log('PRECONDITION: still not ready after setup. Aborting. NOT a regression.');
        process.exit(2);
      }
    } else {
      console.log('PRECONDITION: not everything is up (see above). Start it, or set AUTO_SETUP=true with a configured e2e.env. NOT a regression.');
      process.exit(2);
    }
  }

  console.log('Running cross-platform suite (web + mobile)...');
  if (run(SUITE_CMD, SUITE_ARGS) !== 0) {
    console.log('FAIL: e2e tests failed');
    process.exit(1);
  }

  console.log('PASS');
  process.exit(0);
})();
