'use strict';
// Helpers for the cross-CLI agent relay. Dependency-free (fs/path/os/child_process).
// .cjs = always CommonJS. Loaded by relay-up.cjs / relay-supervisor.cjs / relay-config.cjs.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync, spawn } = require('child_process');
const { CLAUDE_DIR, REPO_ROOT } = require('./_lib.cjs');

const RELAY_JSON = path.join(CLAUDE_DIR, 'relay.json');
const PID_FILE = path.join(CLAUDE_DIR, 'relay.pid');
const STATE_FILE = path.join(CLAUDE_DIR, 'relay.state');
const LOG_FILE = path.join(CLAUDE_DIR, 'relay.log');
const PROMPT_FILE = path.join(CLAUDE_DIR, 'relay.prompt.txt');

const DEFAULTS = {
  enabled: false,
  autostart: false,
  launcher: 'auto',
  poll_seconds: 30,
  budget_minutes: 40,
  on_all_exhausted: 'wait', // 'wait' = sleep reset_wait_minutes then retry; 'stop' = halt + alert
  reset_wait_minutes: 60,
  mode: 'cloud',            // cloud | local | hybrid (documentation/interview hint; behaviour is driven by per-agent `backend`)
  rotation: [],
  agents: {},               // name -> { cmd, fresh:[...], backend?, model?, env?:{} }
  backends: {},             // name -> { kind: lmstudio|ollama|openai-endpoint, url, ... }
  route: {},                // phase -> { chain:[agentName,...], fallback_on?: 'test-fail' }  (phase: planning|implementation|bugfix)
  fallback: {},             // { cloud_exhausted?, local_unstable?:{after_failures,action}, free_vram_on_leave_local? }
};

const BACKEND_KINDS = ['lmstudio', 'ollama', 'openai-endpoint'];
const PHASES = ['planning', 'implementation', 'bugfix'];

function loadConfig() {
  if (!fs.existsSync(RELAY_JSON)) return { ...DEFAULTS, _missing: true };
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(RELAY_JSON, 'utf8'));
  } catch (e) {
    return { ...DEFAULTS, _invalid: `relay.json is not valid JSON: ${e.message}` };
  }
  return { ...DEFAULTS, ...raw };
}

// Returns an array of human-readable problems; empty array = usable.
function validateConfig(cfg) {
  const errs = [];
  if (cfg._invalid) return [cfg._invalid];
  if (cfg._missing) return ['relay.json not found'];
  if (typeof cfg.enabled !== 'boolean') errs.push('enabled must be true/false');
  if (!Array.isArray(cfg.rotation) || cfg.rotation.length === 0) {
    errs.push('rotation must be a non-empty array of agent names');
  }
  if (!cfg.agents || typeof cfg.agents !== 'object') errs.push('agents must be an object');
  for (const name of cfg.rotation || []) {
    const a = cfg.agents && cfg.agents[name];
    if (!a) { errs.push(`rotation names "${name}" but agents.${name} is missing`); continue; }
    if (!a.cmd || typeof a.cmd !== 'string') errs.push(`agents.${name}.cmd missing`);
    if (!Array.isArray(a.fresh)) errs.push(`agents.${name}.fresh must be an array`);
    if (Array.isArray(a.fresh) && !a.fresh.some((s) => String(s).includes('{prompt}'))) {
      errs.push(`agents.${name}.fresh must contain a "{prompt}" placeholder`);
    }
  }
  if (cfg.rotation && cfg.agents) {
    for (const name of cfg.rotation) {
      const a = cfg.agents[name];
      if (a && a.cmd && !which(a.cmd)) errs.push(`agents.${name}.cmd "${a.cmd}" not found on PATH`);
    }
  }
  const posInts = ['poll_seconds', 'budget_minutes', 'reset_wait_minutes'];
  for (const k of posInts) if (!(Number.isFinite(cfg[k]) && cfg[k] > 0)) errs.push(`${k} must be a positive number`);
  if (!['wait', 'stop'].includes(cfg.on_all_exhausted)) errs.push('on_all_exhausted must be "wait" or "stop"');
  if (!['cloud', 'local', 'hybrid'].includes(cfg.mode)) errs.push('mode must be cloud | local | hybrid');

  // backends
  for (const [bn, be] of Object.entries(cfg.backends || {})) {
    if (!BACKEND_KINDS.includes(be.kind)) errs.push(`backends.${bn}.kind must be one of ${BACKEND_KINDS.join(' | ')}`);
    if (!be.url || !/^https?:\/\//.test(be.url)) errs.push(`backends.${bn}.url must be an http(s) URL`);
    if ((be.kind === 'lmstudio' || be.kind === 'ollama')) {
      const bin = (be.server_start && be.server_start[0]) || (be.kind === 'lmstudio' ? 'lms' : 'ollama');
      if (!which(bin)) errs.push(`backends.${bn}: "${bin}" not found on PATH (needed to manage this backend)`);
    }
  }
  // per-agent backend/model/env
  for (const [an, a] of Object.entries(cfg.agents || {})) {
    if (a.backend && a.backend !== 'cloud' && !(cfg.backends && cfg.backends[a.backend])) {
      errs.push(`agents.${an}.backend "${a.backend}" is not defined in backends (use "cloud" for native-auth CLIs)`);
    }
    if (a.env && typeof a.env !== 'object') errs.push(`agents.${an}.env must be an object of VAR:value`);
    const be = a.backend && cfg.backends && cfg.backends[a.backend];
    if (be && (be.kind === 'lmstudio' || be.kind === 'ollama') && !a.model) {
      errs.push(`agents.${an} uses managed backend "${a.backend}" but has no "model"`);
    }
  }
  // route
  for (const [ph, r] of Object.entries(cfg.route || {})) {
    if (!PHASES.includes(ph)) errs.push(`route has unknown phase "${ph}" (use ${PHASES.join(' | ')})`);
    if (!r || !Array.isArray(r.chain) || r.chain.length === 0) { errs.push(`route.${ph}.chain must be a non-empty array`); continue; }
    for (const an of r.chain) if (!(cfg.agents && cfg.agents[an])) errs.push(`route.${ph}.chain names "${an}" but agents.${an} is missing`);
    if (r.fallback_on && r.fallback_on !== 'test-fail') errs.push(`route.${ph}.fallback_on must be "test-fail" if set`);
  }
  // fallback
  const fb = cfg.fallback || {};
  if (fb.cloud_exhausted && !['advance-to-local', 'wait', 'stop'].includes(fb.cloud_exhausted)) {
    errs.push('fallback.cloud_exhausted must be advance-to-local | wait | stop');
  }
  if (fb.local_unstable) {
    if (!(Number.isFinite(fb.local_unstable.after_failures) && fb.local_unstable.after_failures > 0)) {
      errs.push('fallback.local_unstable.after_failures must be a positive number');
    }
    if (!['advance-to-cloud', 'stop'].includes(fb.local_unstable.action)) {
      errs.push('fallback.local_unstable.action must be advance-to-cloud | stop');
    }
  }
  return errs;
}

// Merge base process env with an agent's `env` overrides for its launch.
function agentEnv(cfg, agentName) {
  const a = (cfg.agents || {})[agentName] || {};
  return { ...process.env, HARNESS_AGENT: agentName, ...(a.env || {}) };
}

// Is this agent a cloud agent (native auth, no local backend to manage)?
function isCloudAgent(cfg, agentName) {
  const a = (cfg.agents || {})[agentName] || {};
  return !a.backend || a.backend === 'cloud';
}

// Ordered agent list to try for a feature phase: route.<phase>.chain, else `rotation`.
function phaseChain(cfg, phase) {
  const r = (cfg.route || {})[phase];
  if (r && Array.isArray(r.chain) && r.chain.length) return r.chain.slice();
  return (cfg.rotation || []).slice();
}

function which(cmd) {
  const probe = os.platform() === 'win32'
    ? spawnSync('where', [cmd], { encoding: 'utf8' })
    : spawnSync('/bin/sh', ['-c', `command -v ${JSON.stringify(cmd)}`], { encoding: 'utf8' });
  return probe.status === 0 && probe.stdout.trim().length > 0;
}

// Resolve 'auto' to a concrete launcher id based on OS / environment.
function resolveLauncher(pref) {
  if (pref && pref !== 'auto') return pref;
  if (process.env.TMUX) return 'tmux';
  const plat = os.platform();
  if (plat === 'win32') return which('wt') ? 'wt' : 'win-console';
  if (plat === 'darwin') return process.env.TERM_PROGRAM === 'iTerm.app' ? 'iterm' : 'apple-terminal';
  for (const t of ['gnome-terminal', 'konsole', 'xfce4-terminal', 'xterm']) if (which(t)) return t;
  return 'headless';
}

// Write a launch wrapper that sets the agent's env OVERRIDES (not the whole inherited
// environment — that passes through automatically), cd's into the repo, and runs the
// agent command. `envOverrides` = { VAR: value, ... }, typically HARNESS_AGENT plus the
// agent's `env` block. Returns { path, run } — how to invoke the wrapper (argv).
function writeLaunchWrapper(agentName, cmd, args, cwd, envOverrides) {
  const safe = String(agentName).replace(/[^A-Za-z0-9._-]/g, '_');
  if (os.platform() === 'win32') {
    const q = (s) => (/[\s"]/.test(s) ? `"${String(s).replace(/"/g, '""')}"` : s);
    const p = path.join(CLAUDE_DIR, `relay.launch.${safe}.cmd`);
    const lines = ['@echo off', `cd /d "${cwd}"`];
    for (const [k, v] of Object.entries(envOverrides || {})) lines.push(`set "${k}=${String(v).replace(/%/g, '%%')}"`);
    lines.push(`${q(cmd)} ${args.map(q).join(' ')}`);
    fs.writeFileSync(p, lines.join('\r\n') + '\r\n');
    return { path: p, run: ['cmd', '/c', p] };
  }
  const p = path.join(CLAUDE_DIR, `relay.launch.${safe}.sh`);
  const lines = ['#!/bin/sh', `cd ${sh(cwd)} || exit 1`];
  for (const [k, v] of Object.entries(envOverrides || {})) lines.push(`export ${k}=${sh(String(v))}`);
  lines.push(`exec ${[cmd, ...args].map(sh).join(' ')}`);
  fs.writeFileSync(p, lines.join('\n') + '\n', { mode: 0o755 });
  return { path: p, run: ['sh', p] };
}

// Open a new terminal (or headless process) running the launch wrapper at `wrapper`.
// `wrapper` is { path, run } from writeLaunchWrapper. Returns { ok, detail }.
function launchAgent(launcher, title, wrapper, cwd) {
  const L = resolveLauncher(launcher);
  const [rc, ...ra] = wrapper.run; // e.g. ['cmd','/c',path]  or  ['sh',path]
  try {
    if (L === 'tmux') {
      spawnSync('tmux', ['new-window', '-n', title, '-c', cwd, wrapper.run.join(' ')], { stdio: 'ignore' });
    } else if (L === 'wt') {
      spawnSync('wt', ['-w', '0', 'nt', '--title', title, '-d', cwd, ...wrapper.run], { stdio: 'ignore' });
    } else if (L === 'win-console') {
      spawnSync('cmd', ['/c', 'start', `"${title}"`, ...wrapper.run], { stdio: 'ignore' });
    } else if (L === 'iterm') {
      spawnSync('osascript', ['-e', `tell application "iTerm" to create window with default profile command ${sh(wrapper.run.join(' '))}`], { stdio: 'ignore' });
    } else if (L === 'apple-terminal') {
      spawnSync('osascript', ['-e', `tell application "Terminal" to do script ${sh(wrapper.run.join(' '))}`], { stdio: 'ignore' });
    } else if (L === 'gnome-terminal') {
      spawnSync('gnome-terminal', [`--title=${title}`, `--working-directory=${cwd}`, '--', ...wrapper.run], { stdio: 'ignore' });
    } else if (L === 'konsole') {
      spawnSync('konsole', ['--new-tab', '-p', `tabtitle=${title}`, '--workdir', cwd, '-e', ...wrapper.run], { stdio: 'ignore' });
    } else if (L === 'xfce4-terminal') {
      spawnSync('xfce4-terminal', [`--title=${title}`, `--working-directory=${cwd}`, '-x', ...wrapper.run], { stdio: 'ignore' });
    } else if (L === 'xterm') {
      spawnSync('xterm', ['-T', title, '-e', ...wrapper.run], { stdio: 'ignore' });
    } else { // headless
      const out = fs.openSync(LOG_FILE, 'a');
      const child = spawn(rc, ra, { cwd, detached: true, stdio: ['ignore', out, out] });
      child.unref();
      return { ok: true, detail: `headless pid ${child.pid} (output -> relay.log)` };
    }
    return { ok: true, detail: `launcher=${L}` };
  } catch (e) {
    return { ok: false, detail: `launcher=${L} failed: ${e.message}` };
  }
}

function sh(s) { return `'${String(s).replace(/'/g, `'\\''`)}'`; }

function readState() {
  if (!fs.existsSync(STATE_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch { return {}; }
}
function writeState(s) { fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2)); }

function log(msg) {
  const line = `${new Date().toISOString()} ${msg}\n`;
  fs.appendFileSync(LOG_FILE, line);
}

function supervisorAlive() {
  if (!fs.existsSync(PID_FILE)) return 0;
  const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8').trim(), 10);
  if (!pid) return 0;
  try { process.kill(pid, 0); return pid; } catch { return 0; }
}

// Parse `key: value` lines out of handoff.md's stamped header.
function readHandoffHeader() {
  const f = path.join(CLAUDE_DIR, 'handoff.md');
  if (!fs.existsSync(f)) return null;
  const text = fs.readFileSync(f, 'utf8');
  const grab = (k) => {
    const m = text.match(new RegExp(`^${k}:\\s*(.+)$`, 'm'));
    return m ? m[1].trim() : '';
  };
  return { updated: grab('updated'), agent: grab('agent'), feature: grab('feature'), reason: grab('reason') };
}

function git(args) {
  return spawnSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8' });
}

module.exports = {
  RELAY_JSON, PID_FILE, STATE_FILE, LOG_FILE, PROMPT_FILE, DEFAULTS, BACKEND_KINDS, PHASES,
  loadConfig, validateConfig, which, resolveLauncher, launchAgent, writeLaunchWrapper,
  readState, writeState, log, supervisorAlive, readHandoffHeader, git,
  agentEnv, isCloudAgent, phaseChain,
};
