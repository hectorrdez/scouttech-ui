#!/usr/bin/env node
'use strict';
// Inspect / validate the cross-CLI relay config.
//   node .claude/scripts/relay-config.cjs            -> show effective config + validation
//   node .claude/scripts/relay-config.cjs --validate -> exit 0 if usable, 1 if not
//   node .claude/scripts/relay-config.cjs --launcher -> print the launcher 'auto' resolves to here
//
// The config itself (.claude/relay.json) is written by /init-app's interview or by
// hand — this script does not edit it, it only checks it.
const { loadConfig, validateConfig, resolveLauncher } = require('./relay-lib.cjs');

const arg = process.argv[2];
const cfg = loadConfig();
const errs = validateConfig(cfg);

if (arg === '--launcher') {
  console.log(resolveLauncher(cfg.launcher || 'auto'));
  process.exit(0);
}

if (arg === '--validate') {
  if (errs.length) { errs.forEach((e) => console.log(`INVALID: ${e}`)); process.exit(1); }
  console.log(`OK: relay config usable (enabled=${cfg.enabled}, rotation=${cfg.rotation.join(' -> ')})`);
  process.exit(0);
}

console.log('Relay config (.claude/relay.json)');
console.log(`  enabled:            ${cfg.enabled}`);
console.log(`  mode:              ${cfg.mode}`);
console.log(`  launcher:           ${cfg.launcher}  (resolves here to: ${resolveLauncher(cfg.launcher || 'auto')})`);
console.log(`  rotation:           ${cfg.rotation.join(' -> ') || '(none)'}`);
console.log(`  poll_seconds:       ${cfg.poll_seconds}`);
console.log(`  budget_minutes:     ${cfg.budget_minutes}`);
console.log(`  on_all_exhausted:   ${cfg.on_all_exhausted} (reset_wait_minutes=${cfg.reset_wait_minutes})`);
console.log('  agents:');
for (const [n, a] of Object.entries(cfg.agents || {})) {
  console.log(`    ${n}: ${a.cmd}  backend=${a.backend || 'cloud'}${a.model ? `  model=${a.model}` : ''}`);
}
console.log('  backends:');
for (const [n, b] of Object.entries(cfg.backends || {})) {
  console.log(`    ${n}: ${b.kind}  ${b.url}${b.vram_total_gb ? `  vram=${b.vram_total_gb}GB` : ''}`);
}
if (!Object.keys(cfg.backends || {}).length) console.log('    (none)');
console.log('  route:');
for (const [ph, r] of Object.entries(cfg.route || {})) {
  console.log(`    ${ph}: ${r.chain.join(' -> ')}${r.fallback_on ? `  (fallback_on=${r.fallback_on})` : ''}`);
}
if (!Object.keys(cfg.route || {}).length) console.log('    (none — uses rotation)');
const fb = cfg.fallback || {};
console.log(`  fallback:          cloud_exhausted=${fb.cloud_exhausted || '-'}  local_unstable=${fb.local_unstable ? `${fb.local_unstable.after_failures}x->${fb.local_unstable.action}` : '-'}  free_vram_on_leave_local=${!!fb.free_vram_on_leave_local}`);
console.log('');
if (errs.length) { errs.forEach((e) => console.log(`INVALID: ${e}`)); process.exit(1); }
console.log('OK: config usable');
process.exit(0);
