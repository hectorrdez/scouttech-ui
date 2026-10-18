#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const { CLAUDE_DIR, readHistory } = require('./_lib.cjs');

const rows = readHistory();

// If a relay handoff note is present, print a second line so the orchestrator reads
// .claude/handoff.md before doing anything. Parses the stamped header for context.
function printHandoff() {
  const file = path.join(CLAUDE_DIR, 'handoff.md');
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, 'utf8');
  const grab = (k) => {
    const m = text.match(new RegExp(`^${k}:\\s*(.+)$`, 'm'));
    return m ? m[1].trim() : '?';
  };
  const reason = grab('reason');
  if (reason === 'none') return; // seeded but unused
  console.log(`HANDOFF|present|reason=${reason}|agent=${grab('agent')}|updated=${grab('updated')}`);
}

const inProcess = rows.find((r) => r.state === 'IN_PROCESS');
if (inProcess) {
  console.log(`RESUME|id=${inProcess.id}|slug=${inProcess.slug}|role=${inProcess.role}`);
  printHandoff();
  process.exit(0);
}

const pending = rows.find((r) => r.state === 'PENDING');
if (pending) {
  console.log(`NEXT|id=${pending.id}|slug=${pending.slug}|role=${pending.role}`);
  printHandoff();
  process.exit(0);
}

console.log('NONE|no IN_PROCESS or PENDING features');
printHandoff();
process.exit(0);
