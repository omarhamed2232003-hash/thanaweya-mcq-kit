import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const run = (...args) => execFileSync(process.execPath, ['scripts/validate-data.mjs', ...args], { encoding: 'utf8' });

test('the text report says the bank is fine', () => {
  const out = run();
  assert.match(out, /ok {3}data\/sample-questions\.json — 241 questions/);
});

test('--json prints one object a build can read', () => {
  const report = JSON.parse(run('--json'));
  assert.equal(report.ok, true);
  assert.equal(report.banks.length, 1);
  assert.equal(report.banks[0].file, 'data/sample-questions.json');
  assert.equal(report.banks[0].questions, 241);
  assert.deepEqual(report.banks[0].errors, []);
});
