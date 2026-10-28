#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '../..');
const configPath = path.join(root, '.claude', 'sonar.json');
try {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const url = new URL(config.hostUrl);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error('Invalid SonarQube URL');
  if (typeof config.projectKey !== 'string' || !/^[\w.:-]+$/.test(config.projectKey)) throw new Error('Invalid project key');
  if (!Array.isArray(config.sources) || !config.sources.length) throw new Error('Missing source directories');
  for (const source of config.sources) {
    if (typeof source !== 'string' || source.includes(',') || path.isAbsolute(source) || source.split(/[\\/]/).includes('..') || !fs.statSync(path.join(root, source)).isDirectory()) throw new Error('Invalid source directory');
  }
  const tokenFile = path.join(root, '.claude', 'sonar.token');
  const token = process.env.SONAR_TOKEN || fs.readFileSync(tokenFile, 'utf8').trim();
  if (!token) throw new Error('Missing SonarQube token');
  const result = spawnSync('docker', [
    'run', '--rm', '-v', `${root}:/usr/src:ro`, '-e', 'SONAR_TOKEN', '-e', 'SONAR_HOST_URL',
    'sonarsource/sonar-scanner-cli:latest', `-Dsonar.projectKey=${config.projectKey}`,
    `-Dsonar.sources=${config.sources.join(',')}`, '-Dsonar.working.directory=/tmp/sonar-work',
    '-Dsonar.qualitygate.wait=true',
  ], { cwd: root, env: { ...process.env, SONAR_TOKEN: token, SONAR_HOST_URL: url.toString() }, stdio: 'inherit' });
  if (result.error) throw result.error;
  process.exit(result.status === 0 ? 0 : 1);
} catch (error) {
  console.error(`SonarQube analysis failed: ${error.message}`);
  process.exit(1);
}
