#!/usr/bin/env node
'use strict';
// SessionStart hook: after `/clear` (or a fresh start) print what the new conversation
// needs to continue the backlog without the user re-explaining anything.
// Stdout of a SessionStart hook is added to the model's context.
//
// Wired in .claude/settings.json. Output stays short on purpose (context budget).
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { CLAUDE_DIR } = require('./_lib.cjs');

const run = (script) => {
  try {
    return execFileSync(process.execPath, [path.join(__dirname, script)], {
      encoding: 'utf8',
      cwd: path.dirname(CLAUDE_DIR),
    }).trim();
  } catch (e) {
    return `(${script} failed: ${String(e.message).split('\n')[0]})`;
  }
};

const lines = [];
lines.push('## Harness resume (auto, SessionStart)');
lines.push(`get-current: ${run('get-current.cjs').replace(/\n/g, ' / ')}`);

const handoff = path.join(CLAUDE_DIR, 'handoff.md');
if (fs.existsSync(handoff)) {
  const text = fs.readFileSync(handoff, 'utf8');
  const reason = (text.match(/^reason:\s*(.+)$/m) || [])[1];
  if (reason && reason.trim() !== 'none') {
    lines.push('', 'Handoff note (.claude/handoff.md):', text.replace(/<!--[\s\S]*?-->/g, '').trim());
  }
}

lines.push(
  '',
  'If the user says "continúa"/"continue": follow CLAUDE.md Flow from step 3 (check-remote, get-current, read the feature + notes.md), delete nothing by hand, and respect the Context budget rule (~200k tokens: hand over with write-handoff.cjs near-limit and ask the user to /clear; never open other terminals or claude processes).',
);

console.log(lines.join('\n'));
