#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const text = process.argv[2];
if (!text) {
  console.log('ERROR: usage add-note.cjs "text"');
  process.exit(1);
}

const notesPath = path.join(__dirname, '..', 'notes.md');
fs.appendFileSync(notesPath, `- ${text}\n`);
console.log('OK: note added');
process.exit(0);
