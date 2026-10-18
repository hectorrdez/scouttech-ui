#!/usr/bin/env node
'use strict';
const { writeState } = require('./_lib.cjs');

const [, , id, state] = process.argv;
if (!id || !state) {
  console.log('ERROR: usage set-state.cjs <id> <state>');
  process.exit(1);
}

const hit = writeState(id, state);
if (hit) {
  console.log(`OK: ${id} -> ${state}`);
  process.exit(0);
} else {
  console.log(`ERROR: id ${id} not found. No change.`);
  process.exit(1);
}
