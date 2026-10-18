#!/usr/bin/env node
'use strict';
// Fetches remote refs and reports whether the tracked upstream branch moved.
// Output token: CHANGED|... or UNCHANGED|... (mirrors get-current.cjs's style).
// Exit code: 0 = CHANGED (true), 1 = UNCHANGED or error (false).
const { spawnSync } = require('child_process');

function git(args) {
  return spawnSync('git', args, { encoding: 'utf8', shell: true });
}

const headRes = git(['rev-parse', 'HEAD']);
if (headRes.status !== 0) {
  console.log('ERROR: not a git repository');
  process.exit(1);
}
const local = headRes.stdout.trim();

const upstreamCheck = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
if (upstreamCheck.status !== 0) {
  console.log('ERROR: no upstream branch configured for current branch');
  process.exit(1);
}

const fetchRes = git(['fetch', '--prune']);
if (fetchRes.status !== 0) {
  console.log('ERROR: git fetch failed');
  process.exit(1);
}

const remoteRes = git(['rev-parse', '@{u}']);
if (remoteRes.status !== 0) {
  console.log('ERROR: could not resolve upstream ref');
  process.exit(1);
}
const remote = remoteRes.stdout.trim();

if (local === remote) {
  console.log(`UNCHANGED|local=${local.slice(0, 7)}`);
  process.exit(1);
} else {
  const behindRes = git(['rev-list', '--count', 'HEAD..@{u}']);
  const behind = behindRes.status === 0 ? behindRes.stdout.trim() : '?';
  console.log(`CHANGED|local=${local.slice(0, 7)}|remote=${remote.slice(0, 7)}|behind=${behind}`);
  process.exit(0);
}
