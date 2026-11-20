#!/usr/bin/env node
'use strict';
// OPT-IN bring-up for e2e. FRAGILE BY NATURE. Platform-scoped.
// Usage: node setup.cjs [web|mobile|all]   (default: all)
// Values come from .claude/e2e.env (NOT hardcoded here).
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const { checkUrl, parseEnvFile, sleep, scopedEnv } = require('./_lib.cjs');

const platform = (process.argv[2] || 'all').toLowerCase();
const cfgPath = path.join(__dirname, '..', 'e2e.env');
const cfg = parseEnvFile(cfgPath);
if (Object.keys(cfg).length === 0) {
  console.log(`ERROR: missing config "${cfgPath}". Create it from e2e.env.example or run /init-app.`);
  process.exit(1);
}

const WAIT_SECS = Number(cfg.WAIT_SECS || 60);
const adbArgs = cfg.DEVICE_ID ? ['-s', cfg.DEVICE_ID] : [];

// Fire-and-forget background process (equivalent of `start "" /b cmd /c "..."`).
function spawnBg(cmd) {
  const child = spawn(cmd, { shell: true, detached: true, stdio: 'ignore', env: scopedEnv() });
  child.unref();
}

function adb(args) {
  return spawnSync('adb', [...adbArgs, ...args], { encoding: 'utf8', shell: true, stdio: ['ignore', 'pipe', 'inherit'] });
}

async function waitUrl(url) {
  for (let i = 0; i < WAIT_SECS; i++) {
    if (await checkUrl(url)) return true;
    await sleep(1000);
  }
  console.log(`WARN: timed out waiting for ${url}`);
  return false;
}

async function web() {
  if (!(await checkUrl(cfg.WEB_URL))) {
    console.log('Starting web...');
    spawnBg(cfg.WEB_CMD);
    await waitUrl(cfg.WEB_URL);
  }
}

async function mobile() {
  const hasDevice = /\sdevice$/m.test(adb(['devices']).stdout || '');
  if ((cfg.DEVICE_MODE || '').toLowerCase() === 'physical') {
    if (!hasDevice) {
      console.log('ERROR: no device connected over adb. Plug in / authorize the physical device, then retry.');
      process.exitCode = 2;
      return;
    }
  } else if (!hasDevice) {
    console.log(`Starting emulator ${cfg.AVD_NAME}...`);
    spawnBg(`emulator -avd ${cfg.AVD_NAME}`);
    spawnSync('adb', ['wait-for-device'], { stdio: 'inherit', shell: true });
  }
  console.log('Installing app...');
  spawnSync('adb', [...adbArgs, 'install', '-r', cfg.APK_PATH], { stdio: 'inherit', shell: true });
  if (!(await checkUrl(cfg.APPIUM_URL))) {
    console.log('Starting Appium...');
    spawnBg(cfg.APPIUM_CMD);
    await waitUrl(cfg.APPIUM_URL);
  }
}

(async () => {
  console.log(`=== setup (${platform}) ===`);
  if (platform === 'web') await web();
  else if (platform === 'mobile') await mobile();
  else if (platform === 'all') {
    await web();
    await mobile();
  } else {
    console.log(`ERROR: unknown platform "${platform}" (use web|mobile|all)`);
    process.exit(1);
  }
  console.log('=== setup done ===');
  process.exit(process.exitCode || 0);
})();
