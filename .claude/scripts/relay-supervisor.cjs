#!/usr/bin/env node
'use strict';
// Cross-CLI agent relay supervisor. A detached process that watches the harness and,
// when the working agent stops mid-feature, launches another agent to resume from
// .claude/handoff.md — following per-phase `route` chains and cloud<->local fallback.
//
//   node .claude/scripts/relay-supervisor.cjs start        -> run the loop (writes relay.pid)
//   node .claude/scripts/relay-supervisor.cjs status       -> is it alive? + state + log tail
//   node .claude/scripts/relay-supervisor.cjs stop         -> terminate it
//   node .claude/scripts/relay-supervisor.cjs tick --dry   -> run ONE decision, launch nothing
//
// Normally started by `relay-up.cjs` from CLAUDE.md's flow, not by hand.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { REPO_ROOT, CLAUDE_DIR } = require('./_lib.cjs');
const {
  PID_FILE, STATE_FILE, LOG_FILE, PROMPT_FILE,
  loadConfig, validateConfig, launchAgent, writeLaunchWrapper,
  readState, writeState, log, supervisorAlive, readHandoffHeader, git,
  isCloudAgent, phaseChain,
} = require('./relay-lib.cjs');

const GET_CURRENT = path.join(__dirname, 'get-current.cjs');
const WRITE_HANDOFF = path.join(__dirname, 'write-handoff.cjs');
const RELAY_BACKEND = path.join(__dirname, 'relay-backend.cjs');
const STOP_REASONS = ['near-limit', 'blocked', 'budget', 'error'];
const QUOTA_RE = /quota|rate.?limit|usage limit|429|insufficient|out of (?:tokens|credit)/i;

function getCurrent() {
  const res = spawnSync('node', [GET_CURRENT], { cwd: REPO_ROOT, encoding: 'utf8' });
  return (res.stdout || '').split(/\r?\n/)[0].trim(); // "RESUME|id=..|slug=.." | "NEXT|.." | "NONE|.."
}
function parseFeature(line) {
  const id = (line.match(/id=([^|]+)/) || [])[1];
  const slug = (line.match(/slug=([^|]+)/) || [])[1];
  return id ? { id, slug } : null;
}
function headCommit() {
  const r = git(['rev-parse', 'HEAD']);
  return r.status === 0 ? r.stdout.trim() : '';
}
function detectPhase(feat) {
  if (!feat) return 'implementation';
  try {
    const f = fs.readFileSync(path.join(CLAUDE_DIR, 'features', `${feat.id}_${feat.slug}.md`), 'utf8');
    const m = f.match(/^type:\s*(\w+)/m);
    if (m && m[1] === 'change') return 'bugfix';
  } catch {}
  return 'implementation';
}
function handoffBodyMentionsQuota() {
  try { return QUOTA_RE.test(fs.readFileSync(path.join(CLAUDE_DIR, 'handoff.md'), 'utf8')); } catch { return false; }
}
function logTailMentionsQuota() {
  try {
    const t = fs.readFileSync(LOG_FILE, 'utf8').split(/\r?\n/).slice(-40).join('\n');
    return QUOTA_RE.test(t);
  } catch { return false; }
}
// Walk the chain from startPos, returning {name, pos} for the first agent that passes
// the cloud/local filters, or null if none in one full lap.
function pickFromChain(cfg, chain, startPos, { skipCloud, skipLocal }) {
  for (let k = 0; k < chain.length; k++) {
    const pos = startPos + k;
    const name = chain[pos % chain.length];
    if (!cfg.agents[name]) continue;
    if (skipCloud && isCloudAgent(cfg, name)) continue;
    if (skipLocal && !isCloudAgent(cfg, name)) continue;
    return { name, pos };
  }
  return null;
}

function writePrompt(agentName, leg) {
  fs.writeFileSync(PROMPT_FILE, [
    `You are being run as harness relay agent "${agentName}" (leg ${leg}).`,
    '',
    `1. HARNESS_AGENT=${agentName} is already set for this shell — keep it set.`,
    '2. Open .claude/CLAUDE.md and follow its flow from step 1',
    '   (relay-up -> check-remote -> get-current -> read the feature + handoff -> implement).',
    '3. get-current reports an IN_PROCESS feature and a HANDOFF line. Read',
    '   .claude/handoff.md FIRST — the previous agent\'s note (what it did, next step,',
    '   commands already run, landmines, uncommitted files). Continue that feature;',
    '   do NOT restart it or re-run setup it already did.',
    '4. Approaching your OWN context / token / usage limit, before you run out:',
    '     node .claude/scripts/write-handoff.cjs near-limit   (or: blocked, if you cannot do it)',
    '   fill every section of .claude/handoff.md, then stop. If you stopped because of a',
    '   quota / rate-limit / usage cap, say so in the note — it triggers cloud->local fallback.',
    '5. Finished the feature? Run the normal mark-ended + commit steps; the supervisor',
    '   picks up the next PENDING feature on its next poll.',
    '',
  ].join('\n'));
}

// One decision cycle. Returns 'DONE' | 'IDLE' | 'SLEEP_RESET'.
function tick(dry) {
  const cfg = loadConfig();
  const errs = validateConfig(cfg);
  if (errs.length) { log(`config invalid, idling: ${errs[0]}`); return 'IDLE'; }
  if (!cfg.enabled) { log('relay disabled in config, stopping'); return 'DONE'; }

  const cur = getCurrent();
  if (cur.startsWith('NONE')) { log('backlog complete (get-current: NONE) — stopping'); return 'DONE'; }
  const feat = parseFeature(cur);

  const hh = readHandoffHeader();
  const head = headCommit();
  const st = readState();
  st.leg = st.leg || 0;

  // --- is a relay needed right now? ---
  let trigger = null;
  let reasonWord = '';
  if (hh && STOP_REASONS.includes(hh.reason) && hh.updated !== st.handled_updated) {
    trigger = `handoff:${hh.reason}`;
    reasonWord = hh.reason;
  } else if (st.launched_at) {
    const ageMin = (Date.now() - st.launched_at) / 60000;
    const progressed = head !== st.commit_at_launch || (hh && hh.updated !== st.handled_updated);
    if (ageMin >= cfg.budget_minutes && !progressed) {
      trigger = `budget-timeout(${Math.round(ageMin)}m, no progress)`;
      reasonWord = 'budget';
      if (!dry) spawnSync('node', [WRITE_HANDOFF, 'error'], { cwd: REPO_ROOT });
    }
  }
  if (!trigger) return 'IDLE';

  // --- global loop guard: relay legs since the last commit moved ---
  if (head !== st.cycle_start_commit) { st.cycle_start_commit = head; st.cycle_legs = 0; }
  st.cycle_legs = (st.cycle_legs || 0) + 1;
  const longestChain = Math.max(0, ...Object.values(cfg.route || {}).map((r) => (r.chain || []).length));
  const maxLegs = Math.max(cfg.rotation.length, longestChain, 2) + 2;
  if (st.cycle_legs > maxLegs) {
    if (cfg.on_all_exhausted === 'wait') {
      log(`no commit in ${st.cycle_legs} relay legs — on_all_exhausted=wait, sleeping ${cfg.reset_wait_minutes}m`);
      st.cycle_legs = 0; writeState(st); return 'SLEEP_RESET';
    }
    log('no commit across a full rotation — on_all_exhausted=stop, halting. Check handoff.md + relay.log.');
    return 'DONE';
  }

  // --- per-feature routing state ---
  if (!st.feature || st.feature.id !== (feat && feat.id)) {
    st.feature = { id: feat && feat.id, phase: detectPhase(feat), pos: 0, localFails: 0 };
    st.current_agent = null; // previous feature's agent is irrelevant to this feature's chain
    log(`feature ${st.feature.id}: phase=${st.feature.phase}`);
  }
  const chain = phaseChain(cfg, st.feature.phase);
  const prevAgent = st.current_agent;
  const fb = cfg.fallback || {};

  // classify this stop
  const capabilityFail = reasonWord === 'blocked' || reasonWord === 'error' || reasonWord === 'budget';
  if (capabilityFail && prevAgent && !isCloudAgent(cfg, prevAgent)) st.feature.localFails += 1;
  if (reasonWord === 'blocked' && (handoffBodyMentionsQuota() || logTailMentionsQuota())) {
    if (!st.cloudExhausted) log('cloud quota / rate-limit detected — preferring local agents');
    st.cloudExhausted = true;
  }

  // advance past the agent that just stopped — but only if the supervisor launched it.
  // On the first relay for a feature the human started some agent; begin at chain[0].
  if (prevAgent) st.feature.pos += 1;

  const skipLocal = !!(fb.local_unstable && st.feature.localFails >= fb.local_unstable.after_failures);
  const skipCloud = !!(st.cloudExhausted && fb.cloud_exhausted === 'advance-to-local');
  if (skipLocal && fb.local_unstable.action === 'stop') {
    log(`local agent failed ${st.feature.localFails}x on feature ${st.feature.id} and local_unstable.action=stop — halting.`);
    return 'DONE';
  }

  let cand = pickFromChain(cfg, chain, st.feature.pos, { skipCloud, skipLocal });
  if (!cand) cand = pickFromChain(cfg, cfg.rotation, st.leg + 1, { skipCloud, skipLocal });
  if (!cand) {
    if (cfg.on_all_exhausted === 'wait') { log('no eligible agent (all filtered) — sleeping for reset'); st.cycle_legs = 0; writeState(st); return 'SLEEP_RESET'; }
    log('no eligible agent and on_all_exhausted=stop — halting.'); return 'DONE';
  }
  st.feature.pos = cand.pos;
  const agentName = cand.name;
  const agent = cfg.agents[agentName];
  const local = !isCloudAgent(cfg, agentName);

  if (dry) {
    const line = `DRY relay -> ${agentName} (phase=${st.feature.phase}, localFails=${st.feature.localFails}, skipCloud=${skipCloud}, skipLocal=${skipLocal}) trigger=${trigger}`;
    log(line); console.log(line); return 'IDLE';
  }

  // --- backend management ---
  if (local) {
    const be = agent.backend, model = agent.model;
    const r = spawnSync('node', [RELAY_BACKEND, 'up', be, model || ''], { cwd: REPO_ROOT, encoding: 'utf8' });
    if (r.status !== 0) {
      log(`backend "${be}" up FAILED for ${agentName}: ${(r.stdout || r.stderr || '').trim().split('\n').pop()}`);
      st.feature.localFails += 1;
      writeState(st);
      return 'IDLE'; // next tick advances the chain again
    }
    log(`backend "${be}" ready (${model})`);
  } else if (fb.free_vram_on_leave_local && prevAgent && !isCloudAgent(cfg, prevAgent)) {
    const prevBe = cfg.agents[prevAgent] && cfg.agents[prevAgent].backend;
    if (prevBe) { spawnSync('node', [RELAY_BACKEND, 'down', prevBe], { cwd: REPO_ROOT }); log(`freed VRAM on "${prevBe}" (left local for ${agentName})`); }
  }

  // --- launch ---
  writePrompt(agentName, st.leg + 1);
  const promptArg = 'Read .claude/relay.prompt.txt and follow it exactly.';
  const args = agent.fresh.map((s) => String(s).replace('{prompt}', promptArg));
  const wrapper = writeLaunchWrapper(agentName, agent.cmd, args, REPO_ROOT, { HARNESS_AGENT: agentName, ...(agent.env || {}) });
  const res = launchAgent(cfg.launcher, agentName, wrapper, REPO_ROOT);
  log(`relay -> ${agentName} (${trigger}) [${res.detail}]${res.ok ? '' : ' FAILED'}`);

  st.leg += 1;
  st.current_agent = agentName;
  st.launched_at = Date.now();
  st.handled_updated = hh ? hh.updated : '';
  st.commit_at_launch = head;
  writeState(st);
  return 'IDLE';
}

function cleanup() { try { fs.rmSync(PID_FILE); } catch {} }

async function runLoop() {
  const alive = supervisorAlive();
  if (alive) { console.log(`already running (pid ${alive})`); process.exit(0); }
  fs.writeFileSync(PID_FILE, String(process.pid));
  process.on('SIGINT', () => { cleanup(); process.exit(0); });
  process.on('SIGTERM', () => { cleanup(); process.exit(0); });
  const cfg = loadConfig();
  log(`supervisor up (pid ${process.pid}), mode=${cfg.mode}, rotation: ${cfg.rotation.join(' -> ')}`);
  for (;;) {
    let r;
    try { r = tick(false); } catch (e) { log(`tick error: ${e.message}`); r = 'IDLE'; }
    if (r === 'DONE') { cleanup(); process.exit(0); }
    const waitMs = r === 'SLEEP_RESET'
      ? Math.max(1, loadConfig().reset_wait_minutes) * 60000
      : Math.max(5, loadConfig().poll_seconds) * 1000;
    await new Promise((res) => setTimeout(res, waitMs));
  }
}

function status() {
  const pid = supervisorAlive();
  console.log(pid ? `RUNNING (pid ${pid})` : 'NOT RUNNING');
  if (fs.existsSync(STATE_FILE)) console.log('state: ' + fs.readFileSync(STATE_FILE, 'utf8').replace(/\s+/g, ' ').trim());
  if (fs.existsSync(LOG_FILE)) {
    console.log('--- relay.log (last 12) ---');
    console.log(fs.readFileSync(LOG_FILE, 'utf8').trim().split(/\r?\n/).slice(-12).join('\n'));
  }
  process.exit(pid ? 0 : 1);
}

function stop() {
  const pid = supervisorAlive();
  if (!pid) { console.log('not running'); cleanup(); process.exit(0); }
  try { process.kill(pid, 'SIGTERM'); } catch {}
  cleanup();
  console.log(`stopped (pid ${pid})`);
  process.exit(0);
}

const cmd = process.argv[2];
if (cmd === 'start') runLoop();
else if (cmd === 'status') status();
else if (cmd === 'stop') stop();
else if (cmd === 'tick') { const done = tick(process.argv.includes('--dry')); if (done === 'DONE') process.exit(0); }
else { console.log('usage: relay-supervisor.cjs start|status|stop|tick [--dry]'); process.exit(1); }
