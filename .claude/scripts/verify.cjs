#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = path.resolve(__dirname, '../..');
const commands = ['test.cjs'];
if (fs.existsSync(path.join(root, '.claude', 'sonar.json'))) commands.push('sonar.cjs');
Promise.all(commands.map((script) => new Promise((resolve) => {
  const child = spawn(process.execPath, [path.join(__dirname, script)], { cwd: root, stdio: 'inherit' });
  child.on('error', (error) => { console.error(`${script}: ${error.message}`); resolve(1); });
  child.on('close', (code) => resolve(code === 0 ? 0 : 1));
}))).then((results) => process.exit(results.every((code) => code === 0) ? 0 : 1));
