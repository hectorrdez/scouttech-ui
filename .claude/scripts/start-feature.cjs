#!/usr/bin/env node
'use strict';
const { writeState } = require('./_lib.cjs');

const id = process.argv[2];
if (!id) {
  console.log('ERROR: usage start-feature.cjs <id>');
  process.exit(1);
}

const hit = writeState(id, 'IN_PROCESS');
console.log(hit ? `OK: ${id} -> IN_PROCESS` : `ERROR: id ${id} not found. No change.`);
process.exit(hit ? 0 : 1);
