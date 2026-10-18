'use strict';
// Shared helpers for the harness scripts. .cjs = always CommonJS, regardless of the
// consuming project's package.json "type" field. No external deps: fs/path/child_process/http(s)/os only.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');
const http = require('http');
const https = require('https');

const SCRIPTS_DIR = __dirname;
const CLAUDE_DIR = path.join(SCRIPTS_DIR, '..');
const REPO_ROOT = path.join(CLAUDE_DIR, '..');

function historyPath() {
  return path.join(CLAUDE_DIR, 'history.md');
}

// Parse history.md rows into {id, slug, state, role, commit, commitUrl}, skipping
// comments/blank lines/header. commit/commitUrl are '' until set-commit.cjs records one.
function readHistory() {
  const text = fs.readFileSync(historyPath(), 'utf8');
  const rows = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || line.startsWith('id|')) continue;
    const [id, slug, state, role, commit, commitUrl] = line.split('|');
    if (!id) continue;
    rows.push({ id, slug, state, role, commit: commit || '', commitUrl: commitUrl || '' });
  }
  return rows;
}

// Rewrite one row's state in place. Preserves comments/header/other rows verbatim. Returns true if found.
function writeState(id, newState) {
  const text = fs.readFileSync(historyPath(), 'utf8');
  const lines = text.split(/\r?\n/);
  let hit = false;
  const out = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('id|')) return line;
    const parts = line.split('|');
    if (parts[0] === id) {
      hit = true;
      parts[2] = newState;
      return parts.join('|');
    }
    return line;
  });
  if (hit) fs.writeFileSync(historyPath(), out.join('\n'));
  return hit;
}

// Record a commit hash (+ optional web URL) on a row's trailing columns 5/6. Pads
// older 4-column rows out to 6 columns. Preserves everything else. Returns true if found.
function writeCommit(id, hash, url) {
  const text = fs.readFileSync(historyPath(), 'utf8');
  const lines = text.split(/\r?\n/);
  let hit = false;
  const out = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('id|')) return line;
    const parts = line.split('|');
    if (parts[0] === id) {
      hit = true;
      while (parts.length < 6) parts.push('');
      parts[4] = hash;
      parts[5] = url || '';
      return parts.join('|');
    }
    return line;
  });
  if (hit) fs.writeFileSync(historyPath(), out.join('\n'));
  return hit;
}

// Run a command with inherited stdio, cwd defaults to repo root. shell:true resolves
// npm/npx/.cmd shims on Windows and plain PATH lookups on macOS/Linux. Returns exit code.
function run(cmd, args = [], opts = {}) {
  const res = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: true,
    cwd: opts.cwd || REPO_ROOT,
    env: opts.env || process.env,
  });
  if (res.error) return 1;
  return res.status === null ? 1 : res.status;
}

// GET a URL; resolves true on any response, false on error/timeout. Replaces `curl -fsS -o nul`.
function checkUrl(url, timeoutMs = 3000) {
  return new Promise((resolve) => {
    let done = false;
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, (res) => {
      res.resume();
      if (!done) {
        done = true;
        resolve(true);
      }
    });
    req.setTimeout(timeoutMs, () => {
      if (!done) {
        done = true;
        req.destroy();
        resolve(false);
      }
    });
    req.on('error', () => {
      if (!done) {
        done = true;
        resolve(false);
      }
    });
  });
}

// Parse a KEY=VALUE file (# comments, blank lines ignored). Returns {} if missing.
function parseEnvFile(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i === -1) continue;
    out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return out;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Windows gets gradlew.bat; macOS/Linux get the executable wrapper script.
function gradlew() {
  return os.platform() === 'win32' ? 'gradlew.bat' : './gradlew';
}

// Build a clickable web URL for a commit hash from the 'origin' remote, or '' if there's
// no remote / it isn't a recognized git host. Handles both SSH and HTTPS remote forms.
function commitUrl(hash) {
  const res = spawnSync('git', ['remote', 'get-url', 'origin'], { cwd: REPO_ROOT, encoding: 'utf8', shell: true });
  if (res.status !== 0) return '';
  let remote = res.stdout.trim();
  if (!remote) return '';

  let base;
  const scpMatch = remote.match(/^git@([^:]+):(.+?)(?:\.git)?$/);
  if (scpMatch) {
    base = `https://${scpMatch[1]}/${scpMatch[2]}`;
  } else {
    base = remote.replace(/\.git$/, '');
    if (!/^https?:\/\//.test(base)) return ''; // unrecognized remote form (e.g. local path)
  }

  if (/gitlab/.test(base)) return `${base}/-/commit/${hash}`;
  if (/bitbucket\.org/.test(base)) return `${base}/commits/${hash}`;
  return `${base}/commit/${hash}`; // GitHub, Gitea/Forgejo/Codeberg, and most self-hosted UIs
}

module.exports = {
  CLAUDE_DIR,
  REPO_ROOT,
  historyPath,
  readHistory,
  writeState,
  writeCommit,
  run,
  checkUrl,
  parseEnvFile,
  sleep,
  gradlew,
  commitUrl,
};
