#!/usr/bin/env node
'use strict';
// Manage a local model backend for the relay: bring its server up, load/unload models,
// keep VRAM under budget with an LRU eviction. Cloud agents don't use this.
//
//   node .claude/scripts/relay-backend.cjs up   <backend> [model]   -> server + model ready
//   node .claude/scripts/relay-backend.cjs swap <backend> <model>   -> load model, unload the rest
//   node .claude/scripts/relay-backend.cjs down <backend>           -> unload all (free VRAM/RAM)
//   node .claude/scripts/relay-backend.cjs status <backend>         -> server + loaded models + free VRAM
//
// Supported kinds: lmstudio (lms CLI), ollama (ollama CLI + REST), openai-endpoint
// (externally managed — health-check only, no load/unload).
const os = require('os');
const http = require('http');
const https = require('https');
const { spawnSync, spawn } = require('child_process');
const { loadConfig, readState, writeState, log } = require('./relay-lib.cjs');

function sh(cmd, args, opts = {}) {
  const [c, a] = os.platform() === 'win32' ? ['cmd', ['/c', cmd, ...args]] : [cmd, args];
  return spawnSync(c, a, { encoding: 'utf8', ...opts });
}
function spawnDetached(argv) {
  const [cmd, ...args] = argv;
  const [c, a] = os.platform() === 'win32' ? ['cmd', ['/c', cmd, ...args]] : [cmd, args];
  const child = spawn(c, a, { detached: true, stdio: 'ignore' });
  child.unref();
}
function httpJson(method, url, body) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    const data = body ? JSON.stringify(body) : null;
    const req = lib.request(url, { method, timeout: 4000, headers: data ? { 'content-type': 'application/json', 'content-length': Buffer.byteLength(data) } : {} }, (res) => {
      let buf = '';
      res.on('data', (d) => (buf += d));
      res.on('end', () => { try { resolve({ ok: res.statusCode < 400, status: res.statusCode, json: buf ? JSON.parse(buf) : null }); } catch { resolve({ ok: res.statusCode < 400, status: res.statusCode, json: null }); } });
    });
    req.on('error', () => resolve({ ok: false }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false }); });
    if (data) req.write(data);
    req.end();
  });
}
const GB = (bytes) => Math.round((bytes / 1073741824) * 100) / 100;
async function serverReachable(url, tailGet) {
  const r = await httpJson('GET', url.replace(/\/$/, '') + tailGet);
  return r.ok;
}
async function waitFor(fn, ms = 20000, step = 1000) {
  const end = Date.now() + ms;
  while (Date.now() < end) { if (await fn()) return true; await new Promise((r) => setTimeout(r, step)); }
  return false;
}

const ADAPTERS = {
  lmstudio: {
    reach: (be) => serverReachable(be.url, '/models'),
    start: (be) => spawnDetached(be.server_start || ['lms', 'server', 'start']),
    catalog: () => {
      const r = sh('lms', ['ls', '--json']);
      const map = {};
      try { for (const m of JSON.parse(r.stdout || '[]')) if (m.type === 'llm') map[m.modelKey] = GB(m.sizeBytes || 0); } catch {}
      return map;
    },
    loaded: () => {
      const r = sh('lms', ['ps', '--json']);
      try {
        const arr = JSON.parse(r.stdout || '[]');
        return arr.map((m) => ({ model: m.modelKey || m.identifier, sizeGb: GB(m.sizeBytes || 0) }));
      } catch { return []; }
    },
    load: (be, model, ttl) => sh('lms', ['load', model, '--gpu', be.gpu || 'max', '-y', ...(ttl ? ['--ttl', String(ttl)] : []), ...(be.context_length ? ['-c', String(be.context_length)] : [])]).status === 0,
    unload: (_be, model) => sh('lms', ['unload', model]).status === 0,
    unloadAll: () => sh('lms', ['unload', '--all']).status === 0,
  },
  ollama: {
    reach: (be) => serverReachable(be.url, '/api/tags'),
    start: (be) => spawnDetached(be.server_start || ['ollama', 'serve']),
    catalog: () => {
      const r = sh('ollama', ['list']);
      const map = {};
      for (const line of (r.stdout || '').split(/\r?\n/).slice(1)) {
        const m = line.match(/^(\S+)\s+\S+\s+([\d.]+)\s*(GB|MB)/i);
        if (m) map[m[1]] = m[3].toUpperCase() === 'MB' ? +m[2] / 1024 : +m[2];
      }
      return map;
    },
    loaded: () => {
      const r = sh('ollama', ['ps']);
      const out = [];
      for (const line of (r.stdout || '').split(/\r?\n/).slice(1)) {
        const m = line.match(/^(\S+)\s+\S+\s+([\d.]+)\s*(GB|MB)/i);
        if (m) out.push({ model: m[1], sizeGb: m[3].toUpperCase() === 'MB' ? +m[2] / 1024 : +m[2] });
      }
      return out;
    },
    load: async (be, model, ttl) => (await httpJson('POST', be.url.replace(/\/$/, '') + '/api/generate', { model, prompt: '', stream: false, keep_alive: ttl ? `${ttl}s` : '30m' })).ok,
    unload: async (be, model) => (await httpJson('POST', be.url.replace(/\/$/, '') + '/api/generate', { model, prompt: '', stream: false, keep_alive: 0 })).ok,
    unloadAll: async (be) => { for (const m of ADAPTERS.ollama.loaded()) await ADAPTERS.ollama.unload(be, m.model); return true; },
  },
  'openai-endpoint': {
    reach: (be) => serverReachable(be.url, '/models'),
    start: () => { throw new Error('openai-endpoint is externally managed — start it yourself'); },
    catalog: () => ({}),
    loaded: () => [],
    load: () => true,
    unload: () => true,
    unloadAll: () => true,
  },
};

function lru(state, bn) { state.vram = state.vram || {}; state.vram[bn] = state.vram[bn] || { at: {} }; return state.vram[bn]; }

async function makeRoom(be, ad, bn, model, state) {
  const cat = ad.catalog();
  const target = cat[model] || be.default_model_gb || 8;
  const total = be.vram_total_gb || 0;
  const headroom = be.vram_headroom_gb != null ? be.vram_headroom_gb : 1.5;
  if (!total) return; // no budget configured -> let the runtime decide
  let live = ad.loaded();
  let used = live.reduce((s, m) => s + m.sizeGb, 0);
  const rec = lru(state, bn);
  // evict least-recently-used until target fits, but never evict the model we want
  const order = [...live].sort((x, y) => (rec.at[x.model] || 0) - (rec.at[y.model] || 0));
  for (const m of order) {
    if (total - headroom - used >= target) break;
    if (m.model === model) continue;
    log(`backend ${bn}: evicting ${m.model} (${m.sizeGb}GB) to fit ${model} (${target}GB)`);
    await ad.unload(be, m.model);
    delete rec.at[m.model];
    used -= m.sizeGb;
  }
  if (total - headroom - used < target) log(`backend ${bn}: ${model} (${target}GB) may not fit in ${total - headroom}GB budget — loading anyway (runtime may offload to RAM)`);
}

async function ensureUp(bn, be, ad, model, state) {
  if (!(await ad.reach(be))) {
    log(`backend ${bn}: server not reachable, starting`);
    ad.start(be);
    if (!(await waitFor(() => ad.reach(be)))) { console.log(`ERROR: ${bn} server did not come up`); process.exit(1); }
  }
  if (model && ad.load !== ADAPTERS['openai-endpoint'].load) {
    const isLoaded = ad.loaded().some((m) => m.model === model || m.model.endsWith('/' + model));
    if (!isLoaded) {
      await makeRoom(be, ad, bn, model, state);
      log(`backend ${bn}: loading ${model}`);
      const ok = await ad.load(be, model);
      if (!ok) { console.log(`ERROR: failed to load ${model} on ${bn}`); process.exit(1); }
    }
    lru(state, bn).at[model] = Date.now();
  }
}

(async () => {
  const [, , op, bn, model] = process.argv;
  if (!op || !bn) { console.log('usage: relay-backend.cjs up|swap|down|status <backend> [model]'); process.exit(1); }
  const cfg = loadConfig();
  const be = (cfg.backends || {})[bn];
  if (!be) { console.log(`ERROR: backend "${bn}" not in relay.json`); process.exit(1); }
  const ad = ADAPTERS[be.kind];
  if (!ad) { console.log(`ERROR: unknown backend kind "${be.kind}"`); process.exit(1); }
  const state = readState();

  if (op === 'status') {
    const up = await ad.reach(be);
    console.log(`${bn} (${be.kind}) server: ${up ? 'UP' : 'DOWN'}  ${be.url}`);
    if (up) {
      const live = ad.loaded();
      const used = live.reduce((s, m) => s + m.sizeGb, 0);
      live.forEach((m) => console.log(`  loaded: ${m.model}  ${m.sizeGb}GB`));
      if (be.vram_total_gb) console.log(`  vram: ${used.toFixed(1)}/${be.vram_total_gb}GB used (headroom ${be.vram_headroom_gb ?? 1.5}GB)`);
    }
    process.exit(up ? 0 : 1);
  }

  if (op === 'up') {
    await ensureUp(bn, be, ad, model, state);
    writeState(state);
    console.log(`OK: ${bn} ready${model ? ` with ${model}` : ''}`);
    process.exit(0);
  }

  if (op === 'swap') {
    if (!model) { console.log('ERROR: swap needs <model>'); process.exit(1); }
    await ensureUp(bn, be, ad, model, state);
    for (const m of ad.loaded()) if (m.model !== model && !m.model.endsWith('/' + model)) { log(`backend ${bn}: unloading ${m.model} (swap)`); await ad.unload(be, m.model); delete lru(state, bn).at[m.model]; }
    writeState(state);
    console.log(`OK: ${bn} now on ${model}`);
    process.exit(0);
  }

  if (op === 'down') {
    if (await ad.reach(be)) { await ad.unloadAll(be); }
    if (state.vram && state.vram[bn]) state.vram[bn].at = {};
    writeState(state);
    console.log(`OK: ${bn} models unloaded`);
    process.exit(0);
  }

  console.log(`ERROR: unknown op "${op}"`);
  process.exit(1);
})();
