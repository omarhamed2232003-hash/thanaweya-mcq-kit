#!/usr/bin/env node
/**
 * Validate every JSON bank in data/ and print a short report.
 *
 * Exit code 1 when a bank is invalid, so CI fails loudly.
 * With --json the report is one JSON object on stdout, for a build that wants to
 * read the result instead of scraping the text.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { validateBank } from '../src/schema.js';

const asJson = process.argv.includes('--json');
const dataDir = new URL('../data/', import.meta.url);
const files = readdirSync(dataDir).filter((name) => name.endsWith('.json')).sort();

if (files.length === 0) {
  if (asJson) console.log(JSON.stringify({ ok: false, banks: [], error: 'no JSON banks found in data/' }, null, 2));
  else console.error('FAIL no JSON banks found in data/');
  process.exit(1);
}

const banks = [];
let failed = 0;

for (const file of files) {
  const bank = JSON.parse(readFileSync(new URL(file, dataDir), 'utf8'));
  const result = validateBank(bank);
  const label = `data/${file}`;
  banks.push({ file: label, ok: result.ok, questions: result.questionCount, errors: result.errors });

  if (!result.ok) failed += 1;
  if (asJson) continue;

  if (result.ok) {
    console.log(`ok   ${label} — ${result.questionCount} questions`);
  } else {
    console.error(`FAIL ${label} — ${result.errors.length} problem(s)`);
    result.errors.forEach((error) => console.error(`     ${error.path}: ${error.message}`));
  }
}

if (asJson) {
  console.log(JSON.stringify({ ok: failed === 0, banks }, null, 2));
}

process.exit(failed === 0 ? 0 : 1);
