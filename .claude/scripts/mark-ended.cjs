#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const { CLAUDE_DIR, run, writeState } = require('./_lib.cjs');

const id = process.argv[2];
if (!id) {
  console.log('ERROR: usage mark-ended.cjs <id>');
  process.exit(1);
}

console.log('Running tests before allowing ENDED...');
const code = run('node', [path.join(__dirname, 'test.cjs')]);
if (code !== 0) {
  console.log(`REFUSED: tests failed. ${id} stays unchanged. Fix the code and retry.`);
  process.exit(1);
}

const hit = writeState(id, 'ENDED');
if (!hit) {
  console.log(`ERROR: id ${id} not found. No change.`);
  process.exit(1);
}
console.log(`OK: ${id} -> ENDED`);

// Feature finished cleanly: nothing is in flight, so any relay handoff note is stale.
const handoff = path.join(CLAUDE_DIR, 'handoff.md');
if (fs.existsSync(handoff)) {
  fs.rmSync(handoff);
  console.log('Cleared stale .claude/handoff.md (nothing in flight).');
}
process.exit(0);
