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

// Sequential: test.cjs writes coverage/lcov.info, and sonar.cjs must upload that fresh report, not a stale or missing one.
(async () => {
  if ((await runScript('test.cjs')) !== 0) process.exit(1);
  if (fs.existsSync(path.join(root, '.claude', 'sonar.json'))) {
    if ((await runScript('sonar.cjs')) !== 0) process.exit(1);
  }
  process.exit(0);
})();
