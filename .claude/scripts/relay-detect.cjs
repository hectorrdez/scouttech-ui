#!/usr/bin/env node
'use strict';
// Scan this machine for what the relay can use: agent CLIs, local model runtimes and
// their models, GPU VRAM, and cloud availability. Feeds /init-app's relay interview.
//
//   node .claude/scripts/relay-detect.cjs           -> readable report
//   node .claude/scripts/relay-detect.cjs --json     -> machine-readable JSON
const os = require('os');
const http = require('http');
const { spawnSync } = require('child_process');

function sh(cmd, args) {
  const [c, a] = os.platform() === 'win32' ? ['cmd', ['/c', cmd, ...args]] : [cmd, args];
  const r = spawnSync(c, a, { encoding: 'utf8', timeout: 15000 });
  return { ok: r.status === 0, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() };
}
function which(cmd) {
  const r = os.platform() === 'win32'
    ? spawnSync('where', [cmd], { encoding: 'utf8' })
    : spawnSync('/bin/sh', ['-c', `command -v ${JSON.stringify(cmd)}`], { encoding: 'utf8' });
  return r.status === 0 && (r.stdout || '').trim() ? r.stdout.trim().split(/\r?\n/)[0] : null;
}
function httpGet(url) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: 1200 }, (res) => {
      let b = ''; res.on('data', (d) => (b += d)); res.on('end', () => resolve({ ok: res.statusCode < 400, body: b }));
    });
    req.on('error', () => resolve({ ok: false }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false }); });
  });
}

async function main() {
  const asJson = process.argv.includes('--json');
  const rep = { agents: {}, runtimes: {}, ports: {}, gpu: [], cloud: {} };

  // --- agent CLIs ---
  for (const c of ['claude', 'codex', 'antigravity', 'opencode', 'aider']) rep.agents[c] = which(c);

  // --- LM Studio ---
  const lms = which('lms');
  if (lms) {
    const ls = sh('lms', ['ls', '--json']);
    let models = [];
    try { models = JSON.parse(ls.out || '[]').filter((m) => m.type === 'llm').map((m) => ({ key: m.modelKey, params: m.paramsString, gb: Math.round((m.sizeBytes || 0) / 1073741824 * 100) / 100, arch: m.architecture, tools: !!m.trainedForToolUse })); } catch {}
    const status = sh('lms', ['server', 'status']);
    rep.runtimes.lmstudio = { bin: lms, url: 'http://127.0.0.1:1234/v1', server: /running|on/i.test(status.out) ? 'up' : 'down', models };
  }

  // --- Ollama ---
  const oll = which('ollama');
  if (oll) {
    const list = sh('ollama', ['list']);
    const models = list.out.split(/\r?\n/).slice(1).map((l) => l.split(/\s{2,}/)).filter((p) => p[0]).map((p) => ({ key: p[0], gb: p[2] }));
    rep.runtimes.ollama = { bin: oll, url: 'http://127.0.0.1:11434', server: (await httpGet('http://127.0.0.1:11434/api/tags')).ok ? 'up' : 'down', models };
  }

  // --- generic OpenAI-compatible / known ports ---
  for (const [port, tail] of [[11434, '/api/tags'], [1234, '/v1/models'], [8080, '/v1/models'], [8000, '/v1/models'], [5000, '/v1/models'], [1337, '/v1/models']]) {
    const r = await httpGet(`http://127.0.0.1:${port}${tail}`);
    if (r.ok) rep.ports[port] = (r.body || '').slice(0, 300);
  }

  // --- GPU / VRAM ---
  const nv = sh('nvidia-smi', ['--query-gpu=name,memory.total,memory.used', '--format=csv,noheader']);
  if (nv.ok && nv.out) {
    rep.gpu = nv.out.split(/\r?\n/).map((l) => {
      const [name, total, used] = l.split(',').map((s) => s.trim());
      return { name, vram_total: total, vram_used: used };
    });
  } else if (os.platform() === 'win32') {
    const w = sh('wmic', ['path', 'win32_VideoController', 'get', 'Name,AdapterRAM', '/format:csv']);
    if (w.ok) rep.gpu = w.out.split(/\r?\n/).filter((l) => /,/.test(l) && !/AdapterRAM/.test(l)).map((l) => {
      const p = l.split(','); const ram = parseInt(p[1], 10);
      return { name: (p[2] || '').trim(), vram_total: ram ? `${Math.round(ram / 1073741824)} GiB` : '?' };
    });
  } else if (os.platform() === 'darwin') {
    const s = sh('system_profiler', ['SPDisplaysDataType']);
    if (s.ok) rep.gpu = [...s.out.matchAll(/Chipset Model: (.+)/g)].map((m) => ({ name: m[1].trim(), vram_total: 'unified' }));
  }

  // --- cloud ---
  for (const k of ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'GEMINI_API_KEY', 'OPENROUTER_API_KEY', 'GROQ_API_KEY']) rep.cloud[k] = !!process.env[k];
  rep.cloud.claude_cli = !!rep.agents.claude;
  rep.cloud.codex_cli = !!rep.agents.codex;

  if (asJson) { console.log(JSON.stringify(rep, null, 2)); return; }

  const yn = (v) => (v ? v : '—');
  console.log('=== Agent CLIs ===');
  for (const [k, v] of Object.entries(rep.agents)) console.log(`  ${k.padEnd(12)} ${yn(v)}`);
  console.log('\n=== Local runtimes ===');
  if (!Object.keys(rep.runtimes).length) console.log('  (none found: no lms / ollama on PATH)');
  for (const [k, v] of Object.entries(rep.runtimes)) {
    console.log(`  ${k} — server ${v.server}, ${v.url}`);
    (v.models || []).slice(0, 30).forEach((m) => console.log(`      ${String(m.key).padEnd(48)} ${m.params || ''} ${m.gb ? m.gb + 'GB' : m.gb || ''}${m.tools ? '  [tools]' : ''}`));
    if ((v.models || []).length > 30) console.log(`      … +${v.models.length - 30} more`);
  }
  console.log('\n=== Other OpenAI-compatible ports alive ===');
  console.log(Object.keys(rep.ports).length ? Object.keys(rep.ports).map((p) => '  :' + p).join('\n') : '  (none)');
  console.log('\n=== GPU / VRAM ===');
  rep.gpu.length ? rep.gpu.forEach((g) => console.log(`  ${g.name}  total ${g.vram_total}${g.vram_used ? `, used ${g.vram_used}` : ''}`)) : console.log('  (no GPU info)');
  console.log('\n=== Cloud ===');
  for (const [k, v] of Object.entries(rep.cloud)) console.log(`  ${k.padEnd(18)} ${v ? 'yes' : '—'}`);
  console.log('\nNext: use these values to fill .claude/relay.json (backends, agents, route, fallback), then `relay-config.cjs --validate`.');
}
main();
