import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'demo-build-'));
const out = join(dir, 'demo.html');
const stdout = execFileSync(process.execPath, ['scripts/build-demo.mjs', out], { encoding: 'utf8' });
const built = readFileSync(out, 'utf8');

test('the build reports how many questions it inlined', () => {
  assert.match(stdout, /241 questions inlined/);
});

test('the output carries the bank inline and no module imports', () => {
  assert.match(built, /window\.__BANK__ = \{/);
  assert.doesNotMatch(built, /^\s*import\s/m);
  assert.doesNotMatch(built, /<script type="module" src=/);
  assert.match(built, /<style>/);
});

test('the inlined bank parses and matches the real bank', () => {
  const match = built.match(/window\.__BANK__ = (\{[\s\S]*?\});<\/script>/);
  assert.ok(match, 'the bank script tag was not found');
  const inlined = JSON.parse(match[1]);
  const real = JSON.parse(readFileSync(new URL('../data/sample-questions.json', import.meta.url), 'utf8'));
  assert.equal(inlined.questions.length, real.questions.length);
  assert.deepEqual(inlined.questions[0].id, real.questions[0].id);
});

test('every subject in the bank has a UI label', async () => {
  const { readFileSync } = await import('node:fs');
  const quiz = readFileSync(new URL('../ui/quiz.js', import.meta.url), 'utf8');
  const real = JSON.parse(readFileSync(new URL('../data/sample-questions.json', import.meta.url), 'utf8'));
  for (const subject of new Set(real.questions.map((question) => question.subject))) {
    assert.match(quiz, new RegExp(`\\b${subject}:`), `no label for subject ${subject} in ui/quiz.js`);
  }
});
