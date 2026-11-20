#!/usr/bin/env node
'use strict';
// Removes residue that harness runs leave behind, so it does not pile up.
//   node .claude/scripts/cleanup.cjs [--all] [--dry] [--quiet] [--tmp-only] [--system-tmp]
//
// OWNERSHIP RULE: automatic runs delete ONLY what the harness itself created:
//   - .claude/tmp/ : private temp dir every harness-launched command uses (see _lib.cjs run()/scopedEnv()),
//     so browser profiles and compile caches of tests land here, not in the shared OS temp.
//   - git-ignored repo output: test-results/, playwright-report/, .ts-node/, ...
//   The shared OS temp (%TEMP%) is NEVER touched unless you pass --system-tmp (manual one-off sweep).
//
// Runs automatically (--quiet, age-based, --tmp-only except at ENDED) from start-feature, verify (every
// test run, pass or fail), mark-ended and write-handoff.
// Default: only items older than MAX_AGE_MIN (a process running now keeps its files).
// --all        : ignore age (use after you stopped every dev server you started).
// --dry        : list what would go, delete nothing.
// --quiet      : one summary line only if something was removed.
// --tmp-only   : keep repo reports (test-results, playwright-report): a failed run's traces are evidence.
// --system-tmp : ALSO sweep the shared OS temp for known tool residue (ts-node, Playwright profiles).
//                Manual only: it cannot tell your other apps' files from harness ones.
// Always exits 0: cleanup must never block the flow.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { REPO_ROOT, TMP_DIR } = require('./_lib.cjs');

const MAX_AGE_MIN = 30;
const has = (f) => process.argv.includes(f);
const all = has('--all');
const dry = has('--dry');
const quiet = has('--quiet');
const tmpOnly = has('--tmp-only');
const systemTmp = has('--system-tmp');

// Known tool residue in the OS temp (only with --system-tmp).
const SYSTEM_PATTERNS = [/^\.ts-node/, /^ts-node-dev-/, /^playwright_chromiumdev_profile-/, /^playwright-artifacts-/, /^playwright-transform-cache/];
// Repo-local generated output. Removed ONLY when git ignores it (never touches tracked/user files).
const LOCAL_CANDIDATES = ['.ts-node', 'test-results', 'playwright-report', 'blob-report', '.scannerwork'];

let freed = 0;
let removed = 0;

function sizeOf(p) {
  try {
    const st = fs.lstatSync(p);
    if (!st.isDirectory()) return st.size;
    let total = 0;
    for (const e of fs.readdirSync(p)) total += sizeOf(path.join(p, e));
    return total;
  } catch {
    return 0;
  }
}

function drop(p, why) {
  const size = sizeOf(p);
  if (!dry) {
    try {
      fs.rmSync(p, { recursive: true, force: true });
    } catch (e) {
      if (!quiet) console.log(`SKIP ${p}: ${e.code || e.message}`);
      return;
    }
  }
  freed += size;
  removed += 1;
  if (!quiet) console.log(`${dry ? 'WOULD REMOVE' : 'REMOVED'} ${p} (${why})`);
}

const now = Date.now();
function sweepDir(dir, patterns, label) {
  let names;
  try { names = fs.readdirSync(dir); } catch { return; }
  for (const name of names) {
    if (patterns && !patterns.some((re) => re.test(name))) continue;
    const full = path.join(dir, name);
    let age;
    try { age = (now - fs.statSync(full).mtimeMs) / 60000; } catch { continue; }
    if (all || age >= MAX_AGE_MIN) drop(full, all ? label : `${label}, ${Math.round(age)} min old`);
  }
}

// 1. Harness-owned private temp (everything inside belongs to us).
sweepDir(TMP_DIR, null, 'harness tmp');

// 2. Shared OS temp: only on explicit request.
if (systemTmp) sweepDir(os.tmpdir(), SYSTEM_PATTERNS, 'system tmp');

// 3. Repo-local generated output, only if git-ignored.
function gitIgnored(rel) {
  return spawnSync('git', ['check-ignore', '-q', rel], { cwd: REPO_ROOT }).status === 0;
}
for (const rel of tmpOnly ? [] : LOCAL_CANDIDATES) {
  const full = path.join(REPO_ROOT, rel);
  if (!fs.existsSync(full)) continue;
  if (!gitIgnored(rel + (fs.statSync(full).isDirectory() ? '/' : ''))) {
    if (!quiet) console.log(`KEEP ${rel} (not git-ignored: may be tracked or user-owned)`);
    continue;
  }
  drop(full, 'repo-local, git-ignored');
}

// 4. Dangling worktree metadata (a worktree dir deleted by hand leaves a stale entry).
if (!dry) spawnSync('git', ['worktree', 'prune'], { cwd: REPO_ROOT });

if (!quiet || removed > 0) console.log(`cleanup: ${removed} item(s), ${(freed / 1048576).toFixed(1)} MB ${dry ? 'would be ' : ''}freed`);
process.exit(0);
