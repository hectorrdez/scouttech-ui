#!/usr/bin/env node
'use strict';
// Records a feature's commit hash (+ web URL, if 'origin' resolves to a known git host)
// into history.md, columns 5/6. status.html reads these to link each feature to its commit.
const { writeCommit, commitUrl } = require('./_lib.cjs');

const [, , id, hash] = process.argv;
if (!id || !hash) {
  console.log('ERROR: usage set-commit.cjs <id> <hash>');
  process.exit(1);
}

const url = commitUrl(hash);
const hit = writeCommit(id, hash, url);
if (hit) {
  console.log(`OK: ${id} -> commit ${hash}${url ? ` (${url})` : ' (no remote URL resolved)'}`);
  process.exit(0);
} else {
  console.log(`ERROR: id ${id} not found. No change.`);
  process.exit(1);
}
