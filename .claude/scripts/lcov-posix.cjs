#!/usr/bin/env node
'use strict';
// Rewrites lcov SF: paths to forward slashes. Vitest on Windows writes src\File.tsx, which the
// Linux sonar-scanner container cannot match to the mounted sources (src/File.tsx).
const fs = require('fs');
const path = require('path');

const lcov = path.join(__dirname, '..', '..', 'coverage', 'lcov.info');
if (!fs.existsSync(lcov)) {
  console.log(`ERROR: ${lcov} missing`);
  process.exit(1);
}
const text = fs.readFileSync(lcov, 'utf8');
const out = text.replace(/^SF:(.*)$/gm, (line, file) => `SF:${file.replace(/\\/g, '/')}`);
fs.writeFileSync(lcov, out);
const sf = out.split(/\r?\n/).filter((l) => l.startsWith('SF:'));
const bad = sf.filter((l) => l.includes('\\') || path.isAbsolute(l.slice(3)));
if (!sf.length || bad.length) {
  console.log(`ERROR: bad SF paths: ${sf.length} total, ${bad.length} not relative posix`);
  process.exit(1);
}
console.log(`OK: ${sf.length} SF paths are repo-relative posix`);
