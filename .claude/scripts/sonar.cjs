#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '../..');
const configPath = path.join(root, '.claude', 'sonar.json');
const SONAR_PROPERTY = /^sonar\.[\w.]+$/;

// Repo-relative path that stays inside the scanner mount (/usr/src): no absolute paths, no "..", no commas (Sonar list separator).
function assertRelative(value, label) {
  if (typeof value !== 'string' || !value || value.includes(',') || path.isAbsolute(value) || value.split(/[\\/]/).includes('..')) {
    throw new Error(`Invalid ${label}`);
  }
}

function list(values, label) {
  if (!Array.isArray(values) || !values.length) throw new Error(`Missing ${label}`);
  for (const value of values) assertRelative(value, label);
  return values.join(',');
}

try {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const url = new URL(config.hostUrl);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error('Invalid SonarQube URL');
  if (typeof config.projectKey !== 'string' || !/^[\w.:-]+$/.test(config.projectKey)) throw new Error('Invalid project key');
  if (!Array.isArray(config.sources) || !config.sources.length) throw new Error('Missing source directories');
  for (const source of config.sources) {
    if (typeof source !== 'string' || source.includes(',') || path.isAbsolute(source) || source.split(/[\\/]/).includes('..') || !fs.statSync(path.join(root, source)).isDirectory()) throw new Error('Invalid source directory');
  }

  // Optional, per repo: { "coverageReports": { "sonar.javascript.lcov.reportPaths": ["coverage/lcov.info"] }, "tests": [...], "testInclusions": [...] }
  const optionalArgs = [];
  for (const [property, reports] of Object.entries(config.coverageReports || {})) {
    if (!SONAR_PROPERTY.test(property)) throw new Error('Invalid coverage property');
    list(reports, 'coverage report');
    for (const report of reports) {
      const file = path.join(root, report);
      // A scan must never upload a silent 0%: the report has to exist and contain data.
      if (!fs.existsSync(file) || fs.statSync(file).size === 0) throw new Error(`Coverage report missing or empty: ${report} (run node .claude/scripts/test.cjs first)`);
    }
    optionalArgs.push(`-D${property}=${reports.join(',')}`);
  }
  if (config.tests !== undefined) {
    const tests = list(config.tests, 'test directory');
    for (const dir of config.tests) {
      if (!fs.statSync(path.join(root, dir)).isDirectory()) throw new Error('Invalid test directory');
    }
    optionalArgs.push(`-Dsonar.tests=${tests}`);
  }
  if (config.testInclusions !== undefined) {
    optionalArgs.push(`-Dsonar.test.inclusions=${list(config.testInclusions, 'test inclusion')}`);
  }

  const tokenFile = path.join(root, '.claude', 'sonar.token');
  const token = process.env.SONAR_TOKEN || fs.readFileSync(tokenFile, 'utf8').trim();
  if (!token) throw new Error('Missing SonarQube token');
  const result = spawnSync('docker', [
    'run', '--rm', '-v', `${root}:/usr/src:ro`, '-e', 'SONAR_TOKEN', '-e', 'SONAR_HOST_URL',
    'sonarsource/sonar-scanner-cli:latest', `-Dsonar.projectKey=${config.projectKey}`,
    `-Dsonar.sources=${config.sources.join(',')}`, '-Dsonar.working.directory=/tmp/sonar-work',
    ...optionalArgs,
    '-Dsonar.qualitygate.wait=true',
  ], { cwd: root, env: { ...process.env, SONAR_TOKEN: token, SONAR_HOST_URL: url.toString() }, stdio: 'inherit' });
  if (result.error) throw result.error;
  process.exit(result.status === 0 ? 0 : 1);
} catch (error) {
  console.error(`SonarQube analysis failed: ${error.message}`);
  process.exit(1);
}
