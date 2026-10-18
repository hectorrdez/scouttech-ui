#!/usr/bin/env node
'use strict';
// Stamps the header of .claude/handoff.md so a different agent (possibly a different
// CLI) can resume mid-feature. The BODY below the header is written by the agent, not
// this script. Run this, then fill the sections in handoff.md before you stop.
//
// Usage: node .claude/scripts/write-handoff.cjs <reason>
//   reason: near-limit | budget | manual | blocked | error
//
// Agent identity comes from the HARNESS_AGENT env var (e.g. "claude-code", "codex",
// "antigravity"); falls back to "unknown".
const fs = require('fs');
const path = require('path');
const { CLAUDE_DIR, readHistory } = require('./_lib.cjs');

const REASONS = ['near-limit', 'budget', 'manual', 'blocked', 'error'];
const reason = process.argv[2];
if (!reason || !REASONS.includes(reason)) {
  console.log(`ERROR: usage write-handoff.cjs <reason>  (one of: ${REASONS.join(', ')})`);
  process.exit(1);
}

const HANDOFF = path.join(CLAUDE_DIR, 'handoff.md');
const START = '<!-- HANDOFF-HEADER -->';
const END = '<!-- /HANDOFF-HEADER -->';

const rows = readHistory();
const active = rows.find((r) => r.state === 'IN_PROCESS');
const feature = active ? `${active.id}_${active.slug}` : 'none';
const agent = (process.env.HARNESS_AGENT || 'unknown').trim() || 'unknown';

const header = [
  START,
  `updated: ${new Date().toISOString()}`,
  `agent: ${agent}`,
  `feature: ${feature}`,
  `reason: ${reason}`,
  END,
].join('\n');

let body;
if (fs.existsSync(HANDOFF)) {
  const text = fs.readFileSync(HANDOFF, 'utf8');
  const i = text.indexOf(END);
  body = i !== -1 ? text.slice(i + END.length) : `\n\n${text.trim()}\n`;
} else {
  body = [
    '',
    '',
    '# Handoff note — relay scratch state',
    '',
    '## What I did this leg',
    '- ',
    '',
    '## What\'s left / next concrete step',
    '- ',
    '',
    '## Commands already run (don\'t redo)',
    '- ',
    '',
    '## Landmines / gotchas found',
    '- ',
    '',
    '## Uncommitted files in the tree',
    '- ',
    '',
  ].join('\n');
}

fs.writeFileSync(HANDOFF, header + body);
console.log(`OK: handoff.md stamped (agent=${agent}, feature=${feature}, reason=${reason}).`);
console.log('Now fill the sections below the header before you stop.');
