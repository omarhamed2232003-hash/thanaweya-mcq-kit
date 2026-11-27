#!/usr/bin/env node
/**
 * Validate every JSON bank in data/ and print a short report.
 * Exit code 1 when a bank is invalid, so CI fails loudly.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { validateBank } from '../src/schema.js';

const dataDir = new URL('../data/', import.meta.url);
const files = readdirSync(dataDir).filter((name) => name.endsWith('.json'));

if (files.length === 0) {
  console.error('FAIL no JSON banks found in data/');
  process.exit(1);
}

let failed = 0;
for (const file of files) {
  const bank = JSON.parse(readFileSync(new URL(file, dataDir), 'utf8'));
  const result = validateBank(bank);
  const label = `data/${file}`;
  if (result.ok) {
    console.log(`ok   ${label} — ${result.questionCount} questions`);
  } else {
    failed += 1;
    console.error(`FAIL ${label} — ${result.errors.length} problem(s)`);
    result.errors.forEach((error) => console.error(`     ${error.path}: ${error.message}`));
  }
}

process.exit(failed === 0 ? 0 : 1);
