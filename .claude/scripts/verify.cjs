#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = path.resolve(__dirname, '../..');
const runScript = (script) => new Promise((resolve) => {
  const child = spawn(process.execPath, [path.join(__dirname, script)], { cwd: root, stdio: 'inherit' });
  child.on('error', (error) => { console.error(`${script}: ${error.message}`); resolve(1); });
  child.on('close', (code) => resolve(code === 0 ? 0 : 1));
});

// Sweep residue left by the run (browser profiles, tmp compile caches), pass or fail: a failing
// test loop is where the most junk piles up. Best-effort; a missing cleanup.cjs is ignored.
const sweep = () => {
  const cleanup = path.join(__dirname, 'cleanup.cjs');
  if (fs.existsSync(cleanup)) require('child_process').spawnSync(process.execPath, [cleanup, '--quiet', '--tmp-only'], { cwd: root, stdio: 'inherit' });
};
const finish = (code) => { sweep(); process.exit(code); };

// Sequential: test.cjs writes coverage/lcov.info, and sonar.cjs must upload that fresh report, not a stale or missing one.
(async () => {
  if ((await runScript('test.cjs')) !== 0) finish(1);
  if (fs.existsSync(path.join(root, '.claude', 'sonar.json'))) {
    if ((await runScript('sonar.cjs')) !== 0) finish(1);
  }
  finish(0);
})();
