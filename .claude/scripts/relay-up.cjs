#!/usr/bin/env node
'use strict';
// Idempotent: ensure the relay supervisor is running, if relay is enabled.
// Called from CLAUDE.md's flow (step 1b). Safe to run every session.
//
// Exit 0 in all normal cases (disabled, already up, just started). Exit 1 only when
// relay IS enabled but the config is unusable — the flow should surface that.
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { REPO_ROOT } = require('./_lib.cjs');
const { loadConfig, validateConfig, supervisorAlive, LOG_FILE, resolveLauncher } = require('./relay-lib.cjs');

const cfg = loadConfig();

if (cfg._missing) { console.log('RELAY: no relay.json — relay not configured, continuing normally.'); process.exit(0); }
if (!cfg.enabled) { console.log('RELAY: disabled in relay.json — continuing normally.'); process.exit(0); }

const errs = validateConfig(cfg);
if (errs.length) {
  console.log('RELAY: enabled but config is unusable:');
  errs.forEach((e) => console.log(`  - ${e}`));
  console.log('Fix .claude/relay.json (or set "enabled": false) before relying on the relay.');
  process.exit(1);
}

const alive = supervisorAlive();
if (alive) {
  console.log(`RELAY: supervisor already running (pid ${alive}). Rotation: ${cfg.rotation.join(' -> ')}.`);
  process.exit(0);
}

const out = fs.openSync(LOG_FILE, 'a');
const child = spawn('node', [path.join(__dirname, 'relay-supervisor.cjs'), 'start'], {
  cwd: REPO_ROOT,
  detached: true,
  stdio: ['ignore', out, out],
});
child.unref();

console.log(`RELAY: supervisor started (pid ${child.pid}, launcher=${resolveLauncher(cfg.launcher)}).`);
console.log(`Rotation: ${cfg.rotation.join(' -> ')}. Log: .claude/relay.log`);
console.log('When you near your context/token limit: run write-handoff.cjs near-limit, fill the note, stop — the next agent takes over.');
process.exit(0);
